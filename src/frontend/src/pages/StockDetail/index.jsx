import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { stockDetailData, getDefaultStockDetail } from '../../data/stockDetailData.js';
import { newsApi } from '../../api/newsApi.js';
import { stockApi } from '../../api';
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

    useEffect(() => {
        if (symbol) {
            fetchStockData(symbol);
        }
    }, [symbol]);

    useEffect(() => {
        if (stock && stockDetail) {
            setCurrentNewsIndex(0);
            // 从API获取真实新闻数据
            fetchStockNews(symbol);
        }
    }, [stock, stockDetail, symbol]);

    const fetchStockData = async (stockSymbol) => {
        try {
            setLoadingStock(true);
            // stockApi会自动从localStorage获取用户的simulation_date
            const response = await stockApi.getStocks();

            if (response.success && response.data) {
                const foundStock = response.data.find(s => s.symbol === stockSymbol);
                if (foundStock) {
                    setStock(foundStock);
                    const detail = stockDetailData[stockSymbol] || getDefaultStockDetail(stockSymbol, foundStock.name);
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
            const response = await newsApi.getStockNews(stockSymbol, { limit: 5 });

            if (response.success && response.data?.length > 0) {
                // 更新stockDetail中的新闻数据
                setStockDetail(prev => ({
                    ...prev,
                    news: response.data.map(newsItem => ({
                        title: newsItem.title,
                        summary: newsItem.summary || newsItem.content?.substring(0, 200) + '...',
                        date: new Date(newsItem.publishedAt || newsItem.date).toLocaleDateString('zh-CN'),
                        source: newsItem.source || '财经新闻'
                    }))
                }));
            }
        } catch (error) {
            console.error('Failed to fetch news:', error);
            // 如果API失败，保持使用默认新闻数据
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
        alert(`已添加 ${stock.symbol} 到观察列表`);
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
                    <h2>加载股票信息中...</h2>
                </div>
            </div>
        );
    }

    if (!stock || !stockDetail) {
        return (
            <div className="stock-detail-error">
                <h2>未找到股票信息</h2>
                <button onClick={() => window.close()}>关闭窗口</button>
            </div>
        );
    }

    const timeframes = [
        { key: 'daily', label: '日' },
        { key: 'weekly', label: '周' },
        { key: 'monthly', label: '月' }
    ];

    const currentNews = stockDetail.news[currentNewsIndex];

    return (
        <div className="stock-detail-page">
            <div className="page-header">
                <div className="stock-title">
                    <h1>{stock.symbol}</h1>
                    <span className="stock-full-name">{stock.name}</span>
                </div>
                <button className="close-btn" onClick={() => window.close()}>
                    关闭窗口
                </button>
            </div>

            <div className="page-content">
                {/* 左上角 - K线图 */}
                <div className="chart-section">
                    <div className="chart-header">
                        <h3>价格走势</h3>
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
                            <span className="sector">{stock.sector || 'Technology'}</span>
                        </div>
                    </div>
                    <div className="company-description">
                        <p>{stockDetail.description}</p>
                    </div>
                    <div className="key-metrics">
                        <div className="metric">
                            <span className="metric-label">市值</span>
                            <span className="metric-value">${(stock.marketCap / 1000000000).toFixed(1)}B</span>
                        </div>
                        <div className="metric">
                            <span className="metric-label">成交量</span>
                            <span className="metric-value">{(stock.volume / 1000000).toFixed(1)}M</span>
                        </div>
                    </div>
                </div>

                {/* 左下角 - 公司新闻轮播 */}
                <div className="news-section">
                    <h3>最新资讯</h3>
                    <div className="news-carousel">
                        {loadingNews ? (
                            <div className="news-loading">
                                <p>加载新闻中...</p>
                            </div>
                        ) : currentNews ? (
                            <div className="news-item">
                                <div className="news-header">
                                    <h4>{currentNews.title}</h4>
                                    <span className="news-date">{currentNews.date}</span>
                                </div>
                                <p className="news-summary">{currentNews.summary}</p>
                                <span className="news-source">来源: {currentNews.source}</span>
                            </div>
                        ) : (
                            <div className="news-empty">
                                <p>暂无相关新闻</p>
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
