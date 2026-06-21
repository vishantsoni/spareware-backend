const express = require("express");
const router = express.Router();

const { body, validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const Admin = require("../models/admin");

const JWT_SETCRET = "myorderslipquthdata";

// Admin login
// POST /api/admin/login
router.post(
  "/login",
  [
    body("phone", "Enter a valid Number").isMobilePhone(),
    body("password", "Enter a valid password").isLength({ min: 5 }),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(206).json({ status: false, errors: errors.array() });
    }

    try {
      const { phone, password } = req.body;

      let admin = await Admin.findOne({ phone });
      if (!admin) {
        return res.status(203).json({
          status: false,
          errors: "Please try to login with correct crediencials",
        });
      }

      const passwordcompar = await bcrypt.compare(password, admin.password);
      if (!passwordcompar) {
        return res.status(206).json({
          status: false,
          errors: "Please try to login with correct crediencials",
        });
      }

      const data = {
        user: {
          id: admin.id,
          role: "super admin",
        },
      };

      const authtoken = jwt.sign(data, JWT_SETCRET);

      return res.status(200).json({
        status: true,
        token: authtoken,
        user: {
          createAt: "2026-06-20T10:37:36.791Z",
          email: "",
          fullname: "Admin",
          password:
            "$2a$10$fQ/OBvu1e4PK6yYdDyNIReV3wsbS.Xsq91uk/ItTviCRR5p8r0ZOm",
          phone: 9999999999,
          _id: "6a366d708eabe14f4baced8b",
          role: "super admin",
        },
      });
    } catch (error) {
      console.log(error.message);
      return res
        .status(205)
        .json({ status: false, msg: "Internal server error" });
    }
  },
);

module.exports = router;
