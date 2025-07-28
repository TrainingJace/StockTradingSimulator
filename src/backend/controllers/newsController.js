const { newsService } = require('../services');

class NewsController {
  // 获取股票相关新闻
  async getStockNews(req, res) {
    try {
      const { symbol } = req.params;
      const { startDate, endDate, limit = 10 } = req.query;

      if (!symbol) {
        return res.status(400).json({
          success: false,
          error: 'Symbol is required'
        });
      }

      // TODO: 实现获取股票新闻逻辑
      // const news = await newsService.getStockNews(symbol, startDate, endDate, parseInt(limit));

      // 临时返回模拟数据
      const mockNews = [
        {
          title: `${symbol} 股价表现强劲，分析师上调目标价`,
          summary: `${symbol} 公司在最新财报中表现出色，多位分析师看好其未来发展前景，纷纷上调目标价。`,
          content: `详细分析显示，${symbol} 在关键业务领域取得突破性进展...`,
          publishedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
          source: '财经日报'
        },
        {
          title: `${symbol} 宣布重大技术突破，引发市场关注`,
          summary: `${symbol} 公司今日宣布在核心技术领域取得重大突破，预计将对其业务产生积极影响。`,
          content: `该技术突破将帮助${symbol}进一步巩固其市场地位...`,
          publishedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          source: '科技新闻'
        },
        {
          title: `${symbol} 季度业绩超预期，股价盘后上涨`,
          summary: `${symbol} 公布的季度财报显示，营收和利润均超出市场预期，推动股价盘后大幅上涨。`,
          content: `财报数据显示，${symbol}在多个业务线都实现了增长...`,
          publishedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
          source: '投资者报'
        }
      ];

      res.json({
        success: true,
        data: mockNews.slice(0, parseInt(limit)), // 根据limit参数返回相应数量的新闻
        message: 'Stock news retrieved successfully'
      });
    } catch (error) {
      console.error('Error getting stock news:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  // 获取市场新闻
  async getMarketNews(req, res) {
    try {
      const { startDate, endDate, limit = 20 } = req.query;

      // TODO: 实现获取市场新闻逻辑
      // const news = await newsService.getMarketNews(startDate, endDate, parseInt(limit));

      res.json({
        success: true,
        data: [], // 临时返回空数组
        message: 'Market news retrieved successfully'
      });
    } catch (error) {
      console.error('Error getting market news:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }
}

module.exports = new NewsController();
