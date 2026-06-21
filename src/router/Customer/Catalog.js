const express = require("express");
const router = express.Router();

const { body, validationResult } = require("express-validator");
const CatalogScheme = require("../../models/catalog");
const mongoose = require("mongoose");

router.get("/getAllCatalog/:cus_id", async (req, res) => {
  try {
    const catalog = await CatalogScheme.find().populate('userid').populate('c_id');
    if (catalog.length === 0) {
      return res.json({
        status: "success",
        msg: "no data found",
        data: catalog,
      });
    }

    let data = [];

    for (let i = 0; i < catalog.length; i++) {
      const element = catalog[i];
      for (let j = 0; j < element.customers.length; j++) {
        const cus = element.customers[j];
        if (cus.cus_id.toString() === req.params.cus_id) {
          data.push(element);
        }
      }
    }

    res.json({
      status: "success",
      data: data,
    });
  } catch (e) {
    res.json({
      status: "Failed",
      error: e.array,
    });
  }
});
module.exports = router;
