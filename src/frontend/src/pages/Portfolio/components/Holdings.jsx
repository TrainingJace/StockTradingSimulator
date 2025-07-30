import React, { useState, useEffect } from 'react'
import { formatPrice, formatPercentage } from '../../../utils/formatters'
import BuyStockModal from '../../../components/BuyStockModal'
import SellStockModal from '../../../components/SellStockModal'
import StockChart from '../../../components/StockChart'
import { tradingApi } from '../../../api/tradingApi'
import { stockApi } from '../../../api/stockApi'

function Holdings({ portfolio, onTransactionSuccess }) {
  const [expandedSymbol, setExpandedSymbol] = useState(null)
  const [buyModalOpen, setBuyModalOpen] = useState(false)
  const [sellModalOpen, setSellModalOpen] = useState(false)
  const [selectedSymbol, setSelectedSymbol] = useState(null)
  const [selectedStock, setSelectedStock] = useState(null)
  const [chartData, setChartData] = useState({})
  const [loadingChart, setLoadingChart] = useState({})

  // 调试：打印Holdings接收到的portfolio数据
  console.log('Holdings - positions:', portfolio);

  // 加载特定股票的图表数据
  const loadChartData = async (symbol, avgCost) => {
    if (chartData[symbol]) {
      return; // 如果已经加载过，直接返回
    }

    setLoadingChart(prev => ({ ...prev, [symbol]: true }));

    try {
      const response = await tradingApi.getStockChartData(symbol, 30, avgCost);
      
      if (response.success) {
        // 确保数据按时间顺序排序（从早到晚）
        const sortedData = Array.isArray(response.data) 
          ? response.data.sort((a, b) => new Date(a.date) - new Date(b.date))
          : [];
          
        setChartData(prev => ({
          ...prev,
          [symbol]: sortedData
        }));
      } else {
        console.error('Failed to load chart data for', symbol);
        // 如果加载失败，使用默认数据
        setChartData(prev => ({
          ...prev,
          [symbol]: []
        }));
      }
    } catch (error) {
      console.error('Error loading chart data for', symbol, error);
      setChartData(prev => ({
        ...prev,
        [symbol]: []
      }));
    } finally {
      setLoadingChart(prev => ({ ...prev, [symbol]: false }));
    }
  };

  // 当展开某个股票时加载图表数据
  useEffect(() => {
    if (expandedSymbol && portfolio?.positions) {
      const position = portfolio.positions.find(p => p.symbol === expandedSymbol);
      if (position) {
        loadChartData(expandedSymbol, parseFloat(position.avg_cost) || 0);
      }
    }
  }, [expandedSymbol, portfolio?.positions]);

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
    // 清除图表缓存数据，强制重新加载
    setChartData({});
    
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
              <span>Stock</span>
              <span>Quantity</span>
              <span>Average Cost</span>
              <span>Current Price</span>
              <span>Total Value</span>
              <span>Daily Return</span>
              <span>Gain/Loss</span>
              <span>Actions</span>
            </div>
            {portfolio.positions.map((position) => (
              <React.Fragment key={position.symbol}>
                <div
                  className="table-row"
                  style={{cursor: 'pointer'}}
                  onClick={e => {
                    // 阻止按钮点击时触发展开
                    if (e.target.closest('.action-buttons')) return;
                    setExpandedSymbol(expandedSymbol === position.symbol ? null : position.symbol);
                  }}
                >
                  <span className="stock-symbol">
                    <span className="expand-arrow" style={{marginRight: 4}}>
                      {expandedSymbol === position.symbol ? '▼' : '▶'}
                    </span>
                    {position.symbol}
                  </span>
                  <span>{position.shares}</span>
                  <span>${formatPrice(parseFloat(position.avg_cost) || 0)}</span>
                  <span>${formatPrice(parseFloat(position.current_price) || 0)}</span>
                  <span>${formatPrice(parseFloat(position.current_value) || 0)}</span>
                  <span className={`daily-return ${(parseFloat(position.daily_return) || 0) >= 0 ? 'positive' : 'negative'}`}>
                    ${formatPrice(parseFloat(position.daily_return) || 0)}
                  </span>
                  <span className={`gain-loss ${(parseFloat(position.unrealized_gain) || 0) >= 0 ? 'positive' : 'negative'}`}>
                    ${formatPrice(parseFloat(position.unrealized_gain) || 0)}
                    ({formatPercentage(parseFloat(position.unrealized_gain_percent) || 0)})
                  </span>
                  <span className="action-buttons" onClick={e => e.stopPropagation()}>
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
                {expandedSymbol === position.symbol && (
                  <div className="table-row expanded-row">
                    <span style={{gridColumn: '1 / -1', width: '100%'}}>
                      <div style={{
                        padding: '32px 0',
                        textAlign: 'center',
                        color: '#888',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '100%'
                      }}>
                        <div style={{ width: '90%', maxWidth: 900, minWidth: 400 }}>
                          <StockChart 
                            symbol={position.symbol}
                            data={chartData[position.symbol] || []}
                            loading={loadingChart[position.symbol]}
                          />
                        </div>
                      </div>
                    </span>
                  </div>
                )}
              </React.Fragment>
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
