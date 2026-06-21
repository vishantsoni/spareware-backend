const express = require("express");
const router = express.Router();
const fetchuser = require("../middleware/fetchusertoken");
const { body, validationResult } = require("express-validator");
const RoleSchema = require("../models/role");
const Company = require("../models/company");
const fetchadminusertoken = require("../middleware/fetchadminusertoken");
const requireAdmin = require("../middleware/requireAdmin");

router.get("/getRole/:c_id", fetchuser, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ status: "Failed", errors: errors.array() });
  }

  console.log(req.params.c_id);

  let com = await Company.find({ _id: req.params.c_id });

  if (!com) {
    return res.status(200).json({ status: "Failed", msg: "Company not found" });
  }

  console.log(req.user.id);
  const categorySchema = await RoleSchema.find({
    userid: req.user.id,
    c_id: req.params.c_id,
  });
  let msg = categorySchema.length + " Found";

  res.json({
    status: "success",
    msg: msg,
    data: categorySchema,
  });
});

router.post(
  "/createRole",
  fetchuser,
  [body("role_name", "Enter a Role Name").isLength({ min: 2 })],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ status: "Failed", errors: errors.array() });
    }

    let com = await Company.find({ _id: req.body.com_id });
    if (!com) {
      return res
        .status(200)
        .json({ status: "Failed", msg: "Company not found" });
    }

    try {
      const { role_name, com_id, access } = req.body;
      let categories = await RoleSchema.findOne({
        userid: req.user.id,
        com_id: req.body.com_id,
        role_name: req.body.role_name,
      });
      if (categories) {
        return res
          .status(201)
          .json({ status: "Failed", error: "Role is already exists" });
      }

      userid = req.user.id;
      const newRole = new RoleSchema({
        userid,
        role_name,
        com_id,
        access,
      });
      const saveRole = await newRole.save();
      res.status(201).json({
        status: "Success",
        msg: "Role has been created",
        data: saveRole,
      });
    } catch (e) {
      console.log(e.message);
      res.status(201).json({
        status: "Failed",
        error: e.message,
        msg: "Some internal error",
      });
    }
  },
);

router.get("/", fetchadminusertoken, requireAdmin, async (req, res) => {
  try {
    const roles = await RoleSchema.find();
    return res.json({
      status: "success",
      msg: `${roles.length} Found`,
      data: roles,
    });
  } catch (e) {
    console.log(e.message);
    return res.status(500).json({
      status: "Failed",
      msg: "Some internal error",
      error: e.message,
    });
  }
});

router.get("/admin", fetchadminusertoken, requireAdmin, async (req, res) => {
  try {
    const userid = req.admin.id;

    const roles = await RoleSchema.find({
      userid: userid,
    });
    return res.json({
      status: "success",
      msg: `${roles.length} Found`,
      data: roles,
    });
  } catch (e) {
    console.log(e.message);
    return res.status(500).json({
      status: "Failed",
      msg: "Some internal error",
      error: e.message,
    });
  }
});

router.delete("/deletRole/:id", fetchuser, async (req, res) => {
  try {
    let role = await RoleSchema.findById(req.params.id);
    if (!role) {
      return res.status(404).json({ status: "Failed", errors: "not found" });
    }

    if (role.userid.toString() !== req.user.id) {
      return res.status(401).json({ status: "Failed", errors: "Not Allowed" });
    }

    role = await RoleSchema.findByIdAndDelete(req.params.id);
    res.json({ status: "Success", msg: "deteled" });
  } catch (error) {
    console.log(error.message);
    res.status(500).send("Some internal error");
  }
});

module.exports = router;
