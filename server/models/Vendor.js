const mongoose = require('mongoose');

const vendorSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    storeName: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    description: {
      type: String,
      default: 'Authorized Rainbow Fashions Verified Boutique Seller',
    },
    logo: {
      type: String,
      default: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=400&q=80',
    },
    banner: {
      type: String,
      default: 'https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?auto=format&fit=crop&w=1200&q=80',
    },
    contactEmail: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      default: '+91 9705227709',
    },
    commissionPercentage: {
      type: Number,
      default: 10.0, // Platform retains 10% commission on sales
    },
    isApproved: {
      type: Boolean,
      default: true, // Auto-approved for seed/demo vendors
    },
    balance: {
      type: Number,
      default: 0.0,
    },
    totalPayouts: {
      type: Number,
      default: 0.0,
    },
    bankDetails: {
      bankName: { type: String, default: 'State Bank of India' },
      accountNumber: { type: String, default: 'XXXX-XXXX-5335' },
      ifscCode: { type: String, default: 'SBIN0001234' },
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Vendor', vendorSchema);
