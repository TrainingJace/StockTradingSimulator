const express = require('express');
const authController = require('../controllers/authController');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// ========== 认证路由 ==========
// 公开路由
router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/verify', authController.verifyToken);

// 需要认证的路由
router.get('/me', authenticateToken, authController.getCurrentUser);
router.put('/current-date', authenticateToken, authController.updateCurrentDate);
router.post('/advance-date', authenticateToken, authController.advanceSimulationDate);

// ========== 用户管理路由 ==========
// 根据用户名获取用户
router.get('/username/:username', authController.getUserByUsername);

// 获取用户信息
router.get('/:userId', authController.getUserById);

// 更新用户余额
router.put('/:userId/balance', authController.updateBalance);

// 删除用户 (管理员功能)  
router.delete('/:userId', authenticateToken, authController.deleteUser);

module.exports = router;
