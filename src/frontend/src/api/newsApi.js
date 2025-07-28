import apiClient from './client.js';

export const newsApi = {
  // 获取特定股票的新闻
  async getStockNews(symbol, options = {}) {
    const { startDate, endDate, limit = 10 } = options;
    const params = new URLSearchParams();
    
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    if (limit) params.append('limit', limit.toString());
    
    const queryString = params.toString();
    const url = `/news/stock/${symbol}${queryString ? `?${queryString}` : ''}`;
    
    const response = await apiClient.get(url);
    return response.data;
  },

  // 获取市场新闻
  async getMarketNews(options = {}) {
    const { startDate, endDate, limit = 20 } = options;
    const params = new URLSearchParams();
    
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    if (limit) params.append('limit', limit.toString());
    
    const queryString = params.toString();
    const url = `/news/market${queryString ? `?${queryString}` : ''}`;
    
    const response = await apiClient.get(url);
    return response.data;
  }
};
