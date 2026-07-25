const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const otpSchema = new mongoose.Schema(
  {
    phone: {
      type: String,
      required: true,
      index: true,
    },
    otp: {
      type: String,
      required: true,
    },
    purpose: {
      type: String,
      enum: ['registration', 'forgot_password', 'email_verification', 'forgot_password_email'],
      default: 'registration',
    },
    attempts: {
      type: Number,
      default: 0,
      max: 5,
    },
    expiresAt: {
      type: Date,
      required: true,
      index: { expires: '5m' }, // Automatically deletes from MongoDB after 5 minutes
    },
  },
  {
    timestamps: true,
  }
);

// Method to verify OTP code
otpSchema.methods.matchOTP = async function (enteredOTP) {
  return await bcrypt.compare(enteredOTP, this.otp);
};

const OTP = mongoose.model('OTP', otpSchema);
module.exports = OTP;
