const express = require("express");

const router = express.Router();
const fetchuser = require("../../middleware/fetchusertoken");
const { body, validationResult } = require("express-validator");
const mongoose = require("mongoose");
const SettingSchema = require("../../models/settings");
const path = require("path");
var request = require("request");

router.get("/getinvoicesetting/:c_id", fetchuser, async (req, res) => {
  try {
    const { c_id } = req.params;
    const data = await SettingSchema.findOne({ userid: req.user.id, c_id });
    if (!data) {
      return res
        .status(202)
        .json({ status: "Success", msg: "Not found Any Setting" });
    }

    res.status(200).json({ status: "Success", msg: "Data Found", data });
  } catch (error) {
    res.status(503).json({
      status: "Failed",
      msg: "Server internal Error",
      error: error.message,
    });
  }
});

router.post("/setInvoiceSettings", fetchuser, async (req, res) => {
  try {
    const { c_id, invoiceSetting } = req.body;

    const oldsetting = await SettingSchema.findOne({
      userid: req.user.id,
      c_id,
    });
    if (!oldsetting) {
      let setting = new SettingSchema({
        userid: req.user.id,
        c_id,
        invoiceSetting,
      });

      setting = setting.save();

      return res
        .status(200)
        .json({ status: "Success", data: req.body, data1: setting });
    }

    const newInvoideSetting = {
      invoiceSetting,
    };

    let updateInvoice = await SettingSchema.findByIdAndUpdate(
      oldsetting._id,
      { $set: newInvoideSetting },
      { new: true }
    );

    res.status(200).json({
      status: "Success",
      msg: "Invoice Setting Updated",
      data: updateInvoice,
    });
  } catch (error) {
    res.status(506).json({
      status: "Failed",
      msg: "Internal Server Error",
      error: error.message,
    });
  }
});

router.post("/updateSignatoryImage/:id", fetchuser, async (req, res) => {
  try {
    let setting = await SettingSchema.findById(req.params.id);
    if (!setting) {
      return res
        .status(404)
        .json({ status: "Failed", msg: "Setting id is invalid" });
    }

    
    const fileObject = req.files.file;
    // if (file === undefined) {
    //   return res
    //     .status(206)
    //     .json({ status: "Failed", msg: "Please Send Image File" });
    // }
    let filename = Date.now() + "_" + fileObject.name;
    let newpath = path.join(process.cwd(), "static/image", filename);
    const imagepath =
      req.protocol + "://" + req.get("host") + "/media/image/" + filename;

    setting.invoiceSetting.signatory = imagepath;
    fileObject.mv(newpath);

    let updateSetting = await SettingSchema.findByIdAndUpdate(
      req.params.id,
      { $set: setting },
      { new: true }
    );

    res
      .status(200)
      .json({
        status: "Success",
        msg: "Signatory Image Uploaded",
        data: updateSetting,
      });
  } catch (e) {
    console.log(req.files);
    if (req.files === null) {
      res.json({ status: "Failed", msg: "Invalid Image", error: e.message });
      return;
    } else {
      res.json({ status: "Failed", msg: "Server Error", error: e.message });
      return;
    }
  }
});

module.exports = router;
