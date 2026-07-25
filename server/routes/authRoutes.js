const express = require('express');
const router = express.Router();
const {
  registerUser,
  sendRegistrationOTP,
  verifyRegistrationOTPAndRegister,
  loginUser,
  loginPhone,
  forgotPasswordPhone,
  resetPasswordPhone,
  resendOTP,
  logoutUser,
  getUserProfile,
  updateUserProfile,
  refreshAccessToken,
  verifyEmail,
  forgotPassword,
  resetPassword,
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const {
  registerValidator,
  loginValidator,
  sendOTPValidator,
  verifyOTPValidator,
  phoneLoginValidator,
  phoneResetPasswordValidator,
} = require('../middleware/validation');
const { authLimiter } = require('../middleware/rateLimiter');

// Email Auth Endpoints
router.post('/register', authLimiter, registerValidator, registerUser);
router.post('/login', authLimiter, loginValidator, loginUser);
router.post('/login-email', authLimiter, loginValidator, loginUser);

// Phone Auth Endpoints
router.post('/send-registration-otp', authLimiter, sendOTPValidator, sendRegistrationOTP);
router.post('/verify-registration-otp', authLimiter, verifyOTPValidator, verifyRegistrationOTPAndRegister);
router.post('/login-phone', authLimiter, phoneLoginValidator, loginPhone);
router.post('/forgot-password-phone', authLimiter, sendOTPValidator, forgotPasswordPhone);
router.post('/reset-password-phone', authLimiter, phoneResetPasswordValidator, resetPasswordPhone);
router.post('/resend-otp', authLimiter, sendOTPValidator, resendOTP);

// Session & Profile Endpoints
router.post('/logout', logoutUser);
router.post('/refresh', refreshAccessToken);
router.get('/profile', protect, getUserProfile);
router.put('/profile', protect, updateUserProfile);
router.post('/verify-email', protect, verifyEmail);

router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

module.exports = router;
