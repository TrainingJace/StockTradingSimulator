const services = require('../services');

class PortfolioController {
  async getPortfolio(req, res) {
    try {
      const { userId } = req.params;
      
      if (!userId) {
        return res.status(400).json({ error: 'User ID is required' });
      }

      const portfolio = await services.portfolioService.getPortfolioByUserId(userId);
      
      if (!portfolio) {
        return res.status(404).json({ error: 'Portfolio not found' });
      }

      res.json({ success: true, data: portfolio });
    } catch (error) {
      console.error('Error in getPortfolio:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async createPortfolio(req, res) {
    try {
      const { userId } = req.params;
      const { initialBalance } = req.body;

      if (!userId) {
        return res.status(400).json({ error: 'User ID is required' });
      }

      // 检查用户是否存在
      const user = await services.userService.getUserById(userId);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      // 检查是否已有投资组合
      const existingPortfolio = await services.portfolioService.getPortfolioByUserId(userId);
      if (existingPortfolio) {
        return res.status(409).json({ error: 'Portfolio already exists for this user' });
      }

      const portfolio = await services.portfolioService.createPortfolio(userId, initialBalance);

      res.status(201).json({ success: true, data: portfolio });
    } catch (error) {
      console.error('Error in createPortfolio:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async executeTrade(req, res) {
    try {
      const { userId } = req.params;
      const { symbol, shares, price, type } = req.body;

      // 验证必需参数
      if (!userId || !symbol || !shares || !price || !type) {
        return res.status(400).json({ 
          error: 'User ID, symbol, shares, price, and type are required' 
        });
      }

      // 验证交易类型
      if (!['BUY', 'SELL'].includes(type.toUpperCase())) {
        return res.status(400).json({ error: 'Invalid trade type. Must be BUY or SELL' });
      }

      // 验证数值
      if (parseInt(shares) <= 0 || parseFloat(price) <= 0) {
        return res.status(400).json({ error: 'Shares and price must be positive numbers' });
      }

      // 检查用户是否存在
      const user = await services.userService.getUserById(userId);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      // 检查投资组合是否存在
      const portfolio = await services.portfolioService.getPortfolioByUserId(userId);
      if (!portfolio) {
        return res.status(404).json({ error: 'Portfolio not found' });
      }

      // 对于卖出交易，检查是否有足够的股票
      if (type.toUpperCase() === 'SELL') {
        const position = portfolio.positions?.find(p => p.symbol === symbol.toUpperCase());
        if (!position || position.shares < parseInt(shares)) {
          return res.status(400).json({ error: 'Insufficient shares to sell' });
        }
      }

      // 对于买入交易，检查是否有足够的资金
      if (type.toUpperCase() === 'BUY') {
        const totalCost = parseInt(shares) * parseFloat(price);
        const availableBalance = user.balance - portfolio.totalCost;
        
        if (availableBalance < totalCost) {
          return res.status(400).json({ error: 'Insufficient funds' });
        }
      }

      const tradeData = { symbol, shares, price, type };
      const transaction = await services.portfolioService.executeTrade(userId, tradeData);

      res.json({ success: true, data: transaction });
    } catch (error) {
      console.error('Error in executeTrade:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async getTransactionHistory(req, res) {
    try {
      const { userId } = req.params;
      const { limit = 50 } = req.query;

      if (!userId) {
        return res.status(400).json({ error: 'User ID is required' });
      }

      const transactions = await services.portfolioService.getTransactionHistory(
        userId, 
        parseInt(limit)
      );

      res.json({ success: true, data: transactions });
    } catch (error) {
      console.error('Error in getTransactionHistory:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async updatePortfolioValues(req, res) {
    try {
      const { userId } = req.params;
      const { stockPrices } = req.body;

      if (!userId) {
        return res.status(400).json({ error: 'User ID is required' });
      }

      if (!stockPrices || typeof stockPrices !== 'object') {
        return res.status(400).json({ error: 'Stock prices object is required' });
      }

      const updatedPortfolio = await services.portfolioService.updatePortfolioValues(
        userId, 
        stockPrices
      );

      if (!updatedPortfolio) {
        return res.status(404).json({ error: 'Portfolio not found' });
      }

      res.json({ success: true, data: updatedPortfolio });
    } catch (error) {
      console.error('Error in updatePortfolioValues:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // 获取投资组合的表现统计
  async getPortfolioStats(req, res) {
    try {
      const { userId } = req.params;
      const { period = '1M' } = req.query; // 1D, 1W, 1M, 3M, 1Y

      const portfolio = await services.portfolioService.getPortfolioByUserId(userId);
      if (!portfolio) {
        return res.status(404).json({ error: 'Portfolio not found' });
      }

      // 这里可以计算各种统计数据
      const stats = {
        totalValue: portfolio.totalValue,
        totalReturn: portfolio.totalReturn,
        totalReturnPercent: portfolio.totalReturnPercent,
        dayChange: 0, // 需要实现日变化计算
        dayChangePercent: 0,
        bestPerformer: portfolio.positions.length > 0 
          ? portfolio.positions.reduce((best, pos) => 
              pos.unrealizedGainPercent > best.unrealizedGainPercent ? pos : best
            ) 
          : null,
        worstPerformer: portfolio.positions.length > 0
          ? portfolio.positions.reduce((worst, pos) =>
              pos.unrealizedGainPercent < worst.unrealizedGainPercent ? pos : worst
            )
          : null,
        diversity: portfolio.positions.length,
        period
      };

      res.json({ success: true, data: stats });
    } catch (error) {
      console.error('Error in getPortfolioStats:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // 获取详细的投资收益统计
  async getInvestmentStats(req, res) {
    try {
      const { userId } = req.params;

      if (!userId) {
        return res.status(400).json({ error: 'User ID is required' });
      }

      const stats = await services.portfolioService.getPortfolioStats(userId);
      
      if (!stats) {
        return res.status(404).json({ error: 'Portfolio not found' });
      }

      res.json({ success: true, data: stats });
    } catch (error) {
      console.error('Error in getInvestmentStats:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}

module.exports = new PortfolioController();
