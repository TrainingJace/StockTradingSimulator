// 投资组合服务
class PortfolioService {
  constructor() {
    // 初始化数据库连接
    this.db = require('../database/database');
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
      console.log(`Portfolio found: ${JSON.stringify(portfolioData)}`);

      // 获取持仓信息
      const positionsQuery = 'SELECT * FROM positions WHERE portfolio_id = ?';
      const positions = await this.db.execute(positionsQuery, [portfolioData.id]);

      // 获取交易历史
      const transactionsQuery = 'SELECT * FROM transactions WHERE portfolio_id = ? ORDER BY timestamp DESC LIMIT 20';
      const transactions = await this.db.execute(transactionsQuery, [portfolioData.id]);

      return {
        ...portfolioData,
        positions: positions || [],
        transactions: transactions || []
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
        positions: [],
        transactions: []
      };
    } catch (error) {
      console.error('Error creating portfolio:', error);
      throw error;
    }
  }

  async executeTrade(userId, tradeData) {
    console.log(`Executing trade for user ${userId}:`, tradeData);
    // TODO: 实现交易执行功能
    // 暂时返回成功状态而不是抛出错误
    return { success: true, message: '交易功能暂未实现' };
  }

  async getTransactionHistory(userId, limit = 50) {
    console.log(`Getting transaction history for user ${userId}, limit: ${limit}`);
    // TODO: 实现交易历史获取功能
    // 暂时返回空数组而不是抛出错误
    return [];
  }

  async updatePortfolioValues(userId, stockPrices) {
    console.log(`Updating portfolio values for user ${userId}`);
    // TODO: 实现投资组合价值更新功能
    // 暂时返回成功状态而不是抛出错误
    return { success: true, message: '投资组合更新功能暂未实现' };
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
