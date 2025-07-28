import React, { useState } from 'react'
import { useAsyncData } from '../../hooks'
import { portfolioApi, tradingApi } from '../../api'
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
          return 'Please login first';
        }
        return getErrorMessage(err);
      }
    }
  );

  // 获取交易历史数据
  const {
    data: transactionHistory,
    loading: transactionsLoading,
    error: transactionsError,
    refetch: refetchTransactions
  } = useAsyncData(
    () => tradingApi.getTransactionHistory({ limit: 100 }),
    [userId],
    {
      immediate: isAuthenticated() && userId && activeTab === 'transactions',
      onError: (err) => {
        if (!isAuthenticated()) {
          return 'Please login first';
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

  // 处理tab切换，当切换到transactions tab时获取数据  
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (tab === 'transactions' && !transactionHistory) {
      refetchTransactions();
    }
  };

  if (loading) {
    return (
      <div className="portfolio">
        <div className="loading">
          <div className="loading-spinner"></div>
          <p>Loading portfolio...</p>
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
            {portfolio?.positions && portfolio.positions.length > 0 ? (
              <div className="holdings-table">
                <div className="table-header">
                  <span>Stock Symbol</span>
                  <span>Quantity</span>
                  <span>Average Cost</span>
                  <span>Current Price</span>
                  <span>Total Value</span>
                  <span>Gain/Loss</span>
                </div>
                {portfolio.positions.map((holding) => (
                  <div key={holding.symbol} className="table-row">
                    <span className="stock-symbol">{holding.symbol}</span>
                    <span>{holding.shares}</span>
                    <span>${formatPrice(holding.avg_cost || 0)}</span>
                    <span>${formatPrice(holding.current_price || 0)}</span>
                    <span>${formatPrice(holding.current_value || 0)}</span>
                    <span className={`gain-loss ${(holding.unrealized_gain || 0) >= 0 ? 'positive' : 'negative'}`}>
                      ${formatPrice(holding.unrealized_gain || 0)}
                      ({formatPercentage(holding.unrealized_gain_percent || 0)}%)
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <h3>No Holdings</h3>
                <p>You haven't purchased any stocks yet</p>
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
                  <span>Stock Symbol</span>
                  <span>Company Name</span>
                  <span>Current Price</span>
                  <span>Change</span>
                  <span>Action</span>
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
                        Remove
                      </button>
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <h3>Watchlist is Empty</h3>
                <p>Add stocks to your watchlist from the stock details page</p>
              </div>
            )}
          </div>
        );

      case 'transactions':
        if (transactionsLoading) {
          return (
            <div className="transactions-section">
              <div className="loading">
                <div className="loading-spinner"></div>
                <p>Loading transactions...</p>
              </div>
            </div>
          );
        }

        if (transactionsError) {
          return (
            <div className="transactions-section">
              <div className="error-message">
                ❌ {transactionsError}
                <button onClick={refetchTransactions} className="retry-btn">
                  重试
                </button>
              </div>
            </div>
          );
        }

        // transactionHistory 已经是数组了，不需要再访问 .data
        const transactions = transactionHistory || [];
        
        return (
          <div className="transactions-section">
            {transactions.length > 0 ? (
              <div className="transactions-table">
                <div className="table-header">
                  <span>Date</span>
                  <span>Stock Symbol</span>
                  <span>Stock Name</span>
                  <span>Action</span>
                  <span>Quantity</span>
                  <span>Price</span>
                  <span>Total Amount</span>
                </div>
                {transactions.map((transaction) => (
                  <div key={transaction.id} className="table-row">
                    <span>{formatDate(transaction.timestamp)}</span>
                    <span className="stock-symbol">{transaction.symbol}</span>
                    <span>{transaction.stockName || '-'}</span>
                    <span className={`transaction-type ${transaction.type.toLowerCase()}`}>
                      {transaction.type === 'BUY' ? 'Buy' : 'Sell'}
                    </span>
                    <span>{transaction.shares}</span>
                    <span>${formatPrice(transaction.price)}</span>
                    <span className={`total ${transaction.type.toLowerCase()}`}>
                      ${formatPrice(transaction.total)}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <h3>No Transaction History</h3>
                <p>You haven't made any stock transactions yet</p>
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
        <h1>📊 My Portfolio</h1>
        <button onClick={refetch} className="refresh-btn">
          🔄 Refresh
        </button>
      </div>

      <div className="portfolio-summary">
        <div className="summary-card">
          <h3>Total Assets</h3>
          <p className="summary-value">${portfolio?.total_value ? parseFloat(portfolio.total_value).toFixed(2) : '0.00'}</p>
        </div>
        <div className="summary-card">
          <h3>Cash Balance</h3>
          <p className="summary-value">${portfolio?.cash_balance ? parseFloat(portfolio.cash_balance).toFixed(2) : '0.00'}</p>
        </div>
        <div className="summary-card">
          <h3>Stock Value</h3>
          <p className="summary-value">${portfolio?.stocksValue?.toFixed(2) || '0.00'}</p>
        </div>
        <div className="summary-card">
          <h3>Total Gain</h3>
          <p className={`summary-value ${(portfolio?.total_return || 0) >= 0 ? 'positive' : 'negative'}`}>
            ${portfolio?.total_return ? parseFloat(portfolio.total_return).toFixed(2) : '0.00'}
          </p>
        </div>
      </div>

      <div className="portfolio-tabs">
        <div className="tab-buttons">
          <button 
            className={`tab-btn ${activeTab === 'holdings' ? 'active' : ''}`}
            onClick={() => handleTabChange('holdings')}
          >
            Holdings
          </button>
          <button 
            className={`tab-btn ${activeTab === 'watchlist' ? 'active' : ''}`}
            onClick={() => handleTabChange('watchlist')}
          >
            Watchlist
          </button>
          <button 
            className={`tab-btn ${activeTab === 'transactions' ? 'active' : ''}`}
            onClick={() => handleTabChange('transactions')}
          >
            Transaction History
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
