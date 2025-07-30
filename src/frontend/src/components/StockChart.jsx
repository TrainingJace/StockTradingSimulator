import React from 'react'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, Scatter } from 'recharts'

function StockChart({ symbol, data, loading }) {
  // 自定义 Tooltip 内容
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const date = new Date(label);
      const dateStr = `${date.getMonth()+1}/${date.getDate()}/${date.getFullYear()}`;
      
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

  // 过滤买入和卖出数据并打印调试信息npm
  let buyData = data.filter(d => d.action === 'buy');
  let sellData = data.filter(d => d.action === 'sell');

  if (loading) {
    return (
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
    );
  }

  if (!data || data.length === 0) {
    return (
      <div style={{ 
        height: 320, 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        fontSize: 16,
        color: '#999'
      }}>
        No chart data available for {symbol}
      </div>
    );
  }

  return (
    <>
      <ResponsiveContainer width="100%" height={320}>
        <LineChart data={data} margin={{ left: 24, right: 24, top: 24, bottom: 16 }}>
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
            scale="time"
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
            data={data}
            fill="transparent"
            shape="circle"
            dataKey="price"
            name=""
          />
          {/* 买入点 */}
          {buyData.length > 0 && (  
          <Scatter 
            data={buyData}
            name="Buy"
            fill="#43a047"
            shape="circle"
            dataKey="price"
          />
          )}
          {/* 卖出点 */}
          {sellData.length > 0 && (
          <Scatter 
            data={sellData}
            name="Sell"
            fill="#e53935"
            shape="circle"
            dataKey="price"
          />)}
        </LineChart>
      </ResponsiveContainer>
      <div style={{fontSize:14, color:'#aaa', marginTop:12}}>
        Legend: Blue line = Price, Gray dashed line = Avg Cost, Green dots = Buy orders, Red dots = Sell orders<br/>
        Hover over any point to see trading details including shares traded
      </div>
    </>
  );
}

export default StockChart
