import React, { useState, useEffect } from 'react';
import { Pie, Line } from 'react-chartjs-2';
import { Chart, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement } from 'chart.js';
import Modal from 'react-modal';
import Analysis from './Analysis';
import './Analytics.css';

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

  const [analyticsData, setAnalyticsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedRange, setSelectedRange] = useState('week');

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
    return <div className="analytics-page"><p>Loading analytics...</p></div>;
  }

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
              {key === 'returnPercentage' ? `${analyticsData[key]}%` : `$${analyticsData[key].toLocaleString()}`}
            </p>
          </div>
        ))}
      </section>

      <section style={{ display: 'flex', justifyContent: 'center', marginBottom: '2rem' }}>
        <div style={{ width: '400px' }}>
          <ChartErrorBoundary>
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
          </ChartErrorBoundary>
        </div>
      </section>

      <section style={{ marginBottom: '2rem' }}>
        <h3>Performance Charts</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
          {[...analyticsData.topPerformers, ...analyticsData.worstPerformers].map(stock => (
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
          ))}
        </div>
      </section>

      <Analysis />
    </div>
  );
};

export default Analytics;
