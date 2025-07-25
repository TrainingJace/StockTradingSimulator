// 用户相关 API

import apiClient from './client.js';

export const userApi = {
  // 获取用户信息
  async getUser(userId) {
    const response = await apiClient.get(`/users/${userId}`);
    return response; // 返回完整响应
  },

  // 根据用户名获取用户
  async getUserByUsername(username) {
    const response = await apiClient.get(`/users/username/${username}`);
    return response; // 返回完整响应
  },

  // 创建新用户
  async createUser(userData) {
    const response = await apiClient.post('/users', userData);
    return response; // 返回完整响应
  },

  // 更新用户余额
  async updateUserBalance(userId, balance) {
    const response = await apiClient.put(`/users/${userId}/balance`, { balance });
    return response; // 返回完整响应
  },

  // 获取所有用户（管理员功能）
  async getAllUsers() {
    const response = await apiClient.get('/users');
    return response; // 返回完整响应
  }
};
