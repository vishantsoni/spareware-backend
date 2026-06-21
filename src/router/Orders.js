const express = require("express");

const router = express.Router();
const fetchuser = require("../middleware/fetchusertoken");
const { body, validationResult } = require("express-validator");
const OrderSchema = require("../models/orders");
const Company = require("../models/company");
const Payment = require("../models/payment");
const mongoose = require("mongoose");
const NotiSchema = require("../models/notify");
const Users = require("../models/users");
// fetch all Categories

router.get("/getOrders", fetchuser, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(205).json({ status: "Failed", errors: errors.array() });
  }

  try {
    const staff = await OrderSchema.find({
      userid: req.user.id,
    })
      .populate("userid")
      .populate("supplier_id")
      .populate("order_list.catlog_id")
      .populate("order_list.product_id");

    if (staff.length == 0) {
      res.json({
        status: "Success",
        msg: "Not Found",
        data: staff,
      });
    } else {
      res.json({
        status: "Success",
        data: staff,
      });
    }
  } catch (e) {
    return res
      .status(203)
      .json({ status: "Failed", msg: "Invalid Parameters", errors: e.message });
  }
});

router.get("/getOrdersBySupplier/:c_id", fetchuser, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(205).json({ status: "Failed", errors: errors.array() });
  }

  try {
    console.log("Get order Request");
    let data = [];
    const staff = await OrderSchema.find({
      supplier_id: req.user.id,
      supplier_c_id: req.params.c_id,
    })
      .populate("userid")
      .populate("supplier_id")
      .populate("order_list.catlog_id")
      .populate("order_list.product_id")
      .sort({ _id: -1 });

    if (staff.length == 0) {
      res.json({
        status: "Success",
        msg: "Not Found",
        data: staff,
      });
    } else {
      // Avoid N+1 queries: prefetch all required Company docs
      const sellerUserIds = [
        ...new Set(
          staff.map((x) =>
            x.userid && x.userid._id ? x.userid._id.toString() : null,
          ),
        ),
      ].filter(Boolean);
      const companies = await Company.find({ userid: { $in: sellerUserIds } });
      const companyMap = new Map(
        companies.map((c) => [c.userid.toString(), c]),
      );

      for (let i = 0; i < staff.length; i++) {
        const element = staff[i];
        const com_data = element.userid
          ? companyMap.get(element.userid._id.toString()) || null
          : null;

        let nick_name = {};
        element.supplier_id.customer_data.forEach((m_s) => {
          if (m_s.customer_id.toString() === element.userid._id.toString()) {
            nick_name = m_s;
          }
        });

        data.push({
          nick_name,
          userid: element.userid,
          user_comdata: com_data,

          supplier_id: element.supplier_id,
          order_list: element.order_list,
          order_id: element.order_id,
          supplier_c_id: element.supplier_c_id,
          total_price: element.total_price,
          order_status: element.order_status,
          create_by: element.create_by,
          createdAt: element.createdAt,
        });
      }

      res.json({
        status: "Success",
        data: data,
      });
    }
  } catch (e) {
    return res
      .status(203)
      .json({ status: "Failed", msg: "Invalid Parameters", errors: e.message });
  }
});

router.get("/getOrderByUser/:userid", fetchuser, async (req, res) => {
  try {
    const order = await OrderSchema.find({
      supplier_id: req.user.id,
      userid: req.params.userid,
      order_status: "delivered",
    }).sort({ _id: -1 });
    res.status(202).json({ status: "Success", data: order });
  } catch (error) {
    return res.status(203).json({
      status: "Failed",
      msg: "Invalid Parameters",
      errors: error.message,
    });
  }
});

// create Catalog

const getOrderID = async () => {
  const data = await OrderSchema.findOne().sort({ _id: -1 });
  if (data === null) {
    return 10001;
  } else {
    let returnData = data.order_id;
    return returnData + 1;
  }
};

router.post("/createOrder", fetchuser, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(201).json({
      status: "Failed",
      msg: "Invalid Parameters",
      errors: errors.array(),
    });
  }
  console.log(req.body);
  let {
    userid,
    order_id,
    supplier_c_id,
    supplier_id,
    create_by,
    order_list,
    total_price,
    order_status,
    createdAt,
    updated_at,
  } = req.body;

  try {
    userid = req.user.id;
    const orderData = await getOrderID();
    console.log(orderData);
    order_id = orderData;
    const newOrder = new OrderSchema({
      userid,
      order_id,
      supplier_c_id,
      supplier_id,
      create_by,
      order_list,
      total_price,
      order_status,
      createdAt,
      updated_at,
    });

    let saveOrder = await newOrder.save();

    // sendnotification
    const newNoti = new NotiSchema({
      userid,
      path: "order",
      title: "New order Recieved",
      message: "New order has been recieved",
      markasread: false,
    });

    const newData = await newNoti.save();

    res.status(201).json({
      status: "Success",
      msg: "Order has been created",
      data: saveOrder,
    });
  } catch (e) {
    console.log(e.message);
    res.status(201).json({
      status: "Failed",
      error: e.message,
      msg: "Some internal error",
    });
  }
});

// delete catalog
router.delete("/deleteOrder/:id", fetchuser, async (req, res) => {
  try {
    let category = await OrderSchema.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ status: "Failed", errors: "not found" });
    }

    if (category.userid.toString() !== req.user.id) {
      return res.status(401).json({ status: "Failed", errors: "Not Allowed" });
    }

    category = await OrderSchema.findByIdAndDelete(req.params.id);
    res.json({ status: "Success", msg: "Order has been deleted" });
  } catch (error) {
    console.log(error.message);
    res.status(500).send("Some internal error");
  }
});

// change order status
router.put(
  "/changeOrderStatus/:orderid/:statusType",
  fetchuser,
  async (req, res) => {
    try {
      const { statusType, orderid } = req.params;

      // create new object
      const newOrder = {};
      if (statusType) {
        newOrder.order_status = statusType;
      }

      let order = await OrderSchema.findOne({
        order_id: orderid,
        supplier_id: req.user.id,
      }).populate("supplier_id");

      if (!order) {
        return res
          .status(200)
          .json({ status: "Failed", msg: "Order not found" });
      }

      const updateorder = await OrderSchema.findByIdAndUpdate(
        order._id,
        { $set: newOrder },
        { new: true },
      );
      const msg = "Order has been " + statusType;

      if (statusType === "delivered") {
        let customer_data = order.supplier_id.customer_data;
        customer_data.forEach((cus) => {
          if (cus.customer_id.toString() === order.userid.toString()) {
            cus.out_standing += parseInt(order.total_price);
          }
        });

        const updateUser = await Users.findByIdAndUpdate(
          order.supplier_id._id,
          { $set: { customer_data: customer_data } },
          { new: true },
        );

        // update product inventory
        const product_data = order.order_list;
        product_data.forEach(async (ord) => {
          let pro = await ProductSchema.findById(ord.product_id._id);

          if (ord.attr_id.toString() === "") {
            pro.inventory -= product_data.qty;
          } else {
            pro.p_price.forEach((attr) => {
              if (attr._id.toString() === ord.attr_id.toString()) {
                attr.inventory -= product_data.qty;
              }
            });
          }

          pro = await ProductSchema.findByIdAndUpdate(
            pro._id,
            { $set: pro },
            { new: true },
          );
        });
      }

      res.status(202).json({
        status: "Success",
        msg,
        data: updateorder,
      });
    } catch (error) {
      console.log(error.message);
      res.status(201).json({
        status: "Failed",
        msg: "Server internal Error",
        error: error.message,
      });
    }
  },
);

// editOrder
router.put("/editOrder/:order_id/:type", fetchuser, async (req, res) => {
  try {
    const { pro_id, qty } = req.body;
    let order = await OrderSchema.findOne({ order_id: req.params.order_id });
    if (!order) {
      return res.status(204).json({ status: "Failed", msg: "Order Not Found" });
    }

    for (let i = 0; i < order.order_list.length; i++) {
      const element = order.order_list[i];
      if (type === "remove") {
        if (element.product_id._id.toString() === pro_id) {
          order.order_list.splice(i, 1);
        }
      } else if (type === "qty") {
        if (element.product_id._id.toString() === pro_id) {
          element.qty = parseInt(qty);
        }
      }
    }

    const updatedata = await OrderSchema.findByIdAndUpdate(
      order._id,
      { $set: order },
      { new: true },
    );
    res
      .status(200)
      .json({ status: "Success", msg: "updated", data: updatedata });
  } catch (error) {
    res.status(201).json({
      status: "Failed",
      msg: "Server internal Error",
      error: error.message,
    });
  }
});

// get order details using order id
router.get("/getOrderDetails/:id", fetchuser, async (req, res) => {
  console.log(req.params.id);

  try {
    const orders = await OrderSchema.findOne({
      order_id: req.params.id,
    })
      .populate("userid")
      .populate("supplier_id")
      .populate("order_list.catlog_id")
      .populate("order_list.product_id");

    if (!orders) {
      return res.status(203).json({ status: "Failed", msg: "No Record Found" });
    }

    res.json({
      status: "Success",
      data: orders,
    });
  } catch (e) {
    return res
      .status(203)
      .json({ status: "Failed", msg: "Invalid Parameters", errors: e.message });
  }
});

//###########################################################################
// Time Filter Reports
router.get("/getOrderReport/:c_id/:time", fetchuser, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ status: "Failed", errors: errors.array() });
  }

  try {
    const { time } = req.params;
    let today = new Date();
    let backDate = new Date();
    if (time === "today") {
      backDate.setHours(0, 0, 0);
    } else if (time === "yesterday") {
      let a = backDate.getDate();
      a = a - 2;
      backDate.setDate(a);

      today.setHours(0, 0, 0, 0);
    } else if (time === "weekly") {
      let a = backDate.getDate();
      a = a - 7;
      backDate.setDate(a);
    } else if (time === "monthly") {
      let a = backDate.getMonth();
      a = a - 1;
      backDate.setDate(1);
      backDate.setMonth(a);

      today.setDate(1);
    }
    console.log(backDate);
    console.log(today);
    console.log(time);

    const staff = await OrderSchema.find({
      supplier_id: req.user.id,
      supplier_c_id: req.params.c_id,
      createdAt: {
        $gte: backDate,
        $lt: today,
      },
    })
      .populate("userid")
      .populate("supplier_id")
      .populate("order_list.catlog_id")
      .populate("order_list.product_id")
      .sort({ _id: -1 });

    if (staff.length == 0) {
      res.json({
        status: "Success",
        msg: "Not Found",
        data: staff,
      });
    } else {
      res.json({
        total: staff.length,
        status: "Success",
        data: staff,
      });
    }
  } catch (e) {
    return res
      .status(203)
      .json({ status: "Failed", msg: "Invalid Parameters", errors: e.message });
  }
});

async function getOutstanding(sup_id, cus_id) {
  let returnarrau = {
    orders: [],
    payments: [],
    out: 0,
  };
  let amt = 0,
    w_amt = 0;
  const order = await OrderSchema.find({
    supplier_id: sup_id,
    userid: cus_id,
    order_status: "delivered",
  }).sort({ _id: -1 });

  if (order) {
    order.forEach((element) => {
      amt += parseInt(element.total_price);
    });
  }

  const wallet = await Payment.find({ userid: cus_id, supplier_id: sup_id });
  //console.log("----asdfsadf------");

  if (wallet.length !== 0) {
    wallet.forEach((element) => {
      w_amt += element.amt;
    });
  }

  //console.log(amt+"-----"+w_amt);

  returnarrau.orders = order;
  returnarrau.payments = wallet;
  returnarrau.out = amt - w_amt;
  return returnarrau;
}

// router update orders
router.put("/updateOrder/:order_id", fetchuser, async (req, res) => {
  try {
    const { total_price, order_list } = req.body;
    let order = await OrderSchema.findOne({ order_id: req.params.order_id });
    if (!order) {
      return res.status(204).json({ status: "Failed", msg: "Order Not Found" });
    }

    const updatedata = await OrderSchema.findByIdAndUpdate(
      req.params.order_id,
      { $set: { total_price, order_list } },
      { new: true },
    );
    res.status(200).json({
      status: "Success",
      msg: "Order has been updated",
      data: updatedata,
    });
  } catch (error) {
    res.status(201).json({
      status: "Failed",
      msg: "Server Internal Error",
      error: error.message,
    });
  }
});

const path = require("path");
const CustomerShcema = require("../models/customer");
const ProductSchema = require("../models/product");
const { json } = require("express");

module.exports = router;
