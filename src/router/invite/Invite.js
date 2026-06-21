const express = require("express");
const router = express.Router();
const { body, validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const JWT_SETCRET = "myorderslipquthdata";
const jwt = require("jsonwebtoken");

const mongoose = require("mongoose");
var request = require("request");
const fetchuser = require("../../middleware/fetchusertoken");
const InviteShcema = require("../../models/invite");
const Users = require("../../models/users");

router.get("/getInvites/:type/:id", fetchuser, async (req, res) => {
  try {
    console.log(req.params);
    const { type, id } = req.params;
    let invite = [];

    if (type === "supplier") {
      invite = await InviteShcema.find({ supplier_id: id }).populate("cus_id");
    } else if (type === "user") {
      invite = await InviteShcema.find({ cus_id: id }).populate("supplier_id");
    } else {
      return res
        .status(202)
        .json({ status: "Failed", msg: "Invalid Parameters" });
    }

    res.status(200).json({ status: "Success", msg: "Found", data: invite });
  } catch (error) {
    res
      .status(208)
      .json({ status: "Failed", msg: "Server Internal Error", err: error });
  }
});

router.put("/changeStatus/:type/:id", fetchuser, async (req, res) => {
  try {
    const { id, type } = req.params;
    let invite = await InviteShcema.findById(req.params.id);
    if (!invite) {
      res.status(201).json({ status: "Failed", msg: "Invite not found" });
    }

    console.log(invite);
    if (type === "approve" || type === "reject") {
      const updateinvitedata = {
        supplier_id: invite.supplier_id._id,
        cus_id: invite.cus_id,
        status: type,
      };

      const updateinvite = await InviteShcema.findByIdAndUpdate(
        id,
        { $set: updateinvitedata },
        { new: true }
      );

      // now assigning customer

      if (type === "approve") {
        const supplier = await Users.findById(invite.supplier_id);

        let newCusotmerData = {};
        newCusotmerData.customer_id = updateinvite.cus_id;
        newCusotmerData.nick_name = updateinvite.nick_name;

        if (supplier.customer_data.length > 0) {
          for (
            let i = 0;
            i < supplier.customer_data.length;
            i++
          ) {
            const element = supplier.customer_data[i];

            if (
              element.customer_id.toString() === newCusotmerData.customer_id
            ) {
              return res
                .status(200)
                .json({ status: "Failed", msg: "Customer Already Inserted" });
            } else {
              supplier.customer_data.splice(
                0,
                0,
                newCusotmerData
              );
              break;
            }
          }
        } else {
          supplier.customer_data.splice(0, 0, newCusotmerData);
        }

        const updateUser = await Users.findByIdAndUpdate(
          supplier._id,
          { $set: supplier },
          { new: true }
        );
        return res.status(200).json({
          status: "Success",
          msg: "Invite has been updated",
          data: updateinvite,
          supplier_data: updateUser,
        });
      }

      res.status(200).json({
        status: "Success",
        msg: "Invite has been reject",
        data: updateinvite,
      });
    }
    return res.status(203).json({ status: "Failed", msg: "Invalid Parameter" });
  } catch (error) {
    res.status(208).json({
      status: "Failed",
      msg: "Server Internal Error",
      err: error.message,
    });
  }
});

router.delete("/delinvite/:id", fetchuser, async (req, res) => {
  try {
    const invite = await InviteShcema.findById(req.params.id);
    if (!invite) {
      res.status(201).json({ status: "Failed", msg: "Invite not found" });
    }

    const deletedata = await InviteShcema.findByIdAndDelete(req.params.id);
    res.status(200).json({ status: "Success", msg: "Invite has been deleted" });
  } catch (error) {
    res
      .status(208)
      .json({ status: "Failed", msg: "Server Internal Error", err: error });
  }
});

router.post("/createInvoice", fetchuser, async (req, res) => {
  try {
    const { cus_id, status, nick_name } = req.body;

    const inv = await InviteShcema.findOne({
      supplier_id: req.user.id,
      cus_id,
    });
    if (inv) {
      return res.status(201).json({ status: "Failed", msg: "Already Invited" });
    }

    let new_invite = new InviteShcema({
      supplier_id: req.user.id,
      cus_id,
      status,
      nick_name
    });
    const data = await new_invite.save();

    res
      .status(200)
      .json({ status: "Success", msg: "Invite has been created", data: data });
  } catch (error) {
    res
      .status(208)
      .json({ status: "Failed", msg: "Server Internal Error", err: error });
  }
});

module.exports = router;
