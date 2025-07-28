require('dotenv').config();

console.log(`🔧 Loading services`);

// 统一使用真实服务实现
const authService = require('./authService.js');
const portfolioService = require('./portfolioService.js');
const stockService = require('./stockService.js');
const watchlistService = require('./watchlistService.js');
const tradingService = require('./tradingService.js');
const newsService = require('./newsService.js');
const analyticsService = require('./analyticsService.js');

console.log('✅ Loaded authService');
console.log('✅ Loaded portfolioService');
console.log('✅ Loaded stockService');
console.log('✅ Loaded watchlistService');
console.log('✅ Loaded tradingService');
console.log('✅ Loaded newsService');
console.log('✅ Loaded analyticsService');

// 导出所有服务
module.exports = {
  authService,
  portfolioService,
  stockService,
  watchlistService,
  tradingService,
  newsService,
  analyticsService
};
