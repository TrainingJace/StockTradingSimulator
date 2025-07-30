const express = require('express');
const tradingController = require('../controllers/tradingController');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// 所有交易路由都需要认证
router.use(authenticateToken);

// 执行买入订单
router.post('/buy', tradingController.executeBuyOrder);

// 执行卖出订单
router.post('/sell', tradingController.executeSellOrder);

// 获取交易历史
router.get('/history', tradingController.getTransactionHistory);

// 获取特定股票的交易历史
router.get('/history/:symbol', tradingController.getStockTransactionHistory);

module.exports = router;
