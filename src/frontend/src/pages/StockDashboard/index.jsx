import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSearchableData } from '../../hooks'
import { stockApi, watchlistApi } from '../../api'
import { formatPrice, formatPercentage, getPriceChangeColor, formatNumber, getErrorMessage } from '../../utils/formatters'
import ErrorBoundary from '../../components/ErrorBoundary.jsx'
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
      try {
        if (!term) return true;
        if (!stock) return false;

        const symbol = stock.symbol || '';
        const name = stock.name || '';
        const searchTermLower = term.toLowerCase();

        return symbol.toLowerCase().includes(searchTermLower) ||
          name.toLowerCase().includes(searchTermLower);
      } catch (error) {
        console.error('Error in filter function:', error, { stock, term });
        return false; // 如果出错，不显示这个股票
      }
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
    try {
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
    } catch (error) {
      console.error('Error in handleSearchChange:', error);
    }
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





  const handleStockSelect = (stock) => {
    // 在同一窗口中导航到股票详情页面
    navigate(`/stock/${stock.symbol}`);
  };

  // 添加股票到数据库并获取详细信息
  const handleAddStock = async (result) => {
    try {
      console.log('Adding stock:', result.symbol);

      // 调用API获取并更新公司概览数据
      const response = await stockApi.fetchCompanyOverview(result.symbol);

      if (response.success) {
        console.log('Stock data updated successfully:', response.data);

        // 关闭搜索结果
        setShowSearchResults(false);
        setSearchTerm('');

        // 刷新股票列表以显示新添加的股票
        // refetch();

        // 可选：显示成功消息
        alert(`Successfully added ${result.symbol} and updated company information!`);

        // 导航到新添加的股票详情页
        navigate(`/stock/${result.symbol}`);
      } else {
        console.error('Failed to add stock:', response.error);
        alert(`Failed to add ${result.symbol}: ${response.error}`);
      }
    } catch (error) {
      console.error('Error adding stock:', error);
      alert(`Error adding ${result.symbol}: ${error.message}`);
    }
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
        <h1>📈 Stock Pilot</h1>
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
            stocks && stocks.map((stock) => {
              // 安全地获取股票数据，避免未定义值导致错误
              const safeStock = {
                symbol: stock?.symbol || 'N/A',
                name: stock?.name || 'Unknown',
                price: stock?.price || 0,
                change: stock?.change || 0,
                changePercent: stock?.changePercent || 0,
                volume: stock?.volume || 0,
                marketCap: stock?.marketCap || 0
              };

              return (
                <div
                  key={safeStock.symbol}
                  className="stock-card"
                  onClick={() => handleStockSelect(stock)}
                >
                  <div className="stock-header">
                    <h3 className="stock-symbol">{safeStock.symbol}</h3>
                    <span className="stock-name">{safeStock.name}</span>
                  </div>
                  <div className="stock-price">
                    <span className="current-price">${formatPrice(safeStock.price)}</span>
                  </div>
                  <div className="stock-change">
                    <span
                      className="price-change"
                      style={{ color: getPriceChangeColor(safeStock.change) }}
                    >
                      {safeStock.change > 0 ? '+' : ''}${formatPrice(Math.abs(safeStock.change))}
                    </span>
                    <span
                      className="percentage-change"
                      style={{ color: getPriceChangeColor(safeStock.change) }}
                    >
                      ({formatPercentage(safeStock.changePercent)})
                    </span>

                  </div>
                  <div className="detail-item">
                    <span className="label">Market Cap:</span>
                    {/* using volume * price , 2 decimals */}
                    <span className="value">${
                     ((stock.volume || 0) * (stock.price || 0) / 1000000000).toFixed(2)
                    }B</span>


                    </div>
                    <div className="detail-item">
                      <span className="label">Market Cap:</span>
                      <span className="value">
                        {safeStock.marketCapitalization > 0 ?
                          `$${formatNumber(safeStock.marketCapitalization / 1000000000, 1)}B` :
                          'N/A'
                        }
                      </span>

                    </div>
                  </div>

              );
            })
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

// 导出被ErrorBoundary包装的组件
const StockDashboardWithErrorBoundary = () => (
  <ErrorBoundary>
    <StockDashboard />
  </ErrorBoundary>
);

export default StockDashboardWithErrorBoundary;