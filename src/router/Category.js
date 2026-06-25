const express = require("express");
const router = express.Router();
const fetchuser = require("../middleware/fetchusertoken");
const { body, validationResult } = require("express-validator");
const CategorySchema = require("../models/category");
const Company = require("../models/company");
const path = require("path");
const fs = require("fs");

const ICON_DIR = "static/cat-imageAction";
const ensureIconDir = () => {
  if (!fs.existsSync(ICON_DIR)) {
    fs.mkdirSync(ICON_DIR, { recursive: true });
  }
};

// fetch all Categories

router.get("/getCategory", fetchuser, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ status: "Failed", errors: errors.array() });
  }

  const categorySchema = await CategorySchema.find();
  res.json({
    status: "success",
    data: categorySchema,
  });
});

// create Category

router.post(
  "/createCategory",
  fetchuser,
  [
    // Validates only cat_name (the vehicle Make) now
    body("cat_name", "Enter a Category Name").isLength({ min: 3 }),
    body("sub_items").optional().isArray(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ status: "Failed", errors: errors.array() });
    }

    const { cat_name, sub_items } = req.body;
    const userId = req.user.id;

    // Optional: accept icon upload during createCategory
    const uploaded = req.files?.icon ?? req.files?.file ?? req.files?.image;
    const iconFile = uploaded
      ? Array.isArray(uploaded)
        ? uploaded[0]
        : uploaded
      : null;

    try {
      // Check if this specific user already created this Make category
      let existingCategory = await CategorySchema.findOne({
        userid: userId,
        cat_name: cat_name,
      });

      if (existingCategory) {
        return res
          .status(409)
          .json({ status: "Failed", error: "Category (Make) already exists" });
      }

      // If icon is sent with createCategory, validate (<= 1MB) and store it
      // Uploaded file comes from express-fileupload (req.files.*)
      let iconPublicUrl = "";
      if (iconFile) {
        const MAX_SIZE = 1 * 1024 * 1024; // 1MB
        if (iconFile.size > MAX_SIZE) {
          return res.status(413).json({
            status: "Failed",
            msg: "Icon must be <= 1MB",
          });
        }

        const mime = iconFile.mimetype || "";
        if (!mime.startsWith("image/")) {
          return res.status(415).json({
            status: "Failed",
            msg: "Only image icons are allowed",
          });
        }

        ensureIconDir();
        const filename = `${Date.now()}_${iconFile.name}`;
        const newPath = path.join(process.cwd(), ICON_DIR, filename);
        iconPublicUrl =
          req.protocol + "://" + req.get("host") + "/media/" + filename;
        await iconFile.mv(newPath);
      }

      // Create category with userid, cat_name and optional icon
      const newCategory = new CategorySchema({
        userid: userId,
        cat_name,
        sub_items: sub_items || [],
        icon: iconPublicUrl,
      });

      const saveCat = await newCategory.save();

      return res.status(201).json({
        status: "Success",
        msg: "Category has been created",
        data: saveCat,
      });
    } catch (e) {
      console.error("Create Category Error:", e.message);
      return res.status(500).json({
        status: "Failed",
        error: e.message,
        msg: "Some internal error occurred",
      });
    }
  },
);
// update Category
router.put("/updateCategory/:id", fetchuser, async (req, res) => {
  //const errors = validationResult(req);

  const { cat_name } = req.body;

  // Optional: accept icon upload during updateCategory
  const uploaded = req.files?.icon ?? req.files?.file ?? req.files?.image;
  const iconFile = uploaded
    ? Array.isArray(uploaded)
      ? uploaded[0]
      : uploaded
    : null;

  // create new object
  const newCategory = {};
  if (cat_name) {
    newCategory.cat_name = cat_name;
  }

  let category = await CategorySchema.findById(req.params.id);

  if (!category) {
    return res
      .status(201)
      .json({ status: "sucess", msg: "Category not found" });
  }

  console.log(category.userid.toString());
  if (category.userid.toString() !== req.user.id) {
    return res.status(401).json({ status: "Failed", errors: "Not Allowed" });
  }

  // If icon is sent with updateCategory, validate (<= 1MB) and store it
  if (iconFile) {
    const MAX_SIZE = 1 * 1024 * 1024; // 1MB
    if (iconFile.size > MAX_SIZE) {
      return res
        .status(413)
        .json({ status: "Failed", msg: "Icon must be <= 1MB" });
    }

    const mime = iconFile.mimetype || "";
    if (!mime.startsWith("image/")) {
      return res
        .status(415)
        .json({ status: "Failed", msg: "Only image icons are allowed" });
    }

    ensureIconDir();
    const filename = `${Date.now()}_${iconFile.name}`;
    const newPath = path.join(process.cwd(), ICON_DIR, filename);
    const iconPublicUrl =
      req.protocol + "://" + req.get("host") + "/media/" + filename;

    await iconFile.mv(newPath);
    newCategory.icon = iconPublicUrl;
  }

  category = await CategorySchema.findByIdAndUpdate(
    req.params.id,
    { $set: newCategory },
    { new: true },
  );

  res.status(200).json({
    status: "Success",
    msg: "Category has been updated",
    data: category,
  });
});

// add single subcategory in mongo

router.post("/addSubCategory/:id", fetchuser, async (req, res) => {
  //const errors = validationResult(req);

  const { name } = req.body;

  // create new object
  const newCategory = {};
  if (name) {
    newCategory.name = name;
  }

  let category = await CategorySchema.findById(req.params.id);

  if (!category) {
    return res
      .status(200)
      .json({ status: "Failed", msg: "Category not found" });
  }

  if (category.sub_items.length > 0) {
    for (let i = 0; i < category.sub_items.length; i++) {
      const element = category.sub_items[i];

      if (element.name.toString() === newCategory.name) {
        console.log("Match");
        return res
          .status(200)
          .json({ status: "Failed", msg: "Sub Category Already Insertd" });
      } else {
        console.log("not match");
        category.sub_items.splice(0, 0, newCategory);
        break;
      }
      console.log(newCategory.name);
    }
  } else {
    category.sub_items.splice(0, 0, newCategory);
  }

  console.log(category);

  if (category.userid.toString() !== req.user.id) {
    return res.status(401).json({ status: "Failed", errors: "Not Allowed" });
  }

  let updateCategory = await CategorySchema.findByIdAndUpdate(
    req.params.id,
    { $set: category },
    { new: true },
  );
  res.json({
    status: "Sucess",
    msg: "Sub Category Has Been updated",
    data: updateCategory,
  });

  // const mycategory = await CategorySchema.findByIdAndUpdate(
  //   req.params.id,
  //   { $push: category.sub_items },
  //   { new: true }
  // );
  // res.json(mycategory);
});

// if user want to delete sub category

router.delete("/deleteSubCategory/:id/:sub_id", fetchuser, async (req, res) => {
  try {
    const { id, sub_id } = req.params;
    console.log(req.params);
    const newCategory = {};
    let category = await CategorySchema.findById(id);
    if (!category) {
      return res.status(404).json({ status: "Failed", errors: "not found" });
    }

    if (category.userid.toString() !== req.user.id) {
      return res.status(401).json({ status: "Failed", errors: "Not Allowed" });
    }

    let findStatus = false;
    for (let i = 0; i < category.sub_items.length; i++) {
      const element = category.sub_items[i];
      //      for (let j = 0; j < req.body.length; j++) {
      //        console.log(sub_cat_id);
      if (element._id.toString() === sub_id) {
        findStatus = true;
        category.sub_items.splice(i, 1);
      }
      //    }
    }

    //console.log(category);

    if (!findStatus) {
      return res.json({ status: "Failed", msg: "Sub Category not found" });
    } else {
      let updateCategory = await CategorySchema.findByIdAndUpdate(
        req.params.id,
        { $set: category },
        { new: true },
      );
      res.json({
        status: "Sucess",
        msg: "Sub Category Has Been Removed",
        data: updateCategory,
      });
    }

    // category = await CategorySchema.findByIdAndDelete(req.params.id);
    // res.json({ status: "Success", msg: "deteled" });
  } catch (error) {
    console.log(error.message);
    res.status(500).send("Some internal error");
  }
});

// if user want to delete category

router.delete("/deleteCategory/:id", fetchuser, async (req, res) => {
  try {
    let category = await CategorySchema.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ status: "Failed", errors: "not found" });
    }

    if (category.userid.toString() !== req.user.id) {
      return res.status(401).json({ status: "Failed", errors: "Not Allowed" });
    }

    category = await CategorySchema.findByIdAndDelete(req.params.id);
    res.json({ status: "Success", msg: "deteled" });
  } catch (error) {
    console.log(error.message);
    res.status(500).send("Some internal error");
  }
});

// fetch all subcategories
router.get("/getsubCategory/:id", fetchuser, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ status: "Failed", errors: errors.array() });
  }
  console.log(req.user.id);
  const categorySchema = await CategorySchema.find({ userid: req.user.id });
  res.json({
    status: "success",
    data: categorySchema,
  });
});

// update sub category

router.put("/updateSubCategory", fetchuser, async (req, res) => {
  try {
    console.log(req.body);
    const { p_id, sub_id, cat_name } = req.body;
    let category = await CategorySchema.findById(p_id);
    if (!category) {
      return res
        .status(200)
        .json({ status: "sucess", msg: "Parent Category not found" });
    }

    if (category.userid.toString() !== req.user.id) {
      return res.status(401).json({ status: "Failed", errors: "Not Allowed" });
    }

    for (let i = 0; i < category.sub_items.length; i++) {
      let element = category.sub_items[i];
      console.log("--------------");
      console.log(element);
      if (element._id.toString() === sub_id) {
        element.name = cat_name;
      }
    }

    console.log(category);

    const nCat = await CategorySchema.findByIdAndUpdate(
      p_id,
      { $set: category },
      { new: true },
    );
    res.status(200).json({
      status: "Success",
      msg: "Update Sub Category Successfully",
      data: nCat,
    });
  } catch (error) {
    res.status(206).json({
      status: "Failed",
      msg: "Server Internal Error",
      error: error.message,
    });
  }
});

// upload category icon (1MB max)
router.post("/uploadCategoryIcon/:id", fetchuser, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ status: "Failed", errors: errors.array() });
    }

    const category = await CategorySchema.findById(req.params.id);
    if (!category) {
      return res
        .status(404)
        .json({ status: "Failed", msg: "Category not found" });
    }

    if (category.userid?.toString() !== req.user.id) {
      return res.status(401).json({ status: "Failed", msg: "Not Allowed" });
    }

    const uploaded = req.files?.icon ?? req.files?.file ?? req.files?.image;
    if (!uploaded) {
      return res
        .status(400)
        .json({ status: "Failed", msg: "Icon file is required" });
    }

    const iconFile = Array.isArray(uploaded) ? uploaded[0] : uploaded;

    // express-fileupload uses `size` (bytes)
    const MAX_SIZE = 1 * 1024 * 1024; // 1MB
    if (iconFile.size > MAX_SIZE) {
      return res
        .status(413)
        .json({ status: "Failed", msg: "Icon must be <= 1MB" });
    }

    const mime = iconFile.mimetype || "";
    if (!mime.startsWith("image/")) {
      return res
        .status(415)
        .json({ status: "Failed", msg: "Only image icons are allowed" });
    }

    ensureIconDir();

    const filename = `${Date.now()}_${iconFile.name}`;
    const newPath = path.join(process.cwd(), ICON_DIR, filename);
    const publicUrl =
      req.protocol + "://" + req.get("host") + "/media/" + filename;

    // move to disk
    await iconFile.mv(newPath);

    // store public url
    category.icon = publicUrl;
    const updated = await CategorySchema.findByIdAndUpdate(
      category._id,
      { $set: { icon: publicUrl } },
      { new: true },
    );

    return res.status(200).json({
      status: "Success",
      msg: "Category icon updated",
      data: updated,
    });
  } catch (e) {
    return res
      .status(500)
      .json({ status: "Failed", msg: "Server Error", error: e.message });
  }
});

// export router at end
module.exports = router;
