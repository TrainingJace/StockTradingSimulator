const { newsService, authService } = require('../services');

class NewsController {
  // 获取股票相关新闻
  async getStockNews(req, res) {
    try {
      const { symbol } = req.params;
      let { simulationDate, limit = 3 } = req.query;

      console.log('=== NEWS CONTROLLER ===');
      console.log('Request params:', { symbol, simulationDate, limit });
      console.log('User from req:', req.user ? `ID: ${req.user.id}` : 'No user');

      if (!symbol) {
        return res.status(400).json({
          success: false,
          error: 'Symbol is required'
        });
      }

      // 如果没有传入simulationDate，从用户表中获取
      if (!simulationDate) {
        console.log('No simulationDate provided, fetching from user data...');

        if (!req.user || !req.user.id) {
          return res.status(401).json({
            success: false,
            error: 'User authentication required to fetch simulation date'
          });
        }

        try {
          const user = await authService.getUserById(req.user.id);
          if (!user) {
            return res.status(404).json({
              success: false,
              error: 'User not found'
            });
          }

          simulationDate = user.simulation_date;
          console.log('Retrieved simulationDate from user:', simulationDate);

          if (!simulationDate) {
            return res.status(400).json({
              success: false,
              error: 'User does not have a simulation date set'
            });
          }
        } catch (userError) {
          console.error('Error fetching user data:', userError);
          return res.status(500).json({
            success: false,
            error: 'Failed to fetch user simulation date'
          });
        }
      }

      // 使用真实的新闻服务
      console.log('Calling newsService.getStockNews...');
      const news = await newsService.getStockNews(symbol, simulationDate, parseInt(limit));

      console.log('News service returned:', news.length, 'items');
      if (news.length > 0) {
        console.log('First news item from service:', JSON.stringify(news[0], null, 2));
      }

      const responseData = {
        success: true,
        data: news,
        message: `Retrieved ${news.length} news items before ${simulationDate}`
      };

      console.log('Sending response to frontend:', JSON.stringify(responseData, null, 2));
      console.log('======================');

      res.json(responseData);
    } catch (error) {
      console.error('=== ERROR in getStockNews ===');
      console.error('Error message:', error.message);
      console.error('Stack trace:', error.stack);
      console.error('=============================');
      res.status(500).json({
        success: false,
        error: error.message || 'Internal server error'
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
