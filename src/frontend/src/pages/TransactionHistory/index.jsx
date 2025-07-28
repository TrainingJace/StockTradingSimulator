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
        <h1>Transaction History</h1>
        <p>View all your buy and sell records</p>
      </div>
      
      <div className="transaction-content">
        {loading ? (
          <div className="loading-state">
            <p>Loading...</p>
          </div>
        ) : error ? (
          <div className="error-state">
            <p>Error: {error}</p>
          </div>
        ) : transactions.length === 0 ? (
          <div className="empty-state">
            <h3>No Transaction Records</h3>
            <p>Your transaction records will appear here after you start trading</p>
          </div>
        ) : (
          <div className="transaction-table">
            {/* TODO: 实现交易历史表格组件 */}
            <p>Transaction history table will be displayed here</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default TransactionHistory
