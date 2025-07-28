// 应用配置
const config = {
  // 服务器配置
  server: {
    port: process.env.PORT || 3001,
    mode: process.env.MODE || 'test'
  },

  // 数据库配置（生产环境使用）
  database: {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    name: process.env.DB_NAME || 'stock_simulator',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASS || '',
    maxConnections: 20,
    idleTimeout: 30000
  },

  // API 配置
  apis: {
    stock: {
      provider: 'twelvedata', // 或 'finnhub', 'polygon' 等
      apiKey: process.env.STOCK_API_KEY,
      apiSecret: process.env.STOCK_API_SECRET,
      baseUrl: 'https://api.twelvedata.com',
      timeout: 10000
    },
    news: {
      provider: 'newsapi',
      apiKey: process.env.NEWS_API_KEY,
      baseUrl: 'https://newsapi.org/v2',
      timeout: 10000
    }
  },

  // 交易配置
  trading: {
    defaultBalance: 10000, // 默认初始资金
    minTradeAmount: 1, // 最小交易股数
    maxTradeAmount: 10000, // 最大交易股数
    tradingHours: {
      start: '09:30', // 市场开盘时间
      end: '16:00',   // 市场收盘时间
      timezone: 'America/New_York'
    }
  },

  // 认证配置
  auth: {
    jwtSecret: process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production',
    tokenExpiry: process.env.JWT_EXPIRY || '24h',
    bcryptRounds: 10
  },

  // 缓存配置
  cache: {
    stockPrices: {
      ttl: 60, // 股价缓存时间（秒）
      maxSize: 1000
    },
    historicalData: {
      ttl: 3600, // 历史数据缓存时间（秒）
      maxSize: 500
    }
  },

  // 日志配置
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    file: process.env.LOG_FILE || 'app.log',
    maxSize: '10m',
    maxFiles: 5
  }
};

module.exports = config;
