const express = require("express");
const router = express.Router();
const { body, validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const JWT_SETCRET = "myorderslipquthdata";
const jwt = require("jsonwebtoken");

const fetchuser = require("../middleware/fetchusertoken");
const mongoose = require("mongoose");
const Subscription = require("../models/subscription");

// this route use for register Subscription plan

router.get("/getSubscription", async (req, res) => {
  try {
    const subscription = await Subscription.find().sort({_id:-1});
    res.status(201).json({status:"Success", "data":subscription});
  } catch (error) {
    console.log(error.message);
    res.status(500).json({status:"Failed", "msg":"Data not found"});
  }
});

router.post(
  "/createPlan",
  [
    body("planName", "Enter a valid Plan Name").isLength({ min: 3 }),
    body("duration", "Enter a valid duration").isLength({ min: 3 }),
    body("price", "Enter a valid price").isLength({ min: 1 }),
    body("perday", "Enter a valid Per Day").isLength({ min: 1 }),
    
  ],
  async (req, res) => {
    try {
      // check weather use exist already
      let subs = await Subscription.findOne({ planName: req.body.planName }).sort({_id:-1});
      if (subs) {
        return res
          .status(207)
          .json({ status: "Failed", error: "Plan already exists" });
      }

      subs = await Subscription.create(req.body);

      res.status(201).json({
        status: "Success",
        msg: "Plan has been created",
        data: subs,
      });
      //res.status(201).json({authtoken });
    } catch (error) {
      console.log(error.message);
      res.status(500).send("Some internal error");
    }
  }
);

module.exports = router;
