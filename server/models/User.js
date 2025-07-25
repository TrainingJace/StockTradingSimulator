// 用户数据模型

class User {
  constructor(data) {
    this.id = data.id;
    this.username = data.username;
    this.email = data.email;
    this.balance = data.balance || 10000;
    this.createdAt = data.createdAt || new Date().toISOString();
    this.updatedAt = data.updatedAt || new Date().toISOString();
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
