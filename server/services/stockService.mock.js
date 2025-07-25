// Mock 股票数据
const mockStocks = [
  {
    symbol: 'AAPL',
    name: 'Apple Inc. Company',
    price: 175.25,
    change: 2.50,
    changePercent: 1.45,
    volume: 45234567,
    marketCap: 2850000000000,
    lastUpdated: new Date().toISOString()
  },
  {
    symbol: 'GOOGL',
    name: 'Alphabet Inc.',
    price: 145.80,
    change: -1.20,
    changePercent: -0.82,
    volume: 23456789,
    marketCap: 1820000000000,
    lastUpdated: new Date().toISOString()
  },
  {
    symbol: 'MSFT',
    name: 'Microsoft Corporation',
    price: 415.50,
    change: 5.75,
    changePercent: 1.40,
    volume: 34567890,
    marketCap: 3100000000000,
    lastUpdated: new Date().toISOString()
  }
];

// Mock 历史数据
const mockHistoricalData = {
  'AAPL': [
    { date: '2024-01-01', open: 172.50, high: 175.80, low: 171.20, close: 175.25, volume: 45234567 },
    { date: '2023-12-31', open: 170.20, high: 173.50, low: 169.80, close: 172.75, volume: 42345678 },
    { date: '2023-12-30', open: 168.90, high: 171.20, low: 167.50, close: 170.20, volume: 38456789 }
  ]
};

class StockService {
  async getStockPrice(symbol) {
    console.log(`[MOCK] Getting stock price for: ${symbol}`);
    const stock = mockStocks.find(s => s.symbol === symbol.toUpperCase());
    return stock || null;
  }

  async getMultipleStocks(symbols) {
    console.log(`[MOCK] Getting multiple stocks:`, symbols);
    return mockStocks.filter(stock => 
      symbols.map(s => s.toUpperCase()).includes(stock.symbol)
    );
  }

  async getHistoricalData(symbol, startDate, endDate) {
    console.log(`[MOCK] Getting historical data for ${symbol} from ${startDate} to ${endDate}`);
    return mockHistoricalData[symbol.toUpperCase()] || [];
  }

  async searchStocks(query) {
    console.log(`[MOCK] Searching stocks with query: ${query}`);
    return mockStocks.filter(stock =>
      stock.symbol.toLowerCase().includes(query.toLowerCase()) ||
      stock.name.toLowerCase().includes(query.toLowerCase())
    );
  }

  async getMarketStatus() {
    console.log(`[MOCK] Getting market status`);
    return {
      isOpen: true,
      nextOpen: '2024-01-02T09:30:00.000Z',
      nextClose: '2024-01-01T16:00:00.000Z',
      timezone: 'America/New_York'
    };
  }

  async getTopMovers() {
    console.log(`[MOCK] Getting top movers`);
    return {
      gainers: mockStocks.filter(s => s.change > 0).slice(0, 10),
      losers: mockStocks.filter(s => s.change < 0).slice(0, 10)
    };
  }
}

module.exports = new StockService();
