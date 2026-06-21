const mongoose = require("mongoose");
const { Schema } = mongoose;

const NotiFy = new Schema({
  userid: {
    type: Schema.Types.ObjectId,
    ref: "user",
    required: true,
  },
  path: { type: String, default:"dashboard" },
  title: { type: String, default:"" },
  message: { type: String , default:""},
  markasread: { type: Boolean, default: false },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});
// we are createing new collection
const NotiSchema = new mongoose.model("notification", NotiFy);
module.exports = NotiSchema;
