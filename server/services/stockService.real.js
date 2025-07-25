// 真实股票 API 实现
const axios = require('axios');

class StockService {
  constructor() {
    this.apiKey = process.env.STOCK_API_KEY;
    this.baseURL = 'https://api.alpaca.markets/v2'; // 或其他股票 API
  }

  async getStockPrice(symbol) {
    console.log(`[REAL] Getting stock price for: ${symbol}`);
    try {
      // 实际 API 调用示例
      // const response = await axios.get(`${this.baseURL}/stocks/${symbol}/quotes/latest`, {
      //   headers: {
      //     'APCA-API-KEY-ID': this.apiKey,
      //     'APCA-API-SECRET-KEY': process.env.STOCK_API_SECRET
      //   }
      // });
      // return this.formatStockData(response.data);
      
      throw new Error('Real stock API not configured yet');
    } catch (error) {
      console.error('Error getting stock price:', error);
      throw error;
    }
  }

  async getMultipleStocks(symbols) {
    console.log(`[REAL] Getting multiple stocks:`, symbols);
    try {
      // const promises = symbols.map(symbol => this.getStockPrice(symbol));
      // const results = await Promise.all(promises);
      // return results.filter(result => result !== null);
      
      throw new Error('Real stock API not configured yet');
    } catch (error) {
      console.error('Error getting multiple stocks:', error);
      throw error;
    }
  }

  async getHistoricalData(symbol, startDate, endDate) {
    console.log(`[REAL] Getting historical data for ${symbol} from ${startDate} to ${endDate}`);
    try {
      // const response = await axios.get(`${this.baseURL}/stocks/${symbol}/bars`, {
      //   params: {
      //     start: startDate,
      //     end: endDate,
      //     timeframe: '1Day'
      //   },
      //   headers: {
      //     'APCA-API-KEY-ID': this.apiKey,
      //     'APCA-API-SECRET-KEY': process.env.STOCK_API_SECRET
      //   }
      // });
      // return this.formatHistoricalData(response.data);
      
      throw new Error('Real stock API not configured yet');
    } catch (error) {
      console.error('Error getting historical data:', error);
      throw error;
    }
  }

  async searchStocks(query) {
    console.log(`[REAL] Searching stocks with query: ${query}`);
    try {
      // const response = await axios.get(`${this.baseURL}/assets`, {
      //   params: {
      //     search: query,
      //     asset_class: 'us_equity'
      //   },
      //   headers: {
      //     'APCA-API-KEY-ID': this.apiKey,
      //     'APCA-API-SECRET-KEY': process.env.STOCK_API_SECRET
      //   }
      // });
      // return response.data;
      
      throw new Error('Real stock API not configured yet');
    } catch (error) {
      console.error('Error searching stocks:', error);
      throw error;
    }
  }

  async getMarketStatus() {
    console.log(`[REAL] Getting market status`);
    try {
      // const response = await axios.get(`${this.baseURL}/clock`, {
      //   headers: {
      //     'APCA-API-KEY-ID': this.apiKey,
      //     'APCA-API-SECRET-KEY': process.env.STOCK_API_SECRET
      //   }
      // });
      // return {
      //   isOpen: response.data.is_open,
      //   nextOpen: response.data.next_open,
      //   nextClose: response.data.next_close,
      //   timezone: response.data.timezone
      // };
      
      throw new Error('Real stock API not configured yet');
    } catch (error) {
      console.error('Error getting market status:', error);
      throw error;
    }
  }

  async getTopMovers() {
    console.log(`[REAL] Getting top movers`);
    try {
      // 实际实现会调用相应的 API 获取涨跌幅排行
      throw new Error('Real stock API not configured yet');
    } catch (error) {
      console.error('Error getting top movers:', error);
      throw error;
    }
  }

  // 辅助方法：格式化股票数据
  formatStockData(apiData) {
    // 根据实际 API 响应格式进行转换
    return {
      symbol: apiData.symbol,
      name: apiData.name,
      price: apiData.price,
      change: apiData.change,
      changePercent: apiData.change_percent,
      volume: apiData.volume,
      marketCap: apiData.market_cap,
      lastUpdated: apiData.updated_at
    };
  }

  formatHistoricalData(apiData) {
    // 根据实际 API 响应格式进行转换
    return apiData.bars?.map(bar => ({
      date: bar.t,
      open: bar.o,
      high: bar.h,
      low: bar.l,
      close: bar.c,
      volume: bar.v
    })) || [];
  }
}

module.exports = new StockService();
