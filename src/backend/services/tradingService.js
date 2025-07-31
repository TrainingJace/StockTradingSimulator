const { getYesterdayDate } = require('../utils/dateTime');

require('../utils/dateTime');
// 交易服务实现
class TradingService {
  constructor() {
    this.db = require('../database/database');
    this.portfolioService = require('./portfolioService');
    this.authService = require('./authService');
    console.log('TradingService initialized');
  }

  // 执行买入交易
  async executeBuyOrder(userId, symbol, shares, price, simulationDate = null) {
    console.log(`Executing buy order: ${shares} shares of ${symbol} at $${price} for user ${userId}`);
    
    // 开始数据库事务
    const connection = await this.db.beginTransaction();

    try {
      // 1. 确保参数是正确的数字类型
      shares = parseInt(shares);
      price = parseFloat(price);
      
      // 2. 验证参数
      this.validateTradeParams(symbol, shares, price);

      // 3. 获取用户的模拟日期
      // const simulationDate = await this.authService.getSimulationDate(userId);
      if(simulationDate === null) {
        simulationDate = getYesterdayDate();
      }
      // 4. 检查股票是否存在
      const [stockRows] = await connection.execute(
        'SELECT * FROM stocks WHERE symbol = ?',
        [symbol]
      );

      if (stockRows.length === 0) {
        throw new Error(`Stock ${symbol} not found`);
      }

      // 5. 获取用户的投资组合
      const [portfolioRows] = await connection.execute(
        'SELECT * FROM portfolios WHERE user_id = ?',
        [userId]
      );

      if (portfolioRows.length === 0) {
        throw new Error('User portfolio not found');
      }

      const portfolio = portfolioRows[0];
      const totalCost = shares * price;

      // 6. 检查现金余额是否足够
      if (portfolio.cash_balance < totalCost) {
        throw new Error(`Insufficient cash balance. Required: $${totalCost.toFixed(2)}, Available: $${portfolio.cash_balance.toFixed(2)}`);
      }

      // 7. 更新或创建持仓
      const [existingPositions] = await connection.execute(
        'SELECT * FROM positions WHERE portfolio_id = ? AND symbol = ?',
        [portfolio.id, symbol]
      );

      if (existingPositions.length > 0) {
        // 更新现有持仓
        const position = existingPositions[0];
        
        // 确保数据库中的值也是数字类型
        const currentShares = parseFloat(position.shares) || 0;
        const currentTotalCost = parseFloat(position.total_cost) || 0;
        
        const newShares = currentShares + shares;
        const newTotalCost = currentTotalCost + totalCost;
        const newAvgCost = newTotalCost / newShares;
        const currentValue = newShares * price;
        const unrealizedGain = currentValue - newTotalCost;
        const unrealizedGainPercent = newTotalCost > 0 ? (unrealizedGain / newTotalCost) * 100 : 0;

        await connection.execute(
          `UPDATE positions SET 
           shares = ?, 
           avg_cost = ?, 
           total_cost = ?,
           current_price = ?,
           current_value = ?,
           unrealized_gain = ?,
           unrealized_gain_percent = ?,
           updated_at = ?
           WHERE id = ?`,
          [
            newShares,
            newAvgCost,
            newTotalCost,
            price,
            currentValue,
            unrealizedGain,
            unrealizedGainPercent,
            simulationDate,
            position.id
          ]
        );
      } else {
        // 创建新持仓
        await connection.execute(
          `INSERT INTO positions 
           (portfolio_id, symbol, shares, avg_cost, total_cost, current_price, current_value, unrealized_gain, unrealized_gain_percent, created_at, updated_at) 
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            portfolio.id,
            symbol,
            shares,
            price,
            totalCost,
            price,
            shares * price,
            0, // 刚买入时未实现收益为0
            0,
            simulationDate,
            simulationDate
          ]
        );
      }



      const currentCashBalance = parseFloat(portfolio.cash_balance) || 0;
      const newCashBalance = currentCashBalance - totalCost;

      // 8. 创建交易记录
      await connection.execute(
        'INSERT INTO transactions (user_id, portfolio_id, type, symbol, shares, price, total, timestamp, cash_balance) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [userId, portfolio.id, 'BUY', symbol, shares, price, totalCost, simulationDate, newCashBalance ]
      );
      // 9. 更新投资组合现金余额（在事务中完成，确保数据一致性）

      await connection.execute(
        'UPDATE portfolios SET cash_balance = ?, updated_at = ? WHERE id = ?',
        [newCashBalance, simulationDate, portfolio.id]
      );

      // 提交事务
      await connection.commit();

      // 9. 在事务提交后更新投资组合总价值（使用 portfolioService 的计算逻辑）
      try {
        await this.portfolioService.updatePortfolioTotalValue(userId);
      } catch (error) {
        console.error('Error updating portfolio total value:', error);
        // 不抛出错误，因为交易已经成功提交
      }

      // 10. 写入 portfolio_history 快照
      try {
        // 重新获取最新 portfolio 信息
        const [portfolioRows2] = await this.db.execute('SELECT * FROM portfolios WHERE user_id = ?', [userId]);
        const portfolio2 = portfolioRows2[0];
        // 计算未实现收益
        const [positions2] = await this.db.execute('SELECT * FROM positions WHERE portfolio_id = ?', [portfolio2.id]);
        let unrealizedGain = 0;
        if (Array.isArray(positions2) && positions2.length > 0) {
          unrealizedGain = positions2.reduce((sum, p) => sum + (Number(p.unrealized_gain) || 0), 0);
        }
        const unrealizedGainFormatted = Number.isFinite(unrealizedGain) ? Number(unrealizedGain).toFixed(2) : '0.00';
        const dateStr = simulationDate;
        await this.db.execute(
          `INSERT INTO portfolio_history (portfolio_id, date, total_value, cash_balance, unrealized_gain)
           VALUES (?, ?, ?, ?, ?)
           ON DUPLICATE KEY UPDATE total_value = VALUES(total_value), cash_balance = VALUES(cash_balance), unrealized_gain = VALUES(unrealized_gain)`,
          [portfolio2.id, dateStr, portfolio2.total_value, portfolio2.cash_balance, unrealizedGainFormatted]
        );
      } catch (error) {
        console.error('Error writing portfolio_history after buy:', error);
      }

      return {
        success: true,
        data: {
          type: 'BUY',
          symbol,
          shares,
          price,
          total: totalCost,
          remainingCash: newCashBalance
        }
      };

    } catch (error) {
      // 回滚事务
      await connection.rollback();
      console.error('Error executing buy order:', error);
      throw error;
    } finally {
      connection.release();
    }
  }

  // 执行卖出交易
  async executeSellOrder(userId, symbol, shares, price , simulationDate = null) {
    console.log(`Executing sell order: ${shares} shares of ${symbol} at $${price} for user ${userId}`);
    
    // 开始数据库事务
    const connection = await this.db.beginTransaction();

    try {
      // 1. 确保参数是正确的数字类型
      shares = parseInt(shares);
      price = parseFloat(price);
      
      // 2. 验证参数
      this.validateTradeParams(symbol, shares, price);

      if(simulationDate === null) {
        // simulationDate = new Date().toISOString().split('T')[0]; // 返回当前
        simulationDate = getYesterdayDate();
      }
      // 3. 获取用户的模拟日期
      // const simulationDate = await this.authService.getSimulationDate(userId);

      // 4. 获取用户的投资组合
      const [portfolioRows] = await connection.execute(
        'SELECT * FROM portfolios WHERE user_id = ?',
        [userId]
      );

      if (portfolioRows.length === 0) {
        throw new Error('User portfolio not found');
      }

      const portfolio = portfolioRows[0];

      // 5. 检查持仓是否存在且股数足够
      const [positionRows] = await connection.execute(
        'SELECT * FROM positions WHERE portfolio_id = ? AND symbol = ?',
        [portfolio.id, symbol]
      );

      if (positionRows.length === 0) {
        throw new Error(`No position found for ${symbol}`);
      }

      const position = positionRows[0];
      
      // 确保数据库中的值也是数字类型
      const currentShares = parseFloat(position.shares) || 0;
      const avgCost = parseFloat(position.avg_cost) || 0;
      const currentPrice = parseFloat(position.current_price) || 0;
      
      if (currentShares < shares) {
        throw new Error(`Insufficient shares. Available: ${currentShares}, Requested: ${shares}`);
      }

      const totalValue = shares * price;

      // 5. 更新持仓
      if (currentShares === shares) {
        // 全部卖出，删除持仓
        await connection.execute(
          'DELETE FROM positions WHERE id = ?',
          [position.id]
        );
      } else {
        // 部分卖出，更新持仓
        const remainingShares = currentShares - shares;
        const remainingCost = avgCost * remainingShares;
        const currentValue = remainingShares * currentPrice;
        const unrealizedGain = currentValue - remainingCost;
        const unrealizedGainPercent = remainingCost > 0 ? (unrealizedGain / remainingCost) * 100 : 0;

        await connection.execute(
          `UPDATE positions SET 
           shares = ?, 
           total_cost = ?,
           current_value = ?,
           unrealized_gain = ?,
           unrealized_gain_percent = ?,
           updated_at = ?
           WHERE id = ?`,
          [
            remainingShares,
            remainingCost,
            currentValue,
            unrealizedGain,
            unrealizedGainPercent,
            simulationDate,
            position.id
          ]
        );
      }


      // 7. 更新投资组合现金余额
      const currentCashBalance = parseFloat(portfolio.cash_balance) || 0;
      const newCashBalance = currentCashBalance + totalValue;
      
            // 6. 创建交易记录
      await connection.execute(
        'INSERT INTO transactions (user_id, portfolio_id, type, symbol, shares, price, total, timestamp, cash_balance) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [userId, portfolio.id, 'SELL', symbol, shares, price, totalValue, simulationDate, newCashBalance]
      );

      // 更新现金余额
      await connection.execute(
        'UPDATE portfolios SET cash_balance = ?, updated_at = ? WHERE id = ?',
        [newCashBalance, simulationDate, portfolio.id]
      );

      // 提交事务
      await connection.commit();

      // 7. 在事务提交后更新投资组合总价值
      try {
        await this.portfolioService.updatePortfolioTotalValue(userId);
      } catch (error) {
        console.error('Error updating portfolio total value:', error);
        // 不抛出错误，因为交易已经成功提交
      }

      // 8. 写入 portfolio_history 快照
      try {
        // 重新获取最新 portfolio 信息
        const [portfolioRows2] = await this.db.execute('SELECT * FROM portfolios WHERE user_id = ?', [userId]);
        const portfolio2 = portfolioRows2[0];
        // 计算未实现收益
        const [positions2] = await this.db.execute('SELECT * FROM positions WHERE portfolio_id = ?', [portfolio2.id]);
        let unrealizedGain = 0;
        if (Array.isArray(positions2) && positions2.length > 0) {
          unrealizedGain = positions2.reduce((sum, p) => sum + (Number(p.unrealized_gain) || 0), 0);
        }
        const unrealizedGainFormatted = Number.isFinite(unrealizedGain) ? Number(unrealizedGain).toFixed(2) : '0.00';
        const dateStr = simulationDate;
        await this.db.execute(
          `INSERT INTO portfolio_history (portfolio_id, date, total_value, cash_balance, unrealized_gain)
           VALUES (?, ?, ?, ?, ?)
           ON DUPLICATE KEY UPDATE total_value = VALUES(total_value), cash_balance = VALUES(cash_balance), unrealized_gain = VALUES(unrealized_gain)`,
          [portfolio2.id, dateStr, portfolio2.total_value, portfolio2.cash_balance, unrealizedGainFormatted]
        );
      } catch (error) {
        console.error('Error writing portfolio_history after sell:', error);
      }

      return {
        success: true,
        data: {
          type: 'SELL',
          symbol,
          shares,
          price,
          total: totalValue,
          remainingCash: newCashBalance
        }
      };

    } catch (error) {
      // 回滚事务
      await connection.rollback();
      console.error('Error executing sell order:', error);
      throw error;
    } finally {
      connection.release();
    }
  }

    // 获取用户交易历史
  async getUserTransactions(userId, limit = 50, offset = 0) {
    try {
      // 确保参数是正确的数字类型，处理各种边界情况
      const limitNum = Math.max(1, Math.min(1000, parseInt(limit, 10) || 50));
      const offsetNum = Math.max(0, parseInt(offset, 10) || 0);
      
      // 使用更兼容的 SQL 语法
      const query = `SELECT t.id, t.type, t.symbol, t.shares, t.price, t.total, t.timestamp, t.cash_balance
                     FROM transactions t
                     WHERE t.user_id = ?
                     ORDER BY t.id DESC
                     LIMIT ${limitNum} OFFSET ${offsetNum}`;
      
      const rows = await this.db.execute(query, [userId]);

      const mappedData = rows.map(row => ({
        id: row.id,
        type: row.type,
        symbol: row.symbol,
        shares: row.shares,
        price: parseFloat(row.price),
        total: parseFloat(row.total),
        timestamp: row.timestamp,
        cashBalance: parseFloat(row.cash_balance)
      }));

      return {
        success: true,
        data: mappedData
      };
    } catch (error) {
      console.error('Error getting user transactions:', error);
      throw error;
    }
  }

  // 获取特定股票的交易历史
  async getStockTransactions(userId, symbol, limit = 100, offset = 0) {
    try {
      // 确保参数是正确的数字类型
      const limitNum = Math.max(1, Math.min(1000, parseInt(limit, 10) || 100));
      const offsetNum = Math.max(0, parseInt(offset, 10) || 0);
      
      const query = `SELECT t.id, t.type, t.symbol, t.shares, t.price, t.total, t.timestamp
                     FROM transactions t
                     WHERE t.user_id = ? AND t.symbol = ?
                     ORDER BY t.timestamp ASC
                     LIMIT ${limitNum} OFFSET ${offsetNum}`;
      
      const rows = await this.db.execute(query, [userId, symbol]);

      const mappedData = rows.map(row => ({
        id: row.id,
        type: row.type.toLowerCase(), // 转换为小写以匹配前端期望格式
        symbol: row.symbol,
        shares: parseInt(row.shares),
        price: parseFloat(row.price),
        total: parseFloat(row.total),
        timestamp: row.timestamp,
        // 格式化为图表需要的格式
        action: row.type.toLowerCase() === 'buy' ? 'buy' : 'sell',
        date: row.timestamp
      }));

      return {
        success: true,
        data: mappedData
      };
    } catch (error) {
      console.error('Error getting stock transactions:', error);
      throw error;
    }
  }

  // 计算交易费用（如果需要）
  calculateTradingFee(amount) {
    // TODO: 实现交易费用计算逻辑
    // 目前返回0，可以后续添加费用结构
    return 0;
  }

  // 验证交易参数
  validateTradeParams(symbol, shares, price) {
    if (!symbol || typeof symbol !== 'string') {
      throw new Error('Invalid symbol');
    }
    if (!shares || shares <= 0 || !Number.isInteger(shares)) {
      throw new Error('Invalid shares quantity');
    }
    if (!price || price <= 0 || !Number.isFinite(price)) {
      throw new Error('Invalid price');
    }
    return true;
  }
}

module.exports = new TradingService();
