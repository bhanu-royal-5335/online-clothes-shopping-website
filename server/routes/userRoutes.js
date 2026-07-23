const express = require('express');
const router = express.Router();
const {
  getUsers,
  toggleBlockUser,
  deleteUser,
  updateUserRole,
  getDashboardStats,
} = require('../controllers/userController');
const { protect, admin } = require('../middleware/auth');

router.get('/', protect, admin, getUsers);
router.get('/stats', protect, admin, getDashboardStats);

router.route('/:id')
  .delete(protect, admin, deleteUser);

router.put('/:id/block', protect, admin, toggleBlockUser);
router.put('/:id/role', protect, admin, updateUserRole);

module.exports = router;
