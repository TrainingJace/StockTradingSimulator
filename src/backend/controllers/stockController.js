const services = require('../services');

class StockController {
  async getStockPrice(req, res) {
    try {
      const { symbol } = req.params;
      const { simulation_date } = req.query;
      
      if (!symbol) {
        return res.status(400).json({ error: 'Stock symbol is required' });
      }

      const stock = await services.stockService.getStockPrice(symbol, simulation_date);
      
      if (!stock) {
        return res.status(404).json({ error: 'Stock not found' });
      }

      res.json({ success: true, data: stock });
    } catch (error) {
      console.error('Error in getStockPrice:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async getMultipleStocks(req, res) {
    try {
      const { symbols, simulation_date } = req.query;
      
      let symbolArray = [];
      if (symbols) {
        symbolArray = symbols.split(',').map(s => s.trim());
      }
      // 如果没有指定symbols参数，symbolArray为空数组，service会返回所有股票

      const stocks = await services.stockService.getMultipleStocks(symbolArray, simulation_date);

      res.json({ success: true, data: stocks });
    } catch (error) {
      console.error('Error in getMultipleStocks:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async getHistoricalData(req, res) {
    try {
      const { symbol } = req.params;
      const { startDate, endDate } = req.query;

      if (!symbol) {
        return res.status(400).json({ error: 'Stock symbol is required' });
      }

      if (!startDate || !endDate) {
        return res.status(400).json({ error: 'Start date and end date are required' });
      }

      const historicalData = await services.stockService.getHistoricalData(symbol, startDate, endDate);

      res.json({ success: true, data: historicalData });
    } catch (error) {
      console.error('Error in getHistoricalData:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async searchStocks(req, res) {
    try {
      const { q: query } = req.query;

      if (!query) {
        return res.status(400).json({ error: 'Search query is required' });
      }

      if (query.length < 1) {
        return res.status(400).json({ error: 'Search query must be at least 1 character long' });
      }

      const results = await services.stockService.searchStocks(query);

      res.json({ success: true, data: results });
    } catch (error) {
      console.error('Error in searchStocks:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async getMarketStatus(req, res) {
    try {
      const marketStatus = await services.stockService.getMarketStatus();
      res.json({ success: true, data: marketStatus });
    } catch (error) {
      console.error('Error in getMarketStatus:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async getTopMovers(req, res) {
    try {
      const topMovers = await services.stockService.getTopMovers();
      res.json({ success: true, data: topMovers });
    } catch (error) {
      console.error('Error in getTopMovers:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // 获取股票的实时价格更新（WebSocket 相关，这里先预留）
  async subscribeToStock(req, res) {
    try {
      const { symbol } = req.params;
      
      // 这里可以实现 WebSocket 订阅逻辑
      res.json({ 
        success: true, 
        message: `Subscribed to real-time updates for ${symbol}` 
      });
    } catch (error) {
      console.error('Error in subscribeToStock:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // 手动初始化历史数据
  async initializeHistoryData(req, res) {
    try {
      console.log('🔄 手动初始化历史数据请求');
      
      // 延迟加载，避免循环依赖
      const { testStocks, initializeStockHistory } = require('../database/seed-data');
      const database = require('../database/database');
      
      const results = await initializeStockHistory(database);
      
      res.json({ 
        success: true, 
        message: '历史数据初始化完成',
        data: results || {
          total: testStocks.length,
          message: '所有股票历史数据已存在或初始化过程中出现问题，请查看服务器日志'
        }
      });
    } catch (error) {
      console.error('Error in initializeHistoryData:', error);
      res.status(500).json({ 
        success: false,
        error: 'Failed to initialize history data',
        message: error.message 
      });
    }
  }

  // 检查历史数据状态
  async checkHistoryDataStatus(req, res) {
    try {
      const stockHistoryService = require('../services/stockHistoryService');
      const { testStocks } = require('../database/seed-data');
      
      const startDate = '2020-01-01';
      const endDate = '2025-01-01';
      
      const status = [];
      
      for (const stock of testStocks) {
        const hasData = await stockHistoryService.checkHistoryDataExists(
          stock.symbol, 
          startDate, 
          endDate
        );
        
        const query = `
          SELECT COUNT(*) as count, MIN(date) as earliest, MAX(date) as latest
          FROM stock_history 
          WHERE symbol = ?
        `;
        const result = await stockHistoryService.db.execute(query, [stock.symbol]);
        const dbInfo = result[0];
        
        status.push({
          symbol: stock.symbol,
          name: stock.name,
          hasEnoughData: hasData,
          recordCount: dbInfo.count,
          dateRange: {
            earliest: dbInfo.earliest,
            latest: dbInfo.latest
          }
        });
      }
      
      res.json({
        success: true,
        message: '历史数据状态检查完成',
        data: {
          targetDateRange: { startDate, endDate },
          stocks: status
        }
      });
    } catch (error) {
      console.error('Error in checkHistoryDataStatus:', error);
      res.status(500).json({ 
        success: false,
        error: 'Failed to check history data status',
        message: error.message 
      });
    }
  }
}

module.exports = new StockController();
