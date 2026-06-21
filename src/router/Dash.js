const express = require("express");
const fetchuser = require("../middleware/fetchusertoken");
const OrderSchema = require("../models/orders");
const Users = require("../models/users");
const Payment = require("../models/payment");
const router = express.Router();

router.get("/getdash", fetchuser, async (req, res) => {
  try {
    let data = {};

    const user = await Users.findById(req.user.id);
    if (!user) {
      return res.status(202).json({ status: "Failed", msg: "User not found" });
    }

    // get all outstanding data

    let out_standing = 0;
    user.customer_data.forEach((cus) => {
      out_standing += cus.out_standing;
    });

    // today sale
    let today = new Date();
    let backDate = new Date();
    backDate.setHours(0, 0, 0);
    let order_total = 0;
    const order = await OrderSchema.find({
      supplier_id: req.user.id,
      createdAt: {
        $gte: backDate,
        $lt: today,
      },
    });
    order.forEach((ord) => {
      order_total += ord.total_price;
    });

    // top selling
    const top_selling = await OrderSchema.aggregate([
      {
        $unwind: "$order_list",
      },
      {
        $group: {
          _id: "$order_list.product_id._id",
          sum: {
            $sum: "$order_list.qty",
          },
        },
      },
      {
        $sort: {
          sum: -1,
        },
      },
      {
        $group: {
          _id: null,
          top_selling_products: {
            $push: "$_id",
          },
        },
      },
    ]);

    // top customer
    const top_customer = await OrderSchema.aggregate([
      {
        $unwind: "$userid",
      },
      {
        $group: {
          _id: "$userid",
          sum: {
            $sum: "$total_price",
          },
        },
      },
      {
        $sort: {
          sum: -1,
        },
      },
      {
        $group: {
          _id: null,
          top_customer: {
            $push: "$_id",
          },
        },
      },
    ]);

    res
      .status(200)
      .json({ status: "Success", out_standing, order_total, top_selling });
  } catch (error) {
    res.status(201).json({
      status: "Failed",
      msg: "Server internal error",
      error: error.message,
    });
  }
});

const payable = async (id) => {
  let payable = 0;
  let w_amt = 0;
  const order = await OrderSchema.find({
    userid: id,
  });

  if (order) {
    order.forEach((element) => {
      payable += parseFloat(element.total_price);
    });
  }

  const wallet = await Payment.find({ userid: cus_id });
  if (wallet) {
    wallet.forEach((element) => {
      w_amt += element.amt;
    });
  }

  payable = payable - w_amt;
  return payable;
};

module.exports = router;
