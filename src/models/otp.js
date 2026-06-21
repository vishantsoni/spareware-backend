const mongoose = require("mongoose");
const { Schema } = mongoose;

const otpShcema = new Schema({
  phone: {
    type: String,
    required: true,
  },
  otp: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});
// we are createing new collection
// Hot lookup: verify OTP
otpShcema.index({ phone: 1, otp: 1 });
otpShcema.index({ createdAt: -1 });

// Optional safety: you can add TTL later (only if desired)
// otpShcema.index({ createdAt: 1 }, { expireAfterSeconds: 300 });

const OTPShcema = new mongoose.model("otpcode", otpShcema);
module.exports = OTPShcema;
