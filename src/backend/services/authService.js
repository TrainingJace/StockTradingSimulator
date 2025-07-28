const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const config = require('../config');

class AuthService {
  constructor() {
    this.db = require('../database/database');
    console.log('AuthService initialized');
  }

  // ========== 用户查询功能 ==========

  async getUserById(userId) {
    console.log(`Getting user by ID: ${userId}`);
    try {
      const query = 'SELECT * FROM users WHERE id = ?';
      const result = await this.db.execute(query, [userId]);
      return result[0] || null;
    } catch (error) {
      console.error('Error getting user by ID:', error);
      throw error;
    }
  }

  async getUserByUsername(username) {
    console.log(`Getting user by username: ${username}`);
    try {
      const query = 'SELECT * FROM users WHERE username = ?';
      const result = await this.db.execute(query, [username]);
      return result[0] || null;
    } catch (error) {
      console.error('Error getting user by username:', error);
      throw error;
    }
  }

  async getAllUsers() {
    console.log('Getting all users');
    try {
      const query = 'SELECT id, username, email, signup_date, simulation_date FROM users';
      const result = await this.db.execute(query);
      return result;
    } catch (error) {
      console.error('Error getting all users:', error);
      throw error;
    }
  }

  // ========== 模拟日期管理 ==========

  async getSimulationDate(userId) {
    try {
      const query = 'SELECT simulation_date FROM users WHERE id = ?';
      const result = await this.db.execute(query, [userId]);
      const user = result[0];
      
      if (!user) {
        throw new Error('User not found');
      }
      
      // MySQL会返回统一格式的日期，不需要额外处理
      const simulationDate = user.simulation_date || new Date().toISOString().split('T')[0];
      console.log('Retrieved simulation_date:', simulationDate);
      return simulationDate;
    } catch (error) {
      console.error('Error getting simulation date:', error);
      throw error;
    }
  }

  // ========== Token 管理 ==========

  async createUser(userData) {
    const { username, password, email } = userData;
    console.log('Creating user:', { username, email });

    try {
      // 检查用户名是否已存在
      const existingUser = await this.getUserByUsername(username);
      if (existingUser) {
        throw new Error('Username already exists');
      }

      // 检查邮箱是否已存在
      if (email) {
        const existingEmail = await this.db.execute('SELECT * FROM users WHERE email = ?', [email]);
        if (existingEmail && existingEmail.length > 0) {
          throw new Error('Email already exists');
        }
      }

      // 加密密码
      const hashedPassword = await bcrypt.hash(password, 10);
      
      // 使用配置的simulation_date，MySQL会统一处理时区
      const simulation_date = config.auth.simulation_date || new Date().toISOString().split('T')[0];
      console.log('Creating user with simulation_date:', simulation_date);
    
     
      const insertQuery = `
        INSERT INTO users (username, password, email, simulation_date, created_at, updated_at) 
        VALUES (?, ?, ?, ?, NOW(), NOW())
      `;


      const result = await this.db.execute(insertQuery, [
        username, 
        hashedPassword, 
        email, 
        simulation_date
      ]);

      const userId = result.insertId;

      // 创建用户的初始投资组合
      const portfolioService = require('./portfolioService');
      await portfolioService.createPortfolio(userId, 10000);

      // 返回创建的用户（不包含密码）
      const newUser = await this.getUserById(userId);
      const { password: _, ...userWithoutPassword } = newUser;
      return userWithoutPassword;
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }

  // ========== 用户更新功能 ==========

  async updateUserBalance(userId, newBalance) {
    console.log(`Updating balance for user ${userId}: ${newBalance}`);
    try {
      // Note: Balance is now stored in portfolios table, not users table
      // This method should be moved to portfolioService or updated to work with portfolios
      const query = 'UPDATE portfolios SET cash_balance = ?, updated_at = NOW() WHERE user_id = ?';
      await this.db.execute(query, [newBalance, userId]);
      
      // 返回更新后的用户
      return await this.getUserById(userId);
    } catch (error) {
      console.error('Error updating user balance:', error);
      throw error;
    }
  }

  async updateCurrentDate(userId, newDate) {
    console.log(`Updating simulation date for user ${userId}: ${newDate}`);
    try {
      // 使用指定的日期更新
      const query = 'UPDATE users SET simulation_date = ?, updated_at = NOW() WHERE id = ?';
      await this.db.execute(query, [newDate, userId]);
      
      // 返回更新后的用户
      return await this.getUserById(userId);
    } catch (error) {
      console.error('Error updating user simulation date:', error);
      throw error;
    }
  }

  async advanceSimulationDate(userId) {
    console.log(`Advancing simulation date for user ${userId}`);
    try {
      // 获取当前用户的simulation_date
      const currentUser = await this.getUserById(userId);
      if (!currentUser) {
        throw new Error('User not found');
      }

      let currentDate = new Date(currentUser.simulation_date);
      let nextDate;
      let attempts = 0;
      const maxAttempts = 10; // 最多尝试10天，避免无限循环

      do {
        // 将日期推进一天
        currentDate.setDate(currentDate.getDate() + 1);
        nextDate = currentDate.toISOString().split('T')[0]; // 格式化为 YYYY-MM-DD
        attempts++;

        // 检查这个日期是否在stock_history中存在
        const checkQuery = `
          SELECT COUNT(*) as count 
          FROM stock_history 
          WHERE date = ? 
          LIMIT 1
        `;
        const result = await this.db.execute(checkQuery, [nextDate]);
        const hasData = result[0].count > 0;

        console.log(`Checking date ${nextDate}: ${hasData ? 'has data' : 'no data'} (attempt ${attempts})`);

        if (hasData) {
          // 找到有数据的日期，更新用户的simulation_date
          const updateQuery = 'UPDATE users SET simulation_date = ?, updated_at = NOW() WHERE id = ?';
          await this.db.execute(updateQuery, [nextDate, userId]);
          
          console.log(`✅ Advanced simulation date to ${nextDate} for user ${userId}`);
          break;
        }

        if (attempts >= maxAttempts) {
          console.warn(`⚠️ Reached max attempts (${maxAttempts}) when advancing date for user ${userId}`);
          // 即使没有数据也更新到最后尝试的日期
          const updateQuery = 'UPDATE users SET simulation_date = ?, updated_at = NOW() WHERE id = ?';
          await this.db.execute(updateQuery, [nextDate, userId]);
          break;
        }
      } while (attempts < maxAttempts);
      
      // 返回更新后的用户
      return await this.getUserById(userId);
    } catch (error) {
      console.error('Error advancing user simulation date:', error);
      throw error;
    }
  }

  // ========== 用户删除功能 ==========

  async deleteUser(userId) {
    console.log(`Deleting user: ${userId}`);
    try {
      const query = 'DELETE FROM users WHERE id = ?';
      const result = await this.db.execute(query, [userId]);
      
      if (result.affectedRows === 0) {
        throw new Error('User not found');
      }
      
      return { success: true, message: 'User deleted successfully' };
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
  }

  // ========== 认证功能 ==========

  async validateCredentials(username, password) {
    console.log(`Validating credentials for user: ${username}`);
    try {
      const user = await this.getUserByUsername(username);
      if (!user) {
        console.log('User not found');
        return null;
      }

      const isValid = await bcrypt.compare(password, user.password);
      if (!isValid) {
        console.log('Invalid password');
        return null;
      }

      console.log('Credentials validated successfully');
      const { password: _, ...userWithoutPassword } = user;
      return userWithoutPassword;
    } catch (error) {
      console.error('Error validating credentials:', error);
      throw error;
    }
  }

  generateToken(user) {
    console.log(`Generating token for user: ${user.username}`);
    return jwt.sign(
      { 
        userId: user.id,  // 使用 userId 而不是 id 
        username: user.username,
        email: user.email
      },
      config.auth.jwtSecret,
      { expiresIn: config.auth.tokenExpiry }
    );
  }

  verifyToken(token) {
    console.log(`Verifying token`);
    try {
      return jwt.verify(token, config.auth.jwtSecret);
    } catch (error) {
      throw new Error('Invalid token');
    }
  }
}

module.exports = new AuthService();