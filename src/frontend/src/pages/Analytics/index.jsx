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

      {/* 总资产统计和饼图布局在一行 */}
      <section style={{ display: 'flex', justifyContent: 'center', gap: '2rem', marginBottom: '2.5rem' }}>
        {/* 左侧总资产统计 */}
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

        {/* 中间饼图 */}
        <div style={{ width: '440px', background: '#fff', borderRadius: '20px', boxShadow: '0 4px 16px rgba(34,58,95,0.08)', padding: '2.2rem', border: '1px solid #e5e8ed' }}>
          <ChartErrorBoundary>
            {Array.isArray(analyticsData.assetDistribution) && analyticsData.assetDistribution.length > 0 ? (
              <Pie
                data={{
                  labels: analyticsData.assetDistribution.map(i => i.symbol),
                  datasets: [{
                    data: analyticsData.assetDistribution.map(i => Number(i.percent)),
                    backgroundColor: [
                      '#FF6384', // 粉红
                      '#36A2EB', // 蓝色
                      '#FFCE56', // 黄色
                      '#4BC0C0', // 青色
                      '#9966FF', // 紫色
                      '#FF9F40', // 橙色
                      '#7FD8BE', // 薄荷绿
                      '#FC5185', // 玫红
                      '#4B7BE5', // 靛蓝
                      '#6C757D'  // 灰色
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
                        font: { 
                          size: 15, 
                          weight: 'bold' 
                        } 
                      } 
                    } 
                  } 
                }}
              />
            ) : (
              <div style={{ textAlign: 'center', color: '#999', marginTop: '2rem' }}>No asset distribution data</div>
            )}
          </ChartErrorBoundary>
        </div>

        {/* 右侧 Top/Worst Performers */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', minWidth: '250px' }}>
          {/* Top Performers */}
          <div style={{ background: '#fff', borderRadius: '16px', padding: '1.5rem', boxShadow: '0 2px 8px rgba(34,58,95,0.08)' }}>
            <h4 style={{ color: '#223A5F', margin: '0 0 1rem 0' }}>Top Performers</h4>
            <ul style={{ padding: 0, margin: 0, listStyle: 'none' }}>
              {(analyticsData.topPerformers || []).map(item => (
                <li key={item.symbol} style={{ marginBottom: '0.8rem' }}>
                  <div style={{ fontWeight: 600 }}>{item.symbol}</div>
                  <div>
                    <span style={{ color: item.change >= 0 ? 'green' : 'red', marginRight: '8px' }}>
                      {item.change > 0 ? '+' : ''}{item.change}%
                    </span>
                    <span style={{ color: item.profit >= 0 ? 'green' : 'red', fontSize: '0.9rem' }}>
                      ({item.profit > 0 ? '+' : ''}${Number(item.profit).toFixed(2)})
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          </div>
          
          {/* Worst Performers */}
          <div style={{ background: '#fff', borderRadius: '16px', padding: '1.5rem', boxShadow: '0 2px 8px rgba(34,58,95,0.08)' }}>
            <h4 style={{ color: '#223A5F', margin: '0 0 1rem 0' }}>Worst Performers</h4>
            <ul style={{ padding: 0, margin: 0, listStyle: 'none' }}>
              {(analyticsData.worstPerformers || []).map(item => (
                <li key={item.symbol} style={{ marginBottom: '0.8rem' }}>
                  <div style={{ fontWeight: 600 }}>{item.symbol}</div>
                  <div>
                    <span style={{ color: item.change >= 0 ? 'green' : 'red', marginRight: '8px' }}>
                      {item.change > 0 ? '+' : ''}{item.change}%
                    </span>
                    <span style={{ color: item.profit >= 0 ? 'green' : 'red', fontSize: '0.9rem' }}>
                      ({item.profit > 0 ? '+' : ''}${Number(item.profit).toFixed(2)})
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* 折线图 */}
      <section style={{ marginBottom: '2.5rem' }}>
        <h3 style={{ color: '#223A5F', fontWeight: 700, fontSize: '1.3rem', letterSpacing: '0.5px', marginBottom: '1rem' }}>Performance Charts</h3>
        <div style={{ background: '#fff', borderRadius: '20px', padding: '2rem', boxShadow: '0 4px 16px rgba(34,58,95,0.08)', border: '1px solid #e5e8ed', maxWidth: '900px', margin: '0 auto' }}>
          <ChartErrorBoundary>
            {analyticsData.dailyReturns && Array.isArray(analyticsData.dailyReturns) && analyticsData.dailyReturns.length > 0 ? (
              <Line
                data={{
                  labels: analyticsData.dailyReturns.map(d => d.date),
                  datasets: [{
                    label: 'Portfolio Value',
                    data: analyticsData.dailyReturns.map(d => Number(d.value !== undefined ? d.value : d.total_value)),
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
                  plugins: { legend: { display: true } },
                  scales: {
                    y: { ticks: { callback: v => `$${v}` }, beginAtZero: false, grid: { color: '#e5e8ed' } },
                    x: { grid: { color: '#e5e8ed' } }
                  }
                }}
              />
            ) : (
              <div style={{ textAlign: 'center', color: '#999', marginTop: '2rem' }}>No performance data</div>
            )}
          </ChartErrorBoundary>
        </div>
      </section>

      <Analysis />
    </div>
  );
};

export default Analytics;

