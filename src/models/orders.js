const mongoose = require("mongoose");
const { Schema } = mongoose;

const orderSchema = new Schema({
  order_id: {
    type: Number,
    require: true,
    unique: true,
  },
  supplier_c_id: {
    type: Schema.Types.ObjectId,
    ref: "company",
    require: true,
  },
  userid: {
    type: Schema.Types.ObjectId,
    ref: "user",
    required: true,
  },
  supplier_id: {
    type: Schema.Types.ObjectId,
    ref: "user",
    required: true,
  },
  order_list: [
    {
      catlog_id: { type: Schema.Types.ObjectId, ref: "catalog" },
      product_id: { type: Object },
      qty: { type: Number },
      price: { type: String },
      type: { type: String }, //pkg, mpkg, unit
      key: { type: String },
    },
  ],
  total_price: {
    type: String,
    required: true,
  },
  order_status: {
    type: String,
    required: true,
    default: "pending", // pending , confirm, dispatch, deliverd, Rejected
  },
  create_by: {
    type: String,
    required: true,
  },
  updated_at: {
    type: Date,
    required: true,
    default: Date.now,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});
// we are createing new collection
// Hot queries
orderSchema.index({ userid: 1 });
orderSchema.index({ supplier_id: 1, supplier_c_id: 1 });
orderSchema.index({ supplier_id: 1, userid: 1, order_status: 1 });
orderSchema.index({ order_status: 1 });
orderSchema.index({ createdAt: -1 });

const OrderSchema = new mongoose.model("order", orderSchema);
module.exports = OrderSchema;
