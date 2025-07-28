import { useState } from 'react'
import { useSearchableData } from '../../hooks'
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
    // 在新浏览器窗口中打开股票详情页面
    const stockDetailUrl = `${window.location.origin}/stock/${stock.symbol}`;
    window.open(stockDetailUrl, '_blank', 'width=1200,height=800,scrollbars=yes,resizable=yes');
  };

  const handleCloseModal = () => {
    setShowDetailModal(false);
    setSelectedStock(null);
  };

  const handleRefresh = () => {
    clearSearch(); // 先清除搜索
    refetch(); // 然后刷新数据
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
            placeholder="Search stock code or name..."

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
          {loading ? 'Refreshing...' : '🔄 Refresh Data'}

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
          <p>Loading stock data...</p>
        </div>
      ) : (
        <div className="stocks-grid">
          {stocks && stocks.length === 0 ? (

            <div className="no-data">
              {searchTerm ? 'No matching stocks found' : 'No stock data available'}
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
                    <span className="label">Volume:</span>
                    <span className="value">{formatNumber(stock.volume || 0)}</span>

                  </div>
                  <div className="detail-item">
                    <span className="label">Market Cap:</span>
                    <span className="value">${formatNumber(stock.marketCap / 1000000000, 1)}B</span>


                  </div>
                </div>

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
        <p>* This system is for educational demonstration only, data is simulated</p>
        <p>Showing {stocks ? stocks.length : 0} stocks {searchTerm && `(Search: "${searchTerm}")`}</p>

      </footer>
    </div>
  )
}

export default StockDashboard