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
        <h1>我的观察列表</h1>
        <p>跟踪您感兴趣的股票</p>
      </div>
      
      <div className="watchlist-content">
        {loading ? (
          <div className="loading-state">
            <p>加载中...</p>
          </div>
        ) : error ? (
          <div className="error-state">
            <p>错误: {error}</p>
          </div>
        ) : watchlist.length === 0 ? (
          <div className="empty-state">
            <h3>您的观察列表为空</h3>
            <p>在股票详情页面点击"添加到观察列表"来开始跟踪股票</p>
          </div>
        ) : (
          <div className="watchlist-table">
            {/* TODO: 实现观察列表表格组件 */}
            <p>观察列表表格将在这里显示</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default Watchlist
