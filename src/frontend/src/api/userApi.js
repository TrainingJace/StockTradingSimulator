// 用户相关 API (已迁移到 authApi.js，此文件保留用于向后兼容)

import apiClient from './client.js';

export const userApi = {
  // 获取用户信息 (新路径: /auth/:userId)
  async getUser(userId) {
    const response = await apiClient.get(`/auth/${userId}`);
    return response;
  },

  // 根据用户名获取用户 (新路径: /auth/username/:username)
  async getUserByUsername(username) {
    const response = await apiClient.get(`/auth/username/${username}`);
    return response;
  },

  // 创建新用户 (已移动到 authApi.register)
  async createUser(userData) {
    console.warn('userApi.createUser is deprecated, use authApi.register instead');
    const response = await apiClient.post('/auth/register', userData);
    return response;
  },

  // 更新用户余额 (新路径: /auth/:userId/balance)
  async updateUserBalance(userId, balance) {
    const response = await apiClient.put(`/auth/${userId}/balance`, { balance });
    return response;
  },

  // 获取所有用户（管理员功能）
  async getAllUsers() {
    const response = await apiClient.get('/users');
    return response; // 返回完整响应
  }
};
