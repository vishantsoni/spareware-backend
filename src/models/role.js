const mongoose = require("mongoose");
const { Schema } = mongoose;

const roleshcema = new Schema({
  userid: {
    type: String,
    required: true,
  },
  com_id: {
    type: String,
    required: true,
  },
  role_name: {
    type: String,
    required: true,
  },
  access: [
    {
      type_name: { type: String },
      read:{type:Boolean, default:false},
      write:{type:Boolean,default:false},
      create:{type:Boolean, default:false}
    },
  ],
  created_at: {
    type: Date,
    default: Date.now,
  },
});
// we are createing new collection
const RoleSchema = new mongoose.model("role", roleshcema);
module.exports = RoleSchema;
