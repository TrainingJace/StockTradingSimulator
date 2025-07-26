// 投资组合相关 API

import apiClient from './client.js';

export const portfolioApi = {
  // 获取用户投资组合
  async getPortfolio(userId) {
    const response = await apiClient.get(`/portfolio/user/${userId}`);
    return response; // 返回完整响应
  },

  // 创建投资组合
  async createPortfolio(userId, initialBalance = 10000) {
    const response = await apiClient.post(`/portfolio/user/${userId}`, {
      initialBalance
    });
    return response; // 返回完整响应
  },

  // 执行交易
  async executeTrade(userId, tradeData) {
    const response = await apiClient.post(`/portfolio/user/${userId}/trade`, tradeData);
    return response; // 返回完整响应
  },

  // 获取交易历史
  async getTransactionHistory(userId, limit = 50) {
    const response = await apiClient.get(`/portfolio/user/${userId}/transactions`, {
      limit
    });
    return response; // 返回完整响应
  },

  // 更新投资组合价值
  async updatePortfolioValues(userId, stockPrices) {
    const response = await apiClient.put(`/portfolio/user/${userId}/values`, {
      stockPrices
    });
    return response; // 返回完整响应
  },

  // 获取投资组合统计数据
  async getPortfolioStats(userId, period = '1M') {
    const response = await apiClient.get(`/portfolio/user/${userId}/stats`, {
      period
    });
    return response; // 返回完整响应
  }
};
