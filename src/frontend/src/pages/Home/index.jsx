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
            📈 Stock Trading Simulator
          </h1>
          <p className="hero-subtitle">
            Practice stock trading risk-free and improve your investment skills
          </p>
          
          {isAuthenticated() ? (
            <div className="welcome-section">
              <h2>Welcome back, {user?.username}!</h2>
              <p>Continue your investment journey</p>
              <div className="action-buttons">
                <Link to="/stocks" className="cta-button primary">
                  View Stock Market
                </Link>
                <Link to="/portfolio" className="cta-button secondary">
                  My Portfolio
                </Link>
              </div>
            </div>
          ) : (
            <div className="guest-section">
              <p className="guest-message">
                Start your simulated trading journey now
              </p>
              <div className="action-buttons">
                <Link to="/auth" className="cta-button primary">
                  Get Started
                </Link>
                <Link to="/stocks" className="cta-button secondary">
                  Browse Stocks
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="features-section">
        <div className="container">
          <h2 className="section-title">Why Choose Us?</h2>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">🎯</div>
              <h3>Risk-Free Practice</h3>
              <p>Trade with virtual money, learn investment strategies without worrying about losses</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">📊</div>
              <h3>Real-Time Data</h3>
              <p>Get real stock prices and market data, experience authentic trading environment</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">📈</div>
              <h3>Portfolio Management</h3>
              <p>Track your investment performance, analyze returns and risks</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🎓</div>
              <h3>Learn & Grow</h3>
              <p>Learn investment skills through practice, become a better investor</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Home