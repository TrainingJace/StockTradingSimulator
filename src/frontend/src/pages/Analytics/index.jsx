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
        <h1>投资组合分析</h1>
        <p>查看您的投资表现和分析数据</p>
      </div>

      <div className="analytics-content">
        <div className="analytics-grid">
          <div className="analytics-card">
            <h3>总资产价值</h3>
            <div className="metric-value">
              ${analyticsData?.totalValue?.toLocaleString() || '0.00'}
            </div>
          </div>

          <div className="analytics-card">
            <h3>总收益</h3>
            <div className="metric-value">
              ${analyticsData?.totalReturn?.toLocaleString() || '0.00'}
            </div>
          </div>

          <div className="analytics-card">
            <h3>收益率</h3>
            <div className="metric-value">
              {analyticsData?.returnPercentage?.toFixed(2) || '0.00'}%
            </div>
          </div>
        </div>

        <div className="charts-section">
          <div className="chart-container">
            <h3>收益趋势</h3>
            <div className="chart-placeholder">
              <p>图表将在后续开发中实现</p>
              {/* TODO: 实现收益趋势图表 */}
            </div>
          </div>

          <div className="performance-lists">
            <div className="performance-section">
              <h3>表现最佳</h3>
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
                  <p className="no-data">暂无数据</p>
                )}
              </div>
            </div>

            <div className="performance-section">
              <h3>表现最差</h3>
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
                  <p className="no-data">暂无数据</p>
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
