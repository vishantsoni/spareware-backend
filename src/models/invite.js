const mongoose = require("mongoose");
const { Schema } = mongoose;

const inviteSchema = new Schema({
  supplier_id: {
    type: Schema.Types.ObjectId,
    ref: "user",
    required: true,
    trim: true,
  },
  cus_id: {
    type: Schema.ObjectId,
    ref: "user",
    required: true,
    trim: true,
  },
  status: {
    type: String,
    required: true,
    trim: true,
  },
  nick_name:{
    type:String,
    required:true
  },
  createAt: {
    type: Date,
    default: Date.now,
    required: true,
  },
});
// we are createing new collection
const InviteShcema = new mongoose.model("invites", inviteSchema);
module.exports = InviteShcema;
