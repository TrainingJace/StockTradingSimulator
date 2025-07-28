// 股票服务实现
const axios = require('axios');

class StockService {
  constructor() {
    this.db = require('../database/database');

  }

  async getStockPrice(symbol, simulationDate = null) {
    try {
      // 先获取基本股票信息
      const query = 'SELECT * FROM stocks WHERE symbol = ?';
      const result = await this.db.execute(query, [symbol]);
      const basicStock = result[0];
      
      if (!basicStock) {
        return null;
      }

      if (simulationDate) {
        
        // 先尝试精确匹配日期字符串
        const historyQuery = `
          SELECT close_price, volume, date
          FROM stock_history 
          WHERE symbol = ? AND date = ?
        `;
        
        const dateOnly = simulationDate.split('T')[0]; // 提取 YYYY-MM-DD
        const historyResult = await this.db.execute(historyQuery, [symbol, dateOnly]);
     
        
        if (historyResult.length > 0) {
          const historyData = historyResult[0];
          
          // 查找前一个交易日的价格来计算变化
          const previousDayQuery = `
            SELECT close_price, date
            FROM stock_history 
            WHERE symbol = ? AND date < ?
            ORDER BY date DESC 
            LIMIT 1
          `;
          
          const previousDayResult = await this.db.execute(previousDayQuery, [symbol, dateOnly]);
          console.log(`Previous day data for ${symbol}:`, previousDayResult[0] ? `${previousDayResult[0].date}: $${previousDayResult[0].close_price}` : 'not found');
          
          let changeAmount = 0;
          let changePercent = 0;
          
          if (previousDayResult.length > 0) {
            const previousPrice = parseFloat(previousDayResult[0].close_price);
            const currentPrice = parseFloat(historyData.close_price);
            
            changeAmount = currentPrice - previousPrice;
            changePercent = previousPrice > 0 ? (changeAmount / previousPrice) * 100 : 0;
            
            console.log(`Price change for ${symbol}: $${changeAmount.toFixed(2)} (${changePercent.toFixed(2)}%)`);
          }
          
          return {
            ...basicStock,
            price: parseFloat(historyData.close_price),
            volume: parseInt(historyData.volume),
            simulation_date: historyData.date,
            last_updated: historyData.date,
            change: parseFloat(changeAmount.toFixed(2)),
            changePercent: parseFloat(changePercent.toFixed(2))
            
          };
        } else {
          // 如果没有找到该日期的历史数据，先留白处理
          // TODO: 实现其他处理逻辑
          return null;
        }
      } else {
        // 没有simulation_date，返回基本股票信息
        return basicStock;
      }
    } catch (error) {
      console.error('Error getting stock price:', error);
      return null;
    }
  }

  async getMultipleStocks(symbols = [], simulationDate = null) {
    console.log(`Getting multiple stocks:`, symbols, simulationDate ? `on ${simulationDate}` : '');
    try {
      if (symbols.length === 0) {
        // 如果没有指定股票，返回所有股票
        const query = 'SELECT * FROM stocks ORDER BY symbol';
        const result = await this.db.execute(query);
        
        if (simulationDate) {
          // 为每个股票获取历史价格
          return await Promise.all(
            result.map(async (stock) => {
              const stockWithPrice = await this.getStockPrice(stock.symbol, simulationDate);
              return stockWithPrice || this.formatStockData(stock);
            })
          );
        } else {
          return result.map(this.formatStockData);
        }
      } else {
        // 获取指定的股票
        const placeholders = symbols.map(() => '?').join(',');
        const query = `SELECT * FROM stocks WHERE symbol IN (${placeholders}) ORDER BY symbol`;
        const result = await this.db.execute(query, symbols);
        
        if (simulationDate) {
          // 为每个股票获取历史价格
          return await Promise.all(
            result.map(async (stock) => {
              const stockWithPrice = await this.getStockPrice(stock.symbol, simulationDate);
              return stockWithPrice || this.formatStockData(stock);
            })
          );
        } else {
          return result.map(this.formatStockData);
        }
      }
    } catch (error) {
      console.error('Error getting multiple stocks:', error);
      return [];
    }
  }

  async getHistoricalData(symbol, startDate, endDate) {
    console.log(`Getting historical data for ${symbol} from ${startDate} to ${endDate}`);
    
    try {
      // 使用历史数据服务获取数据
      const stockHistoryService = require('./stockHistoryService');
      const historyData = await stockHistoryService.getHistoryData(symbol, startDate, endDate);
      
      // 格式化数据，确保与前端期望的格式一致
      return historyData.map(item => ({
        date: item.date,
        open: parseFloat(item.open_price),
        high: parseFloat(item.high_price),
        low: parseFloat(item.low_price),
        close: parseFloat(item.close_price),
        volume: parseInt(item.volume)
      }));
    } catch (error) {
      console.error(`Error getting historical data for ${symbol}:`, error);
      return [];
    }
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
