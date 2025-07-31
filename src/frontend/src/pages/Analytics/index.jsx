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
    return <div style={{ color: 'red', textAlign: 'center', margin: '24px 0' }}>Chart failed to load, please refresh the page</div>;
  }
};

const Analytics = () => {
  const [settling, setSettling] = useState(false);
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
        // Always use current date for simulation
        const now = new Date();
        const nowStr = now.toISOString().slice(0, 10);
        setSimulationDate(nowStr);
        let params = {};
        if (selectedRange !== 'all') {
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
            params.endDate = nowStr;
          }
        }
        // Pass startDate and endDate parameters
        return analyticsApi.getPortfolioAnalytics(selectedRange === 'all' ? {} : { startDate: params.startDate, endDate: params.endDate });
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
    return (
      <div className="analytics-page" style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        background: '#f8fafc'
      }}>
        <div style={{ 
          textAlign: 'center',
          padding: '2rem',
          background: 'white',
          borderRadius: '12px',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)'
        }}>
          <div style={{
            width: '50px',
            height: '50px',
            border: '4px solid #e2e8f0',
            borderTopColor: '#3b82f6',
            borderRadius: '50%',
            margin: '0 auto 1rem',
            animation: 'spin 1s linear infinite'
          }}></div>
          <p style={{ 
            color: '#334155',
            fontSize: '1.1rem',
            fontWeight: '500'
          }}>Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="analytics-page" style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        background: '#f8fafc'
      }}>
        <div style={{ 
          textAlign: 'center',
          padding: '2rem',
          background: 'white',
          borderRadius: '12px',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
          maxWidth: '500px'
        }}>
          <div style={{
            width: '50px',
            height: '50px',
            background: '#fee2e2',
            borderRadius: '50%',
            margin: '0 auto 1rem',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            color: '#dc2626',
            fontSize: '1.5rem'
          }}>!</div>
          <h3 style={{ 
            color: '#dc2626',
            fontSize: '1.25rem',
            fontWeight: '600',
            marginBottom: '0.5rem'
          }}>Load Failed</h3>
          <p style={{ 
            color: '#64748b',
            marginBottom: '1.5rem'
          }}>{error}</p>
          <button 
            onClick={() => window.location.reload()}
            style={{
              background: '#3b82f6',
              color: 'white',
              border: 'none',
              padding: '0.5rem 1rem',
              borderRadius: '6px',
              fontWeight: '500',
              cursor: 'pointer',
              transition: 'background 0.2s'
            }}
            onMouseOver={(e) => e.target.background = '#2563eb'}
            onMouseOut={(e) => e.target.background = '#3b82f6'}
          >
            Refresh Page
          </button>
        </div>
      </div>
    );
  }

  if (!analyticsData) {
    return (
      <div className="analytics-page" style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        background: '#f8fafc'
      }}>
        <div style={{ 
          textAlign: 'center',
          padding: '2rem',
          background: 'white',
          borderRadius: '12px',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
          maxWidth: '500px'
        }}>
          <div style={{
            width: '50px',
            height: '50px',
            background: '#e2e8f0',
            borderRadius: '50%',
            margin: '0 auto 1rem',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            color: '#64748b',
            fontSize: '1.5rem'
          }}>i</div>
          <h3 style={{ 
            color: '#334155',
            fontSize: '1.25rem',
            fontWeight: '600',
            marginBottom: '0.5rem'
          }}>No Analytics Data</h3>
          <p style={{ 
            color: '#64748b',
            marginBottom: '1.5rem'
          }}>Please check login status or data source</p>
        </div>
      </div>
    );
  }

  // 定义颜色方案
  const colors = {
    primary: '#4f46e5',
    primaryLight: '#6366f1',
    secondary: '#10b981',
    danger: '#ef4444',
    warning: '#f59e0b',
    background: '#f8fafc',
    cardBg: '#ffffff',
    textPrimary: '#1e293b',
    textSecondary: '#64748b',
    border: '#e2e8f0',
    chartColors: [
      '#4f46e5', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', 
      '#ec4899', '#14b8a6', '#84cc16', '#f97316', '#06b6d4'
    ]
  };

  return (
    <div className="analytics-page" style={{ 
      padding: '2rem', 
      fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', 
      maxWidth: '1400px', 
      margin: '0 auto', 
      background: colors.background,
      minHeight: '100vh',
      width: '100%',
      boxSizing: 'border-box'
    }}>
      <header style={{ 
        textAlign: 'center', 
        marginBottom: '2.5rem',
        position: 'relative'
      }}>
        <h1 style={{ 
          fontSize: '2.5rem', 
          margin: 0, 
          color: colors.textPrimary, 
          fontWeight: 700,
          letterSpacing: '-0.025em',
          marginBottom: '0.5rem'
        }}>Portfolio Analytics</h1>
        
        <p style={{
          color: colors.textSecondary,
          fontSize: '1.1rem',
          marginBottom: '1.5rem',
          maxWidth: '600px',
          marginLeft: 'auto',
          marginRight: 'auto',
          lineHeight: '1.5'
        }}>
          {simulationDate && `Data as of ${new Date(simulationDate).toLocaleDateString()}`}
        </p>
        
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          gap: '1rem', 
          marginTop: '1.5rem'
        }}>
          <select
            value={selectedRange}
            onChange={e => setSelectedRange(e.target.value)}
            style={{
              padding: '10px 16px',
              borderRadius: '8px',
              border: `1px solid ${colors.border}`,
              color: colors.textPrimary,
              background: colors.cardBg,
              fontSize: '1rem',
              minWidth: '180px',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
              fontWeight: 500,
              outline: 'none',
              transition: 'all 0.2s',
              cursor: 'pointer',
              appearance: 'none',
              backgroundImage: 'url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%231E293B%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E")',
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'right 0.7rem top 50%',
              backgroundSize: '0.65rem auto'
            }}
          >
            {timeRanges.map(range => (
              <option key={range.value} value={range.value}>{range.label}</option>
            ))}
          </select>
        </div>
      </header>

      {/* Stats and performers in one row */}
      <section style={{ 
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '1.5rem',
        marginBottom: '2.5rem',
        width: '100%'
      }}>
        {/* Stats Cards */}
        <div style={{ 
          background: colors.cardBg,
          borderRadius: '12px',
          padding: '1.5rem',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.03)',
          border: `1px solid ${colors.border}`,
          transition: 'transform 0.2s, box-shadow 0.2s',
          ':hover': {
            transform: 'translateY(-2px)',
            boxShadow: '0 10px 15px rgba(0, 0, 0, 0.05)'
          },
          width: '100%'
        }}>
          <h3 style={{ 
            color: colors.textPrimary,
            fontSize: '1.25rem',
            fontWeight: 600,
            marginBottom: '1.5rem',
            borderBottom: `1px solid ${colors.border}`,
            paddingBottom: '0.75rem'
          }}>Portfolio Summary</h3>
          
          <div style={{ 
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
            gap: '1rem',
            width: '100%'
          }}>
            {['totalValue', 'totalReturn', 'returnPercentage'].map((key) => {
              const isProfit = analyticsData[key] > 0;
              const isLoss = analyticsData[key] < 0;
              const isColoredKey = key === 'totalReturn' || key === 'returnPercentage';
              const colorStyle = isColoredKey
                ? { color: isProfit ? colors.secondary : isLoss ? colors.danger : colors.textPrimary }
                : { color: colors.textPrimary };
              
              const iconBg = isColoredKey 
                ? (isProfit ? '#d1fae5' : isLoss ? '#fee2e2' : '#e2e8f0') 
                : '#e0e7ff';
              
              const iconColor = isColoredKey 
                ? (isProfit ? colors.secondary : isLoss ? colors.danger : colors.textSecondary) 
                : colors.primary;
              
              return (
                <div
                  key={key}
                  style={{
                    background: 'transparent',
                    borderRadius: '8px',
                    padding: '0.75rem',
                    textAlign: 'center',
                    border: `1px solid ${colors.border}`,
                    width: '100%'
                  }}
                >
                  <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    background: iconBg,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 0.75rem',
                    color: iconColor
                  }}>
                    {key === 'totalValue' ? (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 1L3 5V11C3 16.55 6.84 21.74 12 23C17.16 21.74 21 16.55 21 11V5L12 1ZM12 11.99H19C18.47 16.11 15.72 19.78 12 20.93V12H5V6.3L12 3.19V11.99Z" fill="currentColor"/>
                      </svg>
                    ) : key === 'totalReturn' ? (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 8L18.29 8.29L13.41 13.17L9.41 9.17L2 16.59L3.41 18L9.41 12L13.41 16L19.71 9.71L22 12V6H16Z" fill="currentColor"/>
                      </svg>
                    ) : (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M11 15H13V17H11V15ZM11 7H13V13H11V7ZM12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 20C7.59 20 4 16.41 4 12C4 7.59 7.59 4 12 4C16.41 4 20 7.59 20 12C20 16.41 16.41 20 12 20Z" fill="currentColor"/>
                      </svg>
                    )}
                  </div>
                  <h4 style={{ 
                    margin: 0, 
                    fontSize: '0.875rem', 
                    fontWeight: 500,
                    color: colors.textSecondary,
                    marginBottom: '0.25rem'
                  }}>
                    {key === 'totalValue'
                      ? 'Total Assets'
                      : key === 'totalReturn'
                        ? 'Total Return'
                        : 'Return Rate'}
                  </h4>
                  <p
                    style={{
                      fontSize: '1.25rem',
                      fontWeight: 600,
                      margin: 0,
                      ...colorStyle
                    }}
                  >
                    {key === 'returnPercentage'
                      ? `${safe(analyticsData[key])}%`
                      : `$${safe(analyticsData[key]).toLocaleString()}`}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
        
        {/* Top/Worst performers */}
        <div style={{ 
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '1rem',
          width: '100%'
        }}>
          <div style={{ 
            background: colors.cardBg, 
            borderRadius: '12px', 
            padding: '1.5rem', 
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.03)',
            border: `1px solid ${colors.border}`,
            width: '100%'
          }}>
            <h3 style={{ 
              color: colors.textPrimary,
              fontSize: '1.25rem',
              fontWeight: 600,
              marginBottom: '1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <span style={{
                width: '24px',
                height: '24px',
                borderRadius: '6px',
                background: '#d1fae5',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: colors.secondary
              }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M5 9.2H8V19H5V9.2ZM10.6 5H13.4V19H10.6V5ZM16.2 13H19V19H16.2V13Z" fill="currentColor"/>
                </svg>
              </span>
              Top Performers
            </h3>
            <ul style={{ 
              padding: 0, 
              margin: 0, 
              listStyle: 'none',
              display: 'grid',
              gap: '0.75rem'
            }}>
              {(analyticsData.topPerformers || []).map(item => (
                <li key={item.symbol} style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  paddingBottom: '0.75rem',
                  borderBottom: `1px solid ${colors.border}`,
                  ':last-child': {
                    borderBottom: 'none',
                    paddingBottom: '0'
                  }
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ 
                      fontWeight: 600,
                      color: colors.textPrimary
                    }}>{item.symbol}</span>
                  </div>
                  <span style={{ 
                    marginLeft: 6, 
                    color: item.change >= 0 ? colors.secondary : colors.danger,
                    fontWeight: 600,
                    fontSize: '0.95rem'
                  }}>
                    {item.change > 0 ? '+' : ''}{item.change}%
                  </span>
                </li>
              ))}
            </ul>
          </div>
          
          <div style={{ 
            background: colors.cardBg, 
            borderRadius: '12px', 
            padding: '1.5rem', 
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.03)',
            border: `1px solid ${colors.border}`,
            width: '100%'
          }}>
            <h3 style={{ 
              color: colors.textPrimary,
              fontSize: '1.25rem',
              fontWeight: 600,
              marginBottom: '1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <span style={{
                width: '24px',
                height: '24px',
                borderRadius: '6px',
                background: '#fee2e2',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: colors.danger
              }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M19 13H16V3H19V13ZM13 8H10V3H13V8ZM7 19H4V3H7V19Z" fill="currentColor"/>
                </svg>
              </span>
              Worst Performers
            </h3>
            <ul style={{ 
              padding: 0, 
              margin: 0, 
              listStyle: 'none',
              display: 'grid',
              gap: '0.75rem'
            }}>
              {(analyticsData.worstPerformers || []).map(item => (
                <li key={item.symbol} style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  paddingBottom: '0.75rem',
                  borderBottom: `1px solid ${colors.border}`,
                  ':last-child': {
                    borderBottom: 'none',
                    paddingBottom: '0'
                  }
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ 
                      fontWeight: 600,
                      color: colors.textPrimary
                    }}>{item.symbol}</span>
                  </div>
                  <span style={{ 
                    marginLeft: 6, 
                    color: item.change >= 0 ? colors.secondary : colors.danger,
                    fontWeight: 600,
                    fontSize: '0.95rem'
                  }}>
                    {item.change > 0 ? '+' : ''}{item.change}%
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Pie and Line chart side by side */}
      <section style={{ 
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 400px), 1fr))',
        gap: '2rem',
        marginBottom: '3rem',
        width: '100%'
      }}>
        {/* Asset Distribution Pie Chart */}
        <div style={{ 
          background: colors.cardBg, 
          borderRadius: '12px', 
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.03)', 
          padding: '1.5rem', 
          border: `1px solid ${colors.border}`,
          transition: 'transform 0.2s',
          ':hover': {
            transform: 'translateY(-2px)',
            boxShadow: '0 10px 15px rgba(0, 0, 0, 0.05)'
          },
          width: '100%',
          maxWidth: '100%'
        }}>
          <h3 style={{ 
            color: colors.textPrimary,
            fontSize: '1.25rem',
            fontWeight: 600,
            marginBottom: '1.5rem'
          }}>Asset Distribution</h3>
          <div style={{ 
            position: 'relative',
            height: '300px',
            width: '100%'
          }}>
            <ChartErrorBoundary>
              {Array.isArray(analyticsData.assetDistribution) && analyticsData.assetDistribution.length > 0 ? (
                (() => {
                  // 过滤资产分布到选定区间（与折线图一致，按 dailyReturns 日期过滤）
                  let filteredAssets = analyticsData.assetDistribution;
                  if (selectedRange !== 'all' && simulationDate && analyticsData.dailyReturns) {
                    let endDate = simulationDate;
                    let startDate = null;
                    const end = new Date(endDate);
                    if (selectedRange === 'week') {
                      startDate = new Date(end.getTime() - 7 * 24 * 3600 * 1000);
                    } else if (selectedRange === 'month') {
                      startDate = new Date(end.getTime() - 30 * 24 * 3600 * 1000);
                    } else if (selectedRange === '3month') {
                      startDate = new Date(end.getTime() - 90 * 24 * 3600 * 1000);
                    } else if (selectedRange === 'ytd') {
                      startDate = new Date(end.getFullYear(), 0, 1);
                    }
                    if (startDate) {
                      const startStr = startDate.toISOString().slice(0, 10);
                      // 获取区间内的 symbol 列表（从 dailyReturns）
                      const validDates = analyticsData.dailyReturns.filter(d => d.date >= startStr && d.date <= endDate);
                      // 这里假设 assetDistribution 每天都一样，实际如需精确应后端返回区间资产分布
                      // 仅保留有持仓的 symbol
                      const validSymbols = new Set();
                      validDates.forEach(d => {
                        if (d.symbols && Array.isArray(d.symbols)) {
                          d.symbols.forEach(s => validSymbols.add(s));
                        }
                      });
                      // 如果 dailyReturns 没有 symbols 字段，则直接用 assetDistribution
                      if (validSymbols.size > 0) {
                        filteredAssets = filteredAssets.filter(a => validSymbols.has(a.symbol));
                      }
                    }
                  }
                  return (
                    <Pie
                      data={{
                        labels: filteredAssets.map(i => i.symbol),
                        datasets: [{
                          data: filteredAssets.map(i => Number(i.percent)),
                          backgroundColor: colors.chartColors,
                          borderColor: colors.cardBg,
                          borderWidth: 2
                        }]
                      }}
                      options={{ 
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: { 
                          legend: { 
                            position: 'bottom', 
                            labels: { 
                              color: colors.textPrimary, 
                              font: { 
                                size: 13, 
                                weight: '500' 
                              },
                              padding: 20,
                              usePointStyle: true,
                              pointStyle: 'circle'
                            } 
                          },
                          tooltip: {
                            backgroundColor: colors.textPrimary,
                            titleFont: {
                              size: 14,
                              weight: '600'
                            },
                            bodyFont: {
                              size: 13
                            },
                            padding: 12,
                            usePointStyle: true,
                            callbacks: {
                              label: function(context) {
                                return `${context.label}: ${context.raw}%`;
                              }
                            }
                          }
                        }
                      }}
                    />
                  );
                })()
              ) : (
                <div style={{ 
                  textAlign: 'center', 
                  color: colors.textSecondary, 
                  margin: '2rem 0',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '1rem'
                }}>
                  <div style={{
                    width: '80px',
                    height: '80px',
                    borderRadius: '50%',
                    background: '#f1f5f9',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: colors.textSecondary
                  }}>
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M11 2V22C5.93 21.5 2 17.21 2 12C2 6.79 5.93 2.5 11 2ZM13.03 2V10.99H22C21.53 5.25 17.76 2.03 13.03 2ZM13.03 13.01V22C17.77 21.96 21.53 18.73 22 13.01H13.03Z" fill="currentColor"/>
                    </svg>
                  </div>
                  <p style={{ margin: 0 }}>No asset distribution data available</p>
                </div>
              )}
            </ChartErrorBoundary>
          </div>
        </div>
        
        {/* Portfolio Performance Line Chart */}
        <div style={{ 
          background: colors.cardBg, 
          borderRadius: '12px', 
          padding: '1.5rem', 
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.03)',
          border: `1px solid ${colors.border}`,
          transition: 'transform 0.2s',
          ':hover': {
            transform: 'translateY(-2px)',
            boxShadow: '0 10px 15px rgba(0, 0, 0, 0.05)'
          },
          width: '100%',
          maxWidth: '100%'
        }}>
          <h3 style={{ 
            color: colors.textPrimary,
            fontSize: '1.25rem',
            fontWeight: 600,
            marginBottom: '1.5rem'
          }}>Portfolio Performance</h3>
          <div style={{ 
            position: 'relative',
            height: '300px',
            width: '100%'
          }}>
            <ChartErrorBoundary>
              {analyticsData.dailyReturns && Array.isArray(analyticsData.dailyReturns) && analyticsData.dailyReturns.length > 0 ? (
                (() => {
                  // 过滤 dailyReturns 到选定区间
                  let filteredReturns = analyticsData.dailyReturns;
                  if (selectedRange !== 'all' && simulationDate) {
                    let endDate = simulationDate;
                    let startDate = null;
                    const end = new Date(endDate);
                    if (selectedRange === 'week') {
                      startDate = new Date(end.getTime() - 7 * 24 * 3600 * 1000);
                    } else if (selectedRange === 'month') {
                      startDate = new Date(end.getTime() - 30 * 24 * 3600 * 1000);
                    } else if (selectedRange === '3month') {
                      startDate = new Date(end.getTime() - 90 * 24 * 3600 * 1000);
                    } else if (selectedRange === 'ytd') {
                      startDate = new Date(end.getFullYear(), 0, 1);
                    }
                    if (startDate) {
                      const startStr = startDate.toISOString().slice(0, 10);
                      filteredReturns = filteredReturns.filter(d => d.date >= startStr && d.date <= endDate);
                    }
                  }
                  return (
                    <Line
                      data={{
                        labels: filteredReturns.map(d => d.date),
                        datasets: [{
                          label: 'Portfolio Value',
                          data: filteredReturns.map(d => Number(d.value !== undefined ? d.value : d.total_value)),
                          borderColor: colors.primary,
                          backgroundColor: `${colors.primary}10`,
                          tension: 0.4,
                          pointRadius: 3,
                          fill: true,
                          borderWidth: 2,
                          pointBackgroundColor: colors.cardBg,
                          pointBorderColor: colors.primary,
                          pointHoverRadius: 5,
                          pointHoverBackgroundColor: colors.primary,
                          pointHoverBorderColor: colors.cardBg,
                          pointHoverBorderWidth: 2
                        }]
                      }}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: { 
                          legend: { 
                            display: true,
                            labels: {
                              color: colors.textPrimary,
                              font: {
                                size: 13,
                                weight: '500'
                              },
                              usePointStyle: true,
                              padding: 20
                            }
                          },
                          tooltip: {
                            backgroundColor: colors.textPrimary,
                            titleFont: {
                              size: 14,
                              weight: '600'
                            },
                            bodyFont: {
                              size: 13
                            },
                            padding: 12,
                            usePointStyle: true,
                            callbacks: {
                              label: function(context) {
                                return `$${context.raw.toLocaleString()}`;
                              }
                            }
                          }
                        },
                        scales: {
                          y: { 
                            ticks: { 
                              callback: v => `$${v}`,
                              color: colors.textSecondary
                            }, 
                            beginAtZero: false, 
                            grid: { 
                              color: colors.border,
                              drawBorder: false
                            } 
                          },
                          x: { 
                            grid: { 
                              color: colors.border,
                              drawBorder: false
                            },
                            ticks: {
                              color: colors.textSecondary
                            }
                          }
                        }
                      }}
                    />
                  );
                })()
              ) : (
                <div style={{ 
                  textAlign: 'center', 
                  color: colors.textSecondary, 
                  margin: '2rem 0',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '1rem'
                }}>
                  <div style={{
                    width: '80px',
                    height: '80px',
                    borderRadius: '50%',
                    background: '#f1f5f9',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: colors.textSecondary
                  }}>
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M16 6L18.29 8.29L13.41 13.17L9.41 9.17L2 16.59L3.41 18L9.41 12L13.41 16L19.71 9.71L22 12V6H16Z" fill="currentColor"/>
                    </svg>
                  </div>
                  <p style={{ margin: 0 }}>No performance data available</p>
                </div>
              )}
            </ChartErrorBoundary>
          </div>
        </div>
      </section>

      <Analysis />
    </div>
  );
};

export default Analytics;