const mongoose = require("mongoose");
const { Schema } = mongoose;

const adminSchema = new Schema({
  fullname: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    trim: true,
    default: "",
  },
  phone: {
    type: Number,
    required: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
    trim: true,
  },
  createAt: {
    type: Date,
    default: Date.now,
    required: true,
  },
});
const Admin = new mongoose.model("admin", adminSchema);
module.exports = Admin;
