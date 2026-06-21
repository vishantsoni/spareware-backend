const express = require("express");

const router = express.Router();
const fetchuser = require("../middleware/fetchusertoken");
const { body, validationResult } = require("express-validator");
const mongoose = require("mongoose");
var request = require("request");
const Users = require("../models/users");
const InvoiceShcema = require("../models/invoice");

router.get("/getInvoice", fetchuser, async (req, res) => {
  try {
    const invoice = await InvoiceShcema.find({
      supplier_id: req.user.id
    }).populate("customer_id").populate("supplier_id");

    res
      .status(200)
      .json({ status: "Success", msg: "Data found", data: invoice });
  } catch (error) {
    res.status(503).json({
      status: "Failed",
      msg: "Server Internal Error",
      error: error.message,
    });
  }
});

// invioce by id
router.get("/getById/:id", fetchuser, async (req, res) => {
  try {
    const inv = await InvoiceShcema.findById(req.params.id)
    .populate(
      "supplier_id"
    )
    .populate(
      "customer_id"
    ).populate("item_data.p_id");

    res.status(203).json({ status: "Success", msg: "Found", data: inv });
  } catch (error) {
    res.status(503).json({
      status: "Failed",
      msg: "Server Internal Error",
      error: error.message,
    });
  }
});

router.post("/createInvoice", fetchuser, async (req, res) => {
  try {
    const {
      customer_id,
      inv_number,
      item_data,
      taxableAmt,
      totalPrice,
      bankData,
      signatory,
      createdAt,
    } = req.body;

    const user = await Users.findById(req.user.id);
    if (!user) {
      return res.status(208).json({ status: "Failed", msg: "Invalid User" });
    }

    const invoiceOld = await InvoiceShcema.findOne({ inv_number: inv_number });
    if (invoiceOld) {
      return res
        .status(206)
        .json({ status: "Failed", msg: "Invoice is already created" });
    }

    const invoice = new InvoiceShcema({
      supplier_id: req.user.id,
      customer_id,
      inv_number,
      item_data,
      taxableAmt,
      totalPrice,
      bankData,
      signatory,
      createdAt,
    });

    const newInvoice = await invoice.save();
    res.status(200).json({
      status: "Success",
      msg: "Invoice has created",
      data: newInvoice,
    });
  } catch (error) {
    console.log(error.message);
    res.status(503).json({
      status: "Failed",
      msg: "Server Internal Error",
      error: error.message,
    });
  }
});

module.exports = router;
