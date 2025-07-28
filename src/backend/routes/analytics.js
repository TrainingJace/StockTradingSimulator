const express = require('express');
const analyticsController = require('../controllers/analyticsController');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// 所有分析路由都需要认证
router.use(authenticateToken);

// 获取投资组合表现摘要
router.get('/performance', analyticsController.getPerformanceSummary);

// 获取投资组合价值历史
router.get('/history', analyticsController.getPortfolioValueHistory);

// 与基准指数比较
router.get('/benchmark', analyticsController.getBenchmarkComparison);

module.exports = router;
