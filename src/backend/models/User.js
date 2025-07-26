// 用户数据模型

class User {
  constructor(data = {}) {
    this.id = data.id;
    this.username = data.username;
    this.email = data.email;
    this.balance = data.balance || 10000;
    this.currentDate = data.current_date || data.currentDate;
    this.createdAt = data.created_at || data.createdAt || new Date().toISOString();
    this.updatedAt = data.updated_at || data.updatedAt || new Date().toISOString();
  }

  // 设置数据库连接 (类似 MyBatis 的 SqlSession)
  static setDatabase(db) {
    User.db = db;
  }

  // ========== 类似 MyBatis 的查询方法 ==========
  
  // 根据 ID 查询用户 (类似 MyBatis 的 selectById)
  static async findById(id) {
    if (!User.db) throw new Error('Database not configured');
    
    const query = 'SELECT * FROM users WHERE id = ?';
    const result = await User.db.execute(query, [id]);
    
    return result[0] ? new User(result[0]) : null;
  }

  // 根据用户名查询 (类似 MyBatis 的 selectByExample)
  static async findByUsername(username) {
    if (!User.db) throw new Error('Database not configured');
    
    const query = 'SELECT * FROM users WHERE username = ?';
    const result = await User.db.execute(query, [username]);
    
    return result[0] ? new User(result[0]) : null;
  }

  // 根据条件查询多个用户 (类似 MyBatis 的 selectList)
  static async findWhere(conditions = {}) {
    if (!User.db) throw new Error('Database not configured');
    
    let query = 'SELECT * FROM users WHERE 1=1';
    const params = [];
    
    if (conditions.email) {
      query += ' AND email = ?';
      params.push(conditions.email);
    }
    
    if (conditions.balanceGreaterThan) {
      query += ' AND balance > ?';
      params.push(conditions.balanceGreaterThan);
    }
    
    const result = await User.db.execute(query, params);
    return result.map(userData => new User(userData));
  }

  // 查询所有用户 (类似 MyBatis 的 selectAll)
  static async findAll() {
    if (!User.db) throw new Error('Database not configured');
    
    const query = 'SELECT * FROM users ORDER BY created_at DESC';
    const result = await User.db.execute(query);
    
    return result.map(userData => new User(userData));
  }

  // ========== 类似 MyBatis 的插入/更新方法 ==========
  
  // 保存用户 (新增或更新，类似 MyBatis 的 insertOrUpdate)
  async save(password) {
    if (!User.db) throw new Error('Database not configured');
    
    if (this.id) {
      return await this.update();
    } else {
      return await this.insert(password);
    }
  }

  // 插入新用户 (类似 MyBatis 的 insert)
  async insert(password) {
    if (!User.db) throw new Error('Database not configured');
    if (!password) throw new Error('Password is required for new user');
    
    // 验证数据
    const validation = User.validate(this);
    if (!validation.isValid) {
      throw new Error(validation.errors.join(', '));
    }

    // 检查用户名是否已存在
    const existingUser = await User.findByUsername(this.username);
    if (existingUser) {
      throw new Error('Username already exists');
    }

    // 加密密码
    const bcrypt = require('bcrypt');
    const hashedPassword = await bcrypt.hash(password, 10);

    const query = `
      INSERT INTO users (username, password, email, balance, current_date, created_at, updated_at) 
      VALUES (?, ?, ?, ?, ?, NOW(), NOW())
    `;
    
    const currentDate = new Date().toISOString().slice(0, 10);
    const result = await User.db.execute(query, [
      this.username,
      hashedPassword,
      this.email,
      this.balance,
      currentDate
    ]);

    this.id = result.insertId;
    return this;
  }

  // 更新用户 (类似 MyBatis 的 updateById)
  async update() {
    if (!User.db) throw new Error('Database not configured');
    if (!this.id) throw new Error('Cannot update user without ID');

    const query = `
      UPDATE users 
      SET username = ?, email = ?, balance = ?, updated_at = NOW() 
      WHERE id = ?
    `;
    
    await User.db.execute(query, [
      this.username,
      this.email,
      this.balance,
      this.id
    ]);

    return this;
  }

  // 删除用户 (类似 MyBatis 的 deleteById)
  async delete() {
    if (!User.db) throw new Error('Database not configured');
    if (!this.id) throw new Error('Cannot delete user without ID');

    const query = 'DELETE FROM users WHERE id = ?';
    const result = await User.db.execute(query, [this.id]);
    
    return result.affectedRows > 0;
  }

  // 批量删除 (类似 MyBatis 的 deleteBatch)
  static async deleteWhere(conditions = {}) {
    if (!User.db) throw new Error('Database not configured');
    
    let query = 'DELETE FROM users WHERE 1=1';
    const params = [];
    
    if (conditions.balanceLessThan) {
      query += ' AND balance < ?';
      params.push(conditions.balanceLessThan);
    }
    
    const result = await User.db.execute(query, params);
    return result.affectedRows;
  }

  // 验证用户数据
  static validate(userData) {
    const errors = [];

    if (!userData.username || typeof userData.username !== 'string') {
      errors.push('Username is required and must be a string');
    } else if (userData.username.length < 3 || userData.username.length > 20) {
      errors.push('Username must be between 3 and 20 characters');
    } else if (!/^[a-zA-Z0-9_]+$/.test(userData.username)) {
      errors.push('Username can only contain letters, numbers, and underscores');
    }

    if (!userData.email || typeof userData.email !== 'string') {
      errors.push('Email is required and must be a string');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userData.email)) {
      errors.push('Invalid email format');
    }

    if (userData.balance !== undefined) {
      if (typeof userData.balance !== 'number' || userData.balance < 0) {
        errors.push('Balance must be a non-negative number');
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // 转换为安全的公开对象（不包含敏感信息）
  toPublic() {
    return {
      id: this.id,
      username: this.username,
      email: this.email,
      balance: this.balance,
      createdAt: this.createdAt
    };
  }

  // 更新用户信息
  update(updateData) {
    if (updateData.email) this.email = updateData.email;
    if (updateData.balance !== undefined) this.balance = updateData.balance;
    this.updatedAt = new Date().toISOString();
  }
}

module.exports = User;
