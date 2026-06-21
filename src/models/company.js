const mongoose = require("mongoose");
const { Schema } = mongoose;

const companyShceme = new Schema({
  userid: {
    type: String,
    required: true,
  },
  com_name: {
    type: String,
    required: true,
    trim: true,
    unique: true,
  },
  bus_type: {
    type: String,
    required: true,
    trim: true,
  },
  indus_type: {
    type: String,
    trim: true,
    default: "",
  },
  gst_no: {
    type: String,
    trim: true,
  },
  email: {
    type: String,
    trim: true,
  },
  com_phone: {
    type: Number,
    required: true,
    trim: true,
  },
  address: {
    type: String,
    trim: true,
  },
  state: {
    type: String,
    trim: true,
  },
  zipcode: {
    type: Number,
    trim: true,
  },
  country: {
    type: String,
    trim: true,
  },
  com_image: {
    type: String,
    trim: true,
    default: "",
  },
});
// we are createing new collection
// Hot queries
companyShceme.index({ userid: 1 });
companyShceme.index({ com_name: 1 });

// Used in inventory/order report lookups
companyShceme.index({ com_phone: 1 });
companyShceme.index({ gst_no: 1 });

const Company = new mongoose.model("company", companyShceme);
module.exports = Company;
