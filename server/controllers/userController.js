const User = require('../models/User');
const Order = require('../models/Order');
const Product = require('../models/Product');

// @desc    Get all users
// @route   GET /api/users
// @access  Private/Admin
const getUsers = async (req, res) => {
  try {
    const users = await User.find({}).select('-password');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Toggle user block status
// @route   PUT /api/users/:id/block
// @access  Private/Admin
const toggleBlockUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (user) {
      if (user.role === 'admin') {
        return res.status(400).json({ message: 'Cannot block administrative user accounts' });
      }

      user.isBlocked = !user.isBlocked;
      // If blocked, invalidate refresh token to force logout
      if (user.isBlocked) {
        user.refreshToken = undefined;
      }

      await user.save();
      res.json({
        message: `User account has been successfully ${user.isBlocked ? 'blocked' : 'unblocked'}`,
        user,
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private/Admin
const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (user) {
      if (user.role === 'admin') {
        return res.status(400).json({ message: 'Cannot delete administrative user accounts' });
      }
      await User.deleteOne({ _id: req.params.id });
      res.json({ message: 'User account removed successfully' });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update user role
// @route   PUT /api/users/:id/role
// @access  Private/Admin
const updateUserRole = async (req, res) => {
  const { role } = req.body;

  try {
    const user = await User.findById(req.params.id);

    if (user) {
      user.role = role || user.role;
      const updatedUser = await user.save();
      res.json({
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get dashboard metrics & statistical aggregates
// @route   GET /api/users/dashboard/stats
// @access  Private/Admin
const getDashboardStats = async (req, res) => {
  try {
    // 1. Core tallies
    const userCount = await User.countDocuments({});
    const productCount = await Product.countDocuments({});
    const orderCount = await Order.countDocuments({});

    // 2. Order counts by status
    const pendingOrders = await Order.countDocuments({ orderStatus: { $in: ['pending', 'packed', 'shipped'] } });
    const deliveredOrders = await Order.countDocuments({ orderStatus: 'delivered' });
    const cancelledOrders = await Order.countDocuments({ orderStatus: 'cancelled' });

    // 3. Financial calculations: Sum total revenue for paid orders
    const salesAggregate = await Order.aggregate([
      { $match: { isPaid: true, orderStatus: { $ne: 'cancelled' } } },
      { $group: { _id: null, totalSales: { $sum: '$totalPrice' } } },
    ]);
    const totalSales = salesAggregate.length > 0 ? salesAggregate[0].totalSales : 0;

    // 4. Time series monthly metrics for rendering React area/line charts
    const monthlySales = await Order.aggregate([
      { $match: { isPaid: true, orderStatus: { $ne: 'cancelled' } } },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
          },
          sales: { $sum: '$totalPrice' },
          ordersCount: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    // Format months nicely
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const chartData = monthlySales.map((item) => ({
      name: `${monthNames[item._id.month - 1]} ${item._id.year}`,
      sales: parseFloat(item.sales.toFixed(2)),
      orders: item.ordersCount,
    }));

    // In case chartData is empty, populate with some mock zero nodes so UI chart renders cleanly
    if (chartData.length === 0) {
      const currYear = new Date().getFullYear();
      chartData.push({ name: `Jul ${currYear}`, sales: 0, orders: 0 });
    }

    // 5. Fetch 5 most recent orders with user details populated
    const recentOrders = await Order.find({})
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .limit(5);

    res.json({
      metrics: {
        totalSales: parseFloat(totalSales.toFixed(2)),
        users: userCount,
        products: productCount,
        orders: orderCount,
        pendingOrders,
        deliveredOrders,
        cancelledOrders,
      },
      chartData,
      recentOrders,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getUsers,
  toggleBlockUser,
  deleteUser,
  updateUserRole,
  getDashboardStats,
};
