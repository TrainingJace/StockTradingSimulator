// 投资组合服务
class PortfolioService {
  constructor() {
    // 初始化数据库连接
    this.db = require('../database/database');
    this.authService = require('./authService');
  }

  async getPortfolioByUserId(userId) {
    console.log(`Getting portfolio for user: ${userId}`);
    try {
      // 获取投资组合基本信息
      const portfolioQuery = 'SELECT * FROM portfolios WHERE user_id = ?';
      const portfolio = await this.db.execute(portfolioQuery, [userId]);
      
      if (!portfolio || portfolio.length === 0) {
        return null;
      }

      const portfolioData = portfolio[0];

      // 获取持仓信息
      const positionsQuery = 'SELECT * FROM positions WHERE portfolio_id = ?';
      const positions = await this.db.execute(positionsQuery, [portfolioData.id]);

      console.log(`Found ${positions.length} positions for portfolio ${portfolioData.id}`);
      if (positions.length > 0) {
        console.log('Positions:', positions.map(p => `${p.symbol}: ${p.shares} shares`));
      }

      // 如果有持仓，更新当前价格和价值
      if (positions && positions.length > 0) {
        const stockService = require('./stockService');
        
        // 获取所有持仓股票的符号
        const symbols = positions.map(pos => pos.symbol);
        
        const simulationDate = await this.authService.getSimulationDate(userId);
        // 获取当前股票价格
        const stockPrices = {};
        for (const symbol of symbols) {
          const stockData = await stockService.getStockPrice(symbol, simulationDate);
          if (stockData) {
            stockPrices[symbol] = stockData.price;
            console.log(`price for ${symbol} on ${simulationDate}: ${stockData.price}`);
          }
        }
        
        // 更新持仓价格和价值
        if (Object.keys(stockPrices).length > 0) {
          await this.updatePositionPrices(userId, stockPrices);
          
          // 重新获取更新后的持仓信息
          const updatedPositions = await this.db.execute(positionsQuery, [portfolioData.id]);
          return {
            ...portfolioData,
            positions: updatedPositions || []
          };
        }
      }

      return {
        ...portfolioData,
        positions: positions || []
      };
    } catch (error) {
      console.error('Error getting portfolio:', error);
      throw error;
    }
  }

  async createPortfolio(userId, initialBalance = 500000) {
    console.log(`Creating portfolio for user ${userId} with balance ${initialBalance}`);
    try {
      const insertQuery = `
        INSERT INTO portfolios (user_id, initial_balance, cash_balance, total_value, created_at, updated_at) 
        VALUES (?, ?, ?, ?, NOW(), NOW())
      `;
      
      const result = await this.db.execute(insertQuery, [userId, initialBalance, initialBalance, initialBalance]);
      
      // 返回创建的投资组合
      const portfolioQuery = 'SELECT * FROM portfolios WHERE id = ?';
      const portfolio = await this.db.execute(portfolioQuery, [result.insertId]);
      
      return {
        ...portfolio[0],
        positions: []
      };
    } catch (error) {
      console.error('Error creating portfolio:', error);
      throw error;
    }
  }

  // 更新投资组合总价值（在交易后调用）
  async updatePortfolioTotalValue(userId) {
    console.log(`Updating portfolio total value for user ${userId}`);
    try {
      const portfolioRows = await this.db.execute(
        'SELECT * FROM portfolios WHERE user_id = ?',
        [userId]
      );

      if (portfolioRows.length === 0) {
        throw new Error('Portfolio not found');
      }

      const portfolio = portfolioRows[0];
      
      if (!portfolio || !portfolio.id) {
        throw new Error('Invalid portfolio data - missing id');
      }

      // 获取所有持仓的当前价值
      const positionRows = await this.db.execute(
        'SELECT SUM(current_value) as total_positions_value FROM positions WHERE portfolio_id = ?',
        [portfolio.id]
      );

      const totalPositionsValue = parseFloat(positionRows[0]?.total_positions_value) || 0;
      const cashBalance = parseFloat(portfolio.cash_balance) || 0;
      const initialBalance = parseFloat(portfolio.initial_balance) || 0;
      const newTotalValue = cashBalance + totalPositionsValue;

      // 计算总收益
      const totalReturn = newTotalValue - initialBalance;
      const totalReturnPercent = initialBalance > 0 ? ((newTotalValue - initialBalance) / initialBalance) * 100 : 0;

      // 获取用户的模拟日期
      const simulationDate = await this.authService.getSimulationDate(userId);

      // 更新投资组合
      await this.db.execute(
        `UPDATE portfolios 
         SET total_value = ?, total_return = ?, total_return_percent = ?, updated_at = ?
         WHERE id = ?`,
        [newTotalValue, totalReturn, totalReturnPercent, simulationDate, portfolio.id]
      );

      return {
        totalValue: newTotalValue,
        totalReturn,
        totalReturnPercent
      };
    } catch (error) {
      console.error('Error updating portfolio total value:', error);
      throw error;
    }
  }

  // 更新所有持仓的当前价格和价值
  async updatePositionPrices(userId, stockPrices) {
    console.log(`Updating position prices for user ${userId}`);
    try {
      const portfolioRows = await this.db.execute(
        'SELECT * FROM portfolios WHERE user_id = ?',
        [userId]
      );

      if (portfolioRows.length === 0) {
        throw new Error('Portfolio not found');
      }

      const portfolio = portfolioRows[0];

      // 获取所有持仓
      const positions = await this.db.execute(
        'SELECT * FROM positions WHERE portfolio_id = ?',
        [portfolio.id]
      );

      // 获取用户的模拟日期
      const simulationDate = await this.authService.getSimulationDate(userId);

      // 更新每个持仓的价格
      for (const position of positions) {
        const currentPrice = stockPrices[position.symbol];
        if (currentPrice) {
          const currentValue = position.shares * currentPrice;
          const unrealizedGain = currentValue - position.total_cost;
          const unrealizedGainPercent = (unrealizedGain / position.total_cost) * 100;

          await this.db.execute(
            `UPDATE positions 
             SET current_price = ?, current_value = ?, unrealized_gain = ?, unrealized_gain_percent = ?, updated_at = ?
             WHERE id = ?`,
            [currentPrice, currentValue, unrealizedGain, unrealizedGainPercent, simulationDate, position.id]
          );
        }
      }

      // 更新投资组合总价值
      await this.updatePortfolioTotalValue(userId);

      return { success: true };
    } catch (error) {
      console.error('Error updating position prices:', error);
      throw error;
    }
  }

  async recalculatePortfolio(userId) {
    console.log(`Recalculating portfolio for user ${userId}`);
    try {
      const portfolio = await this.getPortfolioByUserId(userId);
      if (!portfolio) {
        throw new Error('Portfolio not found');
      }

      // 计算总收益和收益率
      const totalReturn = portfolio.total_value - portfolio.initial_balance;
      const totalReturnPercent = ((portfolio.total_value - portfolio.initial_balance) / portfolio.initial_balance) * 100;

      // 更新投资组合
      const updateQuery = `
        UPDATE portfolios 
        SET total_return = ?, total_return_percent = ?, updated_at = NOW()
        WHERE user_id = ?
      `;
      
      await this.db.execute(updateQuery, [totalReturn, totalReturnPercent, userId]);

      return { 
        success: true, 
        totalReturn,
        totalReturnPercent,
        message: '投资组合计算完成' 
      };
    } catch (error) {
      console.error('Error recalculating portfolio:', error);
      throw error;
    }
  }

  // 获取用户的投资收益统计
  async getPortfolioStats(userId) {
    console.log(`Getting portfolio stats for user ${userId}`);
    try {
      const portfolio = await this.getPortfolioByUserId(userId);
      if (!portfolio) {
        return null;
      }

      const totalReturn = portfolio.total_value - portfolio.initial_balance;
      const totalReturnPercent = ((portfolio.total_value - portfolio.initial_balance) / portfolio.initial_balance) * 100;

      return {
        initialBalance: portfolio.initial_balance,
        currentValue: portfolio.total_value,
        cashBalance: portfolio.cash_balance,
        totalReturn,
        totalReturnPercent,
        investedAmount: portfolio.initial_balance - portfolio.cash_balance,
        portfolioAge: this.calculateDaysSince(portfolio.created_at)
      };
    } catch (error) {
      console.error('Error getting portfolio stats:', error);
      throw error;
    }
  }

  // 计算天数差
  calculateDaysSince(dateString) {
    const startDate = new Date(dateString);
    const currentDate = new Date();
    const timeDiff = currentDate.getTime() - startDate.getTime();
    return Math.floor(timeDiff / (1000 * 3600 * 24));
  }
}

module.exports = new PortfolioService();
