import React, { useState } from 'react'
import { formatPrice, formatPercentage } from '../../../utils/formatters'
import BuyStockModal from '../../../components/BuyStockModal'

function Watchlist({ watchlist, setWatchlist, onTransactionSuccess }) {
  const [buyModalOpen, setBuyModalOpen] = useState(false)
  const [selectedSymbol, setSelectedSymbol] = useState(null)

  const handleBuyClick = (stock) => {
    setSelectedSymbol(stock.symbol)
    setBuyModalOpen(true)
  }

  const handleTransactionSuccess = () => {
    if (onTransactionSuccess) {
      onTransactionSuccess()
    }
  }

  return (
    <>
      <div className="watchlist-section">
        {watchlist.length > 0 ? (
          <div className="watchlist-table">
            <div className="table-header">
              <span>Stock Symbol</span>
              <span>Company Name</span>
              <span>Current Price</span>
              <span>Change</span>
              <span>Actions</span>
            </div>
            {watchlist.map((stock) => (
              <div key={stock.symbol} className="table-row">
                <span className="stock-symbol">{stock.symbol}</span>
                <span>{stock.name}</span>
                <span>${formatPrice(stock.price)}</span>
                <span className={stock.change >= 0 ? 'positive' : 'negative'}>
                  {stock.change >= 0 ? '+' : ''}${formatPrice(Math.abs(stock.change))} 
                  ({formatPercentage(stock.changePercent)}%)
                </span>
                <span className="action-buttons">
                  <button 
                    className="action-btn buy-btn"
                    onClick={() => handleBuyClick(stock)}
                  >
                    Buy
                  </button>
                  <button 
                    className="action-btn remove-btn"
                    onClick={() => setWatchlist(prev => prev.filter(s => s.symbol !== stock.symbol))}
                  >
                    Remove
                  </button>
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <h3>Watchlist is Empty</h3>
            <p>Add stocks to your watchlist from the stock details page</p>
          </div>
        )}
      </div>

      {/* Buy Stock Modal */}
      <BuyStockModal
        isOpen={buyModalOpen}
        onClose={() => setBuyModalOpen(false)}
        symbol={selectedSymbol}
        onBuySuccess={handleTransactionSuccess}
      />
    </>
  )
}

export default Watchlist
