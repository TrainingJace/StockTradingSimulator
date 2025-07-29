import React, { useState, useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { stockDetailData, getDefaultStockDetail } from '../../data/stockDetailData.js';
import { newsApi } from '../../api/newsApi.js';
import { stockApi } from '../../api';
import { authApi } from '../../api/authApi.js';
import BuyStockModal from '../../components/BuyStockModal.jsx';
import './StockDetail.css';

const StockDetail = () => {
    const { symbol } = useParams();

    const [selectedTimeframe, setSelectedTimeframe] = useState('daily');
    const [currentNewsIndex, setCurrentNewsIndex] = useState(0);
    const [stockDetail, setStockDetail] = useState(null);
    const [stock, setStock] = useState(null);
    const [loadingNews, setLoadingNews] = useState(false);
    const [loadingStock, setLoadingStock] = useState(true);
    const [showBuyModal, setShowBuyModal] = useState(false);
    const [userSimulationDate, setUserSimulationDate] = useState(null);

    const currentNews = useMemo(() => {
        const newsList = stockDetail?.news || [];
        if (newsList.length === 0) return null;
        if (currentNewsIndex >= newsList.length) return newsList[0]; // fallback
        return newsList[currentNewsIndex];
    }, [stockDetail?.news, currentNewsIndex]);

    useEffect(() => {
        if (symbol) {
            fetchUserData();
            fetchStockData(symbol);
        }
    }, [symbol]);

    useEffect(() => {
        if (stock && stockDetail && symbol) {
            // 只有当新闻数据为空时才获取新闻
            if (!stockDetail.news || stockDetail.news.length === 0) {
                setCurrentNewsIndex(0);
                // 获取最新的新闻数据
                fetchStockNews(symbol);
            }
        }
    }, [stock, symbol]); // 移除 userSimulationDate 依赖

    const fetchUserData = async () => {
        try {
            console.log('=== FETCHING USER DATA ===');
            const response = await authApi.getCurrentUser();
            console.log('User API response:', response);
            if (response.success && response.data) {
                console.log('User simulation date:', response.data.simulation_date);
                setUserSimulationDate(response.data.simulation_date);
            } else {
                console.log('Failed to get user data or no simulation_date found');
            }
            console.log('==========================');
        } catch (error) {
            console.error('=== USER DATA ERROR ===');
            console.error('Failed to fetch user data:', error);
            console.error('=======================');
        }
    };

    const fetchStockData = async (stockSymbol) => {
        try {
            setLoadingStock(true);
            // stockApi会自动从localStorage获取用户的simulation_date
            const response = await stockApi.getStocks();

            if (response.success && response.data) {
                const foundStock = response.data.find(s => s.symbol === stockSymbol);
                if (foundStock) {
                    console.log('Found stock data:', foundStock); // 调试信息
                    setStock(foundStock);
                    const detail = stockDetailData[stockSymbol] || getDefaultStockDetail(stockSymbol, foundStock.name);
                    // 清空默认的新闻数据，等待API数据
                    detail.news = [];
                    setStockDetail(detail);
                } else {
                    console.error('Stock not found');
                }
            }
        } catch (error) {
            console.error('Failed to fetch stock data:', error);
        } finally {
            setLoadingStock(false);
        }
    };

    const fetchStockNews = async (stockSymbol) => {
        try {
            setLoadingNews(true);

            console.log('=== FETCHING STOCK NEWS ===');
            console.log('Stock symbol:', stockSymbol);

            // 获取最新的新闻
            const response = await newsApi.getStockNews(stockSymbol, {
                limit: 3
            });

            console.log('=== NEWS API RESPONSE ===');
            console.log('Full response:', response);
            console.log('Response success:', response.success);
            console.log('Response data:', response.data);
            console.log('News count:', response.data?.length || 0);
            console.log('========================');

            if (response.success && response.data?.length > 0) {
                console.log('Processing news data...');
                // 更新stockDetail中的新闻数据
                const processedNews = response.data.map(newsItem => {
                    console.log('Original news item:', newsItem);

                    // 处理日期字段，支持多种可能的字段名
                    let dateValue = newsItem.published_date || newsItem.publishedAt || newsItem.date;
                    let formattedDate = 'N/A';

                    if (dateValue) {
                        try {
                            const dateObj = new Date(dateValue);
                            if (!isNaN(dateObj.getTime())) {
                                formattedDate = dateObj.toLocaleDateString('en-US');
                            } else {
                                // 如果日期解析失败，尝试直接使用原始值
                                formattedDate = dateValue.toString();
                            }
                        } catch (error) {
                            console.error('Date parsing error:', error);
                            formattedDate = dateValue?.toString() || 'N/A';
                        }
                    }

                    const processed = {
                        title: newsItem.title,
                        summary: newsItem.summary || newsItem.content?.substring(0, 200) + '...',
                        content: newsItem.content || 'N/A',
                        sentimentScore: newsItem.sentimentScore ?? newsItem.sentiment_score ?? 'N/A',
                        date: formattedDate,
                        source: newsItem.source || 'N/A'
                    };
                    console.log('Processed news item:', processed);
                    return processed;
                });

                console.log('Final processed news array:', processedNews);

                setStockDetail(prev => ({
                    ...prev,
                    news: processedNews
                }));
            } else {
                console.log('No news data found, using fallback message');
                console.log('Response structure:', { success: response.success, dataLength: response.data?.length, data: response.data });
                // 如果没有找到新闻，显示提示信息
                setStockDetail(prev => ({
                    ...prev,
                    news: [{
                        title: `No recent news found for ${stockSymbol}`,
                        summary: `There are no recent news articles available for ${stockSymbol}. This could mean the database has no news data for this stock.`,
                        date: new Date().toLocaleDateString('en-US'),
                        source: 'System'
                    }]
                }));
            }
        } catch (error) {
            console.error('=== NEWS API ERROR ===');
            console.error('Error details:', error);
            console.error('Error message:', error.message);
            console.error('=====================');
            // 如果API失败，显示错误信息
            setStockDetail(prev => ({
                ...prev,
                news: [{
                    title: 'Failed to load news',
                    summary: 'Unable to retrieve news data at this time. Please try again later.',
                    date: new Date().toLocaleDateString('en-US'),
                    source: 'System'
                }]
            }));
        } finally {
            setLoadingNews(false);
        }
    };

    useEffect(() => {
        if (!stockDetail?.news?.length) return;

        const interval = setInterval(() => {
            setCurrentNewsIndex((prevIndex) =>
                (prevIndex + 1) % stockDetail.news.length
            );
        }, 4000); // 4秒切换一次新闻

        return () => clearInterval(interval);
    }, [stockDetail?.news?.length]);

    const handleAddToWatchlist = () => {
        console.log(`Adding ${stock.symbol} to watchlist`);
        // TODO: 实现添加到观察列表的逻辑
        alert(`Added ${stock.symbol} to watchlist`);
    };

    const handleBuyStock = () => {
        console.log(`Opening buy modal for ${stock.symbol}`);
        setShowBuyModal(true);
    };

    const handleCloseBuyModal = () => {
        setShowBuyModal(false);
    };

    const formatPrice = (price) => {
        return price?.toFixed(2) || '0.00';
    };

    const getPriceChangeColor = (change) => {
        return change >= 0 ? '#4CAF50' : '#f44336';
    };

    if (loadingStock) {
        return (
            <div className="stock-detail-loading">
                <div className="loading-spinner">
                    <h2>Loading stock information...</h2>
                </div>
            </div>
        );
    }

    if (!stock || !stockDetail) {
        return (
            <div className="stock-detail-error">
                <h2>Stock information not found</h2>
                <button onClick={() => window.close()}>Close Window</button>
            </div>
        );
    }

    const timeframes = [
        { key: 'daily', label: 'Daily' },
        { key: 'weekly', label: 'Weekly' },
        { key: 'monthly', label: 'Monthly' }
    ];

    return (
        <div className="stock-detail-page">
            <div className="page-header">
                <div className="stock-title">
                    <h1>{stock.symbol}</h1>
                    <span className="stock-full-name">{stock.name}</span>
                </div>
                <button className="close-btn" onClick={() => window.close()}>
                    Close Window
                </button>
            </div>

            <div className="page-content">
                {/* 左上角 - K线图 */}
                <div className="chart-section">
                    <div className="chart-header">
                        <h3>Price Trend</h3>
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
                                                <line x1={x} y1={high} x2={x} y2={low} stroke={color} strokeWidth="1" />
                                                <rect
                                                    x={x - 3}
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
                            <span className="symbol">Symbol: {stock.symbol}</span>
                            <span className="sector">Sector: {stock.sector || 'N/A'}</span>
                            <span className="exchange">Exchange: {stock.exchange || 'N/A'}</span>
                        </div>
                    </div>
                    <div className="company-description">
                        <p>{stock.description}</p>
                    </div>

                    {/* 基本信息 */}
                    <div className="basic-info">
                        <h4>Basic Information</h4>
                        <div className="info-grid">
                            <div className="info-item">
                                <span className="info-label">CIK</span>
                                <span className="info-value">{stock.cik || 'N/A'}</span>
                            </div>
                            <div className="info-item">
                                <span className="info-label">Currency</span>
                                <span className="info-value">{stock.currency || 'N/A'}</span>
                            </div>
                            <div className="info-item">
                                <span className="info-label">Country</span>
                                <span className="info-value">{stock.country || 'N/A'}</span>
                            </div>
                            <div className="info-item">
                                <span className="info-label">Address</span>
                                <span className="info-value">{stock.address || 'N/A'}</span>
                            </div>
                            <div className="info-item">
                                <span className="info-label">Official Website</span>
                                <span className="info-value">
                                    {stock.officialSite ? (
                                        <a href={stock.officialSite} target="_blank" rel="noopener noreferrer">
                                            Visit Website
                                        </a>
                                    ) : 'N/A'}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* 财务指标 */}
                    <div className="financial-metrics">
                        <h4>Financial Metrics</h4>
                        <div className="metrics-grid">
                            <div className="metric">
                                <span className="metric-label">Market Cap</span>
                                <span className="metric-value">
                                    {stock.marketCapitalization ?
                                        `$${(parseFloat(stock.marketCapitalization) / 1000000000).toFixed(1)}B` :
                                        (stock.marketCap ? `$${(stock.marketCap / 1000000000).toFixed(1)}B` : 'N/A')
                                    }
                                </span>
                            </div>
                            <div className="metric">
                                <span className="metric-label">EBITDA</span>
                                <span className="metric-value">
                                    {stock.ebitda ?
                                        `$${(parseFloat(stock.ebitda) / 1000000000).toFixed(1)}B` :
                                        'N/A'
                                    }
                                </span>
                            </div>
                            <div className="metric">
                                <span className="metric-label">PE Ratio</span>
                                <span className="metric-value">{stock.peRatio || 'N/A'}</span>
                            </div>
                            <div className="metric">
                                <span className="metric-label">PEG Ratio</span>
                                <span className="metric-value">{stock.pegRatio || 'N/A'}</span>
                            </div>
                            <div className="metric">
                                <span className="metric-label">Book Value</span>
                                <span className="metric-value">{stock.bookValue ? `$${stock.bookValue}` : 'N/A'}</span>
                            </div>
                            <div className="metric">
                                <span className="metric-label">Volume</span>
                                <span className="metric-value">{(stock.volume / 1000000).toFixed(1)}M</span>
                            </div>
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
                        ) : (
                            <>
                                {Array.isArray(stockDetail?.news) && stockDetail.news.length > 0 ? (
                                    <div className="news-item">
                                        <div className="news-header">
                                            <h4>{currentNews?.title || 'Untitled'}</h4>
                                            <span className="news-date">{currentNews?.date || 'N/A'}</span>
                                        </div>
                                        <p className="news-summary">
                                            <strong>Summary:</strong> {currentNews?.summary || 'No summary available.'}
                                        </p>
                                        <p className="news-content">
                                            <strong>Content:</strong> {currentNews?.content || 'No content available.'}
                                        </p>
                                        <p className="news-sentiment">
                                            <strong>Sentiment Score:</strong> {currentNews?.sentimentScore || 'N/A'}
                                        </p>
                                        <span className="news-source">
                                            Source: {currentNews?.source || 'Unknown'}
                                        </span>
                                    </div>
                                ) : (
                                    <div className="news-empty">
                                        <p>No related news available</p>
                                    </div>
                                )}

                                {/* 指示器 */}
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
                            </>
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

            {/* 购买股票模态框 */}
            <BuyStockModal
                isOpen={showBuyModal}
                onClose={handleCloseBuyModal}
                symbol={stock?.symbol}
            />
        </div>
    );
};

export default StockDetail;
