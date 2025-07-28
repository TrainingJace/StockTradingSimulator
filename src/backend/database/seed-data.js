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

module.exports = {
  insertTestStocks,
  testStocks,
  insertTestPortfolio
};
