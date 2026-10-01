const express = require('express');
const router = express.Router();
const {
  getOptimization,
  generateRecommendations,
  getRecommendations,
  updateRecommendationStatus
} = require('../controllers/optimizationController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/', getOptimization);
router.post('/generate-recommendations', authorize('Admin'), generateRecommendations);
router.get('/recommendations', getRecommendations);
router.put('/recommendations/:id', authorize('Admin'), updateRecommendationStatus);

module.exports = router;
