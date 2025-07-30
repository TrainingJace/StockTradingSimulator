import React, { useState, useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { newsApi } from '../../api/newsApi.js';
import { stockApi } from '../../api/index.js';
import { authApi } from '../../api/authApi.js';
import BuyStockModal from '../../components/BuyStockModal.jsx';
import CompanyInfo from './components/CompanyInfo.jsx';
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
    const [companyInfo, setCompanyInfo] = useState(null);
    const [loadingCompanyInfo, setLoadingCompanyInfo] = useState(true);
    const [chartData, setChartData] = useState({
        daily: null,
        weekly: null,
        monthly: null
    });
    const [loadingChart, setLoadingChart] = useState({
        daily: false,
        weekly: false,
        monthly: false
    });

    const currentNews = useMemo(() => {
        const newsList = stockDetail?.news || [];
        if (newsList.length === 0) return null;
        if (currentNewsIndex >= newsList.length) return newsList[0]; // fallback
        return newsList[currentNewsIndex];
    }, [stockDetail?.news, currentNewsIndex]);

    const currentChartData = useMemo(() => {
        return chartData[selectedTimeframe];
    }, [chartData, selectedTimeframe]);

    const isAnyChartLoading = useMemo(() => {
        return Object.values(loadingChart).some(loading => loading);
    }, [loadingChart]);

    // 根据时间范围格式化时间标签
    const formatTimeLabel = (datetime, timeframe) => {
        const date = new Date(datetime);

        switch (timeframe) {
            case 'daily':
                // Daily: 检查是否需要显示日期
                // 如果数据跨越多天，显示月/日 时:分，否则只显示时:分
                if (currentChartData && currentChartData.length > 1) {
                    const firstDate = new Date(currentChartData[0].datetime);
                    const lastDate = new Date(currentChartData[currentChartData.length - 1].datetime);
                    const isSameDay = firstDate.toDateString() === lastDate.toDateString();

                    if (!isSameDay) {
                        // 跨天数据，显示月/日 时:分
                        return date.toLocaleDateString('en-US', {
                            month: 'numeric',
                            day: 'numeric'
                        }) + ' ' + date.toLocaleTimeString('en-US', {
                            hour: '2-digit',
                            minute: '2-digit',
                            hour12: false
                        });
                    }
                }
                // 同一天数据，只显示时:分
                return date.toLocaleTimeString('en-US', {
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: false
                });
            case 'weekly':
                // Weekly: 显示月/日 时:分 格式 (如: 12/25 09:00)
                return date.toLocaleDateString('en-US', {
                    month: 'numeric',
                    day: 'numeric'
                }) + ' ' + date.toLocaleTimeString('en-US', {
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: false
                });
            case 'monthly':
                // Monthly: 显示月/日 格式 (如: 12/25)
                return date.toLocaleDateString('en-US', {
                    month: 'numeric',
                    day: 'numeric'
                });
            default:
                return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        }
    };

    useEffect(() => {
        if (symbol) {
            fetchUserData();
            fetchStockData(symbol);
            fetchCompanyInfo(symbol);
            // 页面加载时获取所有时间范围的数据
            fetchAllChartData(symbol);
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

            console.log('=== 后端返回的完整stocks数据 ===');
            console.log('Response success:', response.success);
            console.log('Response data length:', response.data ? response.data.length : 0);
            console.log('Complete stocks data:', JSON.stringify(response.data, null, 2));
            console.log('====================================');

            if (response.success && response.data) {
                const foundStock = response.data.find(s => s.symbol === stockSymbol);
                if (foundStock) {
                    console.log('=== 当前股票详细数据 ===');
                    console.log('Found stock data:', JSON.stringify(foundStock, null, 2));
                    console.log('========================');
                    setStock(foundStock);
                    // 创建基本的股票详情对象，不依赖模拟数据
                    const detail = {
                        logo: `https://financialmodelingprep.com/image-stock/${stockSymbol}.png`,
                        news: [] // 初始为空，等待API数据
                    };
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

    const fetchCompanyInfo = async (stockSymbol) => {
        try {
            setLoadingCompanyInfo(true);
            console.log(`=== Frontend: Fetching company info for ${stockSymbol} ===`);

            const response = await stockApi.getCompanyInfo(stockSymbol);

            console.log('=== Company Info API Response ===');
            console.log('Response success:', response.success);
            console.log('Company info data:', JSON.stringify(response.data, null, 2));
            console.log('=================================');

            if (response.success && response.data) {
                setCompanyInfo(response.data);
            } else {
                console.error('Failed to fetch company info:', response.error);
                setCompanyInfo(null);
            }
        } catch (error) {
            console.error('Error fetching company info:', error);
            setCompanyInfo(null);
        } finally {
            setLoadingCompanyInfo(false);
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

    const fetchAllChartData = async (stockSymbol) => {
        const apiKey = '7a2f00f6984b4c24a36501313ffd15e0';

        // 构建所有时间范围的API URL，使用不同的时间间隔
        const timeframes = {
            // Daily: 1分钟间隔，显示一天的数据
            daily: `https://api.twelvedata.com/time_series?symbol=${stockSymbol}&interval=30min&apikey=${apiKey}`,
            // Weekly: 1小时间隔，显示一周的数据
            weekly: (() => {
                const today = new Date();
                const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
                const startDate = weekAgo.toISOString().split('T')[0];
                const endDate = today.toISOString().split('T')[0];
                return `https://api.twelvedata.com/time_series?symbol=${stockSymbol}&interval=1h&start_date=${startDate}&end_date=${endDate}&apikey=${apiKey}`;
            })(),
            // Monthly: 1天间隔，显示一个月的数据
            monthly: (() => {
                const today = new Date();
                const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
                const startDate = monthAgo.toISOString().split('T')[0];
                const endDate = today.toISOString().split('T')[0];
                return `https://api.twelvedata.com/time_series?symbol=${stockSymbol}&interval=1day&start_date=${startDate}&end_date=${endDate}&apikey=${apiKey}`;
            })()
        };

        console.log('=== FETCHING ALL CHART DATA ===');
        console.log('URLs:', timeframes);

        // 并发获取所有时间范围的数据
        const promises = Object.entries(timeframes).map(async ([timeframe, url]) => {
            try {
                setLoadingChart(prev => ({ ...prev, [timeframe]: true }));

                const response = await fetch(url);
                const data = await response.json();

                console.log(`Chart API response for ${timeframe}:`, data);

                if (data.status === 'ok' && data.values && Array.isArray(data.values)) {
                    // 处理数据，转换为K线图需要的格式
                    const processedData = data.values.map(item => ({
                        datetime: item.datetime,
                        open: parseFloat(item.open),
                        high: parseFloat(item.high),
                        low: parseFloat(item.low),
                        close: parseFloat(item.close),
                        volume: parseInt(item.volume)
                    })).reverse(); // 反转数组，使最新数据在右侧

                    console.log(`Processed chart data for ${timeframe}:`, processedData);
                    return { timeframe, data: processedData };
                } else {
                    console.error(`Invalid chart data response for ${timeframe}:`, data);
                    return { timeframe, data: [] };
                }
            } catch (error) {
                console.error(`Error fetching chart data for ${timeframe}:`, error);
                return { timeframe, data: [] };
            } finally {
                setLoadingChart(prev => ({ ...prev, [timeframe]: false }));
            }
        });

        // 等待所有请求完成
        const results = await Promise.all(promises);


        // 更新所有时间范围的数据
        const newChartData = {};
        results.forEach(({ timeframe, data }) => {
            newChartData[timeframe] = data;
        });

        setChartData(prev => ({ ...prev, ...newChartData }));
        console.log('All chart data fetched:', newChartData);
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
            <div className="page-content">
                {/* 左上角 - K线图 */}
                <div className="chart-section">
                    <div className="chart-header">
                        <div className="chart-title-section">
                            <h3>Price Trend</h3>
                            {/* 显示当前时间范围信息 */}
                            {currentChartData && currentChartData.length > 0 && (
                                <div className="chart-info">
                                    <span className="chart-range">
                                        {(() => {
                                            const firstDate = new Date(currentChartData[0].datetime);
                                            const lastDate = new Date(currentChartData[currentChartData.length - 1].datetime);

                                            if (selectedTimeframe === 'daily') {
                                                const isSameDay = firstDate.toDateString() === lastDate.toDateString();
                                                if (isSameDay) {
                                                    return `${firstDate.toLocaleDateString('en-US')} (30min intervals)`;
                                                } else {
                                                    return `${firstDate.toLocaleDateString('en-US')} - ${lastDate.toLocaleDateString('en-US')} (30min intervals)`;
                                                }
                                            } else if (selectedTimeframe === 'weekly') {
                                                return `${firstDate.toLocaleDateString('en-US')} - ${lastDate.toLocaleDateString('en-US')} (1hour intervals)`;
                                            } else {
                                                return `${firstDate.toLocaleDateString('en-US')} - ${lastDate.toLocaleDateString('en-US')} (1day intervals)`;
                                            }
                                        })()}
                                    </span>
                                </div>
                            )}
                        </div>

                        {/* 价格显示区域 - 放在header内部 */}
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

                        <div className="timeframe-buttons">
                            {timeframes.map((timeframe) => (
                                <button
                                    key={timeframe.key}
                                    className={`timeframe-btn ${selectedTimeframe === timeframe.key ? 'active' : ''}`}
                                    onClick={() => {
                                        console.log('Timeframe changed to:', timeframe.key);
                                        setSelectedTimeframe(timeframe.key);
                                    }}
                                    disabled={loadingChart[timeframe.key]}
                                >
                                    {timeframe.label}
                                    {loadingChart[timeframe.key] && (
                                        <span style={{ marginLeft: '5px' }}>⏳</span>
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="chart-container">
                        <div className="chart-placeholder">
                            <div className="simple-chart">
                                {loadingChart[selectedTimeframe] ? (
                                    <div className="chart-loading">
                                        <p>Loading {selectedTimeframe} chart data...</p>
                                    </div>
                                ) : currentChartData && currentChartData.length > 0 ? (
                                    <svg width="100%" height="100%" viewBox="0 0 800 500" preserveAspectRatio="none">
                                        {/* 添加渐变定义 */}
                                        <defs>
                                            <linearGradient id="bullishGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                                                <stop offset="0%" stopColor="#4CAF50" stopOpacity="0.8" />
                                                <stop offset="100%" stopColor="#2E7D32" stopOpacity="1" />
                                            </linearGradient>
                                            <linearGradient id="bearishGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                                                <stop offset="0%" stopColor="#f44336" stopOpacity="0.8" />
                                                <stop offset="100%" stopColor="#C62828" stopOpacity="1" />
                                            </linearGradient>
                                            <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
                                                <feDropShadow dx="2" dy="2" stdDeviation="2" floodOpacity="0.3" />
                                            </filter>
                                        </defs>

                                        {/* 网格线 */}
                                        {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map(i => (
                                            <line
                                                key={`grid-h-${i}`}
                                                x1="60"
                                                y1={40 + i * 42}
                                                x2="740"
                                                y2={40 + i * 42}
                                                stroke="rgba(102, 126, 234, 0.1)"
                                                strokeWidth="1"
                                                strokeDasharray="3,3"
                                            />
                                        ))}
                                        {Array.from({ length: Math.min(currentChartData.length, 12) }, (_, i) => (
                                            <line
                                                key={`grid-v-${i}`}
                                                x1={80 + i * 55}
                                                y1="40"
                                                x2={80 + i * 55}
                                                y2="460"
                                                stroke="rgba(102, 126, 234, 0.1)"
                                                strokeWidth="1"
                                                strokeDasharray="3,3"
                                            />
                                        ))}

                                        {/* Daily和Weekly模式：在日期变化处添加分隔线 */}
                                        {(selectedTimeframe === 'daily' || selectedTimeframe === 'weekly') && currentChartData.length > 1 && (
                                            (() => {
                                                const separators = [];
                                                let lastDate = '';

                                                currentChartData.forEach((data, index) => {
                                                    if (index === 0) {
                                                        lastDate = new Date(data.datetime).toDateString();
                                                        return;
                                                    }

                                                    const currentDate = new Date(data.datetime).toDateString();
                                                    if (currentDate !== lastDate) {
                                                        const x = 70 + (index * (660 / (currentChartData.length - 1 || 1)));
                                                        separators.push(
                                                            <line
                                                                key={`date-separator-${index}`}
                                                                x1={x}
                                                                y1="40"
                                                                x2={x}
                                                                y2="460"
                                                                stroke={selectedTimeframe === 'daily' ? "rgba(234, 88, 12, 0.4)" : "rgba(59, 130, 246, 0.4)"}
                                                                strokeWidth="2"
                                                                strokeDasharray="5,5"
                                                            />
                                                        );
                                                        lastDate = currentDate;
                                                    }
                                                });

                                                return separators;
                                            })()
                                        )}

                                        {currentChartData.map((data, index) => {
                                            // 计算价格范围
                                            const allPrices = currentChartData.flatMap(d => [d.high, d.low]);
                                            const maxPrice = Math.max(...allPrices);
                                            const minPrice = Math.min(...allPrices);
                                            const priceRange = maxPrice - minPrice;

                                            // 避免除以零
                                            const normalizedRange = priceRange || 1;

                                            // 计算位置
                                            const x = 70 + (index * (660 / (currentChartData.length - 1 || 1)));
                                            const high = 50 + ((maxPrice - data.high) / normalizedRange) * 400;
                                            const low = 50 + ((maxPrice - data.low) / normalizedRange) * 400;
                                            const open = 50 + ((maxPrice - data.open) / normalizedRange) * 400;
                                            const close = 50 + ((maxPrice - data.close) / normalizedRange) * 400;

                                            // 确保坐标在有效范围内
                                            const validHigh = Math.max(50, Math.min(450, high));
                                            const validLow = Math.max(50, Math.min(450, low));
                                            const validOpen = Math.max(50, Math.min(450, open));
                                            const validClose = Math.max(50, Math.min(450, close));

                                            const isBullish = data.close >= data.open;
                                            const color = isBullish ? '#4CAF50' : '#f44336';
                                            const gradient = isBullish ? 'url(#bullishGradient)' : 'url(#bearishGradient)';

                                            return (
                                                <g key={index} className="candlestick" filter="url(#shadow)">
                                                    {/* 上下影线 */}
                                                    <line
                                                        x1={x}
                                                        y1={validHigh}
                                                        x2={x}
                                                        y2={validLow}
                                                        stroke={color}
                                                        strokeWidth="3"
                                                        strokeLinecap="round"
                                                    />
                                                    {/* K线实体 */}
                                                    <rect
                                                        x={x - 8}
                                                        y={Math.min(validOpen, validClose)}
                                                        width="16"
                                                        height={Math.max(Math.abs(validClose - validOpen), 3)}
                                                        fill={gradient}
                                                        stroke={color}
                                                        strokeWidth="2"
                                                        rx="2"
                                                        ry="2"
                                                    />
                                                    {/* 悬停区域 */}
                                                    <rect
                                                        x={x - 15}
                                                        y={validHigh - 10}
                                                        width="30"
                                                        height={validLow - validHigh + 20}
                                                        fill="transparent"
                                                        className="hover-area"
                                                    >
                                                        <title>
                                                            {(() => {
                                                                const date = new Date(data.datetime);
                                                                let formattedDate;

                                                                if (selectedTimeframe === 'daily') {
                                                                    formattedDate = date.toLocaleDateString('en-US') + ' ' +
                                                                        date.toLocaleTimeString('en-US', {
                                                                            hour: '2-digit',
                                                                            minute: '2-digit',
                                                                            hour12: false
                                                                        });
                                                                } else if (selectedTimeframe === 'weekly') {
                                                                    formattedDate = date.toLocaleDateString('en-US') + ' ' +
                                                                        date.toLocaleTimeString('en-US', {
                                                                            hour: '2-digit',
                                                                            minute: '2-digit',
                                                                            hour12: false
                                                                        });
                                                                } else {
                                                                    formattedDate = date.toLocaleDateString('en-US');
                                                                }

                                                                return `${formattedDate}
Open: $${data.open.toFixed(2)}
High: $${data.high.toFixed(2)}
Low: $${data.low.toFixed(2)}
Close: $${data.close.toFixed(2)}
Volume: ${data.volume.toLocaleString()}`;
                                                            })()}
                                                        </title>
                                                    </rect>

                                                    {/* 股价标签 - 显示收盘价 */}
                                                    <text
                                                        x={x}
                                                        y={validLow + 25}
                                                        fontSize="10"
                                                        fill="#2c3e50"
                                                        textAnchor="middle"
                                                        fontWeight="600"
                                                        style={{
                                                            textShadow: '1px 1px 2px rgba(255,255,255,0.8)',
                                                            filter: 'drop-shadow(0px 1px 1px rgba(0,0,0,0.3))'
                                                        }}
                                                    >
                                                        ${data.close.toFixed(2)}
                                                    </text>
                                                </g>
                                            );
                                        })}

                                        {/* 添加价格标签 */}
                                        {currentChartData.length > 0 && (
                                            <>
                                                <rect x="10" y="35" width="80" height="25" fill="rgba(255, 255, 255, 0.9)" rx="6" stroke="rgba(102, 126, 234, 0.3)" />
                                                <text x="20" y="52" fontSize="14" fill="#2c3e50" fontWeight="600">
                                                    ${Math.max(...currentChartData.map(d => d.high)).toFixed(2)}
                                                </text>
                                                <rect x="10" y="440" width="80" height="25" fill="rgba(255, 255, 255, 0.9)" rx="6" stroke="rgba(102, 126, 234, 0.3)" />
                                                <text x="20" y="457" fontSize="14" fill="#2c3e50" fontWeight="600">
                                                    ${Math.min(...currentChartData.map(d => d.low)).toFixed(2)}
                                                </text>

                                                {/* 添加时间轴标签 */}
                                                {currentChartData.length > 0 && (
                                                    (() => {
                                                        // 根据数据量和时间范围决定显示的标签数量
                                                        const maxLabels = selectedTimeframe === 'daily' ? 6 :
                                                            selectedTimeframe === 'weekly' ? 8 : 10;

                                                        if (selectedTimeframe === 'daily' || selectedTimeframe === 'weekly') {
                                                            // Daily和Weekly模式：优先在日期变化处显示标签
                                                            const labels = [];
                                                            let lastDisplayedDate = '';
                                                            let labelCount = 0;

                                                            currentChartData.forEach((data, index) => {
                                                                const currentDate = new Date(data.datetime);
                                                                const dateString = currentDate.toDateString();
                                                                const x = 70 + (index * (660 / (currentChartData.length - 1 || 1)));

                                                                // 在日期变化处、第一个点、最后一个点显示标签
                                                                const shouldShow = index === 0 ||
                                                                    index === currentChartData.length - 1 ||
                                                                    (dateString !== lastDisplayedDate && labelCount < maxLabels);

                                                                // 对于Daily模式，如果标签太多，增加间隔控制
                                                                if (selectedTimeframe === 'daily' && shouldShow && labelCount >= 2) {
                                                                    // 当已经有2个或更多标签时，检查与上一个标签的距离
                                                                    const lastLabelIndex = labels.length > 0 ?
                                                                        parseInt(labels[labels.length - 1].key.split('-')[1]) : 0;
                                                                    if (index - lastLabelIndex < Math.floor(currentChartData.length / maxLabels)) {
                                                                        return; // 跳过太近的标签
                                                                    }
                                                                }

                                                                if (shouldShow) {
                                                                    const label = formatTimeLabel(data.datetime, selectedTimeframe);
                                                                    labels.push(
                                                                        <text
                                                                            key={`time-${index}`}
                                                                            x={x}
                                                                            y="485"
                                                                            fontSize="9"
                                                                            fill="#666"
                                                                            textAnchor="middle"
                                                                            style={{
                                                                                fontFamily: 'monospace',
                                                                                userSelect: 'none'
                                                                            }}
                                                                        >
                                                                            {label}
                                                                        </text>
                                                                    );
                                                                    lastDisplayedDate = dateString;
                                                                    labelCount++;
                                                                }
                                                            });

                                                            return labels;
                                                        } else {
                                                            // Monthly模式：均匀分布标签
                                                            const step = Math.max(1, Math.ceil(currentChartData.length / maxLabels));

                                                            return currentChartData.map((data, index) => {
                                                                if (index % step === 0 || index === currentChartData.length - 1) {
                                                                    const x = 70 + (index * (660 / (currentChartData.length - 1 || 1)));
                                                                    const label = formatTimeLabel(data.datetime, selectedTimeframe);
                                                                    return (
                                                                        <text
                                                                            key={`time-${index}`}
                                                                            x={x}
                                                                            y="485"
                                                                            fontSize="11"
                                                                            fill="#666"
                                                                            textAnchor="middle"
                                                                            style={{
                                                                                fontFamily: 'monospace',
                                                                                userSelect: 'none'
                                                                            }}
                                                                        >
                                                                            {label}
                                                                        </text>
                                                                    );
                                                                }
                                                                return null;
                                                            });
                                                        }
                                                    })()
                                                )}
                                            </>
                                        )}
                                    </svg>
                                ) : (
                                    <div className="chart-error">
                                        <p>No chart data available for {selectedTimeframe}</p>
                                        <p style={{ fontSize: '12px', color: '#666' }}>
                                            {isAnyChartLoading ? 'Loading other timeframes...' : 'Try selecting a different timeframe'}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* 右侧面板 */}
                <div className="right-panel">
                    {/* 公司Logo和简介 */}
                    <CompanyInfo 
                        companyInfo={companyInfo}
                        loadingCompanyInfo={loadingCompanyInfo}
                        stock={stock}
                    />

                    {/* 操作按钮 */}
                    <div className="actions-section">
                        {/* <button className="action-btn watchlist-btn" onClick={handleAddToWatchlist}>
                            <span className="btn-icon">👁️</span>
                            Add to Watchlist
                        </button> */}
                        <button className="action-btn buy-btn" onClick={handleBuyStock}>
                            <span className="btn-icon">💰</span>
                            Buy Stock
                        </button>
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
