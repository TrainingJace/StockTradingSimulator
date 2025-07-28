import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks'
import './Navigation.css'

function Navigation() {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, isAuthenticated, logout, advanceSimulationDate } = useAuth()
  
  const isActive = (path) => {
    return location.pathname === path
  }

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const handleAdvanceDate = async () => {
    try {
      const result = await advanceSimulationDate()
      if (!result.success) {
        console.error('Failed to advance date:', result.error)
        // 可以在这里添加错误提示
      }
    } catch (error) {
      console.error('Error advancing date:', error)
    }
  }

  const formatDate = (dateString) => {
    if (!dateString) return '未设置'
    const date = new Date(dateString)
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    })
  }

  return (
    <nav className="navigation">
      <div className="nav-container">
        <Link to="/" className="nav-logo">
          📈 股票模拟器
        </Link>
        
        <ul className="nav-menu">
          <li className="nav-item">
            <Link 
              to="/" 
              className={`nav-link ${isActive('/') ? 'active' : ''}`}
            >
              首页
            </Link>
          </li>
          <li className="nav-item">
            <Link 
              to="/stocks" 
              className={`nav-link ${isActive('/stocks') ? 'active' : ''}`}
            >
              股票市场
            </Link>
          </li>
          {user && (
            <>
              <li className="nav-item">
                <Link 
                  to="/portfolio" 
                  className={`nav-link ${isActive('/portfolio') ? 'active' : ''}`}
                >
                  我的投资组合
                </Link>
              </li>
              <li className="nav-item">
                <Link 
                  to="/transactions" 
                  className={`nav-link ${isActive('/transactions') ? 'active' : ''}`}
                >
                  交易历史
                </Link>
              </li>
            </>
          )}
        </ul>

        <div className="nav-auth">
          {isAuthenticated() ? (
            <div className="user-menu">
              <div className="simulation-date">
                <span className="date-label">模拟日期:</span>
                <span className="date-value">{formatDate(user?.simulation_date)}</span>
                <button 
                  onClick={handleAdvanceDate} 
                  className="advance-date-btn"
                  title="推进一天"
                >
                  ⏭
                </button>
              </div>
              <span className="user-greeting">👋 {user.username}</span>
              <button onClick={handleLogout} className="logout-btn">
                登出
              </button>
            </div>
          ) : (
            <div className="auth-links">
              <Link 
                to="/auth" 
                className={`nav-link ${isActive('/auth') || isActive('/login') || isActive('/register') ? 'active' : ''}`}
              >
                登录 / 注册
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  )
}

export default Navigation
