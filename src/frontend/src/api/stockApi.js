// 股票相关 API

import apiClient from './client.js';

export const stockApi = {
  // 获取多个股票信息（默认获取所有股票）
  async getStocks(symbols = []) {
    if (symbols.length === 0) {
      // 如果没有指定股票，获取所有股票
      const response = await apiClient.get('/stocks');
      return response; // 返回完整响应，包含 success 和 data 字段
    } else {
      // 如果指定了股票，获取指定的股票
      const symbolsString = symbols.join(',');
      const response = await apiClient.get('/stocks', { symbols: symbolsString });
      return response; // 返回完整响应，包含 success 和 data 字段
    }
  },

  // 获取单个股票信息
  async getStock(symbol) {
    const response = await apiClient.get(`/stocks/${symbol}`);
    return response; // 返回完整响应
  },

  // 获取多个股票信息
  async getMultipleStocks(symbols) {
    const symbolsString = symbols.join(',');
    const response = await apiClient.get('/stocks', { symbols: symbolsString });
    return response; // 返回完整响应
  },

  // 获取股票历史数据
  async getHistoricalData(symbol, startDate, endDate) {
    const response = await apiClient.get(`/stocks/${symbol}/history`, {
      startDate,
      endDate
    });
    return response; // 返回完整响应
  },

  // 搜索股票
  async searchStocks(query) {
    const response = await apiClient.get('/stocks/search', { q: query });
    return response; // 返回完整响应
  },

  // 获取市场状态
  async getMarketStatus() {
    const response = await apiClient.get('/stocks/market/status');
    return response; // 返回完整响应
  },

  // 获取涨跌幅排行
  async getTopMovers() {
    const response = await apiClient.get('/stocks/market/movers');
    return response; // 返回完整响应
  },

  // 订阅股票实时更新
  async subscribeToStock(symbol) {
    const response = await apiClient.post(`/stocks/${symbol}/subscribe`);
    return response; // 返回完整响应
  }
};
