import React, { useState, useEffect } from 'react'
import { LineChart, Line, XAxis, YAxis, Tooltip, ReferenceLine, ResponsiveContainer, Legend, Scatter } from 'recharts'
import { formatPrice, formatPercentage } from '../../../utils/formatters'
import BuyStockModal from '../../../components/BuyStockModal'
import SellStockModal from '../../../components/SellStockModal'
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
      const response = await tradingApi.getStockChartData(symbol, 90, avgCost);
      
      if (response.success) {
        setChartData(prev => ({
          ...prev,
          [symbol]: response.data
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

  // 自定义 Tooltip 内容
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const date = new Date(label);
      const dateStr = `${date.getMonth()+1}/${date.getDate()}`;
      
      return (
        <div style={{
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          border: '1px solid #ccc',
          borderRadius: 6,
          padding: 8,
          fontSize: 11,
          boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
        }}>
          <div style={{ fontWeight: 'bold', marginBottom: 4, color: '#333' }}>
            {dateStr}
          </div>
          <div style={{ color: '#1976d2', marginBottom: 2 }}>
            Price: ${data.price}
          </div>
          <div style={{ color: '#888', marginBottom: 2 }}>
            Avg Cost: ${data.avgCost}
          </div>
          {data.action && (
            <div style={{ 
              color: data.action === 'buy' ? '#43a047' : '#e53935',
              fontWeight: 'bold'
            }}>
              {data.action === 'buy' 
                ? `📈 Buy ${data.shares} shares` 
                : `📉 Sell ${data.shares} shares`
              }
            </div>
          )}
        </div>
      );
    }
    return null;
  };

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
                          {loadingChart[position.symbol] ? (
                            <div style={{ 
                              height: 320, 
                              display: 'flex', 
                              alignItems: 'center', 
                              justifyContent: 'center',
                              fontSize: 16,
                              color: '#666'
                            }}>
                              Loading chart data...
                            </div>
                          ) : chartData[position.symbol] && chartData[position.symbol].length > 0 ? (
                            <ResponsiveContainer width="100%" height={320}>
                              <LineChart data={chartData[position.symbol]} margin={{ left: 24, right: 24, top: 24, bottom: 16 }}>
                                <XAxis 
                                  type="number"
                                  dataKey="date"
                                  domain={['dataMin', 'dataMax']}
                                  allowDataOverflow={false}
                                  tick={{ fontSize: 12 }}
                                  interval="preserveStartEnd"
                                  angle={-45}
                                  textAnchor="end"
                                  height={60}
                                  tickFormatter={ts => {
                                    const d = new Date(ts);
                                    return `${d.getMonth()+1}/${d.getDate()}`;
                                  }}
                                />
                                <YAxis 
                                  domain={[
                                    dataMin => Math.floor(dataMin * 0.98), 
                                    dataMax => Math.ceil(dataMax * 1.02)
                                  ]} 
                                  tick={{ fontSize: 14 }} 
                                />
                                <Tooltip 
                                  content={<CustomTooltip />}
                                  cursor={{ stroke: '#666', strokeDasharray: '4 4', strokeWidth: 1 }}
                                  shared={true}
                                  allowEscapeViewBox={{ x: true, y: true }}
                                />
                                <Legend />
                                {/* 股票价格主线 */}
                                <Line 
                                  type="linear" 
                                  dataKey="price" 
                                  stroke="#1976d2" 
                                  strokeWidth={2.5} 
                                  dot={false}
                                  name="Price"
                                />
                                {/* 平均成本虚线 */}
                                <Line 
                                  type="linear" 
                                  dataKey="avgCost" 
                                  stroke="#888" 
                                  strokeDasharray="4 4" 
                                  dot={false}
                                  name="Avg Cost" 
                                />
                                {/* 隐形的全数据点Scatter，用于触发Tooltip */}
                                <Scatter 
                                  data={chartData[position.symbol]}
                                  fill="transparent"
                                  shape="circle"
                                  dataKey="price"
                                  name=""
                                />
                                {/* 买入点 */}
                                <Scatter 
                                  data={chartData[position.symbol].filter(d=>d.action==='buy')}
                                  name="Buy"
                                  fill="#43a047"
                                  shape="circle"
                                  dataKey="price"
                                />
                                {/* 卖出点 */}
                                <Scatter 
                                  data={chartData[position.symbol].filter(d=>d.action==='sell')}
                                  name="Sell"
                                  fill="#e53935"
                                  shape="circle"
                                  dataKey="price"
                                />
                              </LineChart>
                            </ResponsiveContainer>
                          ) : (
                            <div style={{ 
                              height: 320, 
                              display: 'flex', 
                              alignItems: 'center', 
                              justifyContent: 'center',
                              fontSize: 16,
                              color: '#999'
                            }}>
                              No chart data available for {position.symbol}
                            </div>
                          )}
                        </div>
                        <div style={{fontSize:14, color:'#aaa', marginTop:12}}>
                          Legend: Blue line = Price, Gray dashed line = Avg Cost, Green dots = Buy orders, Red dots = Sell orders<br/>
                          Hover over any point to see trading details including shares traded
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
