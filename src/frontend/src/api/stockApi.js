// 股票相关 API

import apiClient from './client.js';
// 导入获取认证状态的函数
const getAuthState = () => {
  const storedUser = localStorage.getItem('user');
  try {
    return storedUser ? JSON.parse(storedUser) : null;
  } catch (error) {
    console.error('Error parsing stored user data:', error);
    return null;
  }
};

export const stockApi = {
  // 获取多个股票信息（默认获取所有股票）
  async getStocks(symbols = []) {
    const params = {};
    const user = getAuthState();

    if (symbols.length > 0) {
      params.symbols = symbols.join(',');
    }

    // 自动添加simulation_date参数
    if (user?.simulation_date) {
      params.simulation_date = user.simulation_date;
    }

    const response = await apiClient.get('/stocks', params);
    return response; // 返回完整响应，包含 success 和 data 字段
  },

  // 获取单个股票信息
  async getStock(symbol) {
    const params = {};
    const user = getAuthState();

    // 自动添加simulation_date参数
    if (user?.simulation_date) {
      params.simulation_date = user.simulation_date;
    }

    const response = await apiClient.get(`/stocks/${symbol}`, params);
    return response; // 返回完整响应
  },

  // 获取多个股票信息
  async getMultipleStocks(symbols) {
    const params = {
      symbols: symbols.join(',')
    };
    const user = getAuthState();

    // 自动添加simulation_date参数
    if (user?.simulation_date) {
      params.simulation_date = user.simulation_date;
    }

    const response = await apiClient.get('/stocks', params);
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

  // 使用 Twelve Data API 搜索股票
  async searchStocksBySymbol(symbol) {
    try {
      const apiKey = '7a2f00f6984b4c24a36501313ffd15e0';
      const url = `https://api.twelvedata.com/symbol_search?symbol=${encodeURIComponent(symbol)}&apikey=${apiKey}`;

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.status !== 'ok') {
        throw new Error(data.message || 'Search failed');
      }

      return {
        success: true,
        data: data.data
      };
    } catch (error) {
      console.error('Error searching stocks:', error);
      return {
        success: false,
        error: error.message
      };
    }
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
