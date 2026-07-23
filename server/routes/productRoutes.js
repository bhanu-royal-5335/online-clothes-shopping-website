const express = require('express');
const router = express.Router();
const {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  createProductReview,
  getTopProducts,
  uploadProductImages,
} = require('../controllers/productController');
const { protect, admin } = require('../middleware/auth');
const { productValidator, reviewValidator } = require('../middleware/validation');
const { upload } = require('../middleware/upload');

router.route('/')
  .get(getProducts)
  .post(protect, admin, productValidator, createProduct);

router.get('/top', getTopProducts);

router.post('/upload', protect, admin, upload.array('images', 5), uploadProductImages);

router.route('/:id')
  .get(getProductById)
  .put(protect, admin, updateProduct)
  .delete(protect, admin, deleteProduct);

router.route('/:id/reviews').post(protect, reviewValidator, createProductReview);

module.exports = router;
