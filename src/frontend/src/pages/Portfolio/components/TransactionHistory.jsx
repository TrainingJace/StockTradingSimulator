import React from 'react'
import { formatPrice, formatDate } from '../../../utils/formatters'

function TransactionHistory({ 
  transactionHistory, 
  transactionsLoading, 
  transactionsError, 
  refetchTransactions 
}) {
  if (transactionsLoading) {
    return (
      <div className="transactions-section">
        <div className="loading">
          <div className="loading-spinner"></div>
          <p>Loading transactions...</p>
        </div>
      </div>
    );
  }

  if (transactionsError) {
    return (
      <div className="transactions-section">
        <div className="error-message">
          ❌ {transactionsError}
          <button onClick={refetchTransactions} className="retry-btn">
            重试
          </button>
        </div>
      </div>
    );
  }

  // transactionHistory 已经是数组了，不需要再访问 .data
  const transactions = transactionHistory || [];
  
  return (
    <div className="transactions-section">
      {transactions.length > 0 ? (
        <div className="transactions-table">
          <div className="table-header">
            <span>Date</span>
            <span>Stock Symbol</span>
            <span>Action</span>
            <span>Quantity</span>
            <span>Price</span>
            <span>Total Amount</span>
            <span>Cash Balance</span>
          </div>
          {transactions.map((transaction) => (
            <div key={transaction.id} className="table-row">
              <span>{formatDate(transaction.timestamp)}</span>
              <span className="stock-symbol">{transaction.symbol}</span>
              <span className={`transaction-type ${transaction.type.toLowerCase()}`}>
                {transaction.type === 'BUY' ? 'Buy' : 'Sell'}
              </span>
              <span>{transaction.shares}</span>
              <span>${formatPrice(transaction.price)}</span>
              <span className={`total ${transaction.type.toLowerCase()}`}>
                ${formatPrice(transaction.total)}
              </span>
              <span className="cash-balance">${formatPrice(transaction.cashBalance)}</span>
            </div>
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <h3>No Transaction History</h3>
          <p>You haven't made any stock transactions yet</p>
        </div>
      )}
    </div>
  );
}

export default TransactionHistory
