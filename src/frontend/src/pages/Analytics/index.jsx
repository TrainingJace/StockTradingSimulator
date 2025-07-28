// 分析页面组件
import React, { useState, useEffect } from 'react';
import './Analytics.css';

const Analytics = () => {
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // TODO: 从API获取分析数据
    const fetchAnalyticsData = async () => {
      try {
        setLoading(true);
        // const data = await analyticsApi.getPortfolioAnalytics();
        // setAnalyticsData(data);
        
        // 模拟数据，等API实现后移除
        setTimeout(() => {
          setAnalyticsData({
            totalValue: 0,
            totalReturn: 0,
            returnPercentage: 0,
            dailyReturns: [],
            topPerformers: [],
            worstPerformers: []
          });
          setLoading(false);
        }, 1000);
      } catch (err) {
        setError('Failed to load analytics data');
        setLoading(false);
      }
    };

    fetchAnalyticsData();
  }, []);

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
            <div className="page-header">
        <h1>Portfolio Analytics</h1>
        <p>View your investment performance and analysis</p>
      </div>

      <div className="analytics-content">
        <div className="analytics-grid">
                    <div className="analytics-card">
            <h3>Total Assets</h3>
            <div className="metric-value">
              ${analyticsData?.totalValue?.toLocaleString() || '0.00'}
            </div>
          </div>

          <div className="analytics-card">
            <h3>Total Return</h3>
            <div className="metric-value">
              ${analyticsData?.totalReturn?.toLocaleString() || '0.00'}
            </div>
          </div>

          <div className="analytics-card">
            <h3>Return Rate</h3>
            <div className="metric-value">
              {analyticsData?.returnPercentage?.toFixed(2) || '0.00'}%
            </div>
          </div>
        </div>

        <div className="charts-section">
                    <div className="chart-container">
            <h3>Return Trend</h3>
            <div className="chart-placeholder">
              <p>Chart will be implemented in future development</p>
              {/* TODO: 实现收益趋势图表 */}
            </div>
          </div>

          <div className="performance-lists">
            <div className="performance-section">
              <h3>Top Performers</h3>
              <div className="performance-list">
                {analyticsData?.topPerformers?.length > 0 ? (
                  analyticsData.topPerformers.map((stock, index) => (
                    <div key={index} className="performance-item">
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

            <div className="performance-section">
              <h3>Worst Performers</h3>
              <div className="performance-list">
                {analyticsData?.worstPerformers?.length > 0 ? (
                  analyticsData.worstPerformers.map((stock, index) => (
                    <div key={index} className="performance-item">
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
    </div>
  );
};

export default Analytics;
