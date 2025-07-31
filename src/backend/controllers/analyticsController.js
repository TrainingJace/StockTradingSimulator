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
