const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const config = require('../config');

class UserService {
  constructor() {
    // 数据库连接在 database.js 中初始化
    this.db = require('../config/database');
  }

  async getUserById(userId) {
    console.log(`[REAL] Getting user by ID: ${userId}`);
    try {
      const query = 'SELECT * FROM users WHERE id = ?';
      const result = await this.db.execute(query, [userId]);
      return result[0] || null;
    } catch (error) {
      console.error('Error getting user:', error);
      throw error;
    }
  }

  async getUserByUsername(username) {
    console.log(`[REAL] Getting user by username: ${username}`);
    try {
      const query = 'SELECT * FROM users WHERE username = ?';
      const result = await this.db.execute(query, [username]);
      return result[0] || null;
    } catch (error) {
      console.error('Error getting user by username:', error);
      throw error;
    }
  }

  async createUser(userData) {
    console.log(`[REAL] Creating user:`, userData);
    try {
      // 检查用户名是否已存在
      const existingUser = await this.getUserByUsername(userData.username);
      if (existingUser) {
        throw new Error('Username already exists');
      }

      // 加密密码
      const hashedPassword = await bcrypt.hash(userData.password, 10);

      // 创建用户
      const query = `
        INSERT INTO users (username, password, email, signup_date, trial_start, simulation_date) 
        VALUES (?, ?, ?, NOW(), CURDATE(), CURDATE())
      `;
      const result = await this.db.execute(query, [
        userData.username,
        hashedPassword,
        userData.email || null
      ]);

      const newUser = {
        id: result.insertId,
        username: userData.username,
        email: userData.email || null,
        signup_date: new Date(),
        trial_start: new Date(),
        simulation_date: new Date()
      };

      // 创建用户的投资组合
      await this.createUserPortfolio(newUser.id);

      return newUser;
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }

  async createUserPortfolio(userId) {
    console.log(`[REAL] Creating portfolio for user ${userId}`);
    try {
      const query = `
        INSERT INTO portfolios (user_id, cash_balance, total_value) 
        VALUES (?, 10000.00, 10000.00)
      `;
      await this.db.execute(query, [userId]);
    } catch (error) {
      console.error('Error creating user portfolio:', error);
      throw error;
    }
  }

  async validateCredentials(username, password) {
    console.log(`[REAL] Validating credentials for: ${username}`);
    try {
      const user = await this.getUserByUsername(username);
      if (!user) {
        return null;
      }

      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        return null;
      }

      // 不返回密码
      const { password: _, ...userWithoutPassword } = user;
      return userWithoutPassword;
    } catch (error) {
      console.error('Error validating credentials:', error);
      throw error;
    }
  }

  async generateToken(user) {
    console.log(`[REAL] Generating token for user: ${user.id}`);
    try {
      const token = jwt.sign(
        { 
          userId: user.id, 
          username: user.username 
        },
        config.auth.jwtSecret,
        { expiresIn: config.auth.tokenExpiry }
      );
      return token;
    } catch (error) {
      console.error('Error generating token:', error);
      throw error;
    }
  }

  async verifyToken(token) {
    console.log(`[REAL] Verifying token`);
    try {
      const decoded = jwt.verify(token, config.auth.jwtSecret);
      const user = await this.getUserById(decoded.userId);
      if (!user) {
        throw new Error('User not found');
      }
      
      // 不返回密码
      const { password: _, ...userWithoutPassword } = user;
      return userWithoutPassword;
    } catch (error) {
      console.error('Error verifying token:', error);
      throw error;
    }
  }

  async getAllUsers() {
    console.log(`[REAL] Getting all users`);
    try {
      const query = 'SELECT id, username, email, signup_date, trial_start, simulation_date FROM users ORDER BY signup_date DESC';
      const result = await this.db.execute(query);
      return result;
    } catch (error) {
      console.error('Error getting all users:', error);
      throw error;
    }
  }
}

module.exports = new UserService();
