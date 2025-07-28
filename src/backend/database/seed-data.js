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
    price: 175.25,
    previous_price: 173.50,
    change_amount: 1.75,
    change_percent: 1.01,
    volume: 45000000,
    market_cap: 2800000000000
  },
  {
    symbol: 'GOOGL',
    name: 'Alphabet Inc.',
    sector: 'Technology',
    price: 138.75,
    previous_price: 140.20,
    change_amount: -1.45,
    change_percent: -1.03,
    volume: 28000000,
    market_cap: 1750000000000
  },
  {
    symbol: 'MSFT',
    name: 'Microsoft Corporation',
    sector: 'Technology',
    price: 415.80,
    previous_price: 412.30,
    change_amount: 3.50,
    change_percent: 0.85,
    volume: 22000000,
    market_cap: 3100000000000
  },
  {
    symbol: 'TSLA',
    name: 'Tesla Inc.',
    sector: 'Automotive',
    price: 248.50,
    previous_price: 255.75,
    change_amount: -7.25,
    change_percent: -2.83,
    volume: 75000000,
    market_cap: 790000000000
  },
  {
    symbol: 'AMZN',
    name: 'Amazon.com Inc.',
    sector: 'E-commerce',
    price: 145.60,
    previous_price: 143.20,
    change_amount: 2.40,
    change_percent: 1.68,
    volume: 35000000,
    market_cap: 1500000000000
  },
  {
    symbol: 'NVDA',
    name: 'NVIDIA Corporation',
    sector: 'Technology',
    price: 892.50,
    previous_price: 885.20,
    change_amount: 7.30,
    change_percent: 0.82,
    volume: 18000000,
    market_cap: 2200000000000
  },
  {
    symbol: 'META',
    name: 'Meta Platforms Inc.',
    sector: 'Technology',
    price: 325.40,
    previous_price: 330.15,
    change_amount: -4.75,
    change_percent: -1.44,
    volume: 14000000,
    market_cap: 825000000000
  },
  {
    symbol: 'NFLX',
    name: 'Netflix Inc.',
    sector: 'Entertainment',
    price: 487.30,
    previous_price: 480.90,
    change_amount: 6.40,
    change_percent: 1.33,
    volume: 3200000,
    market_cap: 210000000000
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
        INSERT INTO stocks (symbol, name, sector, price, previous_price, change_amount, change_percent, volume, market_cap)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;
      
      await database.execute(insertQuery, [
        stock.symbol,
        stock.name,
        stock.sector,
        stock.price,
        stock.previous_price,
        stock.change_amount,
        stock.change_percent,
        stock.volume,
        stock.market_cap
      ]);
      
      console.log(`  ✅ ${stock.symbol} - ${stock.name}`);
    }

    console.log('✅ Test stock data inserted successfully');
  } catch (error) {
    console.error('❌ Error inserting test stock data:', error);
    throw error;
  }
}

module.exports = {
  insertTestStocks,
  testStocks
};
