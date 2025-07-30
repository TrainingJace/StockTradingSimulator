const express = require('express');
const analyticsController = require('../controllers/analyticsController');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();
// 所有analytics路由都需要鉴权
router.use(authenticateToken);

// Daily settlement API
router.post('/daily-settle', analyticsController.dailySettle);

// Portfolio analytics (for frontend integration)
router.get('/portfolio', analyticsController.getPortfolioAnalytics);

// Performance summary
router.get('/performance', analyticsController.getPerformanceSummary);

// Portfolio value history
router.get('/history', analyticsController.getPortfolioValueHistory);

// Benchmark comparison
router.get('/benchmark', analyticsController.getBenchmarkComparison);

// 新增：分析摘要接口，返回结构化数据给前端 Analysis.jsx
router.get('/summary', async (req, res) => {
  return;
  console.log('Fetching portfolio analytics summary...');
  try {
    // 假设已通过认证中间件拿到 req.user.id
    const userId = req.user.id;
    const db = require('../database/database');

    // 查询投资组合
    const [portfolio] = await db.execute('SELECT * FROM portfolios WHERE user_id = ?', [userId]);
    if (!portfolio) return res.status(404).json({ error: 'Portfolio not found' });

    // 查询每日收益（近4天）
    const dailyReturns = await db.execute('SELECT date, total_value as value FROM portfolio_history WHERE portfolio_id = ? ORDER BY date DESC LIMIT 4', [portfolio.id]);
    dailyReturns.reverse(); // 按时间升序

    // 查询持仓
    const [positions] = await db.execute('SELECT symbol, current_value, unrealized_gain_percent FROM positions WHERE portfolio_id = ?', [portfolio.id]);

    // 资产分布
    const totalValue = Number(portfolio.total_value) || 0;
    const assetDistribution = positions.map(p => {
    console.log(`Current value : ${p.current_value} , totalValue: ${totalValue}`);
      const currentValue = Number(p.current_value) || 0;
      let percent = 0;
      if (totalValue > 0) {
        percent = ((currentValue / totalValue) * 100).toFixed(2);
      }
      return {
        symbol: p.symbol,
        value: currentValue,
        percent: isNaN(percent) ? 0 : percent
      };
    });

    // Top/Worst performers
    const sorted = [...positions].sort((a, b) => b.unrealized_gain_percent - a.unrealized_gain_percent);
    const topPerformers = sorted.slice(0, 3).map(p => ({ symbol: p.symbol, change: Number(p.unrealized_gain_percent) }));
    const worstPerformers = sorted.slice(-3).map(p => ({ symbol: p.symbol, change: Number(p.unrealized_gain_percent) }));

    res.json({
      totalValue: Number(portfolio.total_value),
      totalReturn: Number(portfolio.total_return),
      returnPercentage: Number(portfolio.total_return_percent),
      dailyReturns,
      topPerformers,
      worstPerformers,
      assetDistribution
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
