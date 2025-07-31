// 分析服务实现
class AnalyticsService {
  // Daily settlement: write current portfolio snapshot to portfolio_history
  async dailySettle(userId) {
    try {
      const db = require('../database/database');
      // 查找用户投资组合
      const [portfolio] = await db.execute('SELECT * FROM portfolios WHERE user_id = ?', [userId]);
      if (!portfolio) return { success: false, error: 'Portfolio not found' };
      // 查找所有持仓
      const positions = await db.execute('SELECT * FROM positions WHERE portfolio_id = ?', [portfolio.id]);
      // 计算未实现收益并格式化为两位小数，防止 NaN
      let unrealizedGain = 0;
      if (Array.isArray(positions) && positions.length > 0) {
        unrealizedGain = positions.reduce((sum, p) => sum + (Number(p.unrealized_gain) || 0), 0);
      }
      const unrealizedGainFormatted = Number.isFinite(unrealizedGain) ? Number(unrealizedGain).toFixed(2) : '0.00';
      // 获取今天日期
      const today = new Date();
      const dateStr = today.toISOString().slice(0, 10);
      // 插入或更新 portfolio_history
      await db.execute(
        `INSERT INTO portfolio_history (portfolio_id, date, total_value, cash_balance, unrealized_gain)
         VALUES (?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE total_value = VALUES(total_value), cash_balance = VALUES(cash_balance), unrealized_gain = VALUES(unrealized_gain)`,
        [portfolio.id, dateStr, portfolio.total_value, portfolio.cash_balance, unrealizedGainFormatted]
      );
      return { success: true, message: 'Daily settlement completed', date: dateStr };
    } catch (error) {
      console.error('Error in dailySettle:', error);
      return { success: false, error: error.message };
    }
  }
  async getPortfolioAnalytics(userId, params) {
    try {
      const db = require('../database/database');
      // 获取该用户所有投资组合ID
      const portfolioRows = await db.execute('SELECT id FROM portfolios WHERE user_id = ?', [userId]);
      const portfolioIds = portfolioRows.map(row => row.id);
      if (portfolioIds.length === 0) {
        return {
          totalValue: 0,
          totalReturn: 0,
          returnPercentage: 0,
          assetDistribution: [],
          topPerformers: [],
          worstPerformers: [],
          dailyReturns: []
        };
      }
      // 支持自定义时间区间分析
      let startDate = params.startDate;
      let endDate = params.endDate;
      let symbol = params.symbol;
      // 总资产：positions表所有持仓市值之和
      const totalValueResult = await db.execute(`SELECT SUM(shares * avg_cost) AS totalValue FROM positions WHERE portfolio_id IN (${portfolioIds.join(',')})`);
      // 总收益：portfolios表的total_return之和
      const totalReturnResult = await db.execute(`SELECT SUM(total_return) AS totalReturn FROM portfolios WHERE id IN (${portfolioIds.join(',')})`);
      // 收益率：portfolios表的平均total_return_percent
      const returnPercentageResult = await db.execute(`SELECT AVG(total_return_percent) AS returnPercentage FROM portfolios WHERE id IN (${portfolioIds.join(',')})`);
      // 资产分布：positions表各symbol市值占比并计算percent
      const assetRows = await db.execute(`SELECT symbol, SUM(shares * avg_cost) AS value FROM positions WHERE portfolio_id IN (${portfolioIds.join(',')}) GROUP BY symbol`);
      const totalAssets = assetRows.reduce((sum, r) => sum + Number(r.value) || 0, 0);
      const assetDistributionResult = assetRows.map(r => ({
        ...r,
        value: Number(r.value) || 0,
        percent: totalAssets ? ((Number(r.value) || 0) / totalAssets * 100).toFixed(2) : 0
      }));

      // 表现最好/最差：按涨跌幅（当前价与成本价的百分比变化）排序
      const positionRows = await db.execute(`SELECT symbol, avg_cost, current_price FROM positions WHERE portfolio_id IN (${portfolioIds.join(',')})`);
      const perfArr = positionRows.map(p => {
        const avgCost = Number(p.avg_cost) || 0;
        const currentPrice = Number(p.current_price) || 0;
        const percentChange = avgCost > 0 ? ((currentPrice - avgCost) / avgCost * 100).toFixed(2) : 0;
        return {
          symbol: p.symbol,
          change: Number(percentChange)
        };
      });
      const topPerformersResult = [...perfArr]
        .sort((a, b) => b.change - a.change)
        .slice(0, 3);
      const worstPerformersResult = [...perfArr]
        .sort((a, b) => a.change - b.change)
        .slice(0, 3);
      // 每日资产变化：用 portfolios 表的最新数据去更新 portfolio_history，再从 portfolio_history 表查询每日资产变化
      // 1. portfolios 表的 total_value/cash_balance 已在每次交易后同步写入 portfolio_history
      // 2. 查询 portfolio_history 表，支持区间
      let dailySql = `SELECT date, total_value, cash_balance FROM portfolio_history WHERE portfolio_id IN (${portfolioIds.join(',')})`;
      let dailyParams = [];
      if (startDate && endDate && typeof startDate === 'string' && typeof endDate === 'string') {
        dailySql += ' AND date >= ? AND date <= ?';
        dailyParams.push(startDate, endDate);
      }
      dailySql += ' ORDER BY date';
      const dailyReturnsResult = await db.execute(dailySql, dailyParams);
      // 单只股票详细分析
      let stockDetail = null;
      if (symbol) {
        const stockRows = await db.execute(`SELECT * FROM positions WHERE portfolio_id IN (${portfolioIds.join(',')}) AND symbol = ?`, [symbol]);
        const priceHistory = await db.execute(`SELECT date, close_price FROM stock_history WHERE symbol = ? ORDER BY date`, [symbol]);
        stockDetail = { position: stockRows[0] || null, priceHistory };
      }

      return {
        totalValue: totalValueResult[0]?.totalValue || 0,
        totalReturn: totalReturnResult[0]?.totalReturn || 0,
        returnPercentage: returnPercentageResult[0]?.returnPercentage || 0,
        assetDistribution: assetDistributionResult,
        topPerformers: topPerformersResult,
        worstPerformers: worstPerformersResult,
        dailyReturns: dailyReturnsResult,
        stockDetail
      };
    } catch (err) {
      return {
        totalValue: '--',
        totalReturn: '--',
        returnPercentage: '--',
        assetDistribution: '--',
        topPerformers: '--',
        worstPerformers: '--',
        dailyReturns: '--',
        error: 'Failed to fetch analytics',
        details: err.message
      };
    }
  }
  async getPerformanceSummary(userId) {
    try {
      const db = require('../database/database');
      const portfolioRows = await db.execute('SELECT id FROM portfolios WHERE user_id = ?', [userId]);
      if (!portfolioRows.length) {
        return { success: true, data: null, message: 'No portfolio found for user' };
      }
      const portfolioId = portfolioRows[0].id;
      // 总收益和收益率
      const perfRows = await db.execute('SELECT total_return, total_return_percent FROM portfolios WHERE id = ?', [portfolioId]);
      const totalReturn = perfRows[0]?.total_return || 0;
      const totalReturnPercent = perfRows[0]?.total_return_percent || 0;
      // 今日收益（假设 portfolio_history 有每日记录）
      const today = new Date().toISOString().slice(0, 10);
      const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
      const todayRow = await db.execute('SELECT total_value FROM portfolio_history WHERE portfolio_id = ? AND date = ?', [portfolioId, today]);
      const yesterdayRow = await db.execute('SELECT total_value FROM portfolio_history WHERE portfolio_id = ? AND date = ?', [portfolioId, yesterday]);
      const dailyReturn = (todayRow[0]?.total_value || 0) - (yesterdayRow[0]?.total_value || 0);
      const dailyReturnPercent = (yesterdayRow[0]?.total_value ? dailyReturn / yesterdayRow[0].total_value * 100 : 0);
      // 总交易次数
      const tradesRow = await db.execute('SELECT COUNT(*) AS totalTrades FROM transactions WHERE portfolio_id = ?', [portfolioId]);
      const totalTrades = tradesRow[0]?.totalTrades || 0;
      // 胜率（买卖盈利次数/总交易次数，简化版）
      const winRow = await db.execute("SELECT COUNT(*) AS winCount FROM transactions WHERE portfolio_id = ? AND type = 'SELL' AND price > (SELECT avg_cost FROM positions WHERE positions.portfolio_id = transactions.portfolio_id AND positions.symbol = transactions.symbol)", [portfolioId]);
      const winRate = totalTrades ? (winRow[0].winCount / totalTrades * 100) : 0;
      // 最大回撤、夏普比率（占位，后续可补充复杂计算）
      const maxDrawdown = 0;
      const sharpeRatio = 0;
      const summary = {
        totalReturn,
        totalReturnPercent,
        dailyReturn,
        dailyReturnPercent,
        maxDrawdown,
        sharpeRatio,
        winRate,
        totalTrades
      };
      return { success: true, data: summary, message: 'Performance summary retrieved successfully' };
    } catch (error) {
      console.error('Error getting performance summary:', error);
      return { success: false, error: error.message };
    }
  }
  async getPortfolioValueHistory(userId, startDate, endDate) {
    try {
      const db = require('../database/database');
      const portfolioRows = await db.execute('SELECT id FROM portfolios WHERE user_id = ?', [userId]);
      if (!portfolioRows.length) {
        return { success: true, data: [], message: 'No portfolio found for user' };
      }
      const portfolioId = portfolioRows[0].id;
      let sql = 'SELECT date, total_value, cash_balance, unrealized_gain FROM portfolio_history WHERE portfolio_id = ?';
      let params = [portfolioId];
      if (startDate && endDate) {
        sql += ' AND date BETWEEN ? AND ?';
        params.push(startDate, endDate);
      }
      sql += ' ORDER BY date';
      const history = await db.execute(sql, params);
      return { success: true, data: history, message: 'Portfolio value history retrieved successfully' };
    } catch (error) {
      console.error('Error getting portfolio value history:', error);
      return { success: false, error: error.message };
    }
  }
  async getBenchmarkComparison(userId, benchmark = 'SPY') {
    try {
      const db = require('../database/database');
      const portfolioRows = await db.execute('SELECT id FROM portfolios WHERE user_id = ?', [userId]);
      if (!portfolioRows.length) {
        return { success: true, data: null, message: 'No portfolio found for user' };
      }
      const portfolioId = portfolioRows[0].id;
      // 获取投资组合总收益率
      const perfRows = await db.execute('SELECT total_return_percent FROM portfolios WHERE id = ?', [portfolioId]);
      const portfolioReturn = perfRows[0]?.total_return_percent || 0;
      // 获取基准收益率（假设 stocks 表有 change_percent 字段，实际可根据需求调整）
      const benchRows = await db.execute('SELECT change_percent FROM stocks WHERE symbol = ?', [benchmark]);
      const benchmarkReturn = benchRows[0]?.change_percent || 0;
      // 计算相对表现
      const relativePerformance = portfolioReturn - benchmarkReturn;
      return {
        success: true,
        data: {
          portfolioReturn,
          benchmarkReturn,
          relativePerformance
        },
        message: 'Benchmark comparison retrieved successfully'
      };
    } catch (error) {
      console.error('Error getting benchmark comparison:', error);
      return { success: false, error: error.message };
    }
  }
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
