const express = require("express");
const router = express.Router();
const fetchuser = require("../middleware/fetchusertoken");
const { body, validationResult } = require("express-validator");
const StaffSchema = require("../models/staff");
// fetch all Categories

// router.get("/getStaff", fetchuser, async (req, res) => {
//   const errors = validationResult(req);
//   if (!errors.isEmpty()) {
//     return res.status(400).json({ status: "Failed", errors: errors.array() });
//   }
//   //console.log(req.user.id);
//   const staff = await StaffSchema.find({ userid: req.user.id });
//   res.json({
//     status: "Success",
//     data: staff,
//   });
// });

// get staff bycompnay

router.get("/getStaff/:com_id", fetchuser, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ status: "Failed", errors: errors.array() });
  }

  if (!req.params.com_id) {
    return res
      .status(400)
      .json({ status: "Failed", msg: "Invalid Company Id" });
  }
  //console.log(req.user.id);
  const staff = await StaffSchema.find({
    userid: req.user.id,
    com_id: req.params.com_id,
  });
  res.json({
    status: "Success",
    data: staff,
  });
});

// create Category

router.post(
  "/createStaff",
  fetchuser,
  [
    body("staff_id", "Enter a Staff Id").isLength({ min: 5 }),
    body("com_id", "Enter Company Id").isLength({ min: 2 }),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(201).json({ status: "Failed", errors: errors.array() });
    }

    const {
      name,
      com_id,
      phone,
      email,
      staff_id,
      password,
      role,
      ip,
      last_login,
    } = req.body;

    try {
      let staffSchema = await StaffSchema.findOne({
        staff_id: req.body.staff_id,
      });
      if (staffSchema) {
        return res
          .status(201)
          .json({ status: "Failed", error: "Staff Already Exists" });
      }

      userid = req.user.id;
      const newStaff = new StaffSchema({
        userid,
        name,
        com_id,
        phone,
        email,
        staff_id,
        password,
        role,
        ip,
        last_login,
      });
      const saveStaff = await newStaff.save();
      res.status(201).json({
        status: "Success",
        msg: "Staff has been created",
        data: saveStaff,
      });
    } catch (e) {
      console.log(e.message);
      res.status(201).json({
        status: "Failed",
        error: e.message,
        msg: "Some internal error",
      });
    }
  }
);

// // update Category
// router.put("/updateCategory/:id", fetchuser, async (req, res) => {
//   //const errors = validationResult(req);

//   const { cat_name } = req.body;

//   // create new object
//   const newCategory = {};
//   if (cat_name) {
//     newCategory.cat_name = cat_name;
//   }

//   let category = await CategorySchema.findById(req.params.id);

//   if (!category) {
//     return res
//       .status(200)
//       .json({ status: "sucess", msg: "Category not found" });
//   }

//   console.log(category.userid.toString());
//   if (category.userid.toString() !== req.user.id) {
//     return res.status(401).json({ status: "Failed", errors: "Not Allowed" });
//   }

//   category = await CategorySchema.findByIdAndUpdate(
//     req.params.id,
//     { $set: newCategory },
//     { new: true }
//   );
//   res.json(category);
// });

// // if user want to delete category

// router.delete("/deleteCategory/:id", fetchuser, async (req, res) => {
//   try {
//     let category = await CategorySchema.findById(req.params.id);
//     if (!category) {
//       return res.status(404).json({ status: "Failed", errors: "not found" });
//     }

//     if (category.userid.toString() !== req.user.id) {
//       return res.status(401).json({ status: "Failed", errors: "Not Allowed" });
//     }

//     category = await CategorySchema.findByIdAndDelete(req.params.id);
//     res.json({ status: "Success", msg: "deteled" });
//   } catch (error) {
//     console.log(error.message);
//     res.status(500).send("Some internal error");
//   }
// });

module.exports = router;
