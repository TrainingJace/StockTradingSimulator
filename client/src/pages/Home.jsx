import { Link } from 'react-router-dom'
import './Home.css'

function Home() {
  return (
    <div className="home">
      <div className="hero-section">
        <div className="hero-content">
          <h1>📈 股票交易模拟器</h1>
          <p className="hero-subtitle">学习投资，从模拟开始</p>
          <p className="hero-description">
            在真实的市场环境中练习股票交易，无风险学习投资技巧
          </p>
          
          <div className="hero-buttons">
            <Link to="/stocks" className="cta-button primary">
              开始交易
            </Link>
            <Link to="/portfolio" className="cta-button secondary">
              查看投资组合
            </Link>
          </div>
        </div>
        
        <div className="hero-image">
          <div className="chart-placeholder">
            <div className="chart-line"></div>
            <div className="chart-bars">
              <div className="bar" style={{height: '60%'}}></div>
              <div className="bar" style={{height: '80%'}}></div>
              <div className="bar" style={{height: '45%'}}></div>
              <div className="bar" style={{height: '90%'}}></div>
              <div className="bar" style={{height: '70%'}}></div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="features-section">
        <h2>功能特色</h2>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">📊</div>
            <h3>实时股价</h3>
            <p>获取最新的股票价格和市场数据</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">💼</div>
            <h3>投资组合</h3>
            <p>管理您的投资组合，追踪收益表现</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">📈</div>
            <h3>交易历史</h3>
            <p>查看详细的交易记录和统计分析</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🔍</div>
            <h3>股票搜索</h3>
            <p>快速搜索和发现感兴趣的股票</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Home
