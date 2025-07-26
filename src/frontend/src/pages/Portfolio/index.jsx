import { useAsyncData } from '../../hooks'
import { portfolioApi } from '../../api'
import { useAuth } from '../../hooks'
import { formatPrice, formatPercentage, getPriceChangeColor, formatDate, getErrorMessage } from '../../utils/formatters'
import './Portfolio.css'

function Portfolio() {
  const { getCurrentUserId, isAuthenticated } = useAuth()
  const userId = getCurrentUserId()

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
                <span>${formatPrice(holding.averageCost || 0)}</span>
                <span>${formatPrice(holding.currentPrice || 0)}</span>
                <span>${formatPrice((holding.quantity * holding.currentPrice) || 0)}</span>
                <span style={{ color: getPriceChangeColor(holding.gain || 0) }}>
                  {(holding.gain || 0) >= 0 ? '+' : ''}${formatPrice(holding.gain || 0)}
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

      {error && (
        <div className="error-message">
          ❌ {getErrorMessage(error)}
        </div>
      )}
    </div>
  )
}

export default Portfolio
