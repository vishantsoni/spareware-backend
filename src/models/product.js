const mongoose = require("mongoose");
const { Schema } = mongoose;

const productSchema = new Schema({
  cat_id: {
    type: Schema.Types.ObjectId,
    ref: "category",
    required: true,
  },
  unit_name: {
    type: String,
    required: true,
  },
  unit_value: {
    type: Number,
    required: true,
  },
  model_name: {
    type: String,
    required: true,
    trim: true,
  },
  year_val: {
    type: Number,
    required: true,
  },
  variant_name: {
    type: String,
    required: true,
    trim: true,
  },

  p_name: {
    type: String,
    required: true,
    trim: true,
  },
  brand: {
    type: String,
    trim: true,
  },
  location: {
    type: String,
    trim: true,
  },
  product_type: {
    type: String, //warehouse, published
    trim: true,
  },
  p_sku: {
    type: String,
    required: true,
    trim: true,
  },
  inventory: {
    type: Number, //0
    required: true,
    trim: true,
  },
  // hide inventory
  hide_inventory: {
    type: Boolean, //true - not show out of stock
    required: true,
    trim: true,
  },
  // hide product
  visibility: {
    type: Boolean, //true remove from product list
    required: true,
    trim: true,
  },
  // minimum order quantity
  m_o_q: {
    type: Number, // 2 = min (2 mpkg)
    required: true,
    trim: true,
  },
  price: {
    type: Number,
    trim: true,
  },
  // per pcs
  p_price: [
    {
      inventory: { type: String },
      name: { type: String },
      value: { type: String },
    },
  ],
  accept_order: {
    type: String,
    trim: true,
    required: true,
  },
  // per packet product
  pkg: {
    type: String,
    required: true,
    trim: true,
  },
  pkg_unit: {
    type: String,
    trim: true,
  },
  // master packaging
  mpkg: {
    type: String,
    required: true,
    trim: true,
  },
  mpkg_unit: {
    type: String,
    trim: true,
  },
  description: {
    type: String,
    required: true,
    trim: true,
  },

  p_gallery_image: [
    {
      link: { type: String },
      created_At: { type: Date, default: Date.now },
    },
  ],
  p_gallery_video: {
    type: String,
    trim: true,
  },
  createAt: {
    type: Date,
    default: Date.now,
  },
});
// we are createing new collection
// Hot queries

productSchema.index({ cat_id: 1 });
productSchema.index({ p_sku: 1 });
productSchema.index({
  cat_id: 1,
  model_name: 1,
  year_val: 1,
  variant_name: 1,
});

const ProductSchema = new mongoose.model("product", productSchema);
module.exports = ProductSchema;
