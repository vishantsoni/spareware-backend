const express = require("express");

const router = express.Router();
const fetchuser = require("../../middleware/fetchusertoken");
const { body, validationResult } = require("express-validator");

const Users = require("../../models/users");

const mongoose = require("mongoose");
const NotiSchema = require("../../models/notify");
const request = require("request");
// fetch all Categories

router.post("/createNoti", fetchuser, async (req, res) => {
  try {
    const user = await Users.findById(req.user.id);
    if (!user) {
      return res.status(204).json({ status: "Failed", msg: "Not Allow" });
    }

    let { userid, path, title, message, image, markasread } = req.body;

    
    const newNoti = new NotiSchema({
      userid,
      path,
      title,
      message,
      image,
      markasread,
    });

    const newData = await newNoti.save();
    res
      .status(202)
      .json({ status: "Success", msg: "New Notfication Added", data: newData });
  } catch (error) {
    res.status(206).json({
      status: "Failed",
      msg: "Server internal Eroor",
      error: error.message,
    });
  }
});

// this is for get all notifications
router.get("/getAllNotification", fetchuser, async (req, res) => {
  try {
    const user = await Users.findById(req.user.id);
    if (!user) {
      return res.status(204).json({ status: "Failed", msg: "Not Allow " });
    }

    const data = await NotiSchema.find({ userid: req.user.id });
    res.status(201).json({ status: "Success", msg: "Found", data: data });
  } catch (error) {
    res
      .status(206)
      .json({
        status: "Failed",
        msg: "Server internal error",
        error: error.message,
      });
  }
});




// push notification
router.post("/push_noti", fetchuser, async (req, res) => {
  try {
    const {id, data } = req.body;
    console.log(req.body);

    const user = await Users.findById(id);
    if(!user){
    	return res.status(202).json({status:"Failed", msg:"User not found"});
    }


    var options = {
      method: "POST",
      url: "https://fcm.googleapis.com/fcm/send",
      headers: {
        "Content-Type": "application/json",
        Authorization:
          "key=AAAATW1yivY:APA91bE_ofL0pbjOhlTPLm9lHT8cVBBUuHpH9XKXsvE3zp6TF7BASIS6M4aNAg3lzr10O_u0YZDi2z5HPxubZcW54h_Nx86lF8p8XQWeigNMVrK4Mczv6OWhsuJ4UkZWmzdqnA0WY6sZ",
      },
      body: JSON.stringify({
        to: user.devide_token,
        data: data,
      }),
    };
    request(options, function (error, response, body) {
      if (error) throw new Error(error);
      if (body.success === 1) {
        res
          .status(200)
          .json({
            status: "Success",
            msg: "Notification has been sent",
            data: body,
          });
      } else {
        res
          .status(203)
          .json({ status: "Failed", msg: "Something Went wrong", data: body });
      }
    });
  } catch (error) {
console.log(error);
    res.status(201).json({ status: "Failed", msg: "Server Internal Error", error });
  }
});


module.exports = router;
