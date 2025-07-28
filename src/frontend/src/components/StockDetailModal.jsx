import React, { useState, useEffect } from 'react';
import { stockDetailData, getDefaultStockDetail } from '../data/stockDetailData.js';
import { newsApi } from '../api/newsApi.js';
import './StockDetailModal.css';

const StockDetailModal = ({ stock, isOpen, onClose }) => {
  const [selectedTimeframe, setSelectedTimeframe] = useState('daily');
  const [currentNewsIndex, setCurrentNewsIndex] = useState(0);
  const [stockDetail, setStockDetail] = useState(null);
  const [loadingNews, setLoadingNews] = useState(false);

  useEffect(() => {
    if (stock && isOpen) {
      const detail = stockDetailData[stock.symbol] || getDefaultStockDetail(stock.symbol, stock.name);
      setStockDetail(detail);
      setCurrentNewsIndex(0);
      
      // Get real news data from API
      fetchStockNews(stock.symbol);
    }
  }, [stock, isOpen]);

  const fetchStockNews = async (symbol) => {
    try {
      setLoadingNews(true);
      const response = await newsApi.getStockNews(symbol, { limit: 5 });
      
      if (response.success && response.data?.length > 0) {
        // Update news data in stockDetail
        setStockDetail(prev => ({
          ...prev,
          news: response.data.map(newsItem => ({
            title: newsItem.title,
            summary: newsItem.summary || newsItem.content?.substring(0, 200) + '...',
            date: new Date(newsItem.publishedAt || newsItem.date).toLocaleDateString('en-US'),
            source: newsItem.source || 'Financial News'
          }))
        }));
      }
    } catch (error) {
      console.error('Failed to fetch news:', error);
      // If API fails, keep using default news data
    } finally {
      setLoadingNews(false);
    }
  };

  useEffect(() => {
    if (!isOpen || !stockDetail?.news?.length) return;

    const interval = setInterval(() => {
      setCurrentNewsIndex((prevIndex) => 
        (prevIndex + 1) % stockDetail.news.length
      );
    }, 4000); // Switch news every 4 seconds

    return () => clearInterval(interval);
  }, [isOpen, stockDetail?.news?.length]);

  const handleAddToWatchlist = () => {
    console.log(`Adding ${stock.symbol} to watchlist`);
    // TODO: Implement add to watchlist logic
  };

  const handleBuyStock = () => {
    console.log(`Buying ${stock.symbol}`);
    // TODO: Implement buy stock logic
  };

  const formatPrice = (price) => {
    return price?.toFixed(2) || '0.00';
  };

  const getPriceChangeColor = (change) => {
    return change >= 0 ? '#4CAF50' : '#f44336';
  };

  if (!isOpen || !stock || !stockDetail) {
    return null;
  }

  const timeframes = [
    { key: 'daily', label: 'D' },
    { key: 'weekly', label: 'W' },
    { key: 'monthly', label: 'M' }
  ];

  const currentNews = stockDetail.news[currentNewsIndex];

  return (
    <div className="stock-detail-modal-overlay" onClick={onClose}>
      <div className="stock-detail-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="stock-title">
            <h2>{stock.symbol}</h2>
            <span className="stock-full-name">{stock.name}</span>
          </div>
          <button className="close-modal-btn" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="modal-content">
          {/* 左上角 - K线图 */}
          <div className="chart-section">
            <div className="chart-header">
              <h3>Price Chart</h3>
              <div className="timeframe-buttons">
                {timeframes.map((timeframe) => (
                  <button
                    key={timeframe.key}
                    className={`timeframe-btn ${selectedTimeframe === timeframe.key ? 'active' : ''}`}
                    onClick={() => setSelectedTimeframe(timeframe.key)}
                  >
                    {timeframe.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="chart-container">
              <div className="chart-placeholder">
                <div className="price-display">
                  <span className="current-price">${formatPrice(stock.price)}</span>
                  <span 
                    className="price-change"
                    style={{ color: getPriceChangeColor(stock.change) }}
                  >
                    {stock.change >= 0 ? '+' : ''}${formatPrice(Math.abs(stock.change))} 
                    ({stock.changePercent?.toFixed(2)}%)
                  </span>
                </div>
                <div className="simple-chart">
                  {/* 简单的模拟K线图 */}
                  <svg width="100%" height="200" viewBox="0 0 400 200">
                    {stockDetail.chartData[selectedTimeframe]?.map((data, index) => {
                      const x = (index + 1) * (400 / (stockDetail.chartData[selectedTimeframe].length + 1));
                      const high = 200 - ((data.high - data.low) / (data.high - data.low)) * 150;
                      const low = 200 - ((data.low - data.low) / (data.high - data.low)) * 150;
                      const open = 200 - ((data.open - data.low) / (data.high - data.low)) * 150;
                      const close = 200 - ((data.close - data.low) / (data.high - data.low)) * 150;
                      const color = data.close >= data.open ? '#4CAF50' : '#f44336';
                      
                      return (
                        <g key={index}>
                          <line x1={x} y1={high} x2={x} y2={low} stroke={color} strokeWidth="1"/>
                          <rect 
                            x={x-3} 
                            y={Math.min(open, close)} 
                            width="6" 
                            height={Math.abs(close - open)} 
                            fill={color}
                          />
                        </g>
                      );
                    })}
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* 右上角 - 公司Logo和简介 */}
          <div className="company-info-section">
            <div className="company-header">
              <img 
                src={stockDetail.logo} 
                alt={`${stock.name} logo`}
                className="company-logo"
                onError={(e) => {
                  e.target.src = `https://via.placeholder.com/80x80/667eea/ffffff?text=${stock.symbol}`;
                }}
              />
              <div className="company-details">
                <h3>{stock.name}</h3>
                <span className="sector">{stock.sector || 'Technology'}</span>
              </div>
            </div>
            <div className="company-description">
              <p>{stockDetail.description}</p>
            </div>
            <div className="key-metrics">
              <div className="metric">
                <span className="metric-label">Market Cap</span>
                <span className="metric-value">${(stock.marketCap / 1000000000).toFixed(1)}B</span>
              </div>
              <div className="metric">
                <span className="metric-label">Volume</span>
                <span className="metric-value">{(stock.volume / 1000000).toFixed(1)}M</span>
              </div>
            </div>
          </div>

          {/* 左下角 - 公司新闻轮播 */}
          <div className="news-section">
            <h3>Latest News</h3>
            <div className="news-carousel">
              {loadingNews ? (
                <div className="news-loading">
                  <p>Loading news...</p>
                </div>
              ) : currentNews ? (
                <div className="news-item">
                  <div className="news-header">
                    <h4>{currentNews.title}</h4>
                    <span className="news-date">{currentNews.date}</span>
                  </div>
                  <p className="news-summary">{currentNews.summary}</p>
                                    <p>Source: {currentNews.source}</p>
                </div>
              ) : (
                <div className="news-empty">
                  <p>No related news</p>
                </div>
              )}
              {stockDetail?.news?.length > 0 && (
                <div className="news-indicators">
                  {stockDetail.news.map((_, index) => (
                    <span 
                      key={index}
                      className={`indicator ${index === currentNewsIndex ? 'active' : ''}`}
                      onClick={() => setCurrentNewsIndex(index)}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* 右下角 - 操作按钮 */}
          <div className="actions-section">
            <button className="action-btn watchlist-btn" onClick={handleAddToWatchlist}>
              <span className="btn-icon">👁️</span>
              Add to Watchlist
            </button>
            <button className="action-btn buy-btn" onClick={handleBuyStock}>
              <span className="btn-icon">💰</span>
              Buy Stock
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StockDetailModal;
