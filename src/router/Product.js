const express = require("express");

const router = express.Router();
const fetchuser = require("../middleware/fetchusertoken");
const { body, validationResult } = require("express-validator");
const ProductSchema = require("../models/product");
const Cat = require("../models/category");
const mongoose = require("mongoose");
const path = require("path");
const CategorySchema = require("../models/category");
const CatalogScheme = require("../models/catalog");
// fetch all Categories

router.get("/getProducts", fetchuser, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ status: "Failed", errors: errors.array() });
  }
  try {
    let staff = await ProductSchema.find({}).populate("cat_id");

    if (staff.length == 0) {
      res.json({
        status: "Success",
        msg: "Not Found",
        data: staff,
      });
    } else {
      res.json({
        status: "Success",
        data: staff,
      });
    }
  } catch (e) {
    console.log(e.message);
  }
});

// Frontend flow: get all published/visible products (no params)
// Filters:
// - product_type: "published"
// - visibility: true
// - hide_inventory: false (so out-of-stock is hidden)
router.get("/getAllPublishedProducts", fetchuser, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ status: "Failed", errors: errors.array() });
  }

  try {
    const products = await ProductSchema.find({
      product_type: "published",
      visibility: true,
      hide_inventory: false,
      // guard against missing/undefined inventory
      $or: [
        { inventory: { $gt: 0 } },
        { inventory: { $exists: false } },
        { inventory: null },
      ],
    }).populate("cat_id");

    return res.json({
      status: "Success",
      data: products,
      msg: products.length === 0 ? "Not Found" : undefined,
    });
  } catch (e) {
    return res.status(500).json({ status: "Failed", errors: e.message });
  }
});

// get only sale product
router.get("/getSaleProducts/:id", fetchuser, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ status: "Failed", errors: errors.array() });
  }
  try {
    console.log(req.user.id);
    console.log(req.params.id);
    const staff = await ProductSchema.find({
      product_type: "published",
    }).populate("cat_id");
    console.log(staff);
    if (staff.length == 0) {
      res.json({
        status: "Success",
        msg: "Not Found",
        data: staff,
      });
    } else {
      res.json({
        status: "Success",
        data: staff,
      });
    }
  } catch (e) {
    res.json({
      status: "Failed",
      errors: e.message,
    });
    console.log(e.message);
    console.log(req.user);
  }
});

// get only ware house product

router.get("/getGodownProducts/:id", fetchuser, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ status: "Failed", errors: errors.array() });
  }
  //console.log(req.user.id);
  const staff = await ProductSchema.find({
    product_type: "warehouse",
  }).populate("cat_id");

  if (staff.length == 0) {
    res.json({
      status: "Success",
      msg: "Not Found",
      data: staff,
    });
  } else {
    res.json({
      status: "Success",
      data: staff,
    });
  }
});

// create Category

router.post(
  "/createProduct",
  fetchuser,
  [
    body("cat_id", "Enter a Category Id").isLength({ min: 3 }),
    body("p_name", "Enter product Name").isLength({ min: 2 }),

    body("unit_name", "Enter Unit Name").isLength({ min: 1 }),
    body("location", "Enter Location").isLength({ min: 3 }),
    body("model_name", "Enter Model Name").isLength({ min: 1 }),
    body("year_val", "Enter Year").isNumeric(),
    body("variant_name", "Enter Variant Name").isLength({ min: 1 }),

    body("p_sku", "Enter SKU").isLength({ min: 1 }),
    body("part_number", "Enter Part Number").isLength({ min: 1 }),
    body("short_description", "Enter Short Description").isLength({ min: 1 }),

    body(
      "features.specification.country_of_origin",
      "Enter Country of Origin",
    ).isLength({ min: 1 }),
    body(
      "features.specification.manufacturer_address",
      "Enter Manufacturer Address",
    ).isLength({ min: 1 }),
    body("features.specification.oem_part_no", "Enter OEM Part No").isLength({
      min: 1,
    }),
    body("features.specification.net_quantity", "Enter Net Quantity").isLength({
      min: 1,
    }),
  ],

  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(201).json({ status: "Failed", errors: errors.array() });
    }

    let {
      cat_id,
      model_name,

      year_val,
      variant_name,

      brand,

      location,
      product_type,
      accept_order,
      unit_name,
      unit_value,
      p_name,
      p_sku,
      inventory,
      hide_inventory,
      visibility,
      m_o_q,

      description,

      part_number,
      short_description,
      features,

      p_gallery_image,
      p_gallery_video,
      p_price,
      price,
    } = req.body;

    try {
      let Product = await ProductSchema.findOne({
        p_name: req.body.p_name,
        p_sku: req.body.p_sku,
      });
      if (Product) {
        return res
          .status(201)
          .json({ status: "Failed", msg: "Product Already Exists" });
      }

      let category = await Cat.findOne({ _id: cat_id });
      if (!category) {
        return res
          .status(203)
          .json({ status: "Failed", msg: "Invalid Category Id" });
      }

      cat_id = new mongoose.Types.ObjectId(category._id);
      console.log(cat_id);
      const newProduct = new ProductSchema({
        cat_id,
        model_name,
        year_val,
        variant_name,
        accept_order,
        unit_name,
        unit_value,
        p_name,
        brand,
        location,
        product_type,
        p_sku,
        inventory,
        hide_inventory,
        visibility,
        m_o_q,

        description,
        part_number,
        short_description,
        features,

        p_gallery_image,
        p_gallery_video,
        p_price,
        price,
      });

      const saveProduct = await newProduct.save();
      res.status(201).json({
        status: "Success",
        msg: "Product has been created",
        data: saveProduct,
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

router.post("/uploadProductImage/:id", fetchuser, async (req, res) => {
  try {
    console.log(req.files.file);
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(201).json({ status: "Failed", errors: errors.array() });
    }

    let product = await ProductSchema.findById(req.params.id);
    if (!product) {
      return res
        .status(207)
        .json({ status: "Failed", msg: "Product not found" });
    }

    if (req.files.file.length > 0) {
      for (let i = 0; i < req.files.file.length; i++) {
        const element = req.files.file[i];
        let filename = Date.now() + "_" + element.name;
        let newpath = path.join(process.cwd(), "static/image", filename);
        const imagePath =
          req.protocol + "://" + req.get("host") + "/media/image/" + filename;
        product.p_gallery_image.splice(0, 0, { link: imagePath });
        element.mv(newpath);
      }
    } else {
      const element = req.files.file;
      let filename = Date.now() + "_" + element.name;
      let newpath = path.join(process.cwd(), "static/image", filename);
      const imagePath =
        req.protocol + "://" + req.get("host") + "/media/image/" + filename;
      product.p_gallery_image.splice(0, 0, { link: imagePath });
      element.mv(newpath);
    }

    let updateProduct = await ProductSchema.findByIdAndUpdate(
      req.params.id,
      { $set: product },
      { new: true },
    );
    if (updateProduct.p_gallery_image.length !== 0) {
      return res.status(200).json({
        status: "Sucess",
        msg: "Updated",
        data: updateProduct,
      });
    } else {
      return res.status(203).json({
        status: "Failed",
        msg: "no update",
        data: updateProduct,
      });
    }
  } catch (e) {
    console.log(req.files);
    console.log(e.message);
    if (req.files === null) {
      res
        .status(208)
        .json({ status: "Failed", msg: "Invalid Image", error: e.message });
      return;
    } else {
      res
        .status(209)
        .json({ status: "Failed", msg: "Server Error", error: e.message });
      return;
    }
  }
});

//out of stock

router.put("/outofstock/:id/:type", fetchuser, async (req, res) => {
  try {
    // console.log("----------------------------------");
    // console.log(req.params);
    const { id, type } = req.params;

    // NOTE: this API appears to enforce ownership by userid, but product schema has no `userid` field.
    // To avoid breaking with missing fields, we only filter by product id here.
    let pro = await ProductSchema.findById(id);

    if (!pro) {
      return res
        .status(201)
        .json({ status: "Failed", msg: "Product not found" });
    }

    if (type === "show") {
      pro.hide_inventory = false;
    } else if (type == "hide") {
      pro.hide_inventory = true;
    } else {
      return res.status(202).json({ status: "Failed", msg: "Invalid Type" });
    }

    const up = await ProductSchema.findByIdAndUpdate(
      pro._id,
      { $set: pro },
      { new: true },
    );

    res.status(200).json({
      status: "Success",
      msg: "Product has been out of stock.",
      data: up,
    });
    // console.log(up);
    // console.log("--------------------");
  } catch (err) {
    res
      .status(205)
      .json({ status: "Failed", msg: "server internal Error", err: err });
  }
});

//out of stock

// hide product
router.put("/productVisible/:id/:type", fetchuser, async (req, res) => {
  try {
    console.log("----------------------------------");
    console.log(req.params);
    const { id, type } = req.params;

    let pro = await ProductSchema.findOne({ _id: id, userid: req.user.id });

    if (!pro) {
      return res
        .status(201)
        .json({ status: "Failed", msg: "Product not found" });
    }

    if (type === "show") {
      pro.visibility = true;
    } else if (type == "hide") {
      pro.visibility = false;
    } else {
      return res.status(202).json({ status: "Failed", msg: "Invalid Type" });
    }

    const up = await ProductSchema.findByIdAndUpdate(
      pro._id,
      { $set: pro },
      { new: true },
    );

    res
      .status(200)
      .json({ status: "Success", msg: "Product has been updated.", data: up });
    console.log(up);
    console.log("--------------------");
  } catch (err) {
    res
      .status(205)
      .json({ status: "Failed", msg: "server internal Error", err: err });
  }
});
// hide product

// if user want to delete category

router.delete("/deleteProduct/:id", fetchuser, async (req, res) => {
  try {
    console.log("-----deleting product-----");

    let attr = await ProductSchema.findById(req.params.id);
    // console.log("attr - ", attr);

    if (!attr) {
      return res.status(501).json({ status: "Failed", msg: "not found" });
    }

    attr = await ProductSchema.findByIdAndDelete(req.params.id);

    // ####################
    // delete catelog produc
    // #######################
    const catalog = await CatalogScheme.find({
      "products.p_id": req.params.id,
    });
    if (!catalog) {
      return res
        .status(203)
        .json({ status: "Sucess", msg: "No produt in catlog assign" });
    }

    let findStatus = false;

    for (let i = 0; i < catalog.length; i++) {
      const element = catalog[i];
      for (let k = 0; k < element.products.length; k++) {
        const pro = element.products[k];
        if (pro.p_id.toString() === req.params.id) {
          findStatus = true;
          element.products.splice(k, 1);
        }
      }
      let updateCatalog = await CatalogScheme.findByIdAndUpdate(
        element._id,
        { $set: element },
        { new: true },
      );
    }

    if (!findStatus) {
      return res
        .status(203)
        .json({ status: "Sucess", msg: "No produt in catlog assign" });
    }
    res.status(203).json({
      status: "Success",
      msg: "Product Delete and Removed from catalogs.",
    });
    //console.log(category);

    // if (!findStatus) {
    //   return res.json({ status: "Failed", msg: "Catlog is not found" });
    // } else {

    //   res.json({
    //     status: "Sucess",
    //     msg: "Sub Category Has Been Removed",
    //     data: updateCategory,
    //   });
    // }

    // ####################t
    // delete catlog product
    // ####################

    // res.json({ status: "Success", msg: "deteled" });
  } catch (error) {
    console.log(error.message);
    res.status(500).send("Some internal error");
  }
});

router.put("/bulkUpdateProductPrice", fetchuser, async (req, res) => {
  try {
    const { cat_id, discount, discountPer, type } = req.body;
    const category = await CategorySchema.findById(cat_id);
    if (!category) {
      return res
        .status(206)
        .json({ status: "Failed", msg: "Category not found" });
    }

    const products = await ProductSchema.find({ cat_id });
    if (products.length === 0) {
      return res
        .status(207)
        .json({ status: "Failed", msg: "No Product Found in this category" });
    }

    for (let i = 0; i < products.length; i++) {
      const element = products[i];
      let newupdate = {};

      if (type) {
        if (discountPer) {
          newupdate.price = (element.price * (100 + discount)) / 100;

          if (element.p_price.length !== 0) {
            for (let j = 0; j < element.p_price.length; j++) {
              const p_price_element = element.p_price[j];
              p_price_element.value =
                (parseInt(p_price_element.value, 10) *
                  (100 + parseInt(discount, 10))) /
                100;
            }
            newupdate.p_price = element.p_price;
          }
        } else {
          newupdate.price =
            parseInt(element.price, 10) + parseInt(discount, 10);

          if (element.p_price.length !== 0) {
            for (let j = 0; j < element.p_price.length; j++) {
              const p_price_element = element.p_price[j];
              p_price_element.value =
                parseInt(p_price_element.value, 10) + parseInt(discount, 10);
            }
            newupdate.p_price = element.p_price;
          }
        }
      } else {
        if (discountPer) {
          newupdate.price = (element.price * (100 - discount)) / 100;

          if (element.p_price.length !== 0) {
            for (let j = 0; j < element.p_price.length; j++) {
              const p_price_element = element.p_price[j];
              p_price_element.value =
                (parseInt(p_price_element.value, 10) *
                  (100 - parseInt(discount, 10))) /
                100;
            }
            newupdate.p_price = element.p_price;
          }
        } else {
          newupdate.price = element.price - discount;

          if (element.p_price.length !== 0) {
            for (let j = 0; j < element.p_price.length; j++) {
              const p_price_element = element.p_price[j];
              p_price_element.value =
                parseInt(p_price_element.value, 10) - parseInt(discount, 10);
            }
            newupdate.p_price = element.p_price;
          }
        }
      }
      console.log(newupdate.price);
      const updateProduct = await ProductSchema.findByIdAndUpdate(
        element._id,
        { $set: newupdate },
        { new: true },
      );
    }

    res.status(202).json({ status: "Success", msg: "Bulk changed is compete" });
  } catch (error) {
    res.status(500).json({
      status: "Failed",
      msg: "Server Internal Error",
      error: error.message,
    });
  }
});

module.exports = router;
