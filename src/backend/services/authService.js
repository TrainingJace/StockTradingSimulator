const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const config = require('../config');

/**
 * 认证和用户服务
 */
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
    console.log(`Getting all users`);
    try {
      const query = 'SELECT * FROM users';
      const result = await this.db.execute(query);
      return result;
    } catch (error) {
      console.error('Error getting all users:', error);
      throw error;
    }
  }

  // ========== 用户创建和更新功能 ==========

  async createUser(userData) {
    const { username, password, email } = userData;
    console.log(`Creating user:`, { username, email });
    
    try {
      // 检查用户名是否已存在
      const existingUser = await this.getUserByUsername(username);
      if (existingUser) {
        throw new Error('Username already exists');
      }

      // 检查邮箱是否已存在
      if (email) {
        const emailQuery = 'SELECT id FROM users WHERE email = ?';
        const emailResult = await this.db.execute(emailQuery, [email]);
        if (emailResult.length > 0) {
          throw new Error('Email already exists');
        }
      }

      // 加密密码
      const hashedPassword = await bcrypt.hash(password, 10);

      // 插入新用户
      const insertQuery = `
        INSERT INTO users (username, password, email, balance, current_date, created_at, updated_at) 
        VALUES (?, ?, ?, ?, ?, NOW(), NOW())
      `;
      const currentDate = new Date().toISOString().slice(0, 10);
      const initialBalance = 10000; // 默认余额

      const result = await this.db.execute(insertQuery, [
        username, 
        hashedPassword, 
        email, 
        initialBalance, 
        currentDate
      ]);

      // 返回创建的用户（不包含密码）
      const newUser = await this.getUserById(result.insertId);
      const { password: _, ...userWithoutPassword } = newUser;
      return userWithoutPassword;
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }

  async updateUserBalance(userId, newBalance) {
    console.log(`Updating balance for user ${userId}: ${newBalance}`);
    try {
      const query = 'UPDATE users SET balance = ?, updated_at = NOW() WHERE id = ?';
      await this.db.execute(query, [newBalance, userId]);
      
      // 返回更新后的用户
      return await this.getUserById(userId);
    } catch (error) {
      console.error('Error updating user balance:', error);
      throw error;
    }
  }

  async updateCurrentDate(userId, newDate) {
    console.log(`Updating current date for user ${userId}: ${newDate}`);
    try {
      const query = 'UPDATE users SET current_date = ?, updated_at = NOW() WHERE id = ?';
      await this.db.execute(query, [newDate, userId]);
      
      // 返回更新后的用户
      return await this.getUserById(userId);
    } catch (error) {
      console.error('Error updating current date:', error);
      throw error;
    }
  }

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
    console.log(`Validating credentials for: ${username}`);
    try {
      const user = await this.getUserByUsername(username);
      if (!user) {
        return null;
      }

      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        return null;
      }

      // 返回用户信息（不包含密码）
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
      { userId: user.id, username: user.username },
      config.auth.jwtSecret,
      { expiresIn: '24h' }
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