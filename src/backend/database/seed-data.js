/**
 * 数据库种子数据模块
 * 用于插入测试用的股票数据
 */

// 测试股票数据
let testStocks = [
  // {
  //   symbol: 'AAPL',
  //   name: 'Apple Inc.',
  //   sector: 'Technology',
  //   industry: 'Consumer Electronics',
  //   description: 'Apple Inc. designs, manufactures, and markets smartphones, personal computers, tablets, wearables, and accessories worldwide.',
  //   cik: '0000320193',
  //   exchange: 'NASDAQ',
  //   currency: 'USD',
  //   country: 'USA',
  //   address: 'One Apple Park Way, Cupertino, CA 95014, United States',
  //   officialSite: 'https://www.apple.com',
  //   marketCapitalization: '3000000000000',
  //   ebitda: '120000000000',
  //   peRatio: '28.5',
  //   pegRatio: '2.1',
  //   bookValue: '4.25'
  // },
  {
    symbol: 'GOOGL',
    name: 'Alphabet Inc.',
    sector: 'Technology',
    industry: 'Internet Content & Information',
    description: 'Alphabet Inc. provides online advertising services in the United States, Europe, the Middle East, Africa, the Asia-Pacific, Canada, and Latin America.',
    cik: '0001652044',
    exchange: 'NASDAQ',
    currency: 'USD',
    country: 'USA',
    address: '1600 Amphitheatre Parkway, Mountain View, CA 94043, United States',
    officialSite: 'https://www.alphabet.com',
    marketCapitalization: '1700000000000',
    ebitda: '80000000000',
    peRatio: '24.2',
    pegRatio: '1.8',
    bookValue: '88.50'
  },
  {
    symbol: 'MSFT',
    name: 'Microsoft Corporation',
    sector: 'Technology',
    industry: 'Software—Infrastructure',
    description: 'Microsoft Corporation develops, licenses, and supports software, services, devices, and solutions worldwide.',
    cik: '0000789019',
    exchange: 'NASDAQ',
    currency: 'USD',
    country: 'USA',
    address: 'One Microsoft Way, Redmond, WA 98052, United States',
    officialSite: 'https://www.microsoft.com',
    marketCapitalization: '2800000000000',
    ebitda: '110000000000',
    peRatio: '32.1',
    pegRatio: '2.3',
    bookValue: '12.80'
  },
  {
    symbol: 'TSLA',
    name: 'Tesla Inc.',
    sector: 'Consumer Cyclical',
    industry: 'Auto Manufacturers',
    description: 'Tesla, Inc. designs, develops, manufactures, leases, and sells electric vehicles, and energy generation and storage systems in the United States, China, and internationally.',
    cik: '0001318605',
    exchange: 'NASDAQ',
    currency: 'USD',
    country: 'USA',
    address: '1 Tesla Road, Austin, TX 78725, United States',
    officialSite: 'https://www.tesla.com',
    marketCapitalization: '800000000000',
    ebitda: '15000000000',
    peRatio: '75.5',
    pegRatio: '3.8',
    bookValue: '15.20'
  },
  {
    symbol: 'AMZN',
    name: 'Amazon.com Inc.',
    sector: 'Consumer Cyclical',
    industry: 'Internet Retail',
    description: 'Amazon.com, Inc. engages in the retail sale of consumer products and subscriptions in North America and internationally.',
    cik: '0001018724',
    exchange: 'NASDAQ',
    currency: 'USD',
    country: 'USA',
    address: '410 Terry Avenue North, Seattle, WA 98109, United States',
    officialSite: 'https://www.amazon.com',
    marketCapitalization: '1500000000000',
    ebitda: '65000000000',
    peRatio: '48.2',
    pegRatio: '2.9',
    bookValue: '18.90'
  },
  {
    symbol: 'NVDA',
    name: 'NVIDIA Corporation',
    sector: 'Technology',
    industry: 'Semiconductors',
    description: 'NVIDIA Corporation operates as a computing company in the United States, Taiwan, China, Hong Kong, and internationally.',
    cik: '0001045810',
    exchange: 'NASDAQ',
    currency: 'USD',
    country: 'USA',
    address: '2788 San Tomas Expressway, Santa Clara, CA 95051, United States',
    officialSite: 'https://www.nvidia.com',
    marketCapitalization: '1800000000000',
    ebitda: '25000000000',
    peRatio: '65.3',
    pegRatio: '1.5',
    bookValue: '26.12'
  },
  {
    symbol: 'META',
    name: 'Meta Platforms Inc.',
    sector: 'Communication Services',
    industry: 'Internet Content & Information',
    description: 'Meta Platforms, Inc. develops products that enable people to connect and share with friends and family through mobile devices, personal computers, virtual reality headsets, and wearables worldwide.',
    cik: '0001326801',
    exchange: 'NASDAQ',
    currency: 'USD',
    country: 'USA',
    address: '1 Meta Way, Menlo Park, CA 94025, United States',
    officialSite: 'https://www.meta.com',
    marketCapitalization: '900000000000',
    ebitda: '55000000000',
    peRatio: '22.8',
    pegRatio: '1.2',
    bookValue: '42.35'
  },
  {
    symbol: 'NFLX',
    name: 'Netflix Inc.',
    sector: 'Communication Services',
    industry: 'Entertainment',
    description: 'Netflix, Inc. provides entertainment services. It offers TV series, documentaries, feature films, and mobile games across a wide variety of genres and languages to members in over 190 countries.',
    cik: '0001065280',
    exchange: 'NASDAQ',
    currency: 'USD',
    country: 'USA',
    address: '100 Winchester Circle, Los Gatos, CA 95032, United States',
    officialSite: 'https://www.netflix.com',
    marketCapitalization: '200000000000',
    ebitda: '8000000000',
    peRatio: '45.6',
    pegRatio: '2.4',
    bookValue: '15.67'
  }
];

/**
 * 插入测试股票数据
 * @param {Object} database - 数据库实例
 */
async function insertTestStocks(database) {
  try {
    console.log('📋 Inserting test stock data...');
    // 仅插入前三个测试股票
    testStocks = testStocks.slice(0, 2);
    // 检查是否已经有股票数据
    const existingStocks = await database.execute('SELECT COUNT(*) as count FROM stocks');
    if (existingStocks[0].count > 0) {
      console.log('📋 Test stocks already exist, skipping...');

      // 即使股票数据已存在，也要检查历史数据
      // await initializeStockHistory(database);
      return;
    }

    console.log(`📈 Inserting ${testStocks.length} test stocks...`);

// Example seed for portfolio table
const seedPortfolio = async (db) => {
  await db.query(`INSERT INTO portfolio (symbol, value, return) VALUES
    ('AAPL', 42000, 8200),
    ('TSLA', 30000, 6500),
    ('NVDA', 24000, 5900),
    ('BABA', 12000, -4100),
    ('JD', 12000, -2900)
  `);
};

// Example seed for portfolio_history table
const seedPortfolioHistory = async (db) => {
  await db.query(`INSERT INTO portfolio_history (date, value) VALUES
    ('2025-07-21', 118000),
    ('2025-07-22', 119000),
    ('2025-07-23', 119500),
    ('2025-07-24', 120000)
  `);
};

module.exports = async function(db) {
  // ...existing code...
  await seedPortfolio(db);
  await seedPortfolioHistory(db);
};
    for (const stock of testStocks) {
      const insertQuery = `
        INSERT INTO stocks (symbol, name, sector, industry, description, cik, exchange, currency, country, address, officialSite, marketCapitalization, ebitda, peRatio, pegRatio, bookValue)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;

      await database.execute(insertQuery, [
        stock.symbol,
        stock.name,
        stock.sector,
        stock.industry,
        stock.description,
        stock.cik,
        stock.exchange,
        stock.currency,
        stock.country,
        stock.address,
        stock.officialSite,
        stock.marketCapitalization,
        stock.ebitda,
        stock.peRatio,
        stock.pegRatio,
        stock.bookValue
      ]);

      console.log(`  ✅ ${stock.symbol} - ${stock.name}`);
    }

    console.log('✅ Test stock data inserted successfully');

    // 插入股票数据后，初始化历史数据
    // await initializeStockHistory(database);
  } catch (error) {
    console.error('❌ Error inserting test stock data:', error);
    throw error;
  }
}

// 新增：插入一组总值为100万的测试投资组合及相关数据
async function insertTestPortfolio(database) {
  // 检查是否已存在该测试用户
  const [user] = await database.execute("SELECT * FROM users WHERE username = ?", ["jason_test"]);
  let userId;
  if (!user) {
    const result = await database.execute("INSERT INTO users (username, password, email) VALUES (?, ?, ?)", ["jason_test", "testpass", "jason_test@example.com"]);
    userId = result.insertId;
  } else {
    userId = user.id;
  }

  // 检查是否已存在投资组合
  const [portfolio] = await database.execute("SELECT * FROM portfolios WHERE user_id = ?", [userId]);
  let portfolioId;
  if (!portfolio) {
    const result = await database.execute("INSERT INTO portfolios (user_id, cash_balance, total_value, total_cost, total_return, total_return_percent) VALUES (?, ?, ?, ?, ?, ?)", [userId, 100000, 1000000, 900000, 100000, 11.11]);
    portfolioId = result.insertId;
  } else {
    portfolioId = portfolio.id;
  }

  // 插入持仓（分配资产）
  const positions = [
    { symbol: 'AAPL', shares: 2000, avg_cost: 150, total_cost: 300000, current_price: 180, current_value: 360000 },
    { symbol: 'TSLA', shares: 1000, avg_cost: 200, total_cost: 200000, current_price: 250, current_value: 250000 },
    { symbol: 'NVDA', shares: 500, avg_cost: 800, total_cost: 400000, current_price: 900, current_value: 450000 }
  ];
  for (const pos of positions) {
    // 检查是否已存在该持仓
    const [exist] = await database.execute("SELECT * FROM positions WHERE portfolio_id = ? AND symbol = ?", [portfolioId, pos.symbol]);
    if (!exist) {
      await database.execute(
        `INSERT INTO positions (portfolio_id, symbol, shares, avg_cost, total_cost, current_price, current_value, unrealized_gain, unrealized_gain_percent) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [portfolioId, pos.symbol, pos.shares, pos.avg_cost, pos.total_cost, pos.current_price, pos.current_value, pos.current_value - pos.total_cost, ((pos.current_value - pos.total_cost) / pos.total_cost * 100).toFixed(2)]
      );
    }
  }

  // 插入投资组合历史（近4天）
  const today = new Date();
  for (let i = 3; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    const dateStr = date.toISOString().slice(0, 10);
    await database.execute(
      `INSERT IGNORE INTO portfolio_history (portfolio_id, date, total_value, cash_balance, unrealized_gain) VALUES (?, ?, ?, ?, ?)`,
      [portfolioId, dateStr, 1000000 - i * 10000, 100000, 100000 - i * 5000]
    );
  }
  console.log('✅ Test portfolio (100w) and positions inserted');
}
/**
 * 初始化股票历史数据
 * 检查并获取2020-01-01到2025-01-01的历史数据
 * @param {Object} database - 数据库实例
 */
async function initializeStockHistory(database) {
  try {
    return;
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
  insertTestPortfolio,
  initializeStockHistory
};
