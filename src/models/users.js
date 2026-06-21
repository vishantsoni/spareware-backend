const mongoose = require("mongoose");
const { Schema } = mongoose;

const menSchema = new Schema({
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
  address: {
    type: String,
    default: "",
    trim: true,
  },
  password: {
    type: String,
    required: true,
    trim: true,
  },
  type: {
    type: String,
    required: true,
    trim: true,
  },
  customer_data: [
    {
      customer_id: {
        type: Schema.Types.ObjectId,
        ref: "user",
        required: true,
      },
      nick_name: {
        type: String,
        trim: true,
        default: "",
      },
      out_standing: {
        type: Number,
        trim: true,
        default: 0,
      },
      status: {
        type: Boolean,
        default: true,
      },
    },
  ],
  createBy: {
    type: String,
    default: "self",
    required: true,
  },
  createAt: {
    type: Date,
    default: Date.now,
    required: true,
  },
  subscription: {
    type: Schema.Types.ObjectId,
    ref: "subscription",
    default: null,
  },
  subcribeAt: {
    type: Date,
    default: "",
  },
  devide_id: {
    type: String,
    default: "",
  },
  devide_token: {
    type: String,
    default: "",
  },
});
// we are createing new collection
// Common indexes for hot query paths
menSchema.index({ phone: 1 });
menSchema.index({ devide_id: 1 });
menSchema.index({ devide_token: 1 });

const Users = new mongoose.model("user", menSchema);
module.exports = Users;
