import { Link } from 'react-router-dom'
import { useAuth } from '../../hooks'
import './Home.css'

function Home() {
  const { user, isAuthenticated } = useAuth()

  return (
    <div className="home-container">
      <div className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">
            📈 股票模拟交易平台
          </h1>
          <p className="hero-subtitle">
            无风险练习股票交易，提升投资技能
          </p>
          
          {isAuthenticated() ? (
            <div className="welcome-section">
              <h2>欢迎回来，{user?.username}！</h2>
              <p>继续你的投资之旅</p>
              <div className="action-buttons">
                <Link to="/stocks" className="cta-button primary">
                  查看股票市场
                </Link>
                <Link to="/portfolio" className="cta-button secondary">
                  我的投资组合
                </Link>
              </div>
            </div>
          ) : (
            <div className="guest-section">
              <p className="guest-message">
                立即开始你的模拟交易之旅
              </p>
              <div className="action-buttons">
                <Link to="/auth" className="cta-button primary">
                  立即开始
                </Link>
                <Link to="/stocks" className="cta-button secondary">
                  浏览股票
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="features-section">
        <div className="container">
          <h2 className="section-title">为什么选择我们？</h2>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">🎯</div>
              <h3>零风险练习</h3>
              <p>使用虚拟资金进行交易，学习投资策略无需担心损失</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">📊</div>
              <h3>实时数据</h3>
              <p>获取真实的股票价格和市场数据，体验真实交易环境</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">📈</div>
              <h3>投资组合管理</h3>
              <p>跟踪你的投资表现，分析收益和风险</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🎓</div>
              <h3>学习成长</h3>
              <p>通过实践学习投资技巧，成为更好的投资者</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Home