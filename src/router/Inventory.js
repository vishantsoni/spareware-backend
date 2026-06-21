const express = require("express");

const router = express.Router();
const fetchuser = require("../middleware/fetchusertoken");
const { body, validationResult } = require("express-validator");
const mongoose = require("mongoose");
var request = require("request");
const ProductSchema = require("../models/product");

router.post("/updateInventory/:type", async (req, res) => {
  try {
    console.log("-----------This is inventory update request----------");
    console.log(req.body);
    const { p_id, attr_id, inventory } = req.body;

    let attr;
    attr = await ProductSchema.findOne({ _id: p_id });

    if (!attr) {
      return res
        .status(208)
        .json({ status: "Failed", msg: "Product not found" });
    }
    if (req.params.type === "attr") {
      for (let i = 0; i < attr.p_price.length; i++) {
        const element = attr.p_price[i];
        if (element._id.toString() === attr_id) {
          element.inventory = inventory;

          break;
        }
      }
    } else {
      attr.inventory = inventory;
    }

    const updateUser = await ProductSchema.findByIdAndUpdate(
      attr._id,
      { $set: attr },
      { new: true }
    );

    res.status(200).json({
      status: "Success",
      msg: "Update inventory successfully",
      updateUser,
    });
  } catch (error) {
    res.status(203).json({
      status: "Failed",
      msg: "Server Internal Error",
      error: error.message,
    });
  }
});

module.exports = router;

