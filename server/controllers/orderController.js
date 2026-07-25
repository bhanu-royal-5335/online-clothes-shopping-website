const Order = require('../models/Order');
const Product = require('../models/Product');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY || 'sk_test_mock_stripe_key_123');

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
const addOrderItems = async (req, res) => {
  const {
    orderItems,
    shippingAddress,
    paymentMethod,
    itemsPrice,
    taxPrice,
    shippingPrice,
    discountPrice,
    totalPrice,
    paymentResult,
  } = req.body;

  if (!orderItems || orderItems.length === 0) {
    return res.status(400).json({ message: 'No order items' });
  }

  try {
    // Check and update product stock
    for (const item of orderItems) {
      const product = await Product.findById(item.product);
      if (!product) {
        return res.status(404).json({ message: `Product not found: ${item.name}` });
      }
      if (product.stockQuantity < item.qty) {
        return res.status(400).json({
          message: `Insufficient stock for ${product.name}. Only ${product.stockQuantity} items left.`,
        });
      }
    }

    // Deduct stock quantities
    for (const item of orderItems) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stockQuantity: -item.qty },
      });
    }

    const order = new Order({
      user: req.user._id,
      orderItems,
      shippingAddress,
      paymentMethod,
      itemsPrice,
      taxPrice,
      shippingPrice,
      discountPrice,
      totalPrice,
      isPaid: paymentMethod === 'stripe' ? true : false,
      paidAt: paymentMethod === 'stripe' ? new Date() : undefined,
      paymentResult: paymentMethod === 'stripe' ? paymentResult : undefined,
      orderStatus: 'pending',
    });

    const createdOrder = await order.save();
    res.status(201).json(createdOrder);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('user', 'name email');

    if (order) {
      // Allow only the owner or an admin to access the order details
      if (order.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Not authorized to view this order' });
      }
      res.json(order);
    } else {
      res.status(404).json({ message: 'Order not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get logged in user orders
// @route   GET /api/orders/myorders
// @access  Private
const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all orders
// @route   GET /api/orders
// @access  Private/Admin
const getOrders = async (req, res) => {
  try {
    const orders = await Order.find({})
      .populate('user', 'id name')
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update order status
// @route   PUT /api/orders/:id/status
// @access  Private/Admin
const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findById(req.params.id);

    if (order) {
      order.orderStatus = status;

      if (status === 'delivered') {
        order.isPaid = true; // COD marks as paid when delivered
        order.paidAt = order.paidAt || new Date();
        order.deliveredAt = new Date();
      }

      if (status === 'cancelled') {
        // Return stock quantities if order is cancelled
        for (const item of order.orderItems) {
          await Product.findByIdAndUpdate(item.product, {
            $inc: { stockQuantity: item.qty },
          });
        }
      }

      const updatedOrder = await order.save();
      res.json(updatedOrder);
    } else {
      res.status(404).json({ message: 'Order not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create Stripe PaymentIntent
// @route   POST /api/orders/payment-intent
// @access  Private
const createPaymentIntent = async (req, res) => {
  const { amount } = req.body;

  try {
    // Stripe expects amount in cents
    const amountInCents = Math.round(amount * 100);

    // Verify key configured or return mock for testing
    if (!process.env.STRIPE_SECRET_KEY || process.env.STRIPE_SECRET_KEY.startsWith('sk_test_mock')) {
      console.log('Using simulated stripe payment intent (secret key empty or mock)');
      return res.json({
        clientSecret: 'mock_client_secret_intent_' + Date.now(),
        simulated: true,
      });
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInCents,
      currency: 'usd',
      metadata: { integration_check: 'accept_a_payment' },
    });

    res.json({
      clientSecret: paymentIntent.client_secret,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Generate printable HTML / PDF Invoice payload
// @route   GET /api/orders/:id/invoice
// @access  Private
const generateInvoicePDF = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('user', 'name email');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (order.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to download this invoice' });
    }

    const htmlInvoice = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Invoice #${order._id}</title>
        <style>
          body { font-family: 'Helvetica Neue', Arial, sans-serif; padding: 40px; color: #1e293b; background: #fff; }
          .header { display: flex; justify-content: space-between; border-bottom: 2px solid #e2e8f0; padding-bottom: 20px; margin-bottom: 30px; }
          .title { font-size: 24px; font-weight: bold; color: #d4af37; }
          .table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          .table th, .table td { border-bottom: 1px solid #cbd5e1; padding: 12px; text-align: left; font-size: 14px; }
          .table th { background: #f8fafc; font-weight: 600; }
          .total { text-align: right; margin-top: 30px; font-size: 18px; font-weight: bold; color: #0f172a; }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <div class="title">Rainbow Fashions</div>
            <div>Enterprise E-Commerce Invoice</div>
          </div>
          <div style="text-align: right;">
            <div><strong>Invoice ID:</strong> #${order._id}</div>
            <div><strong>Date:</strong> ${new Date(order.createdAt).toLocaleDateString()}</div>
          </div>
        </div>

        <div>
          <strong>Billed To:</strong> ${order.user.name} (${order.user.email})<br/>
          <strong>Shipping Address:</strong> ${order.shippingAddress.street}, ${order.shippingAddress.city}, ${order.shippingAddress.country}
        </div>

        <table class="table">
          <thead>
            <tr>
              <th>Item Description</th>
              <th>Qty</th>
              <th>Unit Price</th>
              <th>Subtotal</th>
            </tr>
          </thead>
          <tbody>
            ${order.orderItems
              .map(
                (item) => `
              <tr>
                <td>${item.name}</td>
                <td>${item.qty}</td>
                <td>$${item.price.toFixed(2)}</td>
                <td>$${(item.qty * item.price).toFixed(2)}</td>
              </tr>
            `
              )
              .join('')}
          </tbody>
        </table>

        <div class="total">
          Total Amount Paid: $${order.totalPrice.toFixed(2)}
        </div>
      </body>
      </html>
    `;

    res.setHeader('Content-Type', 'text/html');
    res.send(htmlInvoice);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  addOrderItems,
  getOrderById,
  getMyOrders,
  getOrders,
  updateOrderStatus,
  createPaymentIntent,
  generateInvoicePDF,
};
