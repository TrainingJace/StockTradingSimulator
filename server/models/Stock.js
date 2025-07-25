// 股票数据模型

class Stock {
  constructor(data) {
    this.symbol = data.symbol.toUpperCase();
    this.name = data.name;
    this.price = parseFloat(data.price);
    this.change = parseFloat(data.change || 0);
    this.changePercent = parseFloat(data.changePercent || 0);
    this.volume = parseInt(data.volume || 0);
    this.marketCap = parseInt(data.marketCap || 0);
    this.lastUpdated = data.lastUpdated || new Date().toISOString();
  }

  // 验证股票数据
  static validate(stockData) {
    const errors = [];

    if (!stockData.symbol || typeof stockData.symbol !== 'string') {
      errors.push('Symbol is required and must be a string');
    } else if (!/^[A-Z]{1,5}$/.test(stockData.symbol.toUpperCase())) {
      errors.push('Invalid stock symbol format');
    }

    if (!stockData.name || typeof stockData.name !== 'string') {
      errors.push('Company name is required');
    }

    if (stockData.price === undefined || isNaN(parseFloat(stockData.price))) {
      errors.push('Valid price is required');
    } else if (parseFloat(stockData.price) <= 0) {
      errors.push('Price must be positive');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // 更新股票价格
  updatePrice(newPrice, volume = null) {
    const oldPrice = this.price;
    this.price = parseFloat(newPrice);
    this.change = this.price - oldPrice;
    this.changePercent = oldPrice > 0 ? (this.change / oldPrice) * 100 : 0;
    
    if (volume !== null) {
      this.volume = parseInt(volume);
    }
    
    this.lastUpdated = new Date().toISOString();
  }

  // 获取格式化的价格信息
  getFormattedPrice() {
    return {
      price: `$${this.price.toFixed(2)}`,
      change: `${this.change >= 0 ? '+' : ''}$${this.change.toFixed(2)}`,
      changePercent: `${this.changePercent >= 0 ? '+' : ''}${this.changePercent.toFixed(2)}%`,
      volume: this.volume.toLocaleString()
    };
  }

  // 判断是否上涨
  isUp() {
    return this.change > 0;
  }

  // 判断是否下跌
  isDown() {
    return this.change < 0;
  }

  // 转换为 JSON 对象
  toJSON() {
    return {
      symbol: this.symbol,
      name: this.name,
      price: this.price,
      change: this.change,
      changePercent: this.changePercent,
      volume: this.volume,
      marketCap: this.marketCap,
      lastUpdated: this.lastUpdated,
      formatted: this.getFormattedPrice()
    };
  }
}

// 历史数据模型
class StockHistoricalData {
  constructor(data) {
    this.symbol = data.symbol.toUpperCase();
    this.date = data.date;
    this.open = parseFloat(data.open);
    this.high = parseFloat(data.high);
    this.low = parseFloat(data.low);
    this.close = parseFloat(data.close);
    this.volume = parseInt(data.volume || 0);
  }

  // 验证历史数据
  static validate(data) {
    const errors = [];

    if (!data.symbol) errors.push('Symbol is required');
    if (!data.date) errors.push('Date is required');
    if (isNaN(parseFloat(data.open))) errors.push('Valid open price is required');
    if (isNaN(parseFloat(data.high))) errors.push('Valid high price is required');
    if (isNaN(parseFloat(data.low))) errors.push('Valid low price is required');
    if (isNaN(parseFloat(data.close))) errors.push('Valid close price is required');

    // 验证价格逻辑
    const open = parseFloat(data.open);
    const high = parseFloat(data.high);
    const low = parseFloat(data.low);
    const close = parseFloat(data.close);

    if (high < Math.max(open, close) || low > Math.min(open, close)) {
      errors.push('Invalid price relationships (high/low vs open/close)');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // 计算当日涨跌幅
  getDailyChange() {
    const change = this.close - this.open;
    const changePercent = this.open > 0 ? (change / this.open) * 100 : 0;
    
    return {
      change: parseFloat(change.toFixed(2)),
      changePercent: parseFloat(changePercent.toFixed(2))
    };
  }

  // 转换为 JSON 对象
  toJSON() {
    return {
      symbol: this.symbol,
      date: this.date,
      open: this.open,
      high: this.high,
      low: this.low,
      close: this.close,
      volume: this.volume,
      dailyChange: this.getDailyChange()
    };
  }
}

module.exports = {
  Stock,
  StockHistoricalData
};
