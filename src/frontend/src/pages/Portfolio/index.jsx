import React, { useState } from 'react'
import { useAsyncData } from '../../hooks'
import { portfolioApi, tradingApi } from '../../api'
import { useAuth } from '../../hooks'
import { getErrorMessage } from '../../utils/formatters'
import { Holdings, Watchlist, TransactionHistory } from './components'
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

  // 处理交易成功后的回调
  const handleTransactionSuccess = () => {
    refetch(); // 刷新portfolio数据
    if (activeTab === 'transactions') {
      refetchTransactions(); // 如果在交易历史页面，也刷新交易数据
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'holdings':
        return <Holdings portfolio={portfolio} onTransactionSuccess={handleTransactionSuccess} />;

      case 'watchlist':
        return <Watchlist watchlist={watchlist} setWatchlist={setWatchlist} onTransactionSuccess={handleTransactionSuccess} />;

      case 'transactions':
        return (
          <TransactionHistory 
            transactionHistory={transactionHistory}
            transactionsLoading={transactionsLoading}
            transactionsError={transactionsError}
            refetchTransactions={refetchTransactions}
          />
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
