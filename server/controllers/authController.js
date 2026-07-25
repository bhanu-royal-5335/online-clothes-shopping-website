const User = require('../models/User');
const OTP = require('../models/OTP');
const generateTokens = require('../utils/generateToken');
const otpService = require('../services/otpService');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Helper to normalize phone number string
const normalizePhone = (phone, countryCode = '+91') => {
  const clean = phone.replace(/[^0-9+]/g, '');
  if (clean.startsWith('+')) return clean;
  return `${countryCode}${clean}`;
};

// @desc    Register a new user via Email
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }

    const isFirstUser = (await User.countDocuments({})) === 0;
    const role = isFirstUser ? 'admin' : 'customer';

    const user = await User.create({
      name,
      email,
      password,
      role,
      loginMethod: 'email',
      isVerified: isFirstUser,
    });

    if (user) {
      generateTokens(res, user._id);

      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified,
        loginMethod: user.loginMethod,
        wishlist: user.wishlist,
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Send 6-Digit Registration OTP to Phone
// @route   POST /api/auth/send-registration-otp
// @access  Public
const sendRegistrationOTP = async (req, res) => {
  const { phone, countryCode = '+91' } = req.body;

  try {
    const formattedPhone = normalizePhone(phone, countryCode);

    // Check if phone already registered and verified
    const existingUser = await User.findOne({ phone: formattedPhone, phoneVerified: true });
    if (existingUser) {
      return res.status(400).json({ message: 'Phone number already registered. Please sign in.' });
    }

    // Generate 6-digit OTP
    const rawOTP = otpService.generate6DigitOTP();
    const hashedOTP = await bcrypt.hash(rawOTP, 10);

    // Clear old OTPs for this phone & purpose
    await OTP.deleteMany({ phone: formattedPhone, purpose: 'registration' });

    // Store new OTP in MongoDB with 5-min TTL
    await OTP.create({
      phone: formattedPhone,
      otp: hashedOTP,
      purpose: 'registration',
      expiresAt: new Date(Date.now() + 5 * 60 * 1000), // 5 minutes
    });

    // Send SMS via OTP service
    const smsMessage = `Your Rainbow Fashions verification code is: ${rawOTP}. Valid for 5 minutes. Do not share with anyone.`;
    const smsResult = await otpService.sendSMS(formattedPhone, smsMessage);

    res.status(200).json({
      success: true,
      message: `OTP sent successfully to ${formattedPhone}`,
      phone: formattedPhone,
      // If Twilio API keys are not set, return debugOTP for demo testing
      ...(!process.env.TWILIO_ACCOUNT_SID && { debugOTP: rawOTP }),
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to send OTP: ' + error.message });
  }
};

// @desc    Verify Registration OTP & Create User Account
// @route   POST /api/auth/verify-registration-otp
// @access  Public
const verifyRegistrationOTPAndRegister = async (req, res) => {
  const { name, email, phone, countryCode = '+91', password, otp } = req.body;

  try {
    const formattedPhone = normalizePhone(phone, countryCode);

    // Find OTP record
    const otpRecord = await OTP.findOne({ phone: formattedPhone, purpose: 'registration' });

    if (!otpRecord) {
      return res.status(400).json({ message: 'OTP expired or not found. Please request a new OTP.' });
    }

    if (otpRecord.attempts >= 5) {
      await OTP.deleteOne({ _id: otpRecord._id });
      return res.status(400).json({ message: 'Maximum OTP verification attempts exceeded. Request a new OTP.' });
    }

    // Compare OTP
    const isMatch = await otpRecord.matchOTP(otp);

    if (!isMatch) {
      otpRecord.attempts += 1;
      await otpRecord.save();
      return res.status(400).json({ message: 'Invalid OTP code. Please check and try again.' });
    }

    // Delete OTP record immediately upon match
    await OTP.deleteOne({ _id: otpRecord._id });

    // Check duplicate email if provided
    if (email) {
      const emailExists = await User.findOne({ email });
      if (emailExists) {
        return res.status(400).json({ message: 'An account with this email already exists.' });
      }
    }

    // Determine user role
    const isFirstUser = (await User.countDocuments({})) === 0;
    const role = isFirstUser ? 'admin' : 'customer';

    // Create user
    const user = await User.create({
      name,
      email: email || undefined,
      phone: formattedPhone,
      countryCode,
      phoneVerified: true,
      loginMethod: 'phone',
      password,
      role,
      isVerified: true,
      lastLogin: new Date(),
    });

    generateTokens(res, user._id);

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      countryCode: user.countryCode,
      phoneVerified: user.phoneVerified,
      loginMethod: user.loginMethod,
      role: user.role,
      wishlist: user.wishlist,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Auth user via Phone Number + Password (NO OTP Required)
// @route   POST /api/auth/login-phone
// @access  Public
const loginPhone = async (req, res) => {
  const { phone, countryCode = '+91', password } = req.body;

  try {
    const formattedPhone = normalizePhone(phone, countryCode);

    const user = await User.findOne({ phone: formattedPhone });

    if (!user) {
      return res.status(401).json({ message: 'Invalid phone number or password' });
    }

    if (user.isBlocked) {
      return res.status(403).json({ message: 'User account is blocked. Please contact support.' });
    }

    const isMatch = await user.matchPassword(password);

    if (isMatch) {
      user.lastLogin = new Date();
      await user.save();

      generateTokens(res, user._id);

      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        countryCode: user.countryCode,
        phoneVerified: user.phoneVerified,
        loginMethod: 'phone',
        role: user.role,
        isVerified: user.isVerified,
        wishlist: user.wishlist,
      });
    } else {
      res.status(401).json({ message: 'Invalid phone number or password' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Auth user via Email + Password
// @route   POST /api/auth/login / /api/auth/login-email
// @access  Public
const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email: email.toLowerCase().trim() });

    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    if (user.isBlocked) {
      return res.status(403).json({ message: 'User is blocked. Please contact support.' });
    }

    const isMatch = await user.matchPassword(password);

    if (isMatch) {
      user.lastLogin = new Date();
      await user.save();

      generateTokens(res, user._id);

      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        loginMethod: user.loginMethod || 'email',
        isVerified: user.isVerified,
        wishlist: user.wishlist,
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Send Forgot Password OTP to Phone
// @route   POST /api/auth/forgot-password-phone
// @access  Public
const forgotPasswordPhone = async (req, res) => {
  const { phone, countryCode = '+91' } = req.body;

  try {
    const formattedPhone = normalizePhone(phone, countryCode);

    const user = await User.findOne({ phone: formattedPhone });
    if (!user) {
      return res.status(404).json({ message: 'No account registered with this phone number.' });
    }

    const rawOTP = otpService.generate6DigitOTP();
    const hashedOTP = await bcrypt.hash(rawOTP, 10);

    await OTP.deleteMany({ phone: formattedPhone, purpose: 'forgot_password' });

    await OTP.create({
      phone: formattedPhone,
      otp: hashedOTP,
      purpose: 'forgot_password',
      expiresAt: new Date(Date.now() + 5 * 60 * 1000),
    });

    const smsMessage = `Your Rainbow Fashions password reset code is: ${rawOTP}. Valid for 5 minutes.`;
    await otpService.sendSMS(formattedPhone, smsMessage);

    res.status(200).json({
      success: true,
      message: `Password reset OTP sent to ${formattedPhone}`,
      ...(!process.env.TWILIO_ACCOUNT_SID && { debugOTP: rawOTP }),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Reset Password via Phone OTP
// @route   POST /api/auth/reset-password-phone
// @access  Public
const resetPasswordPhone = async (req, res) => {
  const { phone, countryCode = '+91', otp, password } = req.body;

  try {
    const formattedPhone = normalizePhone(phone, countryCode);

    const otpRecord = await OTP.findOne({ phone: formattedPhone, purpose: 'forgot_password' });
    if (!otpRecord) {
      return res.status(400).json({ message: 'OTP expired or not found. Please request a new OTP.' });
    }

    const isMatch = await otpRecord.matchOTP(otp);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid OTP code.' });
    }

    const user = await User.findOne({ phone: formattedPhone });
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    user.password = password;
    await user.save();

    await OTP.deleteOne({ _id: otpRecord._id });

    res.json({ message: 'Password reset successfully! You can now log in.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Resend OTP
// @route   POST /api/auth/resend-otp
// @access  Public
const resendOTP = async (req, res) => {
  const { phone, countryCode = '+91', purpose = 'registration' } = req.body;

  try {
    const formattedPhone = normalizePhone(phone, countryCode);

    const rawOTP = otpService.generate6DigitOTP();
    const hashedOTP = await bcrypt.hash(rawOTP, 10);

    await OTP.deleteMany({ phone: formattedPhone, purpose });

    await OTP.create({
      phone: formattedPhone,
      otp: hashedOTP,
      purpose,
      expiresAt: new Date(Date.now() + 5 * 60 * 1000),
    });

    const smsMessage = `Your new Rainbow Fashions verification code is: ${rawOTP}. Valid for 5 minutes.`;
    await otpService.sendSMS(formattedPhone, smsMessage);

    res.status(200).json({
      success: true,
      message: `New OTP sent successfully to ${formattedPhone}`,
      ...(!process.env.TWILIO_ACCOUNT_SID && { debugOTP: rawOTP }),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Logout user
const logoutUser = async (req, res) => {
  const isProd = process.env.NODE_ENV === 'production';
  const cookieOptions = {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? 'none' : 'lax',
    expires: new Date(0),
  };

  res.cookie('accessToken', '', cookieOptions);
  res.cookie('refreshToken', '', cookieOptions);

  res.status(200).json({ message: 'Logged out successfully' });
};

// @desc    Get user profile
const getUserProfile = async (req, res) => {
  const user = await User.findById(req.user._id).select('-password');
  if (user) {
    res.json(user);
  } else {
    res.status(404).json({ message: 'User not found' });
  }
};

// @desc    Update user profile
const updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      user.name = req.body.name || user.name;
      user.email = req.body.email || user.email;
      user.phone = req.body.phone || user.phone;

      if (req.body.password) {
        user.password = req.body.password;
      }

      const updatedUser = await user.save();
      generateTokens(res, updatedUser._id);

      res.json({
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        phone: updatedUser.phone,
        role: updatedUser.role,
        isVerified: updatedUser.isVerified,
        wishlist: updatedUser.wishlist,
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Refresh Access Token
const refreshAccessToken = async (req, res) => {
  const token = req.cookies.refreshToken;

  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no refresh token' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET || 'default_refresh_secret_123');
    const user = await User.findById(decoded.userId);

    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    if (user.isBlocked) {
      return res.status(403).json({ message: 'User is blocked' });
    }

    generateTokens(res, user._id);
    res.status(200).json({ message: 'Token refreshed successfully' });
  } catch (error) {
    res.status(401).json({ message: 'Not authorized, invalid refresh token' });
  }
};

// @desc    Simulate Verify Email
const verifyEmail = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (user) {
      user.isVerified = true;
      await user.save();
      res.json({ message: 'Email verified successfully!', isVerified: true });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const emailService = require('../services/emailService');

// @desc    Send 6-Digit OTP to Email Address
// @route   POST /api/auth/send-email-otp
// @access  Public
const sendEmailOTP = async (req, res) => {
  const { email, purpose = 'Verification' } = req.body;

  try {
    const formattedEmail = email.toLowerCase().trim();

    const rawOTP = otpService.generate6DigitOTP();
    const hashedOTP = await bcrypt.hash(rawOTP, 10);

    await OTP.deleteMany({ phone: formattedEmail, purpose: 'email_verification' });

    await OTP.create({
      phone: formattedEmail,
      otp: hashedOTP,
      purpose: 'email_verification',
      expiresAt: new Date(Date.now() + 5 * 60 * 1000),
    });

    await emailService.sendEmailOTP(formattedEmail, rawOTP, purpose);

    res.status(200).json({
      success: true,
      message: `OTP sent successfully to email: ${formattedEmail}`,
      email: formattedEmail,
      ...(!process.env.EMAIL_USER && { debugOTP: rawOTP }),
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to send Email OTP: ' + error.message });
  }
};

// @desc    Forgot Password Email OTP
// @route   POST /api/auth/forgot-password-email-otp
// @access  Public
const forgotPasswordEmailOTP = async (req, res) => {
  const { email } = req.body;

  try {
    const formattedEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: formattedEmail });

    if (!user) {
      return res.status(404).json({ message: 'User with this email does not exist' });
    }

    const rawOTP = otpService.generate6DigitOTP();
    const hashedOTP = await bcrypt.hash(rawOTP, 10);

    await OTP.deleteMany({ phone: formattedEmail, purpose: 'forgot_password_email' });

    await OTP.create({
      phone: formattedEmail,
      otp: hashedOTP,
      purpose: 'forgot_password_email',
      expiresAt: new Date(Date.now() + 5 * 60 * 1000),
    });

    await emailService.sendEmailOTP(formattedEmail, rawOTP, 'Password Reset');

    res.status(200).json({
      success: true,
      message: `Password reset OTP sent to email: ${formattedEmail}`,
      ...(!process.env.EMAIL_USER && { debugOTP: rawOTP }),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Reset Password via Email OTP
// @route   POST /api/auth/reset-password-email-otp
// @access  Public
const resetPasswordEmailOTP = async (req, res) => {
  const { email, otp, password } = req.body;

  try {
    const formattedEmail = email.toLowerCase().trim();

    const otpRecord = await OTP.findOne({ phone: formattedEmail, purpose: 'forgot_password_email' });
    if (!otpRecord) {
      return res.status(400).json({ message: 'OTP expired or not found. Please request a new OTP.' });
    }

    const isMatch = await otpRecord.matchOTP(otp);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid OTP code.' });
    }

    const user = await User.findOne({ email: formattedEmail });
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    user.password = password;
    await user.save();

    await OTP.deleteOne({ _id: otpRecord._id });

    res.json({ message: 'Password reset successfully! You can now log in.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  registerUser,
  sendRegistrationOTP,
  verifyRegistrationOTPAndRegister,
  sendEmailOTP,
  forgotPasswordEmailOTP,
  resetPasswordEmailOTP,
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
};
