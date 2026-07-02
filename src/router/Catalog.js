const express = require("express");

const router = express.Router();
const fetchuser = require("../middleware/fetchusertoken");
const { body, validationResult } = require("express-validator");
const CatalogScheme = require("../models/catalog");

// fetch all Categories

router.get("/getCatalog/:id", fetchuser, async (req, res) => {
  try {
    const staff = await CatalogScheme.findOne({
      _id: req.params.id,
      userid: req.user.id,
    });

    // .populate({
    //   path:'products',
    //   populate:{
    //     path:'p_id',
    //   }
    // })

    if (!staff) {
      return res.json({
        status: "Success",
        msg: "Not Found",
        data: null,
      });
    }

    return res.json({
      status: "Success",
      data: staff,
    });
  } catch (e) {
    return res
      .status(203)
      .json({ status: "Failed", msg: "Invalid Parameters", errors: e.message });
  }
});

router.get("/getCatalog", fetchuser, async (req, res) => {
  try {
    const catalogs = await CatalogScheme.find({ userid: req.user.id });
    return res.json({
      status: "Success",
      data: catalogs,
    });
  } catch (e) {
    return res
      .status(203)
      .json({ status: "Failed", msg: "Invalid Parameters", errors: e.message });
  }
});

router.get("/getCatalogBySeller/:id", fetchuser, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ status: "Failed", errors: errors.array() });
  }

  try {
    const staff = await CatalogScheme.find({
      userid: req.params.id,
      "customers.cus_id": req.user.id,
    }).populate("userid");

    // Avoid N+1 query: fetch all products in one go
    const productIds = [];
    for (let i = 0; i < staff.length; i++) {
      const element = staff[i];
      for (let j = 0; j < element.products.length; j++) {
        const pro = element.products[j];
        if (pro && pro.p_id) productIds.push(pro.p_id);
      }
    }

    const uniqueProductIds = [...new Set(productIds.map((x) => x.toString()))];

    // ProductSchema in this project uses _id:ObjectId; keep ids as strings for $in
    // Mongoose will cast string ids to ObjectId automatically.

    const products = await ProductSchema.find({
      _id: { $in: uniqueProductIds },
    }).populate("cat_id");
    const productMap = new Map(products.map((p) => [p._id.toString(), p]));

    const data = [];
    for (let i = 0; i < staff.length; i++) {
      const element = staff[i];
      for (let j = 0; j < element.products.length; j++) {
        const pro = element.products[j];
        const product_data = productMap.get(pro.p_id.toString());
        data.push({ catdata: element, product_data });
      }
    }

    res.json({
      status: "Success",
      allproducts: data,
    });
  } catch (e) {
    return res
      .status(203)
      .json({ status: "Failed", msg: "Invalid Parameters", errors: e.message });
  }
});

// create Catalog

router.post(
  "/createCatalog",
  fetchuser,
  [body("catalog_name", "Enter a Catalog  Name").isLength({ min: 3 })],

  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(201).json({
        status: "Failed",
        msg: "Invalid Parameters",
        errors: errors.array(),
      });
    }

    const {
      catalog_name,
      nick_name,
      flattDiscount,
      discount,
      products,
      customers,
    } = req.body;

    try {
      let Catalog = await CatalogScheme.findOne({
        catalog_name: req.body.catalog_name,
      });

      if (Catalog) {
        return res
          .status(201)
          .json({ status: "Failed", msg: "Catalog Already Exists" });
      }

      userid = req.user.id;
      const newCatalog = new CatalogScheme({
        userid,
        catalog_name,
        nick_name,
        flattDiscount,
        discount,
        products,
        customers,
      });

      const saveProduct = await newCatalog.save();
      res.status(201).json({
        status: "Success",
        msg: "Catalog has been created",
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

// delete catalog
router.delete("/deleteCatalog/:id", fetchuser, async (req, res) => {
  try {
    let category = await CatalogScheme.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ status: "Failed", errors: "not found" });
    }

    if (category.userid.toString() !== req.user.id) {
      return res.status(401).json({ status: "Failed", errors: "Not Allowed" });
    }

    category = await CatalogScheme.findByIdAndDelete(req.params.id);
    res
      .status(200)
      .json({ status: "Success", msg: "Catalog has been deleted" });
  } catch (error) {
    console.log(error.message);
    res.status(500).send("Some internal error");
  }
});

// update catalog
router.put("/updateCatalog/:id", fetchuser, async (req, res) => {
  try {
    const { catalog_name, customers, discount, flattDiscount, products } =
      req.body;
    let catalog = await CatalogScheme.findById(req.params.id);
    if (!catalog) {
      return res
        .status(202)
        .json({ status: "Failed", msg: "catalog not found" });
    }

    if (products) {
      catalog.products = products;
    }
    if (customers) {
      catalog.customers = customers;
    }

    if (catalog_name) {
      catalog.catalog_name = catalog_name;
    }

    if (discount) {
      catalog.discount = discount;
    }

    if (flattDiscount) {
      catalog.flattDiscount = flattDiscount;
    }

    const updateCatalog = await CatalogScheme.findByIdAndUpdate(
      req.params.id,
      { $set: catalog },
      { new: true },
    );

    console.log(updateCatalog);
    res.status(200).json({
      status: "Sucess",
      msg: "Customer Has Been assigned",
      data: updateCatalog,
    });
  } catch (e) {
    console.log(e.message);
    res.status(206).json({ status: "Failed", error: e.message });
  }
});

router.put("/updateProductCatalog/:id", fetchuser, async (req, res) => {
  try {
    let catalog = await CatalogScheme.findById(req.params.id);
    if (!catalog) {
      return res
        .status(200)
        .json({ status: "Failed", msg: "catalog not found" });
    }

    catalog.products = req.body;
    console.log(req.body);

    let updateCatalog = await CatalogScheme.findByIdAndUpdate(
      req.params.id,
      { $set: catalog },
      { new: true },
    );

    // console.log(updateCatalog);
    res.json({
      status: "Sucess",
      msg: "Products Has Been assigned",
      data: updateCatalog,
    });
  } catch (e) {}
});

// update catalog name
router.put("/updateCatalogName/:id", fetchuser, async (req, res) => {
  try {
    console.log("----------------");
    console.log(req.params);
    console.log(req.body);
    const { id } = req.params;
    const { catalog_name, nick_name, flattDiscount, discount } = req.body;
    let catalog = await CatalogScheme.findById(id);
    if (!catalog) {
      return res
        .status(202)
        .json({ status: "Success", msg: "Catalog not found" });
    }
    catalog.catalog_name = catalog_name;
    catalog.nick_name = nick_name;
    catalog.flattDiscount = flattDiscount;
    catalog.discount = discount;
    let updateCatalog = await CatalogScheme.findByIdAndUpdate(
      id,
      { $set: catalog },
      { new: true },
    );
    res.status(200).json({
      status: "Success",
      msg: "Catalog has been updated",
      data: updateCatalog,
    });
  } catch (error) {
    res.status(206).json({ status: "Failed", msg: "Server Internal Error" });
  }
});

const path = require("path");
const ProductSchema = require("../models/product");

module.exports = router;
