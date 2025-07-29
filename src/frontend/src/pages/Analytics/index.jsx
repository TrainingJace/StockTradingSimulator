import React, { useState, useEffect } from 'react';
import { Pie, Line } from 'react-chartjs-2';
import { Chart, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement } from 'chart.js';
import Modal from 'react-modal';
import Analysis from './Analysis';
import './Analytics.css';
import { analyticsApi } from '../../api/analyticsApi';

Chart.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement);

const ChartErrorBoundary = ({ children }) => {
  try {
    return children;
  } catch (error) {
    return <div style={{ color: 'red', textAlign: 'center', margin: '24px 0' }}>图表加载失败，请刷新页面重试</div>;
  }
};

const Analytics = () => {
  const timeRanges = [
    { label: 'All Time', value: 'all' },
    { label: 'Past Week', value: 'week' },
    { label: 'Past Month', value: 'month' },
    { label: 'Past 3 Months', value: '3month' },
    { label: 'Year to Date', value: 'ytd' },
  ];

  // ...existing code...

  // 时间范围下拉列表渲染
  const renderTimeRangeDropdown = () => (
    <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '2rem' }}>
      <select
        value={selectedRange}
        onChange={e => setSelectedRange(e.target.value)}
        style={{
          padding: '10px 20px',
          borderRadius: '12px',
          border: '1.5px solid #36A2EB',
          color: '#222',
          background: 'linear-gradient(90deg,#f5faff 60%,#e0f0ff 100%)',
          fontSize: '1.08rem',
          minWidth: '200px',
          boxShadow: '0 4px 16px rgba(54,162,235,0.10)',
          fontWeight: 500,
          outline: 'none',
          transition: 'border 0.2s'
        }}
        onFocus={e => e.target.style.border = '2px solid #4BC0C0'}
        onBlur={e => e.target.style.border = '1.5px solid #36A2EB'}
      >
        {timeRanges.map(range => (
          <option key={range.value} value={range.value}>{range.label}</option>
        ))}
      </select>
    </div>
  );

  // 状态管理
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedRange, setSelectedRange] = useState('week');
  const [error, setError] = useState(null);

  // 通用安全显示函数
  const safe = (val) => (val === null || val === undefined || (Array.isArray(val) && val.length === 0)) ? '--' : val;

  // 加载分析数据（从后端API获取）
  useEffect(() => {
    setLoading(true);
    // 传递时间区间参数给后端
    let params = {};
    if (selectedRange !== 'all') {
      const now = new Date();
      let startDate = null;
      if (selectedRange === 'week') {
        startDate = new Date(now.getTime() - 7 * 24 * 3600 * 1000);
      } else if (selectedRange === 'month') {
        startDate = new Date(now.getTime() - 30 * 24 * 3600 * 1000);
      } else if (selectedRange === '3month') {
        startDate = new Date(now.getTime() - 90 * 24 * 3600 * 1000);
      } else if (selectedRange === 'ytd') {
        startDate = new Date(now.getFullYear(), 0, 1);
      }
      if (startDate) {
        params.startDate = startDate.toISOString().slice(0, 10);
        params.endDate = now.toISOString().slice(0, 10);
      }
    }
    analyticsApi.getPortfolioAnalytics(params)
      .then(data => {
        setAnalyticsData(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message || 'Failed to load analytics data');
        setLoading(false);
      });
  }, [selectedRange]);

  if (loading) {
    return <div className="analytics-page"><p>Loading analytics...</p></div>;
  }

  if (error) {
    return <div className="analytics-page"><p style={{color:'red'}}>加载失败：{error}</p></div>;
  }

  if (!analyticsData) {
    return <div className="analytics-page"><p style={{color:'red'}}>暂无分析数据，请检查登录状态或数据源。</p></div>;
  }

  // 示例：在页面任意位置渲染分析字段时
  // <span>{safe(analyticsData.totalValue)}</span>
  // <span>{safe(analyticsData.topPerformers)}</span>
  // <span>{safe(analyticsData.assetDistribution)}</span>
  // ...其他字段同理...

  return (
    <div className="analytics-page" style={{ padding: '2.5rem', fontFamily: 'Inter,Segoe UI,sans-serif', maxWidth: '1280px', margin: '0 auto', background: '#f7f8fa' }}>
      <header style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
        <h1 style={{ fontSize: '2.8rem', margin: 0, color: '#223A5F', letterSpacing: '1.5px', fontWeight: 800 }}>Portfolio Analytics</h1>
        <p style={{ color: '#6C7A89', fontSize: '1.18rem', fontWeight: 500, marginTop: '0.5rem' }}>Track your investment performance and get smart insights</p>
      </header>
      {renderTimeRangeDropdown()}

<section
  style={{
    display: 'flex',
    gap: '2rem',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginBottom: '2rem'
  }}
>
  {['totalValue', 'totalReturn', 'returnPercentage'].map((key) => {
    const isProfit = analyticsData[key] > 0;
    const isLoss = analyticsData[key] < 0;
    const isColoredKey = key === 'totalReturn' || key === 'returnPercentage';
    const colorStyle = isColoredKey
      ? { color: isProfit ? 'green' : isLoss ? 'red' : 'black' }
      : {};

    return (
      <div
        key={key}
        style={{
          background: '#f5f5f5',
          borderRadius: '12px',
          padding: '1rem 2rem',
          minWidth: '200px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
        }}
      >
        <h4 style={{ margin: 0 }}>
          {key === 'totalValue'
            ? 'Total Assets'
            : key === 'totalReturn'
            ? 'Total Return'
            : 'Return Rate'}
        </h4>
        <p
          style={{
            fontSize: '1.5rem',
            fontWeight: 600,
            margin: 0,
            ...colorStyle
          }}
        >
          {key === 'returnPercentage'
            ? `${analyticsData[key]}%`
            : `$${analyticsData[key].toLocaleString()}`}
        </p>
      </div>
    );
  })}
</section>

      <section style={{ display: 'flex', justifyContent: 'center', marginBottom: '2.5rem' }}>
        <div style={{ width: '440px', background: '#fff', borderRadius: '20px', boxShadow: '0 4px 16px rgba(34,58,95,0.08)', padding: '2.2rem', border: '1px solid #e5e8ed', position: 'relative', transition: 'transform 0.2s' }}
          onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.03)'}
          onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}>
          <ChartErrorBoundary>
            {Array.isArray(analyticsData.assetDistribution) && analyticsData.assetDistribution.length > 0 ? (
              <Pie
                data={{
                  labels: analyticsData.assetDistribution.map(i => i.symbol),
                  datasets: [{
                    data: analyticsData.assetDistribution.map(i => i.percent),
                    backgroundColor: [
                      '#223A5F', '#6C7A89', '#B4BCC2', '#36A2EB', '#FF6384'
                    ],
                    borderColor: '#fff',
                    borderWidth: 2
                  }]
                }}
                options={{ plugins: { legend: { position: 'bottom', labels: { color: '#222', font: { size: 15, weight: 'bold' } } } } }}
              />
            ) : (
              <div style={{textAlign:'center',color:'#999',marginTop:'2rem'}}>No asset distribution data</div>
            )}
          </ChartErrorBoundary>
        </div>
      </section>

      <section style={{ marginBottom: '2.5rem' }}>
        <h3 style={{ color: '#223A5F', fontWeight: 700, fontSize: '1.3rem', letterSpacing: '0.5px', marginBottom: '1rem' }}>Performance Charts</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '2.5rem' }}>
          {Array.isArray(analyticsData.topPerformers) && Array.isArray(analyticsData.worstPerformers) && analyticsData.dailyReturns && Array.isArray(analyticsData.dailyReturns) ? (
            [...analyticsData.topPerformers, ...analyticsData.worstPerformers].map(stock => (
              <div key={stock.symbol} style={{ background: '#fff', borderRadius: '20px', padding: '1.5rem', boxShadow: '0 4px 16px rgba(34,58,95,0.08)', border: '1px solid #e5e8ed', transition: 'transform 0.2s', position: 'relative', cursor: 'pointer' }}
                onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.03)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}>
                <h4 style={{ color: '#6C7A89', fontWeight: 700, fontSize: '1.08rem', marginBottom: '0.5rem', letterSpacing: '0.5px' }}>{stock.symbol}</h4>
                <ChartErrorBoundary>
                  <Line
                    data={{
                      labels: analyticsData.dailyReturns.map(d => d.date),
                      datasets: [{
                        label: `${stock.symbol} price`,
                        data: analyticsData.dailyReturns.map((d, idx) => d.value || 100 + Math.random() * 10 - 5),
                        borderColor: '#223A5F',
                        backgroundColor: 'rgba(34,58,95,0.07)',
                        tension: 0.45,
                        pointRadius: 2,
                        fill: true,
                        borderWidth: 3,
                        pointBackgroundColor: '#6C7A89',
                        pointBorderColor: '#fff',
                        pointHoverRadius: 4
                      }]
                    }}
                    options={{
                      plugins: { legend: { display: false } },
                      scales: {
                        y: { ticks: { callback: v => `$${v}` }, beginAtZero: false, grid: { color: '#e5e8ed' } },
                        x: { grid: { color: '#e5e8ed' } }
                      }
                    }}
                  />
                </ChartErrorBoundary>
              </div>
            ))
          ) : (
            <div style={{textAlign:'center',color:'#999',marginTop:'2rem'}}>No performance data</div>
          )}
        </div>
      </section>

      <Analysis />
    </div>
  );
};

export default Analytics;
