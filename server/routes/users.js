const express = require('express');
const userController = require('../controllers/userController');

const router = express.Router();

// 获取所有用户（管理员功能）- 必须在 /:userId 之前
router.get('/', userController.getAllUsers);

// 根据用户名获取用户 - 必须在 /:userId 之前
router.get('/username/:username', userController.getUserByUsername);

// 创建新用户
router.post('/', userController.createUser);

// 获取用户信息
router.get('/:userId', userController.getUser);

// 更新用户余额
router.put('/:userId/balance', userController.updateUserBalance);

module.exports = router;
