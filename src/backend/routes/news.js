const express = require('express');
const newsController = require('../controllers/newsController');

const router = express.Router();

// 获取股票相关新闻
router.get('/stock/:symbol', newsController.getStockNews);

// 获取市场新闻
router.get('/market', newsController.getMarketNews);

module.exports = router;
