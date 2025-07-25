import { useState, useEffect } from 'react'
import { stockApi } from '../api'
import './StockDashboard.css'

function StockDashboard() {
  const [stocks, setStocks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [marketStatus, setMarketStatus] = useState('closed')

  // 获取股票数据
  const fetchStocks = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await stockApi.getStocks()
      if (response.success) {
        setStocks(response.data)
      } else {
        setError(response.error || '获取股票数据失败')
      }
    } catch (err) {
      setError('网络错误，请检查服务器连接')
      console.error('获取股票数据错误:', err)
    } finally {
      setLoading(false)
    }
  }

  // 获取市场状态
  const fetchMarketStatus = async () => {
    try {
      const response = await stockApi.getMarketStatus()
      if (response.success) {
        setMarketStatus(response.data.isOpen ? 'open' : 'closed')
      }
    } catch (err) {
      console.error('获取市场状态错误:', err)
    }
  }

  useEffect(() => {
    fetchStocks()
    fetchMarketStatus()
    
    // 每30秒刷新一次数据
    const interval = setInterval(() => {
      fetchStocks()
      fetchMarketStatus()
    }, 30000)

    return () => clearInterval(interval)
  }, [])

  // 搜索过滤
  const filteredStocks = stocks.filter(stock =>
    stock.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
    stock.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // 价格变化颜色
  const getPriceChangeColor = (change) => {
    if (change > 0) return '#4CAF50'
    if (change < 0) return '#f44336'
    return '#666'
  }

  // 格式化价格
  const formatPrice = (price) => {
    return typeof price === 'number' ? price.toFixed(2) : '0.00'
  }

  // 格式化百分比
  const formatPercentage = (percentage) => {
    const num = typeof percentage === 'number' ? percentage : 0
    return `${num > 0 ? '+' : ''}${num.toFixed(2)}%`
  }

  return (
    <div className="stock-dashboard">
      <header className="dashboard-header">
        <h1>📈 股票交易模拟器</h1>
        <div className="market-status">
          <span className={`status-indicator ${marketStatus}`}></span>
          市场状态: {marketStatus === 'open' ? '开市' : '闭市'}
        </div>
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
        </div>
        <button onClick={fetchStocks} className="refresh-btn" disabled={loading}>
          {loading ? '刷新中...' : '🔄 刷新数据'}
        </button>
      </div>

      {error && (
        <div className="error-message">
          ❌ {error}
        </div>
      )}

      {loading && !error ? (
        <div className="loading">
          <div className="loading-spinner"></div>
          <p>加载股票数据中...</p>
        </div>
      ) : (
        <div className="stocks-grid">
          {filteredStocks.length === 0 ? (
            <div className="no-data">
              {searchTerm ? '未找到匹配的股票' : '暂无股票数据'}
            </div>
          ) : (
            filteredStocks.map((stock) => (
              <div key={stock.symbol} className="stock-card">
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
                    <span className="value">{stock.volume?.toLocaleString() || '0'}</span>
                  </div>
                  <div className="detail-item">
                    <span className="label">市值:</span>
                    <span className="value">${(stock.marketCap / 1000000000).toFixed(1)}B</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      <footer className="dashboard-footer">
        <p>数据更新时间: {new Date().toLocaleString()}</p>
        <p>* 本系统仅供教学演示使用，数据为模拟数据</p>
      </footer>
    </div>
  )
}

export default StockDashboard
