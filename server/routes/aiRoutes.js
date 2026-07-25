const express = require('express');
const router = express.Router();
const {
  analyzeImage,
  generateOutfit,
  naturalLanguageSearch,
  estimateSize,
  getAdminAIStats,
} = require('../controllers/aiController');
const { upload } = require('../middleware/upload');
const { protect, admin } = require('../middleware/auth');

router.post('/analyze-image', upload.single('image'), analyzeImage);
router.post('/outfit-generator', generateOutfit);
router.post('/natural-search', naturalLanguageSearch);
router.post('/size-estimator', estimateSize);
router.get('/admin-analytics', protect, admin, getAdminAIStats);

module.exports = router;
