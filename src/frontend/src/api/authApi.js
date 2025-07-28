// 认证和用户管理相关 API

import apiClient from './client.js';

export const authApi = {
  // ========== 认证功能 ==========
  
  // 用户注册
  async register(userData) {
    const response = await apiClient.post('/auth/register', userData);
    return response;
  },

  // 用户登录
  async login(credentials) {
    const response = await apiClient.post('/auth/login', credentials);
    return response;
  },

  // 验证Token
  async verifyToken() {
    const response = await apiClient.post('/auth/verify');
    return response;
  },

  // 获取当前用户信息
  async getCurrentUser() {
    const response = await apiClient.get('/auth/me');
    return response;
  },

  // 更新模拟日期
  async updateCurrentDate(newDate) {
    const response = await apiClient.put('/auth/current-date', { newDate });
    return response;
  },

  // 将模拟日期向前推一天
  async advanceSimulationDate() {
    const response = await apiClient.post('/auth/advance-date');
    return response;
  },

  // ========== 用户管理功能 ==========

  // 根据ID获取用户信息
  async getUserById(userId) {
    const response = await apiClient.get(`/auth/${userId}`);
    return response;
  },

  // 根据用户名获取用户
  async getUserByUsername(username) {
    const response = await apiClient.get(`/auth/username/${username}`);
    return response;
  },

  // 更新用户余额
  async updateUserBalance(userId, balance) {
    const response = await apiClient.put(`/auth/${userId}/balance`, { balance });
    return response;
  },

  // 删除用户 (管理员功能)
  async deleteUser(userId) {
    const response = await apiClient.delete(`/auth/${userId}`);
    return response;
  }
};

export default authApi;
