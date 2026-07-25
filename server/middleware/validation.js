const { body, validationResult } = require('express-validator');

// Error check aggregator
const validateResults = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorMsg = errors.array().map((err) => err.msg).join(', ');
    return res.status(400).json({ message: errorMsg });
  }
  next();
};

const registerValidator = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').optional({ checkFalsy: true }).trim().isEmail().withMessage('A valid email is required'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  validateResults,
];

const loginValidator = [
  body('password').notEmpty().withMessage('Password is required'),
  validateResults,
];

// Phone Auth Validators
const sendOTPValidator = [
  body('phone').trim().notEmpty().withMessage('Phone number is required'),
  validateResults,
];

const verifyOTPValidator = [
  body('phone').trim().notEmpty().withMessage('Phone number is required'),
  body('otp').trim().isLength({ min: 6, max: 6 }).withMessage('6-digit OTP code is required'),
  validateResults,
];

const phoneLoginValidator = [
  body('password').notEmpty().withMessage('Password is required'),
  validateResults,
];

const phoneResetPasswordValidator = [
  body('password').isLength({ min: 6 }).withMessage('New password must be at least 6 characters'),
  validateResults,
];

const productValidator = [
  body('name').trim().notEmpty().withMessage('Product name is required'),
  body('description').trim().notEmpty().withMessage('Description is required'),
  body('category').trim().notEmpty().withMessage('Category ID is required'),
  body('brand').trim().notEmpty().withMessage('Brand is required'),
  body('price').isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  body('stockQuantity')
    .isInt({ min: 0 })
    .withMessage('Stock quantity must be a non-negative integer'),
  body('sku').trim().notEmpty().withMessage('SKU code is required'),
  validateResults,
];

const reviewValidator = [
  body('rating')
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating must be an integer between 1 and 5'),
  body('comment').trim().notEmpty().withMessage('Review comment is required'),
  validateResults,
];

const orderValidator = [
  body('orderItems').isArray({ min: 1 }).withMessage('At least one order item is required'),
  body('shippingAddress.street').notEmpty().withMessage('Street is required'),
  body('shippingAddress.city').notEmpty().withMessage('City is required'),
  body('shippingAddress.state').notEmpty().withMessage('State is required'),
  body('shippingAddress.postalCode').notEmpty().withMessage('Postal code is required'),
  body('shippingAddress.country').notEmpty().withMessage('Country is required'),
  body('paymentMethod')
    .isIn(['stripe', 'cod'])
    .withMessage('Payment method must be stripe or cod'),
  validateResults,
];

module.exports = {
  registerValidator,
  loginValidator,
  sendOTPValidator,
  verifyOTPValidator,
  phoneLoginValidator,
  phoneResetPasswordValidator,
  productValidator,
  reviewValidator,
  orderValidator,
};
