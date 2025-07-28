import { useState, useMemo, useCallback } from 'react'
import { useHybridSearch } from '../../hooks'
import { stockApi } from '../../api'
import { formatPrice, formatPercentage, getPriceChangeColor, formatNumber, getErrorMessage } from '../../utils/formatters'
import StockDetailModal from '../../components/StockDetailModal'
import './StockDashboard.css'

function StockDashboard() {
  const [selectedStock, setSelectedStock] = useState(null)
  const [showDetailModal, setShowDetailModal] = useState(false)

  // 使用混合搜索功能 - 外部API + 本地过滤
  const {
    data: stocks,
    loading,
    error,
    searchTerm,
    setSearchTerm,
    clearSearch,
    refetch,
    isSearching
  } = useHybridSearch(
    () => stockApi.getStocks(),
    (query) => stockApi.searchStocks(query),
    (stock, term) => {
      if (!term) return true;
      return stock.symbol.toLowerCase().includes(term.toLowerCase()) ||
        stock.name.toLowerCase().includes(term.toLowerCase());
    }
  );

  // 使用 useMemo 缓存股票列表，避免频繁重渲染
  const memoizedStocks = useMemo(() => {
    return stocks || [];
  }, [stocks]);

  // 缓存事件处理函数，避免重复创建
  const handleSearchChange = useCallback((e) => {
    setSearchTerm(e.target.value);
  }, [setSearchTerm]);

  const handleStockSelect = (stock) => {
    // 在新浏览器窗口中打开股票详情页面
    const stockDetailUrl = `${window.location.origin}/stock/${stock.symbol}`;
    window.open(stockDetailUrl, '_blank', 'width=1200,height=800,scrollbars=yes,resizable=yes');
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
        <h1>📈 Stock Trading Simulator</h1>
      </header>

      <div className="dashboard-controls">
        <div className="search-container">
          <input
            type="text"
            placeholder="Search stock code or name (supports external API)..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="search-input"
          />
          {isSearching && searchTerm && searchTerm.trim() && (
            <div className="search-indicator">
              🔍 搜索中...
            </div>
          )}
          {searchTerm && searchTerm.trim() && !isSearching && (
            <button onClick={clearSearch} className="clear-search">
              ✕
            </button>
          )}
        </div>
        <button onClick={handleRefresh} className="refresh-btn" disabled={loading && !searchTerm}>
          {(loading && !searchTerm) ? 'Refreshing...' : '🔄 Refresh Data'}
        </button>
      </div>

      {error && (
        <div className="error-message">
          ❌ {getErrorMessage(error)}
        </div>
      )}

      {loading && !error && !searchTerm ? (
        <div className="loading">
          <div className="loading-spinner"></div>
          <p>Loading stock data...</p>
        </div>
      ) : (
        <div className="stocks-grid">
          {memoizedStocks && memoizedStocks.length === 0 ? (
            <div className="no-data">
              {searchTerm ? 'No matching stocks found' : 'No stock data available'}
            </div>
          ) : (
            memoizedStocks && memoizedStocks.map((stock) => (
              <div
                key={`${stock.symbol}-${stock.source || 'local'}`}
                className={`stock-card ${selectedStock?.symbol === stock.symbol ? 'selected' : ''}`}
                onClick={() => handleStockSelect(stock)}
              >
                <div className="stock-header">
                  <div className="stock-title">
                    <h3 className="stock-symbol">{stock.symbol}</h3>
                    <span className="stock-name">{stock.name}</span>
                  </div>
                  {stock.source && (
                    <div className={`data-source ${stock.source}`}>
                      {stock.source === 'external' ? '🌐' : '💾'}
                    </div>
                  )}
                </div>
                {stock.exchange && (
                  <div className="stock-exchange">
                    📈 {stock.exchange}
                  </div>
                )}
                {stock.price ? (
                  <>
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
                        <span className="label">Volume:</span>
                        <span className="value">{formatNumber(stock.volume || 0)}</span>
                      </div>
                      <div className="detail-item">
                        <span className="label">Market Cap:</span>
                        <span className="value">${formatNumber(stock.marketCap / 1000000000, 1)}B</span>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="external-stock-info">
                    {stock.exchange && (
                      <div className="detail-item">
                        <span className="label">📈 Exchange:</span>
                        <span className="value">{stock.exchange}</span>
                      </div>
                    )}
                    {stock.mic_code && (
                      <div className="detail-item">
                        <span className="label">🏢 MIC Code:</span>
                        <span className="value">{stock.mic_code}</span>
                      </div>
                    )}
                    {stock.country && (
                      <div className="detail-item">
                        <span className="label">� Country:</span>
                        <span className="value">{stock.country}</span>
                      </div>
                    )}
                    {stock.type && (
                      <div className="detail-item">
                        <span className="label">📊 Type:</span>
                        <span className="value">{stock.type}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* 股票详情模态框 */}
      <StockDetailModal
        stock={selectedStock}
        isOpen={showDetailModal}
        onClose={handleCloseModal}
      />

      <footer className="dashboard-footer">
        <p>Data updated: {new Date().toLocaleString()}</p>
        <p>🔍 Smart Search: External API (Twelve Data) + Local Database Fallback</p>
        <p>🌐 = External API Data | 💾 = Local Database Data</p>
        <p>Showing {memoizedStocks ? memoizedStocks.length : 0} stocks {searchTerm && `(Search: "${searchTerm}")`}</p>
        <p>* This system is for educational demonstration only</p>
      </footer>
    </div>
  )
}

export default StockDashboard