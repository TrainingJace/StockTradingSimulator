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
      //refresh the page to reflect the new date
      window.location.reload() ;
    } catch (error) {
      console.error('Error advancing date:', error)
    }
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'Not Set';
    
    // 只提取日期部分，避免时区转换问题
    const dateOnly = dateString.split('T')[0]; // 得到 YYYY-MM-DD
    const date = new Date(dateOnly + 'T12:00:00'); // 添加中午时间避免时区边界问题
    
    return date.toLocaleDateString('en', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      weekday: 'short'
    })
  }

  return (
    <nav className="navigation">
      <div className="nav-container">
        <Link to="/" className="nav-logo">
          📈 StockPilot
        </Link>
        
        <ul className="nav-menu">
          <li className="nav-item">
            <Link 
              to="/" 
              className={`nav-link ${isActive('/') ? 'active' : ''}`}
            >
              Home
            </Link>
          </li>
          <li className="nav-item">
            <Link 
              to="/stocks" 
              className={`nav-link ${isActive('/stocks') ? 'active' : ''}`}
            >
              Stock Market
            </Link>
          </li>
          {user && (
            <>
              <li className="nav-item">
                <Link 
                  to="/portfolio" 
                  className={`nav-link ${isActive('/portfolio') ? 'active' : ''}`}
                >
                  My Portfolio
                </Link>
              </li>
              <li className="nav-item">
                <Link 
                  to="/analytics" 
                  className={`nav-link ${isActive('/analytics') ? 'active' : ''}`}
                >
                  Investment Analytics
                </Link>
              </li>
            </>
          )}
        </ul>

        <div className="nav-auth">
          {isAuthenticated() ? (
            <div className="user-menu">
              {/* <div className="simulation-date">
                <span className="date-label">Simulation Date:</span>
                <span className="date-value">{formatDate(user?.simulation_date)}</span>
                <button 
                  onClick={handleAdvanceDate} 
                  className="advance-date-btn"
                  title="Advance one day"
                >
                  ⏭
                </button>
              </div> */}
              <span className="user-greeting">👋 {user.username}</span>
              <button onClick={handleLogout} className="logout-btn">
                Logout
              </button>
            </div>
          ) : (
            <div className="auth-links">
              <Link 
                to="/auth" 
                className={`nav-link ${isActive('/auth') || isActive('/login') || isActive('/register') ? 'active' : ''}`}
              >
                Login / Register
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  )
}

export default Navigation
