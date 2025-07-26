require('dotenv').config();

console.log(`🔧 Loading services`);

// 统一使用真实服务实现
const authService = require('./authService.js');
const portfolioService = require('./portfolioService.js');
const stockService = require('./stockService.js');

console.log('✅ Loaded authService');
console.log('✅ Loaded portfolioService');
console.log('✅ Loaded stockService');

// 导出所有服务
module.exports = {
  authService,
  portfolioService,
  stockService
};
