import { useState } from 'react'
import { useSearchableData } from '../../hooks'
import { stockApi } from '../../api'
import { formatPrice, formatPercentage, getPriceChangeColor, formatNumber, getErrorMessage } from '../../utils/formatters'
import StockDetailModal from '../../components/StockDetailModal'
import './StockDashboard.css'

function StockDashboard() {
  const [selectedStock, setSelectedStock] = useState(null)
  const [showDetailModal, setShowDetailModal] = useState(false)

  // 使用搜索功能的股票数据
  const {
    data: stocks,
    loading,
    error,
    searchTerm,
    setSearchTerm,
    clearSearch,
    refetch
  } = useSearchableData(
    () => stockApi.getStocks(),
    (stock, term) => {
      if (!term) return true;
      return stock.symbol.toLowerCase().includes(term.toLowerCase()) ||
             stock.name.toLowerCase().includes(term.toLowerCase());
    }
  );

  const handleStockSelect = (stock) => {
    setSelectedStock(stock);
    setShowDetailModal(true);
  };

  const handleCloseModal = () => {
    setShowDetailModal(false);
    setSelectedStock(null);
  };

  const handleRefresh = () => {
    refetch();
  };

  return (
    <div className="stock-dashboard">
      <header className="dashboard-header">
        <h1>📈 股票交易模拟器</h1>
      </header>

      <div className="dashboard-controls">
        <div className="search-container">
          <input
            type="text"
            placeholder="搜索股票代码或名称..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          {searchTerm && (
            <button onClick={clearSearch} className="clear-search">
              ✕
            </button>
          )}
        </div>
        <button onClick={handleRefresh} className="refresh-btn" disabled={loading}>
          {loading ? '刷新中...' : '🔄 刷新数据'}
        </button>
      </div>

      {error && (
        <div className="error-message">
          ❌ {getErrorMessage(error)}
        </div>
      )}

      {loading && !error ? (
        <div className="loading">
          <div className="loading-spinner"></div>
          <p>加载股票数据中...</p>
        </div>
      ) : (
        <div className="stocks-grid">
          {stocks && stocks.length === 0 ? (
            <div className="no-data">
              {searchTerm ? '未找到匹配的股票' : '暂无股票数据'}
            </div>
          ) : (
            stocks && stocks.map((stock) => (
              <div 
                key={stock.symbol} 
                className={`stock-card ${selectedStock?.symbol === stock.symbol ? 'selected' : ''}`}
                onClick={() => handleStockSelect(stock)}
              >
                <div className="stock-header">
                  <h3 className="stock-symbol">{stock.symbol}</h3>
                  <span className="stock-name">{stock.name}</span>
                </div>
                <div className="stock-price">
                  <span className="current-price">${formatPrice(stock.price)}</span>
                </div>
                <div className="stock-change">
                  <span 
                    className="price-change"
                    style={{ color: getPriceChangeColor(stock.change) }}
                  >
                    {stock.change > 0 ? '+' : ''}${formatPrice(Math.abs(stock.change))}
                  </span>
                  <span 
                    className="percentage-change"
                    style={{ color: getPriceChangeColor(stock.change) }}
                  >
                    ({formatPercentage(stock.changePercent)})
                  </span>
                </div>
                <div className="stock-details">
                  <div className="detail-item">
                    <span className="label">成交量:</span>
                    <span className="value">{formatNumber(stock.volume || 0)}</span>
                  </div>
                  <div className="detail-item">
                    <span className="label">市值:</span>
                    <span className="value">${formatNumber(stock.marketCap / 1000000000, 1)}B</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {selectedStock && (
        <div className="stock-detail-panel">
          <div className="panel-header">
            <h3>{selectedStock.symbol} - {selectedStock.name}</h3>
            <button onClick={() => setSelectedStock(null)} className="close-panel">
              ✕
            </button>
          </div>
          <div className="panel-content">
            <p>当前价格: ${formatPrice(selectedStock.price)}</p>
            <p>涨跌幅: {formatPercentage(selectedStock.changePercent)}</p>
            <p>成交量: {formatNumber(selectedStock.volume || 0)}</p>
            <p>市值: ${formatNumber(selectedStock.marketCap / 1000000000, 1)}B</p>
          </div>
        </div>
      )}

      <footer className="dashboard-footer">
        <p>数据更新时间: {new Date().toLocaleString()}</p>
        <p>* 本系统仅供教学演示使用，数据为模拟数据</p>
        <p>显示 {stocks ? stocks.length : 0} 只股票 {searchTerm && `(搜索: "${searchTerm}")`}</p>
      </footer>
    </div>
  )
}

export default StockDashboard