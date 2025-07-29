const express = require('express');
const newsController = require('../controllers/newsController');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// 获取股票相关新闻 - 需要认证以获取用户的simulation_date
router.get('/stock/:symbol', authMiddleware.authenticateToken, newsController.getStockNews);

// 获取市场新闻
router.get('/market', newsController.getMarketNews);

module.exports = router;
