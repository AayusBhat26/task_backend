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
    points: {
      type: Number,
      default: 0,
    },
    level: {
      type: Number,
      default: 0,
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
// userSchema.methods.createPasswordResetToken = function () {
//   const resetToken = crypto.randomBytes(32).toString("hex");
//   this.passwordResetToken = crypto
//     .createHash("sha256")
//     .update(resetToken)
//     .digest("hex");
//   this.passwordResetExpires = Date.now() + 10 * 60 * 1000;
//   return resetToken;
// };
// userSchema.methods.changePasswordAfter = async function (timestamp) {
//   if (this.passwordChangedAt) {
//     const changedTimeStamp = parseInt(this.passwordChangedAt.getTime() / 1000);
//     return timestamp > changedTimeStamp;
//   }

//   // FALSE MEANS NOT CHANGED
//   return false;
// };
module.exports = mongoose.model("User",userSchema);