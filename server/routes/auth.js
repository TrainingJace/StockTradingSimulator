const express = require('express');
const authController = require('../controllers/authController');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// 公开路由
router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/verify', authController.verifyToken);

// 需要认证的路由
router.get('/me', authenticateToken, authController.getCurrentUser);
router.put('/current-date', authenticateToken, authController.updateCurrentDate);

module.exports = router;
