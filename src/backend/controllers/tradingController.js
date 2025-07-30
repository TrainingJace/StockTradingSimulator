const { tradingService } = require('../services');

class TradingController {
  // 执行买入订单
  async executeBuyOrder(req, res) {
    try {
      const userId = req.user.userId;
      const { symbol, shares, price } = req.body;

      // 基本参数验证
      if (!symbol || !shares || !price) {
        return res.status(400).json({
          success: false,
          error: 'Symbol, shares, and price are required'
        });
      }

      if (shares <= 0 || price <= 0) {
        return res.status(400).json({
          success: false,
          error: 'Shares and price must be positive numbers'
        });
      }

      // 执行买入订单
      const result = await tradingService.executeBuyOrder(userId, symbol, shares, price);

      res.json({
        success: true,
        data: result.data,
        message: 'Buy order executed successfully'
      });
    } catch (error) {
      console.error('Error executing buy order:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  // 执行卖出订单
  async executeSellOrder(req, res) {
    try {
      const userId = req.user.userId;
      const { symbol, shares, price } = req.body;

      // 基本参数验证
      if (!symbol || !shares || !price) {
        return res.status(400).json({
          success: false,
          error: 'Symbol, shares, and price are required'
        });
      }

      if (shares <= 0 || price <= 0) {
        return res.status(400).json({
          success: false,
          error: 'Shares and price must be positive numbers'
        });
      }

      // 执行卖出订单
      const result = await tradingService.executeSellOrder(userId, symbol, shares, price);

      res.json({
        success: true,
        data: result.data,
        message: 'Sell order executed successfully'
      });
    } catch (error) {
      console.error('Error executing sell order:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  // 获取交易历史
  async getTransactionHistory(req, res) {
    try {
      const userId = req.user.userId;
      const { limit = 50, offset = 0 } = req.query;

      // 确保参数是有效的数字
      const limitNum = parseInt(limit) || 50;
      const offsetNum = parseInt(offset) || 0;

      // 获取交易历史
      const result = await tradingService.getUserTransactions(userId, limitNum, offsetNum);

      res.json({
        success: true,
        data: result.data,
        message: 'Transaction history retrieved successfully'
      });
    } catch (error) {
      console.error('Error getting transaction history:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  // 获取特定股票的交易历史
  async getStockTransactionHistory(req, res) {
    try {
      const userId = req.user.userId;
      const { symbol } = req.params;
      const { limit = 100, offset = 0 } = req.query;

      // 确保参数是有效的数字
      const limitNum = parseInt(limit) || 100;
      const offsetNum = parseInt(offset) || 0;

      // 获取特定股票的交易历史
      const result = await tradingService.getStockTransactions(userId, symbol, limitNum, offsetNum);

      res.json({
        success: true,
        data: result.data,
        message: 'Stock transaction history retrieved successfully'
      });
    } catch (error) {
      console.error('Error getting stock transaction history:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }
}

module.exports = new TradingController();
