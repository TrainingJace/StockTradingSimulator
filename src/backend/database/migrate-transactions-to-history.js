// Script to migrate transactions data into portfolio_history table
const db = require('./database'); // Adjust path if needed

async function migrateTransactionsToPortfolioHistory() {
  // Get all unique portfolio_id and date combinations from transactions
  const rows = await db.execute(`
    SELECT portfolio_id, DATE(timestamp) as date
    FROM transactions
    GROUP BY portfolio_id, DATE(timestamp)
  `);

  for (const row of rows) {
    const { portfolio_id, date } = row;

    // Aggregate total_value: sum of BUY minus sum of SELL for the day
    const [agg] = await db.execute(`
      SELECT
        SUM(CASE WHEN type = 'BUY' THEN total ELSE 0 END) - SUM(CASE WHEN type = 'SELL' THEN total ELSE 0 END) AS total_value,
        MAX(cash_balance) as cash_balance
      FROM transactions
      WHERE portfolio_id = ? AND DATE(timestamp) = ?
    `, [portfolio_id, date]);

    // Estimate unrealized_gain as the difference between cash_balance and total_value for the day
    const unrealized_gain = (agg.cash_balance || 0) - (agg.total_value || 0);

    // Insert into portfolio_history
    await db.execute(`
      INSERT INTO portfolio_history (portfolio_id, date, total_value, cash_balance, unrealized_gain)
      VALUES (?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE total_value = VALUES(total_value), cash_balance = VALUES(cash_balance), unrealized_gain = VALUES(unrealized_gain)
    `, [portfolio_id, date, agg.total_value || 0, agg.cash_balance || 0, unrealized_gain]);
  }

  console.log('Migration complete!');
}

migrateTransactionsToPortfolioHistory().catch(console.error);
