const express = require('express');
const stockController = require('../controllers/stockController');

const router = express.Router();

// 获取多个股票价格
// 使用方式: GET /api/stocks?symbols=AAPL,GOOGL,MSFT
router.get('/', stockController.getMultipleStocks);

// 搜索股票 - 必须在 /:symbol 之前
// 使用方式: GET /api/stocks/search?q=apple
router.get('/search', stockController.searchStocks);

// 获取市场状态 - 必须在 /:symbol 之前
router.get('/market/status', stockController.getMarketStatus);

// 获取涨跌幅排行 - 必须在 /:symbol 之前
router.get('/market/movers', stockController.getTopMovers);

// 获取单个股票价格
router.get('/:symbol', stockController.getStockPrice);

// 获取股票历史数据
// 使用方式: GET /api/stocks/AAPL/history?startDate=2024-01-01&endDate=2024-01-31
router.get('/:symbol/history', stockController.getHistoricalData);

// 订阅股票实时更新（WebSocket相关）
router.post('/:symbol/subscribe', stockController.subscribeToStock);

module.exports = router;
