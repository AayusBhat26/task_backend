const mongoose = require('mongoose');
const {schemaOptions} = require("./modelOptions")
const crypto = require("crypto-js");

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
    },
    firstname: {
      type: String,
      required: true,
    },
    lastname: {
      type: String,
      required: true,
    },
    username: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
      select: false,
    },
    otp: {
      type: Number,
    },
    otp_expiry_time: {
      type: Date,
    },
    verified: {
      type: Boolean,
      default: false,
    },
  },
  schemaOptions
);

userSchema.methods.correctOtp = async function (candidateOtp, userOtp) {
  // return await crypto.(candidateOtp, userOtp);
  return candidateOtp==userOtp
};

module.exports = mongoose.model("User",userSchema);