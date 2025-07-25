// 交易和投资组合数据模型

class Transaction {
  constructor(data) {
    this.id = data.id;
    this.userId = data.userId;
    this.portfolioId = data.portfolioId;
    this.type = data.type.toUpperCase(); // 'BUY' or 'SELL'
    this.symbol = data.symbol.toUpperCase();
    this.shares = parseInt(data.shares);
    this.price = parseFloat(data.price);
    this.total = parseFloat(data.total || this.shares * this.price);
    this.timestamp = data.timestamp || new Date().toISOString();
  }

  // 验证交易数据
  static validate(transactionData) {
    const errors = [];

    if (!transactionData.userId) {
      errors.push('User ID is required');
    }

    if (!transactionData.type || !['BUY', 'SELL'].includes(transactionData.type.toUpperCase())) {
      errors.push('Transaction type must be BUY or SELL');
    }

    if (!transactionData.symbol || typeof transactionData.symbol !== 'string') {
      errors.push('Stock symbol is required');
    }

    if (!transactionData.shares || parseInt(transactionData.shares) <= 0) {
      errors.push('Shares must be a positive integer');
    }

    if (!transactionData.price || parseFloat(transactionData.price) <= 0) {
      errors.push('Price must be a positive number');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // 计算交易手续费（可扩展）
  calculateFees() {
    // 简化版本，实际可能根据交易金额、股数等计算
    return 0;
  }

  // 转换为 JSON 对象
  toJSON() {
    return {
      id: this.id,
      userId: this.userId,
      portfolioId: this.portfolioId,
      type: this.type,
      symbol: this.symbol,
      shares: this.shares,
      price: this.price,
      total: this.total,
      timestamp: this.timestamp,
      fees: this.calculateFees()
    };
  }
}

class Position {
  constructor(data) {
    this.id = data.id;
    this.portfolioId = data.portfolioId;
    this.symbol = data.symbol.toUpperCase();
    this.shares = parseInt(data.shares);
    this.avgCost = parseFloat(data.avgCost);
    this.currentPrice = parseFloat(data.currentPrice || data.avgCost);
    this.totalCost = parseFloat(data.totalCost || this.shares * this.avgCost);
    this.currentValue = parseFloat(data.currentValue || this.shares * this.currentPrice);
    this.unrealizedGain = this.currentValue - this.totalCost;
    this.unrealizedGainPercent = this.totalCost > 0 ? (this.unrealizedGain / this.totalCost) * 100 : 0;
  }

  // 更新当前价格
  updatePrice(newPrice) {
    this.currentPrice = parseFloat(newPrice);
    this.currentValue = this.shares * this.currentPrice;
    this.unrealizedGain = this.currentValue - this.totalCost;
    this.unrealizedGainPercent = this.totalCost > 0 ? (this.unrealizedGain / this.totalCost) * 100 : 0;
  }

  // 添加股票（买入）
  addShares(shares, price) {
    const newShares = this.shares + parseInt(shares);
    const newTotalCost = this.totalCost + (parseInt(shares) * parseFloat(price));
    
    this.avgCost = newTotalCost / newShares;
    this.shares = newShares;
    this.totalCost = newTotalCost;
    this.currentValue = this.shares * this.currentPrice;
    this.updateGains();
  }

  // 减少股票（卖出）
  removeShares(shares) {
    const sharesToRemove = parseInt(shares);
    if (sharesToRemove > this.shares) {
      throw new Error('Cannot sell more shares than owned');
    }

    this.shares -= sharesToRemove;
    this.totalCost = this.shares * this.avgCost;
    this.currentValue = this.shares * this.currentPrice;
    this.updateGains();
  }

  // 更新收益计算
  updateGains() {
    this.unrealizedGain = this.currentValue - this.totalCost;
    this.unrealizedGainPercent = this.totalCost > 0 ? (this.unrealizedGain / this.totalCost) * 100 : 0;
  }

  // 获取格式化数据
  getFormatted() {
    return {
      totalCost: `$${this.totalCost.toFixed(2)}`,
      currentValue: `$${this.currentValue.toFixed(2)}`,
      unrealizedGain: `${this.unrealizedGain >= 0 ? '+' : ''}$${this.unrealizedGain.toFixed(2)}`,
      unrealizedGainPercent: `${this.unrealizedGainPercent >= 0 ? '+' : ''}${this.unrealizedGainPercent.toFixed(2)}%`
    };
  }

  // 转换为 JSON 对象
  toJSON() {
    return {
      id: this.id,
      portfolioId: this.portfolioId,
      symbol: this.symbol,
      shares: this.shares,
      avgCost: parseFloat(this.avgCost.toFixed(2)),
      currentPrice: parseFloat(this.currentPrice.toFixed(2)),
      totalCost: parseFloat(this.totalCost.toFixed(2)),
      currentValue: parseFloat(this.currentValue.toFixed(2)),
      unrealizedGain: parseFloat(this.unrealizedGain.toFixed(2)),
      unrealizedGainPercent: parseFloat(this.unrealizedGainPercent.toFixed(2)),
      formatted: this.getFormatted()
    };
  }
}

class Portfolio {
  constructor(data) {
    this.id = data.id;
    this.userId = data.userId;
    this.totalValue = parseFloat(data.totalValue || 0);
    this.totalCost = parseFloat(data.totalCost || 0);
    this.totalReturn = parseFloat(data.totalReturn || 0);
    this.totalReturnPercent = parseFloat(data.totalReturnPercent || 0);
    this.positions = data.positions || [];
    this.transactions = data.transactions || [];
    this.createdAt = data.createdAt || new Date().toISOString();
    this.updatedAt = data.updatedAt || new Date().toISOString();
  }

  // 重新计算投资组合价值
  recalculate() {
    this.totalCost = this.positions.reduce((sum, pos) => sum + pos.totalCost, 0);
    this.totalValue = this.positions.reduce((sum, pos) => sum + pos.currentValue, 0);
    this.totalReturn = this.totalValue - this.totalCost;
    this.totalReturnPercent = this.totalCost > 0 ? (this.totalReturn / this.totalCost) * 100 : 0;
    this.updatedAt = new Date().toISOString();
  }

  // 添加持仓
  addPosition(position) {
    this.positions.push(position);
    this.recalculate();
  }

  // 移除持仓
  removePosition(symbol) {
    this.positions = this.positions.filter(pos => pos.symbol !== symbol.toUpperCase());
    this.recalculate();
  }

  // 获取持仓
  getPosition(symbol) {
    return this.positions.find(pos => pos.symbol === symbol.toUpperCase());
  }

  // 添加交易记录
  addTransaction(transaction) {
    this.transactions.unshift(transaction); // 最新的交易在前面
  }

  // 获取投资组合统计
  getStats() {
    if (this.positions.length === 0) {
      return {
        diversity: 0,
        bestPerformer: null,
        worstPerformer: null,
        totalPositions: 0
      };
    }

    const bestPerformer = this.positions.reduce((best, pos) => 
      pos.unrealizedGainPercent > best.unrealizedGainPercent ? pos : best
    );

    const worstPerformer = this.positions.reduce((worst, pos) =>
      pos.unrealizedGainPercent < worst.unrealizedGainPercent ? pos : worst
    );

    return {
      diversity: this.positions.length,
      bestPerformer: bestPerformer.toJSON(),
      worstPerformer: worstPerformer.toJSON(),
      totalPositions: this.positions.length
    };
  }

  // 转换为 JSON 对象
  toJSON() {
    return {
      id: this.id,
      userId: this.userId,
      totalValue: parseFloat(this.totalValue.toFixed(2)),
      totalCost: parseFloat(this.totalCost.toFixed(2)),
      totalReturn: parseFloat(this.totalReturn.toFixed(2)),
      totalReturnPercent: parseFloat(this.totalReturnPercent.toFixed(2)),
      positions: this.positions.map(pos => pos.toJSON ? pos.toJSON() : pos),
      transactions: this.transactions.slice(0, 10), // 只返回最近10条交易
      stats: this.getStats(),
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }
}

module.exports = {
  Transaction,
  Position,
  Portfolio
};
