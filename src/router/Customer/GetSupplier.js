const express = require("express");
const router = express.Router();
const { body, validationResult, param } = require("express-validator");

const mongoose = require("mongoose");
const Users = require("../../models/users");
const Company = require("../../models/company");
const fetchuser = require("../../middleware/fetchusertoken");
const CartShcema = require("../../models/cart");
const { json } = require("express");

router.get("/getAllSupplier", fetchuser, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(206).json({ status: "Failed", msg: errors.array() });
  }
  try {
    const data = [];
    const user = await Users.find({
      type: "supplier",
      "customer_data.customer_id": req.user.id,
    });

    if (!user) {
      return res.status(201).json({ status: "Success", msg:"no supplier found" });
    }

    for (let i = 0; i < user.length; i++) {
      let element = user[i];
      const com = await Company.findOne({ userid: element._id });
      data.push({ supplier_id: element, com: com });
      console.log(data);
    }

    console.log(user);

    res.json({ status: "Success", data: data });
  } catch (error) {
    res.status(202).json({
      status: "Failed",
      msg: "Something Went Wrong",
      error: error.message,
    });
  }
});

// Cart api start form here

router.post("/addToCart", fetchuser, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(206).json({ status: "Failed", msg: errors.array() });
  }
  try {
    const user = await Users.findById(req.user.id);
    console.log(req.body);
    if (!user) {
      return res.status(201).json({ status: "Failed", msg: "User not found" });
    }

    const { product_id, catlog_id, type, key, qty, price } = req.body;
    let oldcart = await CartShcema.find({
      product_id,
      catlog_id,
      key,
      type,
      price,
    });
    if (oldcart) {
      oldcart.qty = qty;
      const updatecart = await CartShcema.findByIdAndUpdate(
        oldcart._id,
        { $set: oldcart },
        { new: true }
      );

      return res
        .status(200)
        .json({
          status: "Success",
          msg: "Product has been updated to cart",
          body: updatecart,
        });
    }

    const newCart = new CartShcema({
      product_id,
      catlog_id,
      type,
      key,
      qty,
      userid: req.user.id,
      price,
    });

    const saveCart = await newCart.save();
    res.status(200).json({
      status: "Success",
      msg: "Product has been added to cart",
      body: saveCart,
    });
  } catch (error) {
    res.status(205).json({
      status: "Failed",
      msg: "Something Went Wrong",
      error: error.array,
    });
  }
});

router.get("/getCart", fetchuser, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(206).json({ status: "Failed", msg: errors.array() });
  }
  try {
    const user = await Users.findById(req.user.id);
    if (!user) {
      return res.status(204).json({ status: "Failed", msg: "User Not Found" });
    }

    const cart = await CartShcema.find({ userid: req.user.id })
      .populate("product_id")
      .populate("catlog_id");
    res.status(200).json({ status: "Success", data: cart });
  } catch (error) {
    res.status(205).json({
      status: "Failed",
      msg: "Something Went Wrong",
      error: error.array,
    });
  }
});

router.delete("/deleteProductCart/:id", fetchuser, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(206).json({ status: "Failed", msg: errors.array() });
  }
  try {
    let cart = await CartShcema.findById(req.params.id);
    if (!cart) {
      return res
        .status(404)
        .json({ status: "Failed", msg: "Product not found" });
    }

    if (cart.userid.toString() !== req.user.id) {
      return res.status(401).json({ status: "Failed", msg: "Not Allowed" });
    }

    const deleteCart = await CartShcema.findByIdAndDelete(req.params.id);
    res.json({ status: "Success", msg: "Deleted", data: deleteCart });
  } catch (error) {
    res.status(206).json({
      status: "Failed",
      msg: "Something Went Wrong",
      error: error.message,
    });
  }
});

router.put(
  "/updatecart/:id/:qty",
  param("id").isMongoId(),
  fetchuser,
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(206).json({ status: "Failed", msg: errors.array() });
    }
    try {
      console.log("----cart qty update start-----");
      console.log(req.params);
      let cart = await CartShcema.findById(req.params.id);
      if (!cart) {
        return res
          .status(404)
          .json({ status: "Failed", msg: "Cart data not found" });
      }

      if (cart.userid.toString() !== req.user.id) {
        return res.status(401).json({ status: "Failed", msg: "Not Allowed" });
      }

      cart.qty = req.params.qty;
      const update = await CartShcema.findByIdAndUpdate(
        cart._id,
        { $set: cart },
        { new: true }
      );

      res.json({ status: "Success", msg: "Deleted", data: update });
    } catch (error) {
      res.status(206).json({
        status: "Failed",
        msg: "Something Went Wrong",
        error: error.message,
      });
    }
  }
);

module.exports = router;
