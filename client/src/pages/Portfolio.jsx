import { useState, useEffect } from 'react'
import { portfolioApi } from '../api'
import './Portfolio.css'

function Portfolio() {
  const [portfolio, setPortfolio] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  
  // 模拟用户ID，实际应用中应该从认证系统获取
  const userId = 1

  useEffect(() => {
    fetchPortfolio()
  }, [])

  const fetchPortfolio = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await portfolioApi.getPortfolio(userId)
      if (response.success) {
        setPortfolio(response.data)
      } else {
        setError(response.error || '获取投资组合失败')
      }
    } catch (err) {
      setError('网络错误，请检查服务器连接')
      console.error('获取投资组合错误:', err)
    } finally {
      setLoading(false)
    }
  }

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

  return (
    <div className="portfolio">
      <div className="portfolio-header">
        <h1>📊 我的投资组合</h1>
        <button onClick={fetchPortfolio} className="refresh-btn">
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

      {portfolio?.holdings && portfolio.holdings.length > 0 ? (
        <div className="holdings-section">
          <h2>持股明细</h2>
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
                <span>${holding.averageCost?.toFixed(2) || '0.00'}</span>
                <span>${holding.currentPrice?.toFixed(2) || '0.00'}</span>
                <span>${(holding.quantity * holding.currentPrice)?.toFixed(2) || '0.00'}</span>
                <span className={holding.gain >= 0 ? 'positive' : 'negative'}>
                  ${holding.gain?.toFixed(2) || '0.00'}
                </span>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="empty-portfolio">
          <h2>您还没有持有任何股票</h2>
          <p>去股票市场开始您的第一笔交易吧！</p>
          <a href="/stocks" className="cta-button">
            前往股票市场
          </a>
        </div>
      )}
    </div>
  )
}

export default Portfolio
