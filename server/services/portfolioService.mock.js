// Mock 投资组合数据
const mockPortfolios = [
  {
    id: 1,
    userId: 1,
    totalValue: 12500,
    totalCost: 10000,
    totalReturn: 2500,
    totalReturnPercent: 25.0,
    positions: [
      {
        id: 1,
        symbol: 'AAPL',
        shares: 10,
        avgCost: 150.00,
        currentPrice: 175.25,
        totalCost: 1500,
        currentValue: 1752.50,
        unrealizedGain: 252.50,
        unrealizedGainPercent: 16.83
      },
      {
        id: 2,
        symbol: 'GOOGL',
        shares: 5,
        avgCost: 140.00,
        currentPrice: 145.80,
        totalCost: 700,
        currentValue: 729.00,
        unrealizedGain: 29.00,
        unrealizedGainPercent: 4.14
      }
    ],
    transactions: [
      {
        id: 1,
        type: 'BUY',
        symbol: 'AAPL',
        shares: 10,
        price: 150.00,
        total: 1500,
        timestamp: '2024-01-01T10:00:00.000Z'
      }
    ]
  }
];

const mockTransactions = [
  {
    id: 1,
    userId: 1,
    portfolioId: 1,
    type: 'BUY',
    symbol: 'AAPL',
    shares: 10,
    price: 150.00,
    total: 1500,
    timestamp: '2024-01-01T10:00:00.000Z'
  },
  {
    id: 2,
    userId: 1,
    portfolioId: 1,
    type: 'BUY',
    symbol: 'GOOGL',
    shares: 5,
    price: 140.00,
    total: 700,
    timestamp: '2024-01-02T14:30:00.000Z'
  }
];

class PortfolioService {
  async getPortfolioByUserId(userId) {
    console.log(`[MOCK] Getting portfolio for user: ${userId}`);
    const portfolio = mockPortfolios.find(p => p.userId === parseInt(userId));
    return portfolio || null;
  }

  async createPortfolio(userId, initialBalance = 10000) {
    console.log(`[MOCK] Creating portfolio for user ${userId} with balance ${initialBalance}`);
    const newPortfolio = {
      id: mockPortfolios.length + 1,
      userId: parseInt(userId),
      totalValue: initialBalance,
      totalCost: 0,
      totalReturn: 0,
      totalReturnPercent: 0,
      positions: [],
      transactions: []
    };
    mockPortfolios.push(newPortfolio);
    return newPortfolio;
  }

  async executeTrade(userId, tradeData) {
    console.log(`[MOCK] Executing trade for user ${userId}:`, tradeData);
    const { symbol, shares, price, type } = tradeData;
    
    const portfolio = mockPortfolios.find(p => p.userId === parseInt(userId));
    if (!portfolio) {
      throw new Error('Portfolio not found');
    }

    // 创建交易记录
    const transaction = {
      id: mockTransactions.length + 1,
      userId: parseInt(userId),
      portfolioId: portfolio.id,
      type: type.toUpperCase(),
      symbol: symbol.toUpperCase(),
      shares: parseInt(shares),
      price: parseFloat(price),
      total: parseInt(shares) * parseFloat(price),
      timestamp: new Date().toISOString()
    };

    mockTransactions.push(transaction);
    portfolio.transactions.push(transaction);

    // 更新持仓
    this.updatePosition(portfolio, transaction);
    
    return transaction;
  }

  updatePosition(portfolio, transaction) {
    const { symbol, shares, price, type } = transaction;
    let position = portfolio.positions.find(p => p.symbol === symbol);

    if (type === 'BUY') {
      if (position) {
        // 更新现有持仓
        const totalShares = position.shares + shares;
        const totalCost = (position.shares * position.avgCost) + (shares * price);
        position.avgCost = totalCost / totalShares;
        position.shares = totalShares;
        position.totalCost = totalCost;
      } else {
        // 创建新持仓
        position = {
          id: portfolio.positions.length + 1,
          symbol,
          shares,
          avgCost: price,
          currentPrice: price,
          totalCost: shares * price,
          currentValue: shares * price,
          unrealizedGain: 0,
          unrealizedGainPercent: 0
        };
        portfolio.positions.push(position);
      }
    } else if (type === 'SELL') {
      if (position && position.shares >= shares) {
        position.shares -= shares;
        position.totalCost = position.shares * position.avgCost;
        
        if (position.shares === 0) {
          // 移除已清仓的持仓
          const index = portfolio.positions.indexOf(position);
          portfolio.positions.splice(index, 1);
        }
      }
    }

    // 重新计算投资组合总值
    this.recalculatePortfolio(portfolio);
  }

  recalculatePortfolio(portfolio) {
    portfolio.totalCost = portfolio.positions.reduce((sum, pos) => sum + pos.totalCost, 0);
    portfolio.totalValue = portfolio.positions.reduce((sum, pos) => sum + pos.currentValue, 0);
    portfolio.totalReturn = portfolio.totalValue - portfolio.totalCost;
    portfolio.totalReturnPercent = portfolio.totalCost > 0 
      ? (portfolio.totalReturn / portfolio.totalCost) * 100 
      : 0;
  }

  async getTransactionHistory(userId, limit = 50) {
    console.log(`[MOCK] Getting transaction history for user ${userId}, limit: ${limit}`);
    return mockTransactions
      .filter(t => t.userId === parseInt(userId))
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, limit);
  }

  async updatePortfolioValues(userId, stockPrices) {
    console.log(`[MOCK] Updating portfolio values for user ${userId}`);
    const portfolio = mockPortfolios.find(p => p.userId === parseInt(userId));
    if (!portfolio) return null;

    // 更新每个持仓的当前价格和价值
    portfolio.positions.forEach(position => {
      const currentPrice = stockPrices[position.symbol];
      if (currentPrice) {
        position.currentPrice = currentPrice;
        position.currentValue = position.shares * currentPrice;
        position.unrealizedGain = position.currentValue - position.totalCost;
        position.unrealizedGainPercent = position.totalCost > 0 
          ? (position.unrealizedGain / position.totalCost) * 100 
          : 0;
      }
    });

    this.recalculatePortfolio(portfolio);
    return portfolio;
  }
}

module.exports = new PortfolioService();
