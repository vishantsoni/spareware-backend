const mongoose = require("mongoose");
const { Schema } = mongoose;

const invoiceShcema = new Schema({
  supplier_id: {
    type: Schema.Types.ObjectId,
    ref: "user",
    required: true,
  },
  customer_id: {
    type: Schema.Types.ObjectId,
    ref: "user",
    required: true,
  },
  inv_number: {
    type: String,
    required: true,
  },
  item_data: [
    {
      p_id: { type: Schema.Types.ObjectId, ref: "product" },
      qty: { type: Number },
      discount: { type: String },
      tax: { type: String },
      amount: { type: String },
    },
  ],
  taxableAmt: { type: String },
  totalPrice:{type:String},
  bankData: {
    bankName: { type: String },
    ifsc: { type: String },
    branch: { type: String },
    holdername: { type: String },
  },
  signatory: { type: String },
  updatedAt: { type: Date, default: Date.now },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});
// we are createing new collection
const InvoiceShcema = new mongoose.model("invoice", invoiceShcema);
module.exports = InvoiceShcema;
