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
    { label: 'Past Week', value: 'week' },
    { label: 'Past Month', value: 'month' },
    { label: 'Past 3 Months', value: '3month' },
    { label: 'Year to Date', value: 'ytd' },
  ];

  // ...existing code...

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
    analyticsApi.getPortfolioAnalytics()
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
    <div className="analytics-page" style={{ padding: '2rem', fontFamily: 'sans-serif', maxWidth: '1200px', margin: '0 auto' }}>
      <header style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2.5rem', margin: 0 }}>Portfolio Analytics</h1>
        <p style={{ color: '#777' }}>Track your investment performance and get smart insights</p>
      </header>

      <section style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap', justifyContent: 'center', marginBottom: '2rem' }}>
        {['totalValue', 'totalReturn', 'returnPercentage'].map((key, idx) => (
          <div key={key} style={{ background: '#f5f5f5', borderRadius: '12px', padding: '1rem 2rem', minWidth: '200px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
            <h4 style={{ margin: 0 }}>{key === 'totalValue' ? 'Total Assets' : key === 'totalReturn' ? 'Total Return' : 'Return Rate'}</h4>
            <p style={{ fontSize: '1.5rem', fontWeight: 600, margin: 0 }}>
              {analyticsData[key] === '--' ? '--' : (key === 'returnPercentage' ? `${analyticsData[key]}%` : `$${Number(analyticsData[key]).toLocaleString()}`)}
            </p>
          </div>
        ))}
      </section>

      <section style={{ display: 'flex', justifyContent: 'center', marginBottom: '2rem' }}>
        <div style={{ width: '400px' }}>
          <ChartErrorBoundary>
            {Array.isArray(analyticsData.assetDistribution) && analyticsData.assetDistribution.length > 0 ? (
              <Pie
                data={{
                  labels: analyticsData.assetDistribution.map(i => i.symbol),
                  datasets: [{
                    data: analyticsData.assetDistribution.map(i => i.percent),
                    backgroundColor: ['#36A2EB', '#FF6384', '#FFCD56', '#FF9F40', '#4BC0C0'],
                  }]
                }}
                options={{ plugins: { legend: { position: 'bottom' } } }}
              />
            ) : (
              <div style={{textAlign:'center',color:'#999',marginTop:'2rem'}}>暂无资产分布数据</div>
            )}
          </ChartErrorBoundary>
        </div>
      </section>

      <section style={{ marginBottom: '2rem' }}>
        <h3>Performance Charts</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
          {Array.isArray(analyticsData.topPerformers) && Array.isArray(analyticsData.worstPerformers) && analyticsData.dailyReturns && Array.isArray(analyticsData.dailyReturns) ? (
            [...analyticsData.topPerformers, ...analyticsData.worstPerformers].map(stock => (
              <div key={stock.symbol} style={{ background: '#fff', borderRadius: '12px', padding: '1rem', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
                <h4>{stock.symbol}</h4>
                <ChartErrorBoundary>
                  <Line
                    data={{
                      labels: analyticsData.dailyReturns.map(d => d.date),
                      datasets: [{
                        label: `${stock.symbol} price`,
                        data: analyticsData.dailyReturns.map((_, idx) => 100 + Math.random() * 10 - 5),
                        borderColor: '#36A2EB',
                        tension: 0.4,
                      }]
                    }}
                    options={{
                      plugins: { legend: { display: false } },
                      scales: {
                        y: { ticks: { callback: v => `$${v}` }, beginAtZero: false }
                      }
                    }}
                  />
                </ChartErrorBoundary>
              </div>
            ))
          ) : (
            <div style={{textAlign:'center',color:'#999',marginTop:'2rem'}}>暂无表现数据</div>
          )}
        </div>
      </section>

      <Analysis />
    </div>
  );
};

export default Analytics;
