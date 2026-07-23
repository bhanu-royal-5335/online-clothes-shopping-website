const express = require('express');
const router = express.Router();
const {
  addOrderItems,
  getOrderById,
  getMyOrders,
  getOrders,
  updateOrderStatus,
  createPaymentIntent,
} = require('../controllers/orderController');
const { protect, admin } = require('../middleware/auth');
const { orderValidator } = require('../middleware/validation');

router.route('/')
  .post(protect, orderValidator, addOrderItems)
  .get(protect, admin, getOrders);

router.get('/myorders', protect, getMyOrders);
router.post('/payment-intent', protect, createPaymentIntent);

router.route('/:id')
  .get(protect, getOrderById);

router.route('/:id/status')
  .put(protect, admin, updateOrderStatus);

module.exports = router;
