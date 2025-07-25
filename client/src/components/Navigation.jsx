import { Link, useLocation } from 'react-router-dom'
import { useState, useEffect } from 'react'
import './Navigation.css'

function Navigation() {
  const location = useLocation()
  const [user, setUser] = useState(null)
  
  const isActive = (path) => {
    return location.pathname === path
  }

  useEffect(() => {
    // 检查是否有登录用户
    const token = localStorage.getItem('token')
    const userData = localStorage.getItem('user')
    
    if (token && userData) {
      try {
        setUser(JSON.parse(userData))
      } catch (error) {
        console.error('Error parsing user data:', error)
        localStorage.removeItem('token')
        localStorage.removeItem('user')
      }
    }
  }, [location])

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setUser(null)
    window.location.href = '/'
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
          {user ? (
            <div className="user-menu">
              <span className="user-greeting">👋 {user.username}</span>
              <button onClick={handleLogout} className="logout-btn">
                登出
              </button>
            </div>
          ) : (
            <div className="auth-links">
              <Link 
                to="/login" 
                className={`nav-link ${isActive('/login') ? 'active' : ''}`}
              >
                登录
              </Link>
              <Link 
                to="/register" 
                className={`nav-link register-link ${isActive('/register') ? 'active' : ''}`}
              >
                注册
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  )
}

export default Navigation
