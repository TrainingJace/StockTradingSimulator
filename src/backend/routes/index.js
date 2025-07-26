const express = require('express');
const router = express.Router();

// 导入各个路由模块
const stocksRouter = require('./stocks');
const portfolioRouter = require('./portfolio');
const authRouter = require('./auth');

// 注册路由
router.use('/auth', authRouter);  // 包含用户管理功能
router.use('/stocks', stocksRouter);
router.use('/portfolio', portfolioRouter);

// 健康检查端点
router.get('/health', (req, res) => {
  res.json({ 
    success: true, 
    message: 'Stock Trading Simulator API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.MODE || 'test'
  });
});

// API 信息端点
router.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Welcome to Stock Trading Simulator API',
    version: '1.0.0',
    endpoints: {
      users: '/api/users',
      stocks: '/api/stocks', 
      portfolio: '/api/portfolio',
      health: '/api/health'
    },
    documentation: {
      users: {
        'GET /api/users/:userId': 'Get user by ID',
        'GET /api/users/username/:username': 'Get user by username', 
        'POST /api/users': 'Create new user',
        'PUT /api/users/:userId/balance': 'Update user balance',
        'GET /api/users': 'Get all users'
      },
      stocks: {
        'GET /api/stocks/:symbol': 'Get stock price',
        'GET /api/stocks?symbols=AAPL,GOOGL': 'Get multiple stocks',
        'GET /api/stocks/:symbol/history': 'Get historical data',
        'GET /api/stocks/search?q=apple': 'Search stocks',
        'GET /api/stocks/market/status': 'Get market status',
        'GET /api/stocks/market/movers': 'Get top movers'
      },
      portfolio: {
        'GET /api/portfolio/user/:userId': 'Get user portfolio',
        'POST /api/portfolio/user/:userId': 'Create portfolio',
        'POST /api/portfolio/user/:userId/trade': 'Execute trade',
        'GET /api/portfolio/user/:userId/transactions': 'Get transaction history',
        'PUT /api/portfolio/user/:userId/values': 'Update portfolio values',
        'GET /api/portfolio/user/:userId/stats': 'Get portfolio stats'
      }
    }
  });
});

module.exports = router;
