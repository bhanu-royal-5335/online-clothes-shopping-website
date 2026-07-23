const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: [true, 'Please enter coupon code'],
      unique: true,
      uppercase: true,
      trim: true,
    },
    discountType: {
      type: String,
      enum: ['percent', 'flat'],
      default: 'percent',
    },
    discountValue: {
      type: Number,
      required: [true, 'Please enter discount value'],
      min: [0, 'Discount value cannot be negative'],
    },
    minOrderValue: {
      type: Number,
      default: 0,
      min: [0, 'Minimum order value cannot be negative'],
    },
    expiryDate: {
      type: Date,
      required: [true, 'Please enter coupon expiry date'],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Method to verify if coupon is valid
couponSchema.methods.isValid = function (orderValue) {
  const isExpired = new Date() > this.expiryDate;
  const isMinMet = orderValue >= this.minOrderValue;
  return this.isActive && !isExpired && isMinMet;
};

const Coupon = mongoose.model('Coupon', couponSchema);
module.exports = Coupon;
