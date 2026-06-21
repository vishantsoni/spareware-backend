const mongoose = require("mongoose");
const { Schema } = mongoose;

const cartShcema = new Schema({
  userid: {
    type: Schema.Types.ObjectId,
    ref: "user",
    required: true,
  },
  catlog_id: {
    type: Schema.Types.ObjectId,
    ref: "catalog",
    required: true,
  },
  product_id: {
    type: Schema.Types.ObjectId,
    ref: "product",
    required: true,
  },
  key: { type: String },
  qty: { type: String },
  type: { type: String },
  price: { type: String },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});
// we are createing new collection
const CartShcema = new mongoose.model("cart", cartShcema);
module.exports = CartShcema;
