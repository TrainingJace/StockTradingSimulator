import { useState, useEffect } from 'react'
import './Watchlist.css'

function Watchlist() {
  const [watchlist, setWatchlist] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    // TODO: 实现获取观察列表数据
    // fetchWatchlistData()
    setLoading(false)
  }, [])

  return (
    <div className="watchlist-page">
      <div className="page-header">
        <h1>My Watchlist</h1>
        <p>Track stocks you're interested in</p>
      </div>
      
      <div className="watchlist-content">
        {loading ? (
          <div className="loading-state">
            <p>Loading...</p>
          </div>
        ) : error ? (
          <div className="error-state">
            <p>Error: {error}</p>
          </div>
        ) : watchlist.length === 0 ? (
          <div className="empty-state">
            <h3>Your watchlist is empty</h3>
            <p>Click "Add to Watchlist" on stock detail pages to start tracking stocks</p>
          </div>
        ) : (
          <div className="watchlist-table">
            {/* TODO: 实现观察列表表格组件 */}
            <p>Watchlist table will be displayed here</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default Watchlist
