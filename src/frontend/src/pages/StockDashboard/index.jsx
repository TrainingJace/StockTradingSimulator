import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSearchableData } from '../../hooks'
import { stockApi, watchlistApi } from '../../api'
import { formatPrice, formatPercentage, getPriceChangeColor, formatNumber, getErrorMessage } from '../../utils/formatters'
import './StockDashboard.css'

function StockDashboard() {
  const [searchResults, setSearchResults] = useState([])
  const [searchLoading, setSearchLoading] = useState(false)
  const [searchError, setSearchError] = useState(null)
  const [showSearchResults, setShowSearchResults] = useState(false)
  const searchTimeoutRef = useRef(null)
  const searchContainerRef = useRef(null)
  const navigate = useNavigate()

  // 使用混合搜索功能 - 外部API + 本地过滤
  // stockApi会自动从localStorage获取用户的simulation_date
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

  // 搜索股票功能
  const performSearch = async (query) => {
    if (!query.trim()) {
      setSearchResults([])
      setShowSearchResults(false)
      return
    }

    setSearchLoading(true)
    setSearchError(null)
    setShowSearchResults(true)

    try {
      const response = await stockApi.searchStocksBySymbol(query)
      if (response.success) {
        setSearchResults(response.data || [])
      } else {
        setSearchError(response.error || 'Search failed')
        setSearchResults([])
      }
    } catch (error) {
      setSearchError('Network error occurred')
      setSearchResults([])
    } finally {
      setSearchLoading(false)
    }
  }

  // 防抖搜索
  const handleSearchChange = (e) => {
    const value = e.target.value
    setSearchTerm(value)

    // 清除之前的定时器
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current)
    }

    // 设置新的定时器
    searchTimeoutRef.current = setTimeout(() => {
      performSearch(value)
    }, 500) // 500ms 延迟
  }

  // 点击搜索结果外部关闭搜索结果
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target)) {
        setShowSearchResults(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  // 清理定时器
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current)
      }
    }
  }, [])

  // 添加股票到用户观察列表
  const handleAddStock = async (stockInfo) => {
    try {
      const response = await watchlistApi.addToWatchlist(stockInfo.symbol)
      if (response.success) {
        alert(`Successfully added ${stockInfo.symbol} (${stockInfo.instrument_name}) to your watchlist!`)
      } else {
        alert(response.error || 'Failed to add stock to watchlist')
      }
      setShowSearchResults(false)
      setSearchTerm('')
    } catch (error) {
      console.error('Error adding stock to watchlist:', error)
      alert('Failed to add stock to watchlist. Please try again.')
    }
  }



  const handleStockSelect = (stock) => {
    // 在同一窗口中导航到股票详情页面
    navigate(`/stock/${stock.symbol}`);
  };

  const handleClearSearch = () => {
    setSearchTerm('')
    setSearchResults([])
    setShowSearchResults(false)
    clearSearch() // 清除原有的本地搜索
  }

  const handleRefresh = () => {
    handleClearSearch() // 清除搜索
    refetch(); // 然后刷新数据
  };

  return (
    <div className="stock-dashboard">
      <header className="dashboard-header">
        <h1>📈 Stock Trading Simulator</h1>
      </header>

      <div className="dashboard-controls">
        <div className="search-container" ref={searchContainerRef}>
          <input
            type="text"
            placeholder="Search stock code or name..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="search-input"
          />
          {searchTerm && (
            <button onClick={handleClearSearch} className="clear-search">
              ✕
            </button>
          )}

          {/* 搜索结果下拉框 */}
          {showSearchResults && (
            <div className="search-results">
              {searchLoading ? (
                <div className="search-loading">
                  🔍 Searching...
                </div>
              ) : searchError ? (
                <div className="search-error">
                  ❌ {searchError}
                </div>
              ) : searchResults.length === 0 ? (
                <div className="search-no-results">
                  No results found
                </div>
              ) : (
                searchResults.map((result, index) => (
                  <div key={index} className="search-result-item">
                    <div className="search-result-info">
                      <div className="search-result-symbol">{result.symbol}</div>
                      <div className="search-result-name">{result.instrument_name}</div>
                      <div className="search-result-exchange">
                        {result.exchange} • {result.country} • {result.currency}
                      </div>
                    </div>
                    <button
                      className="search-result-add-btn"
                      onClick={() => handleAddStock(result)}
                    >
                      Add
                    </button>
                  </div>
                ))
              )}
            </div>
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
                className="stock-card"
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

      <footer className="dashboard-footer">
        <p>Data updated: {new Date().toLocaleString()}</p>
        <p>* This system is for educational demonstration only, data is simulated</p>
        <p>Showing {stocks ? stocks.length : 0} stocks {searchTerm && `(Search: "${searchTerm}")`}</p>

      </footer>
    </div>
  )
}

export default StockDashboard