// Daily settlement: write current portfolio snapshot to portfolio_history
exports.dailySettle = async (req, res) => {
  try {
    console.log('dailySettle req.user:', req.user);
    const userId = req.user?.userId || req.user?.id;
    if (!userId) return res.status(401).json({ error: 'User not authenticated', user: req.user });
    const db = require('../database/database');
    // 查找用户投资组合
    const [portfolio] = await db.execute('SELECT * FROM portfolios WHERE user_id = ?', [userId]);
    if (!portfolio) return res.status(404).json({ error: 'Portfolio not found' });
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
    res.json({ success: true, message: 'Daily settlement completed', date: dateStr });
  } catch (error) {
    console.error('Error in dailySettle:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};
const db = require('../database/database');

// Get portfolio analytics
exports.getPortfolioAnalytics = async (req, res) => {
  try {
    // ...existing code...
    const userId = req.user.userId;
    // 获取该用户所有投资组合ID
    const portfolioRows = await db.execute('SELECT id FROM portfolios WHERE user_id = ?', [userId]);
    const portfolioIds = portfolioRows.map(row => row.id);
    if (portfolioIds.length === 0) {
      return res.json({
        totalValue: 0,
        totalReturn: 0,
        returnPercentage: 0,
        assetDistribution: [],
        topPerformers: [],
        worstPerformers: [],
        dailyReturns: []
      });
    }
    // 支持自定义时间区间分析
    const { startDate, endDate, symbol } = req.query;
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

    // 表现最好/最差
    const topPerformersResult = [...assetRows]
      .sort((a, b) => Number(b.value) - Number(a.value))
      .slice(0, 3)
      .map(r => ({ symbol: r.symbol, change: Number(r.value) || 0 }));

    const worstPerformersResult = [...assetRows]
      .sort((a, b) => Number(a.value) - Number(b.value))
      .slice(0, 3)
      .map(r => ({ symbol: r.symbol, change: Number(r.value) || 0 }));
    // 每日资产变化：portfolio_history表，支持区间
    let dailySql = `SELECT date, total_value FROM portfolio_history WHERE portfolio_id IN (${portfolioIds.join(',')})`;
    let dailyParams = [];
    if (startDate && endDate) {
      dailySql += ' AND date BETWEEN ? AND ?';
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

    res.json({
      totalValue: totalValueResult[0]?.totalValue || 0,
      totalReturn: totalReturnResult[0]?.totalReturn || 0,
      returnPercentage: returnPercentageResult[0]?.returnPercentage || 0,
      assetDistribution: assetDistributionResult,
      topPerformers: topPerformersResult,
      worstPerformers: worstPerformersResult,
      dailyReturns: dailyReturnsResult,
      stockDetail
    });
  } catch (err) {
    res.json({
      totalValue: '--',
      totalReturn: '--',
      returnPercentage: '--',
      assetDistribution: '--',
      topPerformers: '--',
      worstPerformers: '--',
      dailyReturns: '--',
      error: 'Failed to fetch analytics',
      details: err.message
    });
  }
};

const { analyticsService } = require('../services');

// 获取投资组合表现摘要
exports.getPerformanceSummary = async (req, res) => {
  try {
    const userId = req.user.userId;
    // 获取用户投资组合ID
    const portfolioRows = await db.execute('SELECT id FROM portfolios WHERE user_id = ?', [userId]);
    if (!portfolioRows.length) {
      return res.json({ success: true, data: null, message: 'No portfolio found for user' });
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
    const portfolioRows = await db.execute('SELECT id FROM portfolios WHERE user_id = ?', [userId]);
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
    const history = await db.execute(sql, params);
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
    const portfolioRows = await db.execute('SELECT id FROM portfolios WHERE user_id = ?', [userId]);
    if (!portfolioRows.length) {
      return res.json({ success: true, data: null, message: 'No portfolio found for user' });
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

// 计算每支股票的日涨跌幅
const getStockDailyChange = async (positions) => {
  const dailyChanges = await Promise.all(positions.map(async position => {
    // 获取昨天和今天的收盘价
    const todayPrice = position.current_price;
    const yesterdayPrice = position.previous_close; // 需要从数据库或API获取

    // 计算日涨跌幅
    const dailyChangePercent = ((todayPrice - yesterdayPrice) / yesterdayPrice) * 100;
    // 计算日盈亏金额
    const dailyProfitAmount = (todayPrice - yesterdayPrice) * position.quantity;

    return {
      symbol: position.symbol,
      change: Number(dailyChangePercent.toFixed(2)),
      profit: Number(dailyProfitAmount.toFixed(2))
    };
  }));

  // 排序并返回top/worst performers
  const sorted = [...dailyChanges].sort((a, b) => b.change - a.change);
  return {
    topPerformers: sorted.slice(0, 3),
    worstPerformers: sorted.slice(-3).reverse()
  };
};

// 计算当日每只股票的收益及其占比
const calculateDailyPerformers = (positions) => {
  // 计算每只股票的当日收益
  const dailyProfits = positions.map(position => {
    const todayProfit = (position.current_price - position.previous_close) * position.quantity;
    return {
      symbol: position.symbol,
      profit: todayProfit
    };
  });

  // 计算当日总收益
  const totalDailyProfit = dailyProfits.reduce((sum, stock) => sum + stock.profit, 0);

  // 计算每只股票收益占总收益的百分比
  const performersWithPercentage = dailyProfits.map(stock => ({
    symbol: stock.symbol,
    profit: Number(stock.profit.toFixed(2)),
    change: Number(((stock.profit / Math.abs(totalDailyProfit)) * 100).toFixed(2)) // 使用绝对值确保百分比符号正确
  }));

  // 按收益占比排序
  const sorted = [...performersWithPercentage].sort((a, b) => b.change - a.change);

  return {
    topPerformers: sorted.slice(0, 3),
    worstPerformers: sorted.slice(-3).reverse()
  };
};
