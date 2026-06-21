const express = require("express");
const router = express.Router();
const Users = require("../models/users");
const Subscription = require("../models/subscription");
const { body, validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const JWT_SETCRET = "myorderslipquthdata";
const jwt = require("jsonwebtoken");

const fetchuser = require("../middleware/fetchusertoken");
const mongoose = require("mongoose");
var request = require("request");
const OTPShcema = require("../models/otp");
const InviteShcema = require("../models/invite");
const Company = require("../models/company");

router.put("/changepass", fetchuser, async (req, res) => {
  try {
    console.log(req.body);
    const { oldpass, newpass } = req.body;
    let user = await Users.findById(req.user.id);
    if (!user) {
      return res
        .status(206)
        .json({ status: "Failed", msg: "Account not found" });
    }

    const check = await bcrypt.compare(oldpass, user.password);
    //console.log(check);
    if (!check) {
      return res
        .status(207)
        .json({ status: "Failed", msg: "Incorrect old password" });
    }

    const salt = await bcrypt.genSalt(10);

    const newpass_encrypt = await bcrypt.hash(newpass, salt);
    user.password = newpass_encrypt;

    const update = await Users.findByIdAndUpdate(
      req.user.id,
      { $set: user },
      { new: true }
    );

    res.status(200).json({
      status: "Success",
      msg: "Password has been changed",
      data: update,
    });
  } catch (err) {
    res
      .status(208)
      .json({ status: "Failed", msg: "Server inter error", err: err.message });
  }
});

// this route use for register route
router.post(
  "/createuser",
  [
    body("phone", "Enter a valid phone").isLength({ min: 10 }, { max: 10 }),
    body("password", "Enter a valid password").isLength({ min: 5 }),
  ],
  async (req, res) => {
    console.log("creating user");
    
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(206).json({ errors: errors.array() });
    }

    try {
      // check weather use exist already
      let user = await Users.findOne({ email: req.body.email });
      if (user) {
        return res
          .status(207)
          .json({ status: "Failed", error: "Email already exists" });
      }

      const salt = await bcrypt.genSalt(10);
      const secPass = await bcrypt.hash(req.body.password, salt);

      req.body.password = secPass;
      user = await Users.create(req.body);

      const data = {
        user: {
          id: user.id,
        },
      };
      const authtoken = jwt.sign(data, JWT_SETCRET);

      res.status(201).json({
        status: "Success",
        msg: "User has been created",
        token: authtoken,
        data: user,
      });
      //res.status(201).json({authtoken });
    } catch (error) {
      console.log(error.message);
      res.status(500).json({msg:"Some internal error", err:error.message});
    }
  }
);

// this route use for login route
router.post(
  "/login",
  [
    body("phone", "Enter a valid Number").isMobilePhone(),
    body("password", "Enter a valid password").isLength({ min: 5 }),
  ],
  async (req, res) => {
    // if there are erorr
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(206).json({ status: "Failed", errors: errors.array() });
    }

    const { phone, password, d_id, token } = req.body;
console.log(req.body);
    try {
      let user = await Users.findOne({ phone });
      if (!user) {
        return res.status(203).json({
          status: "Failed",
          errors: "Please try to login with correct crediencials",
        });
      }

      const passwordcompar = await bcrypt.compare(password, user.password);
      if (!passwordcompar) {
        return res.status(206).json({
          status: "Failed",
          errors: "Please try to login with correct crediencials",
        });
      }

     //update token or device id in database
	user.devide_id = d_id;
	user.devide_token = token;
	user = await Users.findByIdAndUpdate( user._id, {$set:user}, {new:true} );


      const data = {
        user: {
          id: user.id,
        },
      };
      const authtoken = jwt.sign(data, JWT_SETCRET);
      const company = await Company.find({userid:user._id});
      res.status(200).json({ status: "Sucess", authtoken, user_data: user, com_data:company });
    } catch (error) {
      console.log(error.message);
      res.status(205).json({ status: "Failed", msg: "Internal server error" });
    }
  }
);

// login with otp system
router.post(
  "/loginWithOtp",
  [body("phone", "Enter a valid Number").isMobilePhone()],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(206).json({ status: "Failed", errors: errors.array() });
    }

    try {
      const { phone, password } = req.body;
      let user = await Users.findOne({ phone });
      if (!user) {
        return res.status(203).json({
          status: "Failed",
          errors: "Please try to login with correct credentials ",
        });
      }

      const otp = Math.random().toFixed(6).substr(`-${6}`);

      // send otp

      const message = `Your OTP Verification Code is ${otp}. Do not share it with anyone. Myorderslip.`;
      var options = {
        method: "POST",
        url: "https://smsapi.edumarcsms.com/api/v1/sendsms",
        headers: {
          apikey: "cktmx65hb0006gxqo5oxh05bq",
          "Content-Type": "application/json",
        },
        body: {
          number: phone,
          message: message,
          senderId: "ODRSLP",
          templateId: "1707163194414141059",
        },
        json: true,
      };

      request(options, async (error, response, body) => {
        if (error) throw new Error(error);
        if (body.success) {
          let dataotp = null;
          let otpOldData = await OTPShcema.findOne({ phone });
          if (!otpOldData) {
            let newotpdata = new OTPShcema({ phone, otp });
            dataotp = await newotpdata.save();
            // res.json({ data });
          } else {
            const newotpdata = { otp };
            dataotp = await OTPShcema.findByIdAndUpdate(
              otpOldData._id,
              { $set: newotpdata },
              { new: true }
            );

            // res.json({ newotp });
          }

          res.status(202).json({
            status: "Sucess",
            msg: "Message has been sent",
            data: body,
            dataotp,
          });
        } else {
          res.status(203).json({
            status: "Failed",
            msg: "Something Went wrong",
            data: body,
          });
        }
      });

      // ################
      // send otp end
      // ################

      // res.status(202).json({ status: "Success", msg: "otp send", otpres });
    } catch (error) {
      res.status(206).json({
        status: "Failed",
        msg: "Something Went Wrong!",
        err: error.message,
      });
    }
  }
);

// verify otp
router.post("/verifyotp", async (req, res) => {
  try {
    console.log(req.body);
    const { phone, otp } = req.body;
    const user = await Users.findOne({ phone });
    if (!user) {
      return res
        .status(207)
        .json({ status: "Failed", msg: "Account not found." });
    }

    const dbOtp = await OTPShcema.findOne({ phone, otp });
    if (!dbOtp) {
      return res.status(207).json({ status: "Failed", msg: "Incorrect OTP" });
    }

    console.log(dbOtp);

    const data = {
      user: {
        id: user.id,
      },
    };
    const authtoken = jwt.sign(data, JWT_SETCRET);
    res.status(207).json({
      status: "Success",
      msg: "Login Sucess",
      authtoken,
      user_data: user,
    });
  } catch (error) {
    res.status(204).json({
      status: "Failed",
      msg: "Something Went Wrong",
      error: error.message,
    });
  }
});

// get user details

router.get("/getuserDetails", fetchuser, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(206).json({ status: "Failed", errors: errors.array() });
  }
  try {
    userid = req.user.id;
    const user = await Users.findById(userid).select("-password");
    res.send(user);
  } catch (error) {
    console.log(error.message);
    res.status(500).send("Internal server error");
  }
});

// edit User updateSubscription

router.put("/editUser", fetchuser, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(206).json({ status: "Failed", errors: errors.array() });
  }
  try {
    const { fullname, email, password, subscription, type } = req.body;

    const newUserData = {};
    if (fullname) {
      newUserData.fullname = fullname;
    }

    if (email) {
      newUserData.email = email;
    }

    if(type){      
      newUserData.type = type;
    }

    if (password) {
      const salt = await bcrypt.genSalt(10);
      const secPass = await bcrypt.hash(req.body.password, salt);
      newUserData.password = secPass;
    }
    if (subscription) {
      let subData = await Subscription.findById(subscription);

      if (!subData) {
        return res.status(200).json({ status: "Failed", msg: "Not found " });
      }

      newUserData.subscription = subscription;
      newUserData.type = "supplier";
      newUserData.subcribeAt = new Date();
    }

    let userData = await Users.findById(req.user.id);

    if (!userData) {
      return res.status(200).json({ status: "sucess", msg: "User not found" });
    }

    userData = await Users.findByIdAndUpdate(
      req.user.id,
      { $set: newUserData },
      { new: true }
    );

    res.status(200).json({ status: "Success", msg: "updated", data: userData });
  } catch (e) {
    res
      .status(204)
      .json({ status: "Failed", msg: "Invalid data", error: e.message });
  }
});

// getMyCustomers
router.get("/getMyCustomer", fetchuser, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(206).json({ status: "Failed", errors: errors.array() });
  }
  try {
    userid = req.user.id;
    const user = await Users.findById(userid);
    if (!user) {
      return res.status(204).json({ status: "Failed", msg: "User not found" });
    }
    res.status(200).json({ status: "Success", data: user.customer_data });
  } catch (error) {
    console.log(error.message);
    res.status(500).send("Internal server error");
  }
});

// updateCustomer
router.put(
  "/addCustomer",
  fetchuser,
  [
    body("phone", "Enter a valid phone").isLength({ min: 10 }, { max: 10 }),
    body("fullname", "Enter a valid name").isLength({ min: 3 }),
    body("password", "Enter a valid password").isLength({ min: 5 }),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(206).json({
        status: "Failed",
        msg: "Invalid Parameter",
        errors: errors.array(),
      });
    }
    try {
      let user = await Users.findById(req.user.id);
      if (!user) {
        return res
          .status(204)
          .json({ status: "Failed", msg: "User not found" });
      }

      const customer = await Users.findOne({ phone: req.body.phone });
      if (customer) {
        let customer_invite = await InviteShcema.findOne({
          supplier_id: req.user.id,
          cus_id: customer._id
        });
        if (customer_invite) {
          return res.status(203).json({
            status: "Failed",
            msg: `Invite Already Send & ${customer_invite.status}`,
          });
        }

        const createInvite = new InviteShcema({
          supplier_id: req.user.id,
          cus_id: customer._id,
	  nick_name:req.body.fullname,
          status: "pending",
        });
        const createdata = await createInvite.save();
        return res.status(200).json({
          status: "Success",
          msg: "Invite has been sent to cusotmer",
          data: createdata,
        });
      }

      // encrypt password with salt

      const salt = await bcrypt.genSalt(10);
      const secPass = await bcrypt.hash(req.body.password, salt);

      req.body.password = secPass;
      const newUser = await Users.create(req.body);

      const createInvite = new InviteShcema({
        supplier_id: req.user.id,
        cus_id: newUser._id,
        status: "pending",
      });
      const createdata = await createInvite.save();
      res.status(202).json({
        status: "Success",
        msg: "Customer account create and send invitation successfully",
        data: newUser,
        invite: createdata,
      });
    } catch (error) {
      console.log(error.message);
      res.status(207).json({
        status: "Failed",
        msg: "Enter valid information",
        err: error.message,
      });
    }
  }
);

//update profile

router.put("/updateprofile", fetchuser, async (req, res) => {
  try {
    const { name } = req.body;
    let user = await Users.findById(req.user.id);
    if (!user) {
      return res.status(201).json({ status: "Failed", msg: "User not found" });
    }

    user.fullname = name;
    const data = await Users.findByIdAndUpdate(
      req.user.id,
      { $set: user },
      { new: true }
    );

    res.status(200).json({status:"Success", msg:"Profile update", data:data});
  } catch (error) {
    req
      .status(208)
      .json({
        status: "Failed",
        msg: "Server Internal Error",
        err: error.message,
      });
  }
});




//login with device key
router.post("/login_device", fetchuser, async (req, res) => {
  try {
    // check weather use exist already
    let user = await Users.findOne({
      _id: req.user.id,
      devide_id: req.body.d_id,
    });
    if (!user) {
      return res.status(207).json({ status: "Failed", msg: "User not found" });
    }

    user.devide_token = req.body.token;
    const data = await Users.findByIdAndUpdate(
      user._id,
      { $set: user },
      { new: true }
    );
    res
      .status(200)
      .json({ status: "Success", msg: "logged in and update token", data });
  } catch (error) {
    console.log(error.message);
    res.status(500).send("Some internal error");
  }
});







module.exports = router;
