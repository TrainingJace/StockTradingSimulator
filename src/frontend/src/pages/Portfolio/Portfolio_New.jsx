import React, { useState } from 'react'
import { useAsyncData } from '../../hooks'
import { portfolioApi } from '../../api'
import { useAuth } from '../../hooks'
import { formatPrice, formatPercentage, getPriceChangeColor, formatDate, getErrorMessage } from '../../utils/formatters'
import './Portfolio.css'

function Portfolio() {
  const { getCurrentUserId, isAuthenticated } = useAuth()
  const userId = getCurrentUserId()
  const [activeTab, setActiveTab] = useState('holdings') // 'holdings', 'watchlist', 'transactions'

  // 使用异步数据Hook获取投资组合
  const {
    data: portfolio,
    loading,
    error,
    refetch
  } = useAsyncData(
    () => portfolioApi.getPortfolio(userId),
    [userId],
    {
      immediate: isAuthenticated() && userId,
      onError: (err) => {
        if (!isAuthenticated()) {
          return '请先登录';
        }
        return getErrorMessage(err);
      }
    }
  );

  // 模拟观察列表数据 - 后续需要从API获取
  const [watchlist, setWatchlist] = useState([
    { symbol: 'TSLA', name: 'Tesla Inc', price: 234.56, change: 12.34, changePercent: 5.56 },
    { symbol: 'NVDA', name: 'NVIDIA Corp', price: 456.78, change: -8.90, changePercent: -1.91 }
  ]);

  // 模拟交易历史数据 - 后续需要从API获取
  const [transactions, setTransactions] = useState([
    { id: 1, symbol: 'AAPL', type: 'BUY', quantity: 10, price: 150.00, date: '2024-01-15', total: 1500.00 },
    { id: 2, symbol: 'GOOGL', type: 'SELL', quantity: 5, price: 2800.00, date: '2024-01-14', total: 14000.00 }
  ]);

  if (loading) {
    return (
      <div className="portfolio">
        <div className="loading">
          <div className="loading-spinner"></div>
          <p>加载投资组合中...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="portfolio">
        <div className="error-message">
          ❌ {error}
        </div>
      </div>
    )
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case 'holdings':
        return (
          <div className="holdings-section">
            {portfolio?.holdings && portfolio.holdings.length > 0 ? (
              <div className="holdings-table">
                <div className="table-header">
                  <span>股票代码</span>
                  <span>持股数量</span>
                  <span>平均成本</span>
                  <span>当前价格</span>
                  <span>总价值</span>
                  <span>收益/损失</span>
                </div>
                {portfolio.holdings.map((holding) => (
                  <div key={holding.symbol} className="table-row">
                    <span className="stock-symbol">{holding.symbol}</span>
                    <span>{holding.quantity}</span>
                    <span>${formatPrice(holding.averageCost || 0)}</span>
                    <span>${formatPrice(holding.currentPrice || 0)}</span>
                    <span>${formatPrice((holding.quantity * holding.currentPrice) || 0)}</span>
                    <span className={`gain-loss ${(holding.totalGain || 0) >= 0 ? 'positive' : 'negative'}`}>
                      ${formatPrice(holding.totalGain || 0)}
                      ({formatPercentage(holding.gainPercent || 0)}%)
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <h3>暂无持股</h3>
                <p>您还没有购买任何股票</p>
              </div>
            )}
          </div>
        );

      case 'watchlist':
        return (
          <div className="watchlist-section">
            {watchlist.length > 0 ? (
              <div className="watchlist-table">
                <div className="table-header">
                  <span>股票代码</span>
                  <span>公司名称</span>
                  <span>当前价格</span>
                  <span>涨跌幅</span>
                  <span>操作</span>
                </div>
                {watchlist.map((stock) => (
                  <div key={stock.symbol} className="table-row">
                    <span className="stock-symbol">{stock.symbol}</span>
                    <span>{stock.name}</span>
                    <span>${formatPrice(stock.price)}</span>
                    <span className={stock.change >= 0 ? 'positive' : 'negative'}>
                      {stock.change >= 0 ? '+' : ''}${formatPrice(Math.abs(stock.change))} 
                      ({formatPercentage(stock.changePercent)}%)
                    </span>
                    <span>
                      <button 
                        className="remove-btn"
                        onClick={() => setWatchlist(prev => prev.filter(s => s.symbol !== stock.symbol))}
                      >
                        移除
                      </button>
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <h3>观察列表为空</h3>
                <p>在股票详情页面添加股票到观察列表</p>
              </div>
            )}
          </div>
        );

      case 'transactions':
        return (
          <div className="transactions-section">
            {transactions.length > 0 ? (
              <div className="transactions-table">
                <div className="table-header">
                  <span>日期</span>
                  <span>股票代码</span>
                  <span>操作</span>
                  <span>数量</span>
                  <span>价格</span>
                  <span>总金额</span>
                </div>
                {transactions.map((transaction) => (
                  <div key={transaction.id} className="table-row">
                    <span>{formatDate(transaction.date)}</span>
                    <span className="stock-symbol">{transaction.symbol}</span>
                    <span className={`transaction-type ${transaction.type.toLowerCase()}`}>
                      {transaction.type === 'BUY' ? '买入' : '卖出'}
                    </span>
                    <span>{transaction.quantity}</span>
                    <span>${formatPrice(transaction.price)}</span>
                    <span>${formatPrice(transaction.total)}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <h3>暂无交易记录</h3>
                <p>您还没有进行任何股票交易</p>
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="portfolio">
      <div className="portfolio-header">
        <h1>📊 我的投资组合</h1>
        <button onClick={refetch} className="refresh-btn">
          🔄 刷新
        </button>
      </div>

      <div className="portfolio-summary">
        <div className="summary-card">
          <h3>总资产价值</h3>
          <p className="summary-value">${portfolio?.totalValue?.toFixed(2) || '0.00'}</p>
        </div>
        <div className="summary-card">
          <h3>现金余额</h3>
          <p className="summary-value">${portfolio?.cashBalance?.toFixed(2) || '0.00'}</p>
        </div>
        <div className="summary-card">
          <h3>持股价值</h3>
          <p className="summary-value">${portfolio?.stocksValue?.toFixed(2) || '0.00'}</p>
        </div>
        <div className="summary-card">
          <h3>总收益</h3>
          <p className={`summary-value ${(portfolio?.totalGain || 0) >= 0 ? 'positive' : 'negative'}`}>
            ${portfolio?.totalGain?.toFixed(2) || '0.00'}
          </p>
        </div>
      </div>

      <div className="portfolio-tabs">
        <div className="tab-buttons">
          <button 
            className={`tab-btn ${activeTab === 'holdings' ? 'active' : ''}`}
            onClick={() => setActiveTab('holdings')}
          >
            持有股票
          </button>
          <button 
            className={`tab-btn ${activeTab === 'watchlist' ? 'active' : ''}`}
            onClick={() => setActiveTab('watchlist')}
          >
            观察列表
          </button>
          <button 
            className={`tab-btn ${activeTab === 'transactions' ? 'active' : ''}`}
            onClick={() => setActiveTab('transactions')}
          >
            交易历史
          </button>
        </div>

        <div className="tab-content">
          {renderTabContent()}
        </div>
      </div>
    </div>
  )
}

export default Portfolio
