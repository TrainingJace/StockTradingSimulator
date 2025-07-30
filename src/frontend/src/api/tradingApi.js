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
      return response;
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

  // 获取特定股票的交易历史（用于图表显示）
  async getStockTransactionHistory(symbol, params = {}) {
    try {
      const { limit = 100, offset = 0 } = params;
      const response = await apiClient.get(`/trading/history/${symbol}`, {
        params: { limit, offset }
      });
      return response;
    } catch (error) {
      console.error('Failed to fetch stock transaction history:', error);
      return {
        success: false,
        error: error.response?.data?.error || error.message
      };
    }
  }

  // 获取股票的图表数据（价格历史 + 交易历史）
  async getStockChartData(symbol, days = 90, avgCost = null) {
    try {
      // 计算开始和结束日期
      const endDate = new Date();
     const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);
      // 并行获取股票历史价格和交易历史
      const [priceHistoryResponse, transactionHistoryResponse] = await Promise.all([
        apiClient.get(`/stocks/${symbol}/history`, {
          startDate: startDate.toISOString().split('T')[0],
          endDate: endDate.toISOString().split('T')[0]
        }),
        this.getStockTransactionHistory(symbol)
      ]);

      if (!priceHistoryResponse.success || !transactionHistoryResponse.success) {
        throw new Error('Failed to fetch chart data');
      }

      // 组合数据
      const priceHistory = priceHistoryResponse.data || [];
      const transactions = transactionHistoryResponse.data || [];
      // 创建交易映射（按日期）
      const transactionMap = new Map();
      transactions.forEach(transaction => {
        const date = transaction.date.split(' ')[0];
        if (!transactionMap.has(date)) {
          transactionMap.set(date, []);
        }
        transactionMap.get(date).push(transaction);
      });

      // 组合价格历史和交易数据
      const chartData = priceHistory.map(priceData => {
        const date = priceData.date;
        const dayTransactions = transactionMap.get(date) || [];
        
        // 如果当天有多个交易，选择最后一个（或者可以根据需要调整逻辑）
        const lastTransaction = dayTransactions.length > 0 ? dayTransactions[dayTransactions.length - 1] : null;
        
        const result =  {
          date: new Date(date).getTime(), // 时间戳格式 
          price: parseFloat(priceData.close),
          avgCost: avgCost || parseFloat(priceData.avg_cost) || 0,
          action: lastTransaction ? lastTransaction.action : null,
          shares: lastTransaction ? lastTransaction.shares : null
        };

        console .log(`Chart data for ${symbol} on ${date}:`, result);

        return result;
      });

      return {
        success: true,
        data: chartData
      };
    } catch (error) {
      console.error('Failed to fetch stock chart data:', error);
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
