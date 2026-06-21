const express = require("express");

const router = express.Router();
const fetchuser = require("../middleware/fetchusertoken");
const { body, validationResult } = require("express-validator");
const mongoose = require("mongoose");
const Payment = require("../models/payment");
const Users = require("../models/users");

router.get("/getPayments", fetchuser, async (req, res) => {
  try {
    let payData = [];

    payData = await Payment.find({ userid: req.user.id })
      .sort({ _id: -1 })
      .populate("supplier_id");

    let msg = "Data Found";
    if (payData.length === 0) {
      msg = "No data Found";
    }
    res.status(202).json({ status: "Success", msg, data: payData });
  } catch (error) {
    res.status(206).json({
      status: "Failed",
      msg: "Server Internal Error",
      error: error.message,
    });
  }
});

// supplier payments api
router.get("/getPaymentSupplier", fetchuser, async (req, res) => {
  try {
    let payData = [];
    payData = await Payment.find({ supplier_id: req.user.id })
      .sort({ _id: -1 })
      .populate("supplier_id")
      .populate("userid");

    let msg = "Data Found";
    if (payData.length === 0) {
      msg = "No data Found";
    }
    res.status(202).json({ status: "Success", msg, data: payData });
  } catch (error) {
    res.status(206).json({
      status: "Failed",
      msg: "Server Internal Error",
      error: error.message,
    });
  }
});

router.post("/createPayment/:type", fetchuser, async (req, res) => {
  try {
    let {
      userid,
      supplier_id,
      amt,
      collectedBy,
      mode,
      desc,
      createBy,
      createAt,
    } = req.body;
    const { type } = req.params;
    let payment = null;
    if (type === "supplier") {
      supplier_id = req.user.id;
      payment = new Payment({
        userid,
        supplier_id,
        amt,
        collectedBy,
        mode,
        desc,
        createBy,
        createAt,
        approve: true,
      });
    } else if (type === "user") {
      userid = req.user.id;
      payment = new Payment({
        userid,
        supplier_id,
        amt,
        collectedBy,
        mode,
        desc,
        createBy,
        createAt,
        approve: false,
      });
    } else if (type === "orderComplete") {
      userid = req.user.id;
      payment = new Payment({
        userid,
        supplier_id,
        amt,
        collectedBy,
        mode,
        desc,
        createBy,
        createAt,
        approve: true,
      });
    } else {
      return res.status(207).json({ status: "Failed", msg: "Invalid Type" });
    }

   const pay = await payment.save();

   let data = await Payment.findById(pay._id).populate("userid").populate("supplier_id");


	let out = [];

		out = data.supplier_id.customer_data;
		out.forEach((ele)=>{
			if(ele.customer_id.toString() === data.userid._id.toString()){
				ele.out_standing = ele.out_standing - amt;
			}
		});
		const updateUser = await Users.findByIdAndUpdate(data.supplier_id._id, {$set:{customer_data:out}}, {new:true});
   data.supplier_id = updateUser;

//console.log(updateUser);

    res
      .status(202)
      .json({ status: "Success", msg: "Payment has been added", data: data });
  } catch (error) {
    res.status(206).json({
      status: "Failed",
      msg: "Server Internal Error",
      err: error.message,
    });
  }
});

//###########################################################################
// Time Filter Reports
router.get("/getPartyReport/:supplier_id/:userid/:time",  async (req, res) => {  

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
    
    console.log("payment report");

    console.log(backDate);
    console.log(today);
    console.log("Formate date");


    const backDateNew = backDate.getFullYear()+"-"+(backDate.getMonth()+1)+"-"+backDate.getDate();
    const todayDateNew = today.getFullYear()+"-"+(today.getMonth()+1)+"-"+today.getDate();
    
    




    const staff = await Payment.find({
      supplier_id: req.params.supplier_id,
      userid: req.params.userid,
      createAt: {
        $gte: backDate,
        $lt: today,
      },
    })

      .populate("userid")
      .populate("supplier_id")      
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



// update payments







module.exports = router;
