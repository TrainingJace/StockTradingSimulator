const express = require('express');
const portfolioController = require('../controllers/portfolioController');

const router = express.Router();

// 获取用户投资组合
router.get('/user/:userId', portfolioController.getPortfolio);

// 创建投资组合
router.post('/user/:userId', portfolioController.createPortfolio);

// 执行交易
router.post('/user/:userId/trade', portfolioController.executeTrade);

// 获取交易历史
// 使用方式: GET /api/portfolio/user/1/transactions?limit=20
router.get('/user/:userId/transactions', portfolioController.getTransactionHistory);

// 更新投资组合价值（批量更新股价）
router.put('/user/:userId/values', portfolioController.updatePortfolioValues);

// 获取投资组合统计数据
// 使用方式: GET /api/portfolio/user/1/stats?period=1M
router.get('/user/:userId/stats', portfolioController.getPortfolioStats);

// 获取详细的投资收益统计
// 使用方式: GET /api/portfolio/user/1/investment-stats
router.get('/user/:userId/investment-stats', portfolioController.getInvestmentStats);

module.exports = router;
