const services = require('../services');

class StockController {
  async getStockPrice(req, res) {
    try {
      const { symbol } = req.params;
      
      if (!symbol) {
        return res.status(400).json({ error: 'Stock symbol is required' });
      }

      const stock = await services.stockService.getStockPrice(symbol);
      
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
      const { symbols } = req.query;
      
      let symbolArray = [];
      if (symbols) {
        symbolArray = symbols.split(',').map(s => s.trim());
      }
      // 如果没有指定symbols参数，symbolArray为空数组，service会返回所有股票

      const stocks = await services.stockService.getMultipleStocks(symbolArray);

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
}

module.exports = new StockController();
