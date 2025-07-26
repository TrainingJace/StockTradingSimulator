import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks'
import './Navigation.css'

function Navigation() {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, isAuthenticated, logout } = useAuth()
  
  const isActive = (path) => {
    return location.pathname === path
  }

  const handleLogout = () => {
    logout()
    navigate('/')
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
