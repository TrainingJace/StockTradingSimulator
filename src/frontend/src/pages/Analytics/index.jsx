import React, { useState, useEffect } from 'react';
import { Pie, Line } from 'react-chartjs-2';
import { Chart, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement } from 'chart.js';
import Modal from 'react-modal';
import Analysis from './Analysis';
import './Analytics.css';
import { analyticsApi } from '../../api/analyticsApi';
import { authApi } from '../../api/authApi';

Chart.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement);

const ChartErrorBoundary = ({ children }) => {
  try {
    return children;
  } catch (error) {
    return <div style={{ color: 'red', textAlign: 'center', margin: '24px 0' }}>图表加载失败，请刷新页面重试</div>;
  }
};

const Analytics = () => {
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedRange, setSelectedRange] = useState('week');
  const [error, setError] = useState(null);
  const [simulationDate, setSimulationDate] = useState(null);

  const timeRanges = [
    { label: 'All Time', value: 'all' },
    { label: 'Past Week', value: 'week' },
    { label: 'Past Month', value: 'month' },
    { label: 'Past 3 Months', value: '3month' },
    { label: 'Year to Date', value: 'ytd' },
  ];

  const safe = (val) => (val === null || val === undefined || (Array.isArray(val) && val.length === 0)) ? '--' : val;

  // Fetch analytics data from API
  useEffect(() => {
    setLoading(true);
    authApi.getCurrentUser()
      .then(user => {
        const userSimDate = user?.simulation_date || user?.simulationDate;
        return analyticsApi.getPortfolioAnalytics({});
      })
      .then(allData => {
        let maxDate = null;
        if (allData.dailyReturns && allData.dailyReturns.length > 0) {
          maxDate = allData.dailyReturns.reduce((max, cur) => cur.date > max ? cur.date : max, allData.dailyReturns[0].date);
        }
        setSimulationDate(maxDate);
        let params = {};
        if (selectedRange !== 'all' && maxDate) {
          const simDate = new Date(maxDate);
          let startDate = null;
          if (selectedRange === 'week') {
            startDate = new Date(simDate.getTime() - 7 * 24 * 3600 * 1000);
          } else if (selectedRange === 'month') {
            startDate = new Date(simDate.getTime() - 30 * 24 * 3600 * 1000);
          } else if (selectedRange === '3month') {
            startDate = new Date(simDate.getTime() - 90 * 24 * 3600 * 1000);
          } else if (selectedRange === 'ytd') {
            startDate = new Date(simDate.getFullYear(), 0, 1);
          }
          if (startDate) {
            params.startDate = startDate.toISOString().slice(0, 10);
            params.endDate = maxDate;
          }
        }
        return analyticsApi.getPortfolioAnalytics(selectedRange === 'all' ? {} : params);
      })
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

  // Debug output for assetDistribution
  console.log("Asset Distribution:", analyticsData.assetDistribution);

  return (
    <div className="analytics-page" style={{ padding: '2.5rem', fontFamily: 'Inter,Segoe UI,sans-serif', maxWidth: '1280px', margin: '0 auto', background: '#f7f8fa' }}>
      <header style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
        <h1 style={{ fontSize: '2.8rem', margin: 0, color: '#223A5F', letterSpacing: '1.5px', fontWeight: 800 }}>Portfolio Analytics</h1>
        <p style={{ color: '#6C7A89', fontSize: '1.18rem', fontWeight: 500, marginTop: '0.5rem' }}>Track your investment performance and get smart insights</p>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginTop: '2rem', marginBottom: '1.5rem' }}>
          <select
            value={selectedRange}
            onChange={e => setSelectedRange(e.target.value)}
            style={{
              padding: '10px 20px',
              borderRadius: '12px',
              border: '1.5px solid #36A2EB',
              color: '#222',
              background: '#f7f8fa',
              fontSize: '1.08rem',
              minWidth: '200px',
              boxShadow: '0 2px 8px rgba(54,162,235,0.10)',
              fontWeight: 500,
              outline: 'none',
              transition: 'border 0.2s'
            }}
          >
            {timeRanges.map(range => (
              <option key={range.value} value={range.value}>{range.label}</option>
            ))}
          </select>
        </div>
      </header>

      {/* Main content section */}
      <section style={{ display: 'flex', justifyContent: 'center', gap: '2rem' }}>
        {/* Left side stats */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
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
                  background: '#fff',
                  borderRadius: '12px',
                  padding: '1rem 1.5rem',
                  width: '220px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
                }}
              >
                <h4 style={{ margin: 0, fontSize: '0.9rem', color: '#666' }}>
                  {key === 'totalValue' ? 'Total Assets' : key === 'totalReturn' ? 'Total Return' : 'Return Rate'}
                </h4>
                <p style={{ fontSize: '1.3rem', fontWeight: 600, margin: '0.5rem 0 0 0', ...colorStyle }}>
                  {key === 'returnPercentage' ? `${safe(analyticsData[key])}%` : `$${safe(analyticsData[key]).toLocaleString()}`}
                </p>
              </div>
            );
          })}
        </div>

        {/* Right side pie chart */}
        <div style={{ 
          width: '380px',
          background: '#fff', 
          borderRadius: '12px', 
          boxShadow: '0 2px 8px rgba(0,0,0,0.05)', 
          padding: '1.5rem',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center'
        }}>
          <ChartErrorBoundary>
            {Array.isArray(analyticsData.assetDistribution) && analyticsData.assetDistribution.length > 0 ? (
              <Pie
                data={{
                  labels: analyticsData.assetDistribution.map(i => i.symbol),
                  datasets: [{
                    data: analyticsData.assetDistribution.map(i => Number(i.percent)),
                    backgroundColor: [
                      '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', 
                      '#9966FF', '#FF9F40', '#7FD8BE', '#FC5185', 
                      '#4B7BE5', '#6C757D'
                    ],
                    borderColor: '#fff',
                    borderWidth: 2
                  }]
                }}
                options={{ 
                  plugins: { 
                    legend: { 
                      position: 'bottom',
                      labels: { 
                        color: '#222',
                        font: { size: 13, weight: 'bold' },
                        boxWidth: 14,
                        padding: 15
                      }
                    } 
                  },
                  maintainAspectRatio: true,
                  responsive: true
                }}
              />
            ) : (
              <div style={{ textAlign: 'center', color: '#999', marginTop: '1rem' }}>No asset distribution data</div>
            )}
          </ChartErrorBoundary>
        </div>
      </section>

      <Analysis />
    </div>
  );
};

export default Analytics;

