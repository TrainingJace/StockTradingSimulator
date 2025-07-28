const db = require('../database/database');

// Get portfolio analytics
exports.getPortfolioAnalytics = async (req, res) => {
  try {
    // Example: Query total assets, returns, asset distribution, top/worst performers
    // You should adjust table/column names to match your schema
    const totalValueResult = await db.query('SELECT SUM(value) AS totalValue FROM portfolio');
    const totalReturnResult = await db.query('SELECT SUM(return) AS totalReturn FROM portfolio');
    const returnPercentageResult = await db.query('SELECT SUM(return)/SUM(value)*100 AS returnPercentage FROM portfolio');
    const assetDistributionResult = await db.query('SELECT symbol, SUM(value) * 100.0 / (SELECT SUM(value) FROM portfolio) AS percent FROM portfolio GROUP BY symbol');
    const topPerformersResult = await db.query('SELECT symbol, return AS change FROM portfolio ORDER BY return DESC LIMIT 3');
    const worstPerformersResult = await db.query('SELECT symbol, return AS change FROM portfolio ORDER BY return ASC LIMIT 3');
    const dailyReturnsResult = await db.query('SELECT date, SUM(value) AS value FROM portfolio_history GROUP BY date ORDER BY date');

    res.json({
      totalValue: totalValueResult[0]?.totalValue || 0,
      totalReturn: totalReturnResult[0]?.totalReturn || 0,
      returnPercentage: returnPercentageResult[0]?.returnPercentage || 0,
      assetDistribution: assetDistributionResult,
      topPerformers: topPerformersResult,
      worstPerformers: worstPerformersResult,
      dailyReturns: dailyReturnsResult
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch analytics', details: err.message });
  }
};

const { analyticsService } = require('../services');

// 获取投资组合表现摘要
exports.getPerformanceSummary = async (req, res) => {
  try {
    const userId = req.user.userId;
    // 获取用户投资组合ID
    const portfolioRows = await db.query('SELECT id FROM portfolios WHERE user_id = ?', [userId]);
    if (!portfolioRows.length) {
      return res.json({ success: true, data: null, message: 'No portfolio found for user' });
    }
    const portfolioId = portfolioRows[0].id;

    // 总收益和收益率
    const perfRows = await db.query('SELECT total_return, total_return_percent FROM portfolios WHERE id = ?', [portfolioId]);
    const totalReturn = perfRows[0]?.total_return || 0;
    const totalReturnPercent = perfRows[0]?.total_return_percent || 0;

    // 今日收益（假设 portfolio_history 有每日记录）
    const today = new Date().toISOString().slice(0, 10);
    const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
    const todayRow = await db.query('SELECT total_value FROM portfolio_history WHERE portfolio_id = ? AND date = ?', [portfolioId, today]);
    const yesterdayRow = await db.query('SELECT total_value FROM portfolio_history WHERE portfolio_id = ? AND date = ?', [portfolioId, yesterday]);
    const dailyReturn = (todayRow[0]?.total_value || 0) - (yesterdayRow[0]?.total_value || 0);
    const dailyReturnPercent = (yesterdayRow[0]?.total_value ? dailyReturn / yesterdayRow[0].total_value * 100 : 0);

    // 总交易次数
    const tradesRow = await db.query('SELECT COUNT(*) AS totalTrades FROM transactions WHERE portfolio_id = ?', [portfolioId]);
    const totalTrades = tradesRow[0]?.totalTrades || 0;

    // 胜率（买卖盈利次数/总交易次数，简化版）
    const winRow = await db.query("SELECT COUNT(*) AS winCount FROM transactions WHERE portfolio_id = ? AND type = 'SELL' AND price > (SELECT avg_cost FROM positions WHERE positions.portfolio_id = transactions.portfolio_id AND positions.symbol = transactions.symbol)", [portfolioId]);
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
    res.json({
      success: true,
      data: summary,
      message: 'Performance summary retrieved successfully'
    });
  } catch (error) {
    console.error('Error getting performance summary:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// 获取投资组合价值历史
exports.getPortfolioValueHistory = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { startDate, endDate } = req.query;
    // 获取用户投资组合ID
    const portfolioRows = await db.query('SELECT id FROM portfolios WHERE user_id = ?', [userId]);
    if (!portfolioRows.length) {
      return res.json({ success: true, data: [], message: 'No portfolio found for user' });
    }
    const portfolioId = portfolioRows[0].id;
    // 查询历史数据
    let sql = 'SELECT date, total_value, cash_balance, unrealized_gain FROM portfolio_history WHERE portfolio_id = ?';
    let params = [portfolioId];
    if (startDate && endDate) {
      sql += ' AND date BETWEEN ? AND ?';
      params.push(startDate, endDate);
    }
    sql += ' ORDER BY date';
    const history = await db.query(sql, params);
    res.json({
      success: true,
      data: history,
      message: 'Portfolio value history retrieved successfully'
    });
  } catch (error) {
    console.error('Error getting portfolio value history:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// 与基准指数比较
exports.getBenchmarkComparison = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { benchmark = 'SPY' } = req.query;
    // 获取用户投资组合ID
    const portfolioRows = await db.query('SELECT id FROM portfolios WHERE user_id = ?', [userId]);
    if (!portfolioRows.length) {
      return res.json({ success: true, data: null, message: 'No portfolio found for user' });
    }
    const portfolioId = portfolioRows[0].id;
    // 获取投资组合总收益率
    const perfRows = await db.query('SELECT total_return_percent FROM portfolios WHERE id = ?', [portfolioId]);
    const portfolioReturn = perfRows[0]?.total_return_percent || 0;
    // 获取基准收益率（假设 stocks 表有 change_percent 字段，实际可根据需求调整）
    const benchRows = await db.query('SELECT change_percent FROM stocks WHERE symbol = ?', [benchmark]);
    const benchmarkReturn = benchRows[0]?.change_percent || 0;
    // 计算相对表现
    const relativePerformance = portfolioReturn - benchmarkReturn;
    res.json({
      success: true,
      data: {
        portfolioReturn,
        benchmarkReturn,
        relativePerformance
      },
      message: 'Benchmark comparison retrieved successfully'
    });
  } catch (error) {
    console.error('Error getting benchmark comparison:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};
