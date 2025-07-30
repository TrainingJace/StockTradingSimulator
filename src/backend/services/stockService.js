// 股票服务实现
const axios = require('axios');

class StockService {
  // 获取某只股票在指定日期的前一交易日收盘价
  async getPreviousPrice(symbol, currentDate) {
    const query = `
      SELECT close_price, date FROM stock_history
      WHERE symbol = ? AND date < ?
      ORDER BY date DESC
      LIMIT 1
    `;
    const result = await this.db.execute(query, [symbol, currentDate]);
    if (result && result.length > 0) {
      return result[0].close_price;
    }
    return null;
  }

  
  constructor() {
    this.db = require('../database/database');
    this.API_KEY = process.env.STOCK_API_KEY;
    this.BASE_URL = 'https://api.twelvedata.com';
    
    // // 设置定期清理缓存（每小时执行一次）
    // setInterval(() => {
    //   this.cleanupCache();
    // }, 60 * 60 * 1000); // 1小时
    
    console.log('StockService initialized with caching enabled');
  }

  async getStockPrice(symbol, simulationDate = null) {
    return this.getRealTimePrice(symbol, null);
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

          // 用 getPreviousPrice 方法获取前一交易日价格
          const previousPriceRaw = await this.getPreviousPrice(symbol, dateOnly);
          let changeAmount = 0;
          let changePercent = 0;
          if (previousPriceRaw !== null && previousPriceRaw !== undefined) {
            const previousPrice = parseFloat(previousPriceRaw);
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
    try {
      if (symbols.length === 0) {
        // 如果没有指定股票，返回所有股票
        const query = 'SELECT * FROM stocks ORDER BY symbol';
        const result = await this.db.execute(query);

        // if (simulationDate) {
        // console.log('Fetching historical prices for all stocks');
        //   // 为每个股票获取历史价格
        //   return await Promise.all(
        //     result.map(async (stock) => {
        //       const stockWithPrice = await this.getStockPrice(stock.symbol, simulationDate);
        //       return stockWithPrice || this.formatStockData(stock);
        //     })
        //   );
        // } else {
          console.log('Fetching real prices for all stocks');
          return await Promise.all(
            result.map(async (stock) => {
              const realtimePrice = await this.getRealTimePrice(stock.symbol);
              return realtimePrice || this.formatStockData(stock);
            })
          );
        // }
        
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
          // 为指定股票获取实时价格
          return await Promise.all(
            result.map(async (stock) => {
              const realtimePrice = await this.getRealTimePrice(stock.symbol);
              return realtimePrice || this.formatStockData(stock);
            })
          );
        }
      }
    } catch (error) {
      console.error('Error getting multiple stocks:', error);
      return [];
    }
  }


  async getRealTimePrice(symbol) {
    try {
      // 获取昨天的日期（YYYY-MM-DD格式） in local time

      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];

      // 首先检查缓存中是否有昨天的数据
      const cacheQuery = `
        SELECT * FROM stock_real_history 
        WHERE symbol = ? 
          AND price_time = ?
        ORDER BY price_time DESC 
        LIMIT 1
      `;

      const cachedResult = await this.db.execute(cacheQuery, [symbol, yesterdayStr]);
      if (cachedResult && cachedResult.length > 0) {
        console.log(`Using cached data for ${symbol} from ${cachedResult[0].price_time}`);

        const cachedData = cachedResult[0];
        
        // 计算涨跌幅（与开盘价比较）
        const change = parseFloat(cachedData.change_price);
        const changePercent = parseFloat(cachedData.change_percent); ;
        return {
          symbol: symbol,
          price: parseFloat(cachedData.close_price),
          open: parseFloat(cachedData.open_price),
          high: parseFloat(cachedData.high_price),
          low: parseFloat(cachedData.low_price),
          change: parseFloat(change.toFixed(2)),
          changePercent: parseFloat(changePercent.toFixed(2)),
          volume: parseInt(cachedData.volume),
          last_updated: cachedData.price_time
        };
      }

      // 如果缓存中没有数据或数据过期，则调用API
      console.log(`Cached data length for ${symbol}:`, cachedResult.length);
      // console.log(`Fetching fresh data from API for ${symbol}`);
      const response = await axios.get(`${this.BASE_URL}/time_series`, {
        params: {
          symbol: symbol,
          interval: '1day',
          apikey: this.API_KEY,
          outputsize: 91,
          timezone: "utc"
        }
      });


      if (response.data && response.data.values && response.data.values.length > 0) {
        console.log(`Fetching data for ${symbol} from API`);
        const latestData = response.data.values[0];
        const previousData = response.data.values[1];
        
        const priceData = {
          symbol: symbol,
          price: parseFloat(latestData.close),
          open: parseFloat(latestData.open),
          high: parseFloat(latestData.high),
          low: parseFloat(latestData.low),
          change: parseFloat(latestData.close) - parseFloat(previousData.close),
          changePercent: ((parseFloat(latestData.close) - parseFloat(previousData.close)) / parseFloat(previousData.close)) * 100,
          volume: parseInt(latestData.volume),
          last_updated: latestData.datetime
        };

        // 批量存储前90天的数据（跳过最远的那一天，因为没有前一天数据计算change）
        try {
          const dataToStore = response.data.values.slice(0, -1); // 去掉最后一天（最远的那一天）
          let storedCount = 0;
          let skippedCount = 0;
          
          for (let i = 0; i < dataToStore.length; i++) {
            const currentData = dataToStore[i];
            const prevData = response.data.values[i + 1]; // 前一天的数据
            
            const dateOnly = new Date(currentData.datetime).toISOString().split('T')[0];
            
            // 先检查是否已经存在该股票该日期的数据
            const existQuery = `
              SELECT id FROM stock_real_history 
              WHERE symbol = ? AND price_time = ?
              LIMIT 1
            `;
            const existResult = await this.db.execute(existQuery, [symbol, dateOnly]);
            
            if (existResult && existResult.length > 0) {
              skippedCount++;
              continue; // 跳过已存在的数据
            }
            
            // 计算与前一天的变化
            const change = parseFloat(currentData.close) - parseFloat(prevData.close);
            const changePercent = (change / parseFloat(prevData.close)) * 100;
            
            const insertQuery = `
              INSERT INTO stock_real_history 
              (symbol, price_time, open_price, high_price, low_price, close_price, volume, change_price, change_percent)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            `;
            
            await this.db.execute(insertQuery, [
              symbol,
              dateOnly,
              currentData.open,
              currentData.high,
              currentData.low,
              currentData.close,
              currentData.volume,
              change,
              changePercent
            ]);
            
            storedCount++;
          }
          
          console.log(`Cached ${storedCount} new records for ${symbol}, skipped ${skippedCount} existing records`);
        } catch (cacheError) {
          console.error(`Failed to cache data for ${symbol}:`, cacheError);
          // 继续执行，不因为缓存失败而中断
        }

        return priceData;
      } else {
        // 检查是否有错误信息
        if (response.data && response.data.status) {
          console.error(`API Error for ${symbol}:`, response.data.status, response.data.message || '');
        }
        throw new Error(`Invalid response from time_series API for ${symbol}`);
      }
    } catch (error) {
      console.error(`Error getting real-time price for ${symbol}:`, error);
      return null;
    }
  }

  async getHistoricalData(symbol, startDate, endDate) {
    console.log(`Getting historical data for ${symbol} from ${startDate} to ${endDate}`);

    try {
      // 使用历史数据服务获取数据
      const stockHistoryService = require('./stockHistoryService');
      const historyData = await stockHistoryService.getHistoryData(symbol, startDate, endDate);

      // 格式化数据，确保与前端期望的格式一致
      const result =  historyData.map(item => ({
        date: new Date(item.price_time).toISOString().split('T')[0], //yyyy-MM-DD格式
        open: parseFloat(item.open_price),
        high: parseFloat(item.high_price),
        low: parseFloat(item.low_price),
        close: parseFloat(item.close_price),
        volume: parseInt(item.volume)
      }));

      console.log(`Result for ${symbol}:`, result);
      return result;
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
      industry: stock.industry,
      description: stock.description,
      cik: stock.cik,
      exchange: stock.exchange,
      currency: stock.currency,
      country: stock.country,
      address: stock.address,
      officialSite: stock.officialSite,
      marketCapitalization: stock.marketCapitalization,
      ebitda: stock.ebitda,
      peRatio: stock.peRatio,
      pegRatio: stock.pegRatio,
      bookValue: stock.bookValue,
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
