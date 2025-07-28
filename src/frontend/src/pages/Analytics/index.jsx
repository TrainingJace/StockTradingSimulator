import React, { useState, useEffect } from 'react';
import { Pie, Line } from 'react-chartjs-2';
import { Chart, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement } from 'chart.js';
import Modal from 'react-modal';
import Analysis from './Analysis'; // 导入 Analysis 组件
import './Analytics.css';

// 注册Chart.js组件
Chart.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement);

// 图表错误边界组件
class ChartErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true };
  }
  componentDidCatch(error, info) {}
  render() {
    if (this.state.hasError) {
      return <div style={{ color: 'red', textAlign: 'center', margin: '24px 0' }}>图表加载失败，请刷新页面重试</div>;
    }
    return this.props.children;
  }
}

// 主分析组件
const Analytics = () => {
  // 时间范围选项
  const timeRanges = [
    { label: 'Past Week', value: 'week' },
    { label: 'Past Month', value: 'month' },
    { label: 'Past 3 Months', value: '3month' },
    { label: 'Year to Date', value: 'ytd' },
  ];

  // 模拟股票详情数据
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

  // 状态管理
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedRange, setSelectedRange] = useState('week');
  const [showModal, setShowModal] = useState(false);
  const [modalStock, setModalStock] = useState(null);

  // 加载分析数据
  useEffect(() => {
    setLoading(true);
    // 模拟API请求延迟
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

  // 加载状态
  if (loading) {
    return (
      <div className="analytics-page">
        <div className="loading-state">
          <p>Loading analytics...</p>
        </div>
      </div>
    );
  }

  // 错误状态
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
      {/* 页面头部 */}
      <div className="page-header" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', marginBottom: '24px' }}>
        <h1 style={{ margin: 0, fontSize: '2.2rem', fontWeight: 700, letterSpacing: '1px' }}>Portfolio Analytics</h1>
        <p style={{ margin: 0, fontSize: '1.1rem', color: '#555' }}>View your investment performance and analysis</p>
        <div className="analytics-actions" style={{ marginTop: '12px', display: 'flex', gap: '16px', alignItems: 'center' }}>
          <select 
            value={selectedRange} 
            onChange={e => setSelectedRange(e.target.value)} 
            style={{ padding: '6px 12px', borderRadius: '8px', border: '1px solid #36A2EB', fontSize: '1rem' }}
          >
            {timeRanges.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
          </select>
          <button 
            className="export-btn" 
            style={{ 
              padding: '6px 16px', 
              borderRadius: '8px', 
              background: 'linear-gradient(135deg,#667eea,#764ba2)', 
              color: '#fff', 
              border: 'none', 
              fontWeight: 600, 
              cursor: 'pointer' 
            }} 
            onClick={() => alert('Analysis report exported (mock)')}
          >
            Export Analysis Report
          </button>
        </div>
      </div>

      {/* 分析内容区 */}
      <div className="analytics-content" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
        {/* 核心指标卡片 */}
        <div className="analytics-top-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px', width: '100%', maxWidth: '1000px', marginBottom: '32px' }}>
          {/* 核心指标卡片 */}
          <div className="analytics-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', width: '100%' }}>
            <div className="analytics-card" style={{ minHeight: '120px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <h3>Total Assets</h3>
              <div className="metric-value">
                ${analyticsData?.totalValue?.toLocaleString() || '0.00'}
              </div>
            </div>
            <div className="analytics-card" style={{ minHeight: '120px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <h3>Total Return</h3>
              <div className="metric-value">
                ${analyticsData?.totalReturn?.toLocaleString() || '0.00'}
              </div>
            </div>
            <div className="analytics-card" style={{ minHeight: '120px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <h3>Return Rate</h3>
              <div className="metric-value">
                {analyticsData?.returnPercentage?.toFixed(2) || '0.00'}%
              </div>
            </div>
            <div className="analytics-card risk-card" style={{ minHeight: '120px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <h3>Risk Metrics</h3>
              <div className="metric-value">Max Drawdown: -15.2%</div>
              <div className="metric-value">Volatility: 20%</div>
            </div>
          </div>
        </div>

        {/* 资产分布图 */}
        <div className="analytics-chart" style={{ width: '100%', maxWidth: '900px', marginBottom: '32px' }}>
          <ChartErrorBoundary>
            <Pie
              data={{
                labels: analyticsData?.assetDistribution?.map(item => item.symbol),
                datasets: [{
                  data: analyticsData?.assetDistribution?.map(item => item.percent),
                  backgroundColor: ['#36A2EB', '#FF6384', '#FFCD56', '#FF9F40', '#4BC0C0'],
                }]
              }}
            />
          </ChartErrorBoundary>
        </div>

        {/* 投资建议区域：在这里集成 Analysis 组件 */}
        <Analysis />
      </div>
    </div>
  );
};

export default Analytics;
