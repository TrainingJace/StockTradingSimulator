const express = require('express');
const analyticsController = require('../controllers/analyticsController');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// All analytics routes require authentication
router.use(authenticateToken);

// Portfolio analytics (for frontend integration)
router.get('/portfolio', analyticsController.getPortfolioAnalytics);

// Performance summary
router.get('/performance', analyticsController.getPerformanceSummary);

// Portfolio value history
router.get('/history', analyticsController.getPortfolioValueHistory);

// Benchmark comparison
router.get('/benchmark', analyticsController.getBenchmarkComparison);

module.exports = router;
