const fs = require('fs');
const path = require('path');
require('dotenv').config();

const MODE = process.env.MODE || 'test';

console.log(`🔧 Loading services in ${MODE} mode`);

// 定义特殊的服务配置覆盖
// 默认规则：test模式用mock，real模式用real
// 这里只需要定义例外情况
const serviceOverrides = {
  test: {
    userService: 'real',      // 特殊：用户服务在test模式下也使用真实数据库
    portfolioService: 'real'  // 特殊：投资组合服务在test模式下也使用真实数据库
    // stockService 不在这里，所以会使用默认的 mock
  },
  real: {
    // real模式下所有服务都使用real，无需特殊配置
  }
};

// 自动扫描并加载所有服务
function loadServices() {
  const services = {};
  const servicesDir = __dirname;
  const overrides = serviceOverrides[MODE] || {};
  
  console.log(`📋 Service overrides for ${MODE} mode:`, overrides);
  
  // 获取所有服务文件
  const files = fs.readdirSync(servicesDir);
  
  // 找出所有可用的服务名
  const serviceNames = new Set();
  files.forEach(file => {
    if (file.endsWith('.mock.js') || file.endsWith('.real.js')) {
      const serviceName = file.replace(/\.(mock|real)\.js$/, '');
      serviceNames.add(serviceName);
    }
  });
  
  // 为每个服务加载对应的实现
  serviceNames.forEach(serviceName => {
    let serviceType;
    
    // 检查是否有特殊配置覆盖
    if (overrides[serviceName]) {
      serviceType = overrides[serviceName];
    } else {
      // 使用默认规则：test用mock，real用real
      serviceType = MODE === 'test' ? 'mock' : 'real';
    }
    
    const fileName = `${serviceName}.${serviceType}.js`;
    
    try {
      const servicePath = path.join(servicesDir, fileName);
      if (fs.existsSync(servicePath)) {
        services[serviceName] = require(servicePath);
        console.log(`✅ Loaded ${serviceName} (${fileName})`);
      } else {
        console.warn(`⚠️  Service file not found: ${fileName}`);
      }
    } catch (error) {
      console.error(`❌ Failed to load ${serviceName}:`, error.message);
    }
  });
  
  return services;
}

// 导出所有服务
module.exports = loadServices();
