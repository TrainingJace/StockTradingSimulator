// 股票服务实现
const axios = require('axios');

class StockService {
  constructor() {
    this.db = require('../database/database');

  }

  async getStockPrice(symbol) {
    console.log(`Getting stock price for: ${symbol}`);
    try {
      const query = 'SELECT * FROM stocks WHERE symbol = ?';
      const result = await this.db.execute(query, [symbol]);
      return result[0] || null;
    } catch (error) {
      console.error('Error getting stock price:', error);
      return null;
    }
  }

  async getMultipleStocks(symbols = []) {
    console.log(`Getting multiple stocks:`, symbols);
    try {
      if (symbols.length === 0) {
        // 如果没有指定股票，返回所有股票
        const query = 'SELECT * FROM stocks ORDER BY symbol';
        const result = await this.db.execute(query);
        return result.map(this.formatStockData);
      } else {
        // 获取指定的股票
        const placeholders = symbols.map(() => '?').join(',');
        const query = `SELECT * FROM stocks WHERE symbol IN (${placeholders}) ORDER BY symbol`;
        const result = await this.db.execute(query, symbols);
        return result.map(this.formatStockData);
      }
    } catch (error) {
      console.error('Error getting multiple stocks:', error);
      return [];
    }
  }

  async getHistoricalData(symbol, startDate, endDate) {
    console.log(`Getting historical data for ${symbol} from ${startDate} to ${endDate}`);
    // TODO: 实现真实的历史数据获取
    // 暂时返回空数组
    return [];
  }

  async searchStocks(query) {
    console.log(`Searching stocks with query: ${query}`);


    try {
      const searchQuery = `
        SELECT * FROM stocks 
        WHERE symbol LIKE ? OR name LIKE ? 
        ORDER BY symbol
        LIMIT 20
      `;
      const searchTerm = `%${query}%`;
      const result = await this.db.execute(searchQuery, [searchTerm, searchTerm]);
      return result.map(this.formatStockData);

    } catch (error) {
      console.error('本地数据库搜索错误:', error);
      return [];
    }
  }

  async getMarketStatus() {
    console.log('Getting market status');
    // TODO: 实现真实的市场状态获取
    // 暂时返回基本状态
    return { isOpen: true, status: 'open' };
  }

  async getTopMovers() {
    console.log('Getting top movers');
    try {
      // 获取涨幅最大的股票
      const gainersQuery = `
        SELECT * FROM stocks 
        WHERE change_percent > 0 
        ORDER BY change_percent DESC 
        LIMIT 5
      `;
      const gainers = await this.db.execute(gainersQuery);

      // 获取跌幅最大的股票
      const losersQuery = `
        SELECT * FROM stocks 
        WHERE change_percent < 0 
        ORDER BY change_percent ASC 
        LIMIT 5
      `;
      const losers = await this.db.execute(losersQuery);

      return {
        gainers: gainers.map(this.formatStockData),
        losers: losers.map(this.formatStockData)
      };
    } catch (error) {
      console.error('Error getting top movers:', error);
      return { gainers: [], losers: [] };
    }
  }

  // 格式化股票数据，确保与前端期望的格式一致
  formatStockData(stock) {
    return {
      symbol: stock.symbol,
      name: stock.name,
      sector: stock.sector,
      price: parseFloat(stock.price),
      change: parseFloat(stock.change_amount),
      changePercent: parseFloat(stock.change_percent),
      volume: parseInt(stock.volume),
      marketCap: parseInt(stock.market_cap),
      lastUpdated: stock.last_updated
    };
  }
}

module.exports = new StockService();
