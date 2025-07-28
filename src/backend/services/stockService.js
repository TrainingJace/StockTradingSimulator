// 股票服务实现
const axios = require('axios');

class StockService {
  constructor() {
    this.db = require('../database/database');
    this.TWELVEDATA_API_KEY = process.env.STOCK_API_KEY;
    console.log('StockService initialized with API key:', this.TWELVEDATA_API_KEY ? 'configured' : 'missing');
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
      // 首先尝试调用外部API
      const externalResults = await this.searchFromTwelveDataAPI(query);

      if (externalResults && externalResults.length > 0) {
        console.log(`外部API返回 ${externalResults.length} 条结果`);
        return externalResults;
      }

      // 如果外部API没有结果，回退到本地数据库搜索
      console.log('外部API无结果，回退到本地数据库搜索...');
      return await this.searchFromLocalDatabase(query);

    } catch (error) {
      console.error('外部API调用失败:', error.message);

      // API调用失败时，回退到本地数据库搜索
      console.log('回退到本地数据库搜索...');
      return await this.searchFromLocalDatabase(query);
    }
  }

  // 调用 Twelve Data API 搜索股票
  async searchFromTwelveDataAPI(query) {
    try {
      const apiUrl = 'https://api.twelvedata.com/symbol_search';
      console.log(`调用外部API: ${apiUrl}?symbol=${query}`);

      const response = await axios.get(apiUrl, {
        params: {
          symbol: query,
          apikey: this.TWELVEDATA_API_KEY
        },
        timeout: 8000 // 8秒超时
      });

      console.log('外部API响应状态:', response.status);
      console.log('外部API响应数据结构:', {
        hasData: !!response.data,
        hasDataField: !!(response.data && response.data.data),
        isArray: !!(response.data && response.data.data && Array.isArray(response.data.data)),
        length: response.data && response.data.data ? response.data.data.length : 0
      });

      if (response.data && response.data.data && Array.isArray(response.data.data)) {
        console.log(`外部API返回 ${response.data.data.length} 条原始结果`);

        // 格式化外部API返回的数据，显示指定字段
        const formattedResults = response.data.data.map(stock => ({
          symbol: stock.symbol || '',
          name: stock.instrument_name || stock.name || '',
          exchange: stock.exchange || '',
          mic_code: stock.mic_code || '',
          country: stock.country || '',
          type: stock.instrument_type || '',
          source: 'external' // 标记为外部数据源
        }));

        console.log(`格式化后返回 ${formattedResults.length} 条结果`);
        console.log('第一条结果示例:', formattedResults[0]);

        return formattedResults;
      } else {
        console.log('外部API返回数据格式不正确或为空');
        if (response.data) {
          console.log('实际返回数据:', JSON.stringify(response.data, null, 2));
        }
      }

      return [];
    } catch (error) {
      console.error('Twelve Data API调用失败:', error.message);
      throw error;
    }
  }

  // 本地数据库搜索（备选方案）
  async searchFromLocalDatabase(query) {
    try {
      const searchQuery = `
        SELECT * FROM stocks 
        WHERE symbol LIKE ? OR name LIKE ? 
        ORDER BY symbol
        LIMIT 20
      `;
      const searchTerm = `%${query}%`;
      const result = await this.db.execute(searchQuery, [searchTerm, searchTerm]);
      return result.map(stock => ({
        ...this.formatStockData(stock),
        source: 'local' // 标记为本地数据源
      }));
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
