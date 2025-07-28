import { useState, useEffect } from 'react'
import './TransactionHistory.css'

function TransactionHistory() {
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    // TODO: 实现获取交易历史数据
    // fetchTransactionHistory()
    setLoading(false)
  }, [])

  return (
    <div className="transaction-history-page">
      <div className="page-header">
        <h1>交易历史</h1>
        <p>查看您的所有买卖记录</p>
      </div>
      
      <div className="transaction-content">
        {loading ? (
          <div className="loading-state">
            <p>加载中...</p>
          </div>
        ) : error ? (
          <div className="error-state">
            <p>错误: {error}</p>
          </div>
        ) : transactions.length === 0 ? (
          <div className="empty-state">
            <h3>暂无交易记录</h3>
            <p>开始交易后，您的交易记录将显示在这里</p>
          </div>
        ) : (
          <div className="transaction-table">
            {/* TODO: 实现交易历史表格组件 */}
            <p>交易历史表格将在这里显示</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default TransactionHistory
