import React, { useState } from 'react'
import { formatPrice, formatPercentage } from '../../../utils/formatters'
import BuyStockModal from '../../../components/BuyStockModal'
import SellStockModal from '../../../components/SellStockModal'

function Holdings({ portfolio, onTransactionSuccess }) {
  const [buyModalOpen, setBuyModalOpen] = useState(false)
  const [sellModalOpen, setSellModalOpen] = useState(false)
  const [selectedSymbol, setSelectedSymbol] = useState(null)
  const [selectedStock, setSelectedStock] = useState(null)

  // 调试：打印Holdings接收到的portfolio数据
  console.log('Holdings - positions:', portfolio);

  const handleBuyClick = (position) => {
    setSelectedSymbol(position.symbol)
    setBuyModalOpen(true)
  }

  const handleSellClick = (position) => {
    // 卖出仍需要持仓信息，所以保留原有逻辑
    setSelectedStock({
      symbol: position.symbol,
      name: position.name || position.symbol,
      price: parseFloat(position.current_price) || 0,
      current_price: parseFloat(position.current_price) || 0,
      change: 0,
      changePercent: 0
    })
    setSellModalOpen(true)
  }

  const handleTransactionSuccess = () => {
    if (onTransactionSuccess) {
      onTransactionSuccess()
    }
  }

  return (
    <>
      <div className="holdings-section">
        {portfolio?.positions && portfolio.positions.length > 0 ? (
          <div className="holdings-table">
            <div className="table-header">
              <span>Stock Symbol</span>
              <span>Quantity</span>
              <span>Average Cost</span>
              <span>Current Price</span>
              <span>Total Value</span>
              <span>Gain/Loss</span>
              <span>Actions</span>
            </div>
            {portfolio.positions.map((position) => (
              <div key={position.symbol} className="table-row">
                <span className="stock-symbol">{position.symbol}</span>
                <span>{position.shares}</span>
                <span>${formatPrice(parseFloat(position.avg_cost) || 0)}</span>
                <span>${formatPrice(parseFloat(position.current_price) || 0)}</span>
                <span>${formatPrice(parseFloat(position.current_value) || 0)}</span>
                <span className={`gain-loss ${(parseFloat(position.unrealized_gain) || 0) >= 0 ? 'positive' : 'negative'}`}>
                  ${formatPrice(parseFloat(position.unrealized_gain) || 0)}
                  ({formatPercentage(parseFloat(position.unrealized_gain_percent) || 0)})
                </span>
                <span className="action-buttons">
                  <button 
                    className="action-btn action-buy-btn"
                    onClick={() => handleBuyClick(position)}
                  >
                    Buy
                  </button>
                  <button 
                    className="action-btn action-sell-btn"
                    onClick={() => handleSellClick(position)}
                  >
                    Sell
                  </button>
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <h3>No Holdings</h3>
            <p>You haven't purchased any stocks yet</p>
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

      {/* Sell Stock Modal */}
      <SellStockModal
        isOpen={sellModalOpen}
        onClose={() => setSellModalOpen(false)}
        stock={selectedStock}
        holdings={portfolio?.positions || []}
        onSellSuccess={handleTransactionSuccess}
      />
    </>
  )
}

export default Holdings
