/**
 * 脚本：为测试用户（用户名123456）添加假投资组合和相关数据
 * 用法：node scripts/seed-test-user.js
 */

const mysql = require('mysql2/promise');

const DB_CONFIG = {
  host: 'localhost',
  user: 'root',
  password: '123456',
  database: 'stock_simulator',
};

async function seed() {
  const connection = await mysql.createConnection(DB_CONFIG);

  // 获取用户ID
  const [userRows] = await connection.execute("SELECT id FROM users WHERE username = '123456'");
  if (!userRows.length) {
    console.error('测试用户不存在');
    process.exit(1);
  }
  const userId = userRows[0].id;

  // 添加投资组合
  const [portfolioRows] = await connection.execute('SELECT id FROM portfolios WHERE user_id = ?', [userId]);
  let portfolioId;
  if (!portfolioRows.length) {
    const [result] = await connection.execute(
      'INSERT INTO portfolios (user_id, cash_balance, total_value, total_cost, total_return, total_return_percent, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())',
      [userId, 23000, 100000, 305000, 5000, 5]
    );
    portfolioId = result.insertId;
  } else {
    portfolioId = portfolioRows[0].id;
    // 更新portfolio的total_value、cash_balance、total_cost、total_return、total_return_percent
    await connection.execute(
      'UPDATE portfolios SET cash_balance=?, total_value=?, total_cost=?, total_return=?, total_return_percent=? WHERE id=?',
      [23000, 100000, 305000, 5000, 5, portfolioId]
    );
  }

  // 添加持仓
  // 清空原有持仓，避免唯一索引冲突
  await connection.execute('DELETE FROM positions WHERE portfolio_id = ?', [portfolioId]);
  await connection.execute(
    `INSERT INTO positions (portfolio_id, symbol, shares, avg_cost, total_cost, current_price, current_value, unrealized_gain, unrealized_gain_percent) VALUES
      (?, 'AAPL', 100, 150, 15000, 155, 15500, 500, 3.33),
      (?, 'GOOG', 50, 2800, 140000, 2820, 141000, 1000, 0.71),
      (?, 'TSLA', 30, 700, 21000, 710, 21300, 300, 1.43)`,
    [portfolioId, portfolioId, portfolioId]
  );

  // 添加历史数据
  // 清空原有历史数据，避免唯一索引冲突
  await connection.execute('DELETE FROM portfolio_history WHERE portfolio_id = ?', [portfolioId]);
  await connection.execute(
    'INSERT INTO portfolio_history (portfolio_id, date, total_value, cash_balance, unrealized_gain) VALUES (?, ?, ?, ?, ?), (?, ?, ?, ?, ?), (?, ?, ?, ?, ?), (?, ?, ?, ?, ?)',
    [portfolioId, '2025-07-20', 98000, 20000, 1000,
     portfolioId, '2025-07-21', 99000, 21000, 1200,
     portfolioId, '2025-07-22', 99500, 22000, 1300,
     portfolioId, '2025-07-23', 100000, 23000, 1500]
  );

  // 添加交易记录
  await connection.execute(
    'INSERT INTO transactions (user_id, portfolio_id, symbol, type, shares, price, total, timestamp) VALUES (?, ?, ?, ?, ?, ?, ?, ?), (?, ?, ?, ?, ?, ?, ?, ?)',
    [userId, portfolioId, 'AAPL', 'BUY', 100, 150, 15000, '2025-07-20 10:00:00',
     userId, portfolioId, 'TSLA', 'SELL', 10, 720, 7200, '2025-07-22 14:00:00']
  );

  console.log('测试数据已添加');
  await connection.end();
}

seed().catch(err => {
  console.error('脚本执行失败:', err);
  process.exit(1);
});
