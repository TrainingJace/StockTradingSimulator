import apiClient from './client.js';

class TradingApi {
  // 执行买入订单
  async executeBuyOrder(orderData) {
    try {
      const response = await apiClient.post('/trading/buy', orderData);
      return response;
    } catch (error) {
      console.error('Buy order failed:', error);
      return {
        success: false,
        error: error.response?.data?.error || error.message
      };
    }
  }

  // 执行卖出订单
  async executeSellOrder(orderData) {
    try {
      const response = await apiClient.post('/trading/sell', orderData);
      return response.data;
    } catch (error) {
      console.error('Sell order failed:', error);
      return {
        success: false,
        error: error.response?.data?.error || error.message
      };
    }
  }

  // 获取交易历史
  async getTransactionHistory(params = {}) {
    try {
      const { limit = 50, offset = 0 } = params;
      const response = await apiClient.get('/trading/history', {
        params: { limit, offset }
      });
      return response;
    } catch (error) {
      console.error('Failed to fetch transaction history:', error);
      return {
        success: false,
        error: error.response?.data?.error || error.message
      };
    }
  }

  // 验证订单参数
  validateOrderData(orderData) {
    const { symbol, shares, price } = orderData;

    if (!symbol || typeof symbol !== 'string') {
      return { valid: false, error: '股票代码不能为空' };
    }

    if (!shares || !Number.isInteger(shares) || shares <= 0) {
      return { valid: false, error: '股数必须为正整数' };
    }

    if (!price || typeof price !== 'number' || price <= 0) {
      return { valid: false, error: '价格必须为正数' };
    }

    return { valid: true };
  }
}

export const tradingApi = new TradingApi();
