const mongoose = require("mongoose");
const { Schema } = mongoose;

const settingSchema = new Schema({
  userid: {
    type: Schema.Types.ObjectId,
    ref: "user",
    required: true,
  },
  c_id: {
    type: Schema.Types.ObjectId,
    ref: "company",
    required: true,
  },
  invoiceSetting: {
    bankData: {
      bankName: { type: String },
      ifsc: { type: String },
      branch: { type: String },
      holdername: { type: String },
      ac_no:{type:String}
    },
    signatory: {
      type: String,
    },
    invoice_prefix: { type: String },
  },
  updatedAt: { type: Date, default: Date.now },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});
// we are createing new collection
const SettingSchema = new mongoose.model("setting", settingSchema);
module.exports = SettingSchema;
