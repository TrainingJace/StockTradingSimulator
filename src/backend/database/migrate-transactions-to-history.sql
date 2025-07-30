-- Aggregate and insert daily portfolio snapshots from transactions into portfolio_history

INSERT INTO portfolio_history (portfolio_id, date, total_value, cash_balance, unrealized_gain)
SELECT
  t.portfolio_id,
  DATE(t.timestamp) AS date,
  SUM(CASE WHEN t.type = 'BUY' THEN t.total ELSE 0 END) - SUM(CASE WHEN t.type = 'SELL' THEN t.total ELSE 0 END) AS total_value,
  MAX(t.cash_balance) AS cash_balance,
  MAX(t.cash_balance) - (SUM(CASE WHEN t.type = 'BUY' THEN t.total ELSE 0 END) - SUM(CASE WHEN t.type = 'SELL' THEN t.total ELSE 0 END)) AS unrealized_gain
FROM transactions t
GROUP BY t.portfolio_id, DATE(t.timestamp)
ON DUPLICATE KEY UPDATE
  total_value = VALUES(total_value),
  cash_balance = VALUES(cash_balance),
  unrealized_gain = VALUES(unrealized_gain);
