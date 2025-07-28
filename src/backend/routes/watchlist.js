const express = require('express');
const watchlistController = require('../controllers/watchlistController');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// 所有观察列表路由都需要认证
router.use(authenticateToken);

// 获取用户观察列表
router.get('/', watchlistController.getUserWatchlist);

// 添加股票到观察列表
router.post('/', watchlistController.addToWatchlist);

// 从观察列表移除股票
router.delete('/:symbol', watchlistController.removeFromWatchlist);

module.exports = router;
