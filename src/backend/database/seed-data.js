/**
 * 数据库种子数据模块
 * 用于插入测试用的股票数据
 */

// 测试股票数据
const testStocks = [
  {
    symbol: 'AAPL',
    name: 'Apple Inc.',
    sector: 'Technology',
    industry: 'Consumer Electronics',
    description: 'Apple Inc. designs, manufactures, and markets smartphones, personal computers, tablets, wearables, and accessories worldwide.',
  },
  {
    symbol: 'GOOGL',
    name: 'Alphabet Inc.',
    sector: 'Technology',
    industry: 'Internet Content & Information',
    description: 'Alphabet Inc. provides online advertising services in the United States, Europe, the Middle East, Africa, the Asia-Pacific, Canada, and Latin America.',
  },
  {
    symbol: 'MSFT',
    name: 'Microsoft Corporation',
    sector: 'Technology',
    industry: 'Software—Infrastructure',
    description: 'Microsoft Corporation develops, licenses, and supports software, services, devices, and solutions worldwide.',
  },
  {
    symbol: 'TSLA',
    name: 'Tesla Inc.',
    sector: 'Consumer Cyclical',
    industry: 'Auto Manufacturers',
    description: 'Tesla, Inc. designs, develops, manufactures, leases, and sells electric vehicles, and energy generation and storage systems in the United States, China, and internationally.',
  },
  {
    symbol: 'AMZN',
    name: 'Amazon.com Inc.',
    sector: 'Consumer Cyclical',
    industry: 'Internet Retail',
    description: 'Amazon.com, Inc. engages in the retail sale of consumer products and subscriptions in North America and internationally.',
  },
  {
    symbol: 'NVDA',
    name: 'NVIDIA Corporation',
    sector: 'Technology',
    industry: 'Semiconductors',
    description: 'NVIDIA Corporation operates as a computing company in the United States, Taiwan, China, Hong Kong, and internationally.',
  },
  {
    symbol: 'META',
    name: 'Meta Platforms Inc.',
    sector: 'Communication Services',
    industry: 'Internet Content & Information',
    description: 'Meta Platforms, Inc. develops products that enable people to connect and share with friends and family through mobile devices, personal computers, virtual reality headsets, and wearables worldwide.',
  },
  {
    symbol: 'NFLX',
    name: 'Netflix Inc.',
    sector: 'Communication Services',
    industry: 'Entertainment',
    description: 'Netflix, Inc. provides entertainment services. It offers TV series, documentaries, feature films, and mobile games across a wide variety of genres and languages to members in over 190 countries.',
  }
];

/**
 * 插入测试股票数据
 * @param {Object} database - 数据库实例
 */
async function insertTestStocks(database) {
  try {
    console.log('📋 Inserting test stock data...');
    
    // 检查是否已经有股票数据
    const existingStocks = await database.execute('SELECT COUNT(*) as count FROM stocks');
    if (existingStocks[0].count > 0) {
      console.log('📋 Test stocks already exist, skipping...');
      
      // 即使股票数据已存在，也要检查历史数据
      await initializeStockHistory(database);
      return;
    }

    console.log(`📈 Inserting ${testStocks.length} test stocks...`);

    for (const stock of testStocks) {
      const insertQuery = `
        INSERT INTO stocks (symbol, name, sector, industry, description)
        VALUES (?, ?, ?, ?, ?)
      `;
      
      await database.execute(insertQuery, [
        stock.symbol,
        stock.name,
        stock.sector,
        stock.industry,
        stock.description
      ]);
      
      console.log(`  ✅ ${stock.symbol} - ${stock.name}`);
    }

    console.log('✅ Test stock data inserted successfully');
    
    // 插入股票数据后，初始化历史数据
    await initializeStockHistory(database);
  } catch (error) {
    console.error('❌ Error inserting test stock data:', error);
    throw error;
  }
}

/**
 * 初始化股票历史数据
 * 检查并获取2020-01-01到2025-01-01的历史数据
 * @param {Object} database - 数据库实例
 */
async function initializeStockHistory(database) {
  try {
    console.log('\n🔄 初始化股票历史数据...');
    
    // 延迟加载服务，避免循环依赖
    const stockHistoryService = require('../services/stockHistoryService');
    
    // 提取所有股票代码
    const symbols = testStocks.map(stock => stock.symbol);
    const startDate = '2020-01-01';
    const endDate = '2025-01-01';
    
    console.log(`📊 检查 ${symbols.length} 个股票的历史数据 (${startDate} 到 ${endDate})`);
    console.log(`🔍 股票列表: ${symbols.join(', ')}`);
    
    // 检查每个股票是否需要获取历史数据
    const stocksNeedingData = [];
    
    for (const symbol of symbols) {
      const hasData = await stockHistoryService.checkHistoryDataExists(symbol, startDate, endDate);
      if (!hasData) {
        stocksNeedingData.push(symbol);
      }
    }
    
    if (stocksNeedingData.length === 0) {
      console.log('✅ 所有股票的历史数据都已存在，无需获取');
      return;
    }
    
    console.log(`🌐 需要获取历史数据的股票: ${stocksNeedingData.join(', ')}`);
    console.log(`⚠️  注意: 这个过程可能需要几分钟时间，请耐心等待...`);
    
    // 批量获取历史数据
    const results = await stockHistoryService.batchFetchStockHistory(
      stocksNeedingData, 
      startDate, 
      endDate
    );
    
    console.log('\n📈 历史数据初始化完成');
    console.log(`✅ 成功获取: ${results.success} 个股票`);
    console.log(`❌ 获取失败: ${results.failed} 个股票`);
    console.log(`⏭️  已存在跳过: ${results.skipped} 个股票`);
    
    if (results.failed > 0) {
      console.log('\n❌ 失败的股票详情:');
      results.details
        .filter(detail => detail.status === 'failed' || detail.status === 'error')
        .forEach(detail => {
          console.log(`  - ${detail.symbol}: ${detail.message}`);
        });
    }
    
    return results;
  } catch (error) {
    console.error('❌ 初始化股票历史数据失败:', error);
    
    // 不抛出错误，允许应用继续启动
    console.log('⚠️  历史数据初始化失败，但应用将继续启动');
    console.log('💡 你可以稍后手动调用API获取历史数据');
  }
}

module.exports = {
  insertTestStocks,
  testStocks,
  initializeStockHistory
};
