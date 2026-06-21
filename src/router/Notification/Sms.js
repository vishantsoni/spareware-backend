const express = require("express");

const router = express.Router();
const fetchuser = require("../../middleware/fetchusertoken");
const { body, validationResult } = require("express-validator");
const mongoose = require("mongoose");

var request = require("request");

router.post("/sendOtp", async (req, res) => {
  const { otp, number } = req.body;
  const message = `Your OTP Verification Code is ${otp}. Do not share it with anyone. Myorderslip.`;
  var options = {
    method: "POST",
    url: "https://smsapi.edumarcsms.com/api/v1/sendsms",
    headers: {
      apikey: "cktmx65hb0006gxqo5oxh05bq",
      "Content-Type": "application/json",
    },
    body: {
      number: number,
      message: message,
      senderId: "ODRSLP",
      templateId: "1707163194414141059",
    },
    json: true,
  };

  request(options, function(error, response, body) {
    if (error) throw new Error(error);
    if (body.success) {
      res
        .status(202)
        .json({ status: "Sucess", msg: "Message has been sent", data: body });
    } else {
      res
        .status(203)
        .json({ status: "Failed", msg: "Something Went wrong", data: body });
    }
    // console.log(body);
  });
});





// send invitation

router.post("/sendInvitation", async (req, res) => {
  const { supplier, phone, number, com_name, pass } = req.body;
console.log("------------ invitaion sms-----------------");
const link = "http://myorderslip.com/app";
const login_d = phone+"-"+pass;
//const msg = `You are invited by ${supplier} of ${com_name} to join myorderslip.com . Download Link - ${link}`;
const msg = `Invitation from ${supplier} to join myorderslip.com. \nId - ${phone}, pass - ${pass}. \nLink - ${link}`;
console.log(msg);
  var options = {
    method: "POST",
    url: "https://smsapi.edumarcsms.com/api/v1/sendsms",
    headers: {
      apikey: "cktmx65hb0006gxqo5oxh05bq",
      "Content-Type": "application/json",
    },
    body: {
      number: number,
      message: msg,
      senderId: "ODRSLP",
      templateId: "1707167379270722867",
    },
    json: true,
  };

  request(options, function(error, response, body) {
    if (error) throw new Error(error);
    if (body.success) {
      res
        .status(202)
        .json({ status: "Sucess", msg: "Invitation has been sent by SMS", data: body });
    } else {
      res
        .status(203)
        .json({ status: "Failed", msg: "Something Went wrong", data: body });
    }
console.log(body);
  });
});






module.exports = router;
