// Analytics相关API
import apiClient from './client.js';

export const analyticsApi = {
  async getPortfolioAnalytics() {
    return await apiClient.get('/analytics/portfolio');
  },
  async getPerformanceSummary() {
    return await apiClient.get('/analytics/performance');
  },
  async getPortfolioValueHistory(params = {}) {
    return await apiClient.get('/analytics/history', params);
  },
  async getBenchmarkComparison(params = {}) {
    return await apiClient.get('/analytics/benchmark', params);
  },
  async dailySettle() {
    return await apiClient.post('/analytics/daily-settle');
  }
};
