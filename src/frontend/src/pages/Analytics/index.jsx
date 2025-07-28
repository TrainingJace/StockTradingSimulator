
import React, { useState, useEffect } from 'react';
import Modal from 'react-modal';
import { Pie, Line } from 'react-chartjs-2';
import { Chart, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement } from 'chart.js';
import './Analytics.css';

Chart.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement);

// Error boundary for chart errors
class ChartErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true };
  }
  componentDidCatch(error, info) {
    // You can log error info here if needed
  }
  render() {
    if (this.state.hasError) {
      return <div style={{color:'red',textAlign:'center',margin:'24px 0'}}>Chart failed to render. Please refresh or check your data.</div>;
    }
    return this.props.children;
  }
}


function Analytics() {
  const timeRanges = [
    { label: 'Past Week', value: 'week' },
    { label: 'Past Month', value: 'month' },
    { label: 'Past 3 Months', value: '3month' },
    { label: 'Year to Date', value: 'ytd' },
  ];

  const mockDetails = {
    symbol: 'AAPL',
    name: 'Apple Inc.',
    priceHistory: [
      { date: '2025-07-21', price: 180 },
      { date: '2025-07-22', price: 182 },
      { date: '2025-07-23', price: 185 },
      { date: '2025-07-24', price: 187 },
    ],
    holding: 100,
    profit: 820,
    positionHistory: [
      { date: '2025-07-21', holding: 100 },
      { date: '2025-07-22', holding: 100 },
      { date: '2025-07-23', holding: 100 },
      { date: '2025-07-24', holding: 100 },
    ]
  };

  // Mock investment advice and risk tips
  const mockAdvice = [
    "Diversify your portfolio to reduce risk.",
    "Consider rebalancing your assets based on recent performance.",
    "Monitor high volatility stocks closely.",
    "Review your top performers for potential profit-taking opportunities.",
    "Be cautious with stocks showing significant drawdown."
  ];

  const mockRisk = {
    maxDrawdown: 6.2,
    volatility: 3.8,
  };

  const [analyticsData, setAnalyticsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedRange, setSelectedRange] = useState('week');
  const [showModal, setShowModal] = useState(false);
  const [modalStock, setModalStock] = useState(null);

  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      setAnalyticsData({
        totalValue: 120000,
        totalReturn: 15000,
        returnPercentage: 14.29,
        dailyReturns: [
          { date: '2025-07-21', value: 118000 },
          { date: '2025-07-22', value: 119000 },
          { date: '2025-07-23', value: 119500 },
          { date: '2025-07-24', value: 120000 },
        ],
        topPerformers: [
          { symbol: 'AAPL', change: 8.2 },
          { symbol: 'TSLA', change: 6.5 },
          { symbol: 'NVDA', change: 5.9 }
        ],
        worstPerformers: [
          { symbol: 'BABA', change: -4.1 },
          { symbol: 'PDD', change: -3.7 },
          { symbol: 'JD', change: -2.9 }
        ],
        assetDistribution: [
          { symbol: 'AAPL', percent: 35 },
          { symbol: 'TSLA', percent: 25 },
          { symbol: 'NVDA', percent: 20 },
          { symbol: 'BABA', percent: 10 },
          { symbol: 'JD', percent: 10 }
        ]
      });
      setLoading(false);
    }, 800);
  }, [selectedRange]);

  if (loading) {
    return (
      <div className="analytics-page">
        <div className="loading-state">
          <p>Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="analytics-page">
        <div className="error-state">
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="analytics-page">
      <div className="page-header" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', marginBottom: '24px' }}>
        <h1 style={{ margin: 0, fontSize: '2.2rem', fontWeight: 700, letterSpacing: '1px' }}>Portfolio Analytics</h1>
        <p style={{ margin: 0, fontSize: '1.1rem', color: '#555' }}>View your investment performance and analysis</p>
        <div className="analytics-actions" style={{ marginTop: '12px', display: 'flex', gap: '16px', alignItems: 'center' }}>
          <select value={selectedRange} onChange={e => setSelectedRange(e.target.value)} style={{ padding: '6px 12px', borderRadius: '8px', border: '1px solid #36A2EB', fontSize: '1rem' }}>
            {timeRanges.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
          </select>
          <button className="export-btn" style={{ padding: '6px 16px', borderRadius: '8px', background: 'linear-gradient(135deg,#667eea,#764ba2)', color: '#fff', border: 'none', fontWeight: 600, cursor: 'pointer' }} onClick={() => alert('Analysis report exported (mock)')}>Export Analysis Report</button>
        </div>
      </div>

      <div className="analytics-content" style={{display:'flex',flexDirection:'column',alignItems:'center',width:'100%'}}>
        <div className="analytics-top-row" style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'32px',width:'100%',maxWidth:'1000px',marginBottom:'32px'}}>
          <div className="analytics-grid" style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'24px',width:'100%'}}>
            <div className="analytics-card" style={{minHeight:'120px',display:'flex',flexDirection:'column',justifyContent:'center'}}>
              <h3>Total Assets</h3>
              <div className="metric-value">
                ${analyticsData?.totalValue?.toLocaleString() || '0.00'}
              </div>
            </div>
            <div className="analytics-card" style={{minHeight:'120px',display:'flex',flexDirection:'column',justifyContent:'center'}}>
              <h3>Total Return</h3>
              <div className="metric-value">
                ${analyticsData?.totalReturn?.toLocaleString() || '0.00'}
              </div>
            </div>
            <div className="analytics-card" style={{minHeight:'120px',display:'flex',flexDirection:'column',justifyContent:'center'}}>
              <h3>Return Rate</h3>
              <div className="metric-value">
                {analyticsData?.returnPercentage?.toFixed(2) || '0.00'}%
              </div>
            </div>
            <div className="analytics-card risk-card" style={{minHeight:'120px',display:'flex',flexDirection:'column',justifyContent:'center'}}>
              <h3>Risk Metrics</h3>
              <div className="risk-metric">Max Drawdown: <span style={{color:'#FF6384',fontWeight:600}}>{mockRisk.maxDrawdown}%</span></div>
              <div className="risk-metric">Volatility: <span style={{color:'#36A2EB',fontWeight:600}}>{mockRisk.volatility}%</span></div>
            </div>
          </div>
          <div className="asset-distribution-section" style={{display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',width:'100%'}}>
            <h3>Asset Distribution</h3>
            <div style={{ width: '100%', maxWidth: 320, height: 250 }}>
              <ChartErrorBoundary>
                {Array.isArray(analyticsData?.assetDistribution) && analyticsData.assetDistribution.length > 0 ? (
                  <Pie
                    key={analyticsData.assetDistribution.map(item => item.symbol).join('-')}
                    data={{
                      labels: analyticsData.assetDistribution.map(item => item.symbol),
                      datasets: [
                        {
                          data: analyticsData.assetDistribution.map(item => item.percent),
                          backgroundColor: [
                            '#36A2EB', '#FF6384', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40'
                          ],
                          borderWidth: 1
                        }
                      ]
                    }}
                    options={{
                      plugins: {
                        legend: {
                          position: 'bottom',
                        },
                      },
                      responsive: true,
                      maintainAspectRatio: false,
                    }}
                    height={250}
                  />
                ) : (
                  <p style={{textAlign:'center',color:'#888'}}>No asset distribution data</p>
                )}
              </ChartErrorBoundary>
            </div>
          </div>
        </div>
        <div className="analytics-charts-advice-row" style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'32px',width:'100%',maxWidth:'1000px',marginBottom:'32px'}}>
          <div style={{display:'flex',flexDirection:'column',gap:'32px',width:'100%'}}>
            <div className="chart-card" style={{minHeight:'220px',maxWidth:'100%',width:'100%',boxSizing:'border-box'}}>
              <h3 className="chart-card-title">Return Trend</h3>
              <ChartErrorBoundary>
                {Array.isArray(analyticsData?.dailyReturns) && analyticsData.dailyReturns.length > 0 ? (
                  <div style={{height: 180}}>
                    <Line
                      key={analyticsData.dailyReturns.map(item => item.date).join('-')}
                      data={{
                        labels: analyticsData.dailyReturns.map(item => item.date),
                        datasets: [
                          {
                            label: 'Portfolio Value',
                            data: analyticsData.dailyReturns.map(item => Number(item.value)),
                            fill: true,
                            borderColor: 'rgba(54,162,235,1)',
                            backgroundColor: (context) => {
                              const chart = context.chart;
                              const {ctx, chartArea} = chart;
                              if (!chartArea) return 'rgba(54,162,235,0.1)';
                              const gradient = ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
                              gradient.addColorStop(0, 'rgba(54,162,235,0.3)');
                              gradient.addColorStop(1, 'rgba(54,162,235,0.05)');
                              return gradient;
                            },
                            pointBackgroundColor: 'white',
                            pointBorderColor: 'rgba(54,162,235,1)',
                            pointRadius: 5,
                            pointHoverRadius: 7,
                            pointBorderWidth: 2,
                            borderWidth: 3,
                            tension: 0.4,
                          }
                        ]
                      }}
                      options={{
                        responsive: true,
                        plugins: {
                          legend: {
                            display: true,
                            position: 'bottom',
                            labels: {
                              font: { size: 14, weight: 'bold' },
                              color: '#333',
                            }
                          },
                          tooltip: {
                            enabled: true,
                            backgroundColor: '#fff',
                            titleColor: '#36A2EB',
                            bodyColor: '#333',
                            borderColor: '#36A2EB',
                            borderWidth: 1,
                            padding: 12,
                            callbacks: {
                              label: function(context) {
                                return `Value: $${context.parsed.y.toLocaleString()}`;
                              }
                            }
                          },
                        },
                        scales: {
                          x: {
                            title: {
                              display: true,
                              text: 'Date',
                              color: '#36A2EB',
                              font: { size: 14, weight: 'bold' }
                            },
                            grid: {
                              color: 'rgba(54,162,235,0.08)',
                            },
                            ticks: {
                              color: '#333',
                              font: { size: 12 }
                            }
                          },
                          y: {
                            title: {
                              display: true,
                              text: 'Value ($)',
                              color: '#36A2EB',
                              font: { size: 14, weight: 'bold' }
                            },
                            grid: {
                              color: 'rgba(54,162,235,0.08)',
                            },
                            ticks: {
                              color: '#333',
                              font: { size: 12 }
                            }
                          },
                        },
                      }}
                    />
                  </div>
                ) : (
                  <p style={{textAlign:'center',color:'#888'}}>No return trend data</p>
                )}
              </ChartErrorBoundary>
            </div>
            {/* Investment Advice & Risk Tips Section */}
            <div className="advice-section" style={{padding: '24px', background: 'rgba(54,162,235,0.06)', borderRadius: 12, maxWidth:'100%',width:'100%',boxSizing:'border-box'}}>
              <h3 style={{color:'#36A2EB',marginBottom:12}}>Investment Advice & Risk Tips</h3>
              <ul style={{paddingLeft:20,margin:0}}>
                {mockAdvice.map((tip, idx) => (
                  <li key={idx} style={{marginBottom:8,color:'#333',fontSize:'1rem'}}>{tip}</li>
                ))}
              </ul>
            </div>
          </div>
          <div style={{display:'flex',flexDirection:'column',gap:'32px',width:'100%'}}>
            <div className="chart-card" style={{minHeight:'220px',maxWidth:'100%',width:'100%',boxSizing:'border-box'}}>
              <h3 className="chart-card-title">Top Performers</h3>
              <div className="performance-list">
                {analyticsData?.topPerformers?.length > 0 ? (
                  analyticsData.topPerformers.map((stock, index) => (
                    <div key={index} className="performance-item" style={{cursor:'pointer'}} onClick={()=>{setModalStock(stock);setShowModal(true);}}>
                      <span className="stock-symbol">{stock.symbol}</span>
                      <span className="performance-change positive">
                        +{stock.change}%
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="no-data">No data available</p>
                )}
              </div>
            </div>
            <div className="chart-card" style={{minHeight:'220px',maxWidth:'100%',width:'100%',boxSizing:'border-box'}}>
              <h3 className="chart-card-title">Worst Performers</h3>
              <div className="performance-list">
                {analyticsData?.worstPerformers?.length > 0 ? (
                  analyticsData.worstPerformers.map((stock, index) => (
                    <div key={index} className="performance-item" style={{cursor:'pointer'}} onClick={()=>{setModalStock(stock);setShowModal(true);}}>
                      <span className="stock-symbol">{stock.symbol}</span>
                      <span className="performance-change negative">
                        {stock.change}%
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="no-data">No data available</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Stock Detail Modal */}
      <Modal
        isOpen={showModal}
        onRequestClose={()=>setShowModal(false)}
        style={{
          overlay: { backgroundColor: 'rgba(0,0,0,0.2)', zIndex: 9999 },
          content: { maxWidth: 400, margin: 'auto', borderRadius: 16, padding: 24, boxShadow: '0 4px 24px rgba(54,162,235,0.12)' }
        }}
        ariaHideApp={false}
      >
        <h2 style={{color:'#36A2EB',marginBottom:12}}>{modalStock?.symbol} Details</h2>
        <div style={{marginBottom:8}}>Name: {mockDetails.name}</div>
        <div style={{marginBottom:8}}>Holding: {mockDetails.holding} shares</div>
        <div style={{marginBottom:8}}>Total Profit: <span style={{color:'#36A2EB',fontWeight:600}}>${mockDetails.profit}</span></div>
        <div style={{marginBottom:8}}>Price History:</div>
        <ul style={{marginBottom:8}}>
          {mockDetails.priceHistory.map(p=>(<li key={p.date}>{p.date}: ${p.price}</li>))}
        </ul>
        <div style={{marginBottom:8}}>Position History:</div>
        <ul>
          {mockDetails.positionHistory.map(p=>(<li key={p.date}>{p.date}: {p.holding} shares</li>))}
        </ul>
        <button style={{marginTop:16,padding:'8px 20px',borderRadius:8,background:'linear-gradient(135deg,#667eea,#764ba2)',color:'#fff',border:'none',fontWeight:600,cursor:'pointer'}} onClick={()=>setShowModal(false)}>Close</button>
      </Modal>
    </div>
  );
}

export default Analytics;
