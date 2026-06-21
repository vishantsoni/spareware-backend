const mongoose = require("mongoose");
const { Schema } = mongoose;

const payment = new Schema({
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
  amt: {
    type: Number,
  },
  collectedBy: {
    type: String,
    required: true,
  },
  mode: { type: String, required: true },
  desc: { type: String },
  createBy: { type: String, required: true },
  createAt: { type: Date, default: Date.now },
  approve: { type: Boolean, required: true },
});
// we are createing new collection
// Hot lookup for outstanding calculation
payment.index({ userid: 1, supplier_id: 1 });
payment.index({ createAt: -1 });

const Payment = new mongoose.model("payment", payment);
module.exports = Payment;
