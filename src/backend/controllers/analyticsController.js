const { analyticsService } = require('../services');



exports.dailySettle = async (req, res) => {
  try {
    const userId = req.user?.userId || req.user?.id;
    if (!userId) return res.status(401).json({ error: 'User not authenticated', user: req.user });
    const result = await analyticsService.dailySettle(userId);
    res.json(result);
  } catch (error) {
    console.error('Error in dailySettle:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};


exports.getPortfolioAnalytics = async (req, res) => {
  try {
    const userId = req.user.userId;
    const params = { ...req.query, ...req.body };
    const result = await analyticsService.getPortfolioAnalytics(userId, params);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};




exports.getPerformanceSummary = async (req, res) => {
  try {
    const userId = req.user.userId;
    const result = await analyticsService.getPerformanceSummary(userId);
    res.json(result);
  } catch (error) {
    console.error('Error getting performance summary:', error);
    res.status(500).json({ error: error.message });
  }
};


exports.getPortfolioValueHistory = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { startDate, endDate } = req.query;
    const result = await analyticsService.getPortfolioValueHistory(userId, startDate, endDate);
    res.json(result);
  } catch (error) {
    console.error('Error getting portfolio value history:', error);
    res.status(500).json({ error: error.message });
  }
};


exports.getBenchmarkComparison = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { benchmark = 'SPY' } = req.query;
    const result = await analyticsService.getBenchmarkComparison(userId, benchmark);
    res.json(result);
  } catch (error) {
    console.error('Error getting benchmark comparison:', error);
    res.status(500).json({ error: error.message });
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
