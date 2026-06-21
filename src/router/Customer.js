const express = require("express");
const router = express.Router();
const fetchuser = require("../middleware/fetchusertoken");
const Users = require("../models/users");

const { body, validationResult } = require("express-validator");
const OrderSchema = require("../models/orders");
const Company = require("../models/company");
const InviteShcema = require("../models/invite");
const Payment = require("../models/payment");
const CatalogScheme = require("../models/catalog");
const fetchadminusertoken = require("../middleware/fetchadminusertoken");
const requireAdmin = require("../middleware/requireAdmin");
// fetch all users

router.get(
  "/getCustomers",
  fetchadminusertoken,
  requireAdmin,
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: "Failed",
        msg: "Validation Error",
        errors: errors.array(),
      });
    }
    try {
      const data = [];
      const user = await Users.find();

      if (!user) {
        return res.status(201).json({
          status: "Failed",
          msg: "User not found",
          id: req.user.id,
        });
      }

      res.status(200).json({
        status: "success",
        data: user,
      });
    } catch (e) {
      res.status(202).json({
        status: "Failed",
        msg: "Something Went Wrong",
        error: e.message,
      });
    }
  },
);

// Createuser

router.post(
  "/createCustomer",
  fetchuser,
  [
    body("phone", "Enter a Phone Number").isLength({ min: 10 }),
    body("name", "Enter a Valid Name").isLength({ min: 5 }),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(201).json({ status: "Failed", errors: errors.array() });
    }

    const {
      phone,
      name,
      email,
      address,
      cus_image,
      com_name,
      gst_no,
      bus_type,
    } = req.body;

    try {
      let customers = await Customershcema.findOne({ phone: req.body.phone });
      if (customers) {
        return res
          .status(201)
          .json({ status: "Failed", error: "Customer already exists" });
      }

      userid = req.user.id;
      const com = new Customershcema({
        userid,
        phone,
        name,
        email,
        address,
        cus_image,
        com_name,
        gst_no,
        bus_type,
      });
      const saveCom = await com.save();
      res.status(201).json({
        status: "Success",
        msg: "Customer has been created",
        data: saveCom,
      });
    } catch (e) {
      console.log(e.message);
      res.status(201).json({
        status: "Failed",
        error: e.message,
        msg: "Some internal error",
        err: e.message,
      });
    }
  },
);

//delete customer

router.delete("/deleteFromSupplier/:id", fetchuser, async (req, res) => {
  try {
    let user = await Users.findById(req.user.id).populate({
      path: "customer_data",
      populate: {
        path: "customer_id",
      },
    });

    if (!user) {
      return res
        .status(102)
        .json({ status: "Failed", msg: "Supplier not found" });
    }

    let updateType = false;

    for (let i = 0; i < user.customer_data.length; i++) {
      const element = user.customer_data[i];
      if (element.customer_id._id.toString() === req.params.id) {
        user.customer_data.splice(i, 1);
        updateType = true;
      }
    }

    if (!updateType) {
      return res
        .status(201)
        .json({ status: "Failed", msg: "Customer not found" });
    }

    const invite = await InviteShcema.findOne({
      supplier_id: req.user.id,
      cus_id: req.params.id,
    });
    if (invite) {
      await InviteShcema.findByIdAndDelete(invite._id);
    }

    const updateuser = await Users.findByIdAndUpdate(
      user._id,
      { $set: user },
      { new: true },
    );

    // delete customer from catalog
    const catlog = await CatalogScheme.find({
      userid: req.user.id,
      "customers.cus_id": req.params.id,
    });

    for (let i = 0; i < catlog.length; i++) {
      const element = catlog[i];
      for (let j = 0; j < element.customers.length; j++) {
        const cus = element.customers[j];
        if (cus.cus_id.toString() === req.params.id) {
          element.customers.splice(j, 1);
        }
      }
      const updatecata = await CatalogScheme.findByIdAndUpdate(
        catlog._id,
        { $set: element },
        { new: true },
      );
    }

    res.status(200).json({
      status: "Success",
      msg: "Customer has been deleted",
      data: updateuser,
    });
  } catch (error) {
    res
      .status(105)
      .json({ status: "Failed", msg: "Server Internal Error", error });
  }
});

// block and unblock customer
router.put("/changeStatus/:type/:id", fetchuser, async (req, res) => {
  try {
    const { type, id } = req.params;
    const supp_id = req.user.id;
    let user = await Users.findById(supp_id);

    if (!user) {
      return res
        .status(102)
        .json({ status: "Failed", msg: "Supplier not found" });
    }

    for (let i = 0; i < user.customer_data.length; i++) {
      const element = user.customer_data[i];
      if (type === "block") {
        if (element.customer_id.toString() === id) {
          element.status = false;
        }
      } else if (type === "unblock") {
        if (element.customer_id.toString() === id) {
          element.status = true;
        }
      }
    }

    const updateUser = await Users.findByIdAndUpdate(
      user._id,
      { $set: user },
      { new: true },
    );
    res.status(200).json({
      status: "Success",
      msg: "Customer Status has been changed",
      data: updateUser,
    });
  } catch (error) {
    res
      .status(101)
      .json({ status: "Failed", msg: "Server Internal Error", error });
  }
});

//edit customer
router.put("/updateCustomer/:cus_id/:name", fetchuser, async (req, res) => {
  try {
    const { cus_id, name } = req.params;

    let user = await Users.findById(req.user.id);
    if (!user) {
      return res
        .status(201)
        .json({ status: "Failed", msg: "Supplier not found" });
    }

    for (let i = 0; i < user.customer_data.length; i++) {
      const element = user.customer_data[i];
      if (element.cus_id.toString() === cus_id.toString()) {
        element.nick_name = name;
        break;
      }
    }

    const update_user = await Users.findByIdAndUpdate(
      user._id,
      { $set: true },
      { new: true },
    );
    res.status(200).json({
      status: "Success",
      msg: "Customer has been updated",
      data: update_user,
    });
  } catch (error) {
    res.status(204).json({
      status: "Failed",
      msg: "Something Went Wrong",
      error: error.message,
    });
  }
});

router.put("/setLimit/:id/:limit", fetchuser, async (req, res) => {
  try {
    const { id, limit } = req.params;
    const sup_id = req.user.id;
    let user = await Users.findById(sup_id);

    if (!user) {
      return res
        .status(102)
        .json({ status: "Failed", msg: "Supplier not found" });
    }

    for (let i = 0; i < user.customer_data.length; i++) {
      const element = user.customer_data[i];
      if (element.customer_id.toString() === id) {
        element.order_limit = limit;
      }
    }

    const u_user = await Users.findByIdAndUpdate(
      user._id,
      { $set: $user },
      { new: true },
    );
    res
      .status(200)
      .json({ status: "Success", msg: "Limit has been set", data: u_user });
  } catch (error) {
    res
      .status(101)
      .json({ status: "Failed", msg: "Server Internal Error", error });
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
  })
    .sort({ _id: -1 })
    .populate("userid")
    .populate("supplier_id");

  if (order) {
    order.forEach((element) => {
      amt += parseFloat(element.total_price);
    });
  }

  const wallet = await Payment.find({ userid: cus_id, supplier_id: sup_id });
  if (wallet) {
    wallet.forEach((element) => {
      w_amt += element.amt;
    });
  }

  returnarrau.orders = order;
  returnarrau.payments = wallet;
  returnarrau.out = w_amt - amt;
  return returnarrau;
}

module.exports = router;
