// 分析服务实现
class AnalyticsService {
  constructor() {
    this.db = require('../database/database');
    console.log('AnalyticsService initialized');
  }

  // 计算投资组合总回报率
  async calculateTotalReturn(portfolioId) {
    console.log(`Calculating total return for portfolio ${portfolioId}`);
    try {
      // 获取初始投资金额（假设为所有买入交易总额）
      const buyRows = await this.db.execute('SELECT SUM(total) AS invested FROM transactions WHERE portfolio_id = ? AND type = "BUY"', [portfolioId]);
      const invested = buyRows[0]?.invested || 0;
      // 获取当前投资组合价值
      const valueRows = await this.db.execute('SELECT total_value FROM portfolios WHERE id = ?', [portfolioId]);
      const currentValue = valueRows[0]?.total_value || 0;
      // 计算总回报率和金额
      const totalReturn = currentValue - invested;
      const totalReturnPercent = invested ? (totalReturn / invested * 100) : 0;
      return { invested, currentValue, totalReturn, totalReturnPercent };
    } catch (error) {
      console.error('Error calculating total return:', error);
      throw error;
    }
  }

  // 计算每日回报率
  async calculateDailyReturns(portfolioId, startDate, endDate) {
    console.log(`Calculating daily returns for portfolio ${portfolioId}`);
    try {
      let sql = 'SELECT date, total_value FROM portfolio_history WHERE portfolio_id = ?';
      const params = [portfolioId];
      if (startDate && endDate) {
        sql += ' AND date BETWEEN ? AND ?';
        params.push(startDate, endDate);
      }
      sql += ' ORDER BY date';
      const rows = await this.db.execute(sql, params);
      // 计算每日变化率
      const dailyReturns = rows.map((row, idx, arr) => {
        const prev = idx > 0 ? arr[idx - 1].total_value : row.total_value;
        const change = prev ? ((row.total_value - prev) / prev * 100) : 0;
        return { date: row.date, value: row.total_value, change: change };
      });
      return dailyReturns;
    } catch (error) {
      console.error('Error calculating daily returns:', error);
      throw error;
    }
  }

  // 计算最大回撤
  async calculateMaxDrawdown(portfolioId) {
    console.log(`Calculating max drawdown for portfolio ${portfolioId}`);
    try {
      const rows = await this.db.execute('SELECT date, total_value FROM portfolio_history WHERE portfolio_id = ? ORDER BY date', [portfolioId]);
      let peak = -Infinity;
      let maxDrawdown = 0;
      rows.forEach(row => {
        if (row.total_value > peak) peak = row.total_value;
        const drawdown = peak ? ((peak - row.total_value) / peak * 100) : 0;
        if (drawdown > maxDrawdown) maxDrawdown = drawdown;
      });
      return maxDrawdown;
    } catch (error) {
      console.error('Error calculating max drawdown:', error);
      throw error;
    }
  }

  // 计算夏普比率
  async calculateSharpeRatio(portfolioId, riskFreeRate = 0.02) {
    console.log(`Calculating Sharpe ratio for portfolio ${portfolioId}`);
    try {
      const rows = await this.db.execute('SELECT date, total_value FROM portfolio_history WHERE portfolio_id = ? ORDER BY date', [portfolioId]);
      const returns = [];
      for (let i = 1; i < rows.length; i++) {
        const prev = rows[i - 1].total_value;
        const curr = rows[i].total_value;
        if (prev) returns.push((curr - prev) / prev);
      }
      const avgReturn = returns.length ? returns.reduce((a, b) => a + b, 0) / returns.length : 0;
      const stdDev = returns.length ? Math.sqrt(returns.reduce((a, b) => a + Math.pow(b - avgReturn, 2), 0) / returns.length) : 0;
      const sharpe = stdDev ? ((avgReturn - riskFreeRate / 252) / stdDev) : 0;
      return sharpe;
    } catch (error) {
      console.error('Error calculating Sharpe ratio:', error);
      throw error;
    }
  }

  // 计算交易胜率
  async calculateWinRate(userId) {
    console.log(`Calculating win rate for user ${userId}`);
    try {
      // 获取所有卖出交易
      const sellRows = await this.db.execute('SELECT t.*, p.avg_cost FROM transactions t JOIN positions p ON t.portfolio_id = p.portfolio_id AND t.symbol = p.symbol WHERE t.user_id = ? AND t.type = "SELL"', [userId]);
      const totalTrades = sellRows.length;
      const winTrades = sellRows.filter(row => row.price > row.avg_cost).length;
      const winRate = totalTrades ? (winTrades / totalTrades * 100) : 0;
      return winRate;
    } catch (error) {
      console.error('Error calculating win rate:', error);
      throw error;
    }
  }

  // 与基准指数比较
  async compareToBenchmark(portfolioId, benchmarkSymbol = 'SPY') {
    console.log(`Comparing portfolio ${portfolioId} to benchmark ${benchmarkSymbol}`);
    try {
      // 获取投资组合总收益率
      const perfRows = await this.db.execute('SELECT total_return_percent FROM portfolios WHERE id = ?', [portfolioId]);
      const portfolioReturn = perfRows[0]?.total_return_percent || 0;
      // 获取基准收益率（假设 stocks 表有 change_percent 字段）
      const benchRows = await this.db.execute('SELECT change_percent FROM stocks WHERE symbol = ?', [benchmarkSymbol]);
      const benchmarkReturn = benchRows[0]?.change_percent || 0;
      // 计算相对表现
      const relativePerformance = portfolioReturn - benchmarkReturn;
      return { portfolioReturn, benchmarkReturn, relativePerformance };
    } catch (error) {
      console.error('Error comparing to benchmark:', error);
      throw error;
    }
  }

  // 生成性能摘要报告
  async generatePerformanceSummary(userId) {
    console.log(`Generating performance summary for user ${userId}`);
    try {
      // 获取用户投资组合ID
      const portfolioRows = await this.db.execute('SELECT id FROM portfolios WHERE user_id = ?', [userId]);
      if (!portfolioRows.length) return null;
      const portfolioId = portfolioRows[0].id;
      // 汇总各项指标
      const totalReturnObj = await this.calculateTotalReturn(portfolioId);
      const dailyReturns = await this.calculateDailyReturns(portfolioId);
      const maxDrawdown = await this.calculateMaxDrawdown(portfolioId);
      const sharpeRatio = await this.calculateSharpeRatio(portfolioId);
      const winRate = await this.calculateWinRate(userId);
      const benchmark = await this.compareToBenchmark(portfolioId);
      return {
        ...totalReturnObj,
        dailyReturns,
        maxDrawdown,
        sharpeRatio,
        winRate,
        benchmark
      };
    } catch (error) {
      console.error('Error generating performance summary:', error);
      throw error;
    }
  }
}

module.exports = new AnalyticsService();
