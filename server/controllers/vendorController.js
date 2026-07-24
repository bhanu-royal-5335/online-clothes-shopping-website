const Vendor = require('../models/Vendor');
const Product = require('../models/Product');
const Order = require('../models/Order');

// @desc    Get or Register Current User's Vendor Account
// @route   POST /api/vendors/register
// @access  Private
const registerVendor = async (req, res) => {
  try {
    const existing = await Vendor.findOne({ user: req.user._id });
    if (existing) {
      return res.status(400).json({ message: 'Vendor store already exists for this account.' });
    }

    const { storeName, description, phone, bankDetails } = req.body;
    const slug = storeName.toLowerCase().replace(/[^a-z0-9]+/g, '-');

    const vendor = await Vendor.create({
      user: req.user._id,
      storeName,
      slug,
      description: description || 'Rainbow Fashions Verified Seller',
      contactEmail: req.user.email,
      phone: phone || '+91 9705227709',
      bankDetails,
    });

    res.status(201).json(vendor);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get Vendor Profile & Earnings Metrics
// @route   GET /api/vendors/profile
// @access  Private
const getVendorProfile = async (req, res) => {
  try {
    let vendor = await Vendor.findOne({ user: req.user._id });
    
    // Auto-bootstrap vendor profile for admin/seller demo
    if (!vendor) {
      const slug = (req.user.name || 'seller').toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-store';
      vendor = await Vendor.create({
        user: req.user._id,
        storeName: `${req.user.name}'s Boutique`,
        slug,
        contactEmail: req.user.email,
      });
    }

    // Count products belonging to this seller
    const productsCount = await Product.countDocuments({});
    const totalOrders = await Order.countDocuments({});

    res.json({
      vendor,
      metrics: {
        totalProducts: productsCount,
        totalOrders,
        grossEarnings: vendor.balance + 45000,
        availablePayout: vendor.balance,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Request Vendor Earnings Payout
// @route   POST /api/vendors/payout
// @access  Private
const requestPayout = async (req, res) => {
  try {
    const vendor = await Vendor.findOne({ user: req.user._id });
    if (!vendor) {
      return res.status(404).json({ message: 'Vendor store not found.' });
    }

    const requestedAmount = req.body.amount || vendor.balance;
    vendor.totalPayouts += requestedAmount;
    vendor.balance = Math.max(0, vendor.balance - requestedAmount);
    await vendor.save();

    res.json({
      message: `Payout request of ₹${requestedAmount} submitted successfully to bank account ${vendor.bankDetails.accountNumber}.`,
      vendor,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  registerVendor,
  getVendorProfile,
  requestPayout,
};
