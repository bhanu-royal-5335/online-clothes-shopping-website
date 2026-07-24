const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  registerVendor,
  getVendorProfile,
  requestPayout,
} = require('../controllers/vendorController');

router.post('/register', protect, registerVendor);
router.get('/profile', protect, getVendorProfile);
router.post('/payout', protect, requestPayout);

module.exports = router;
