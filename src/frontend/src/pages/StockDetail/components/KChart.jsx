// components/KChart.jsx
import React, { useState, useEffect, useMemo } from 'react';

const KChart = ({ symbol, stock }) => {
    const [selectedTimeframe, setSelectedTimeframe] = useState('daily');
    const [chartData, setChartData] = useState({ daily: [], weekly: [], monthly: [] });
    const [loading, setLoading] = useState({ daily: false, weekly: false, monthly: false });

    // ---- 时间标签格式化 ----
    const formatTimeLabel = (datetime, tf, allData) => {
        const date = new Date(datetime);
        if (tf === 'monthly') return date.toLocaleDateString('en-US', { month: 'numeric', day: 'numeric' });
        if (tf === 'weekly') return date.toLocaleDateString('en-US', { month: 'numeric', day: 'numeric' }) + ' ' +
            date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
        // daily模式，判断是否跨天
        if (allData && allData.length > 1) {
            const first = new Date(allData[0].datetime);
            const last = new Date(allData[allData.length - 1].datetime);
            if (first.toDateString() !== last.toDateString()) {
                return date.toLocaleDateString('en-US', { month: 'numeric', day: 'numeric' }) + ' ' +
                    date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
            }
        }
        return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
    };

    const currentData = useMemo(() => chartData[selectedTimeframe], [chartData, selectedTimeframe]);
    const isLoading = loading[selectedTimeframe];

    // ---- 价格显示工具 ----
    const formatPrice = (p) => (p?.toFixed(2) || '0.00');
    const getPriceChangeColor = (c) => (c >= 0 ? '#4CAF50' : '#f44336');

    // ---- 数据获取 ----
    const fetchAllChartData = async (stockSymbol) => {
        const apiKey = import.meta.env.STOCK_K_CHART_KEY;
        const timeframes = {
            daily: `https://api.twelvedata.com/time_series?symbol=${stockSymbol}&interval=30min&apikey=${apiKey}`,
            weekly: (() => {
                const today = new Date();
                const weekAgo = new Date(today - 7 * 86400000);
                return `https://api.twelvedata.com/time_series?symbol=${stockSymbol}&interval=1h&start_date=${weekAgo.toISOString().split('T')[0]}&end_date=${today.toISOString().split('T')[0]}&apikey=${apiKey}`;
            })(),
            monthly: (() => {
                const today = new Date();
                const monthAgo = new Date(today - 30 * 86400000);
                return `https://api.twelvedata.com/time_series?symbol=${stockSymbol}&interval=1day&start_date=${monthAgo.toISOString().split('T')[0]}&end_date=${today.toISOString().split('T')[0]}&apikey=${apiKey}`;
            })()
        };

        Object.keys(timeframes).forEach(async tf => {
            setLoading(prev => ({ ...prev, [tf]: true }));
            try {
                const res = await fetch(timeframes[tf]);
                console.log(`response for ${tf} chart:`, res);
                const json = await res.json();
                const processed = (json.values || []).map(v => ({
                    datetime: v.datetime,
                    open: parseFloat(v.open),
                    high: parseFloat(v.high),
                    low: parseFloat(v.low),
                    close: parseFloat(v.close),
                    volume: parseInt(v.volume)
                })).reverse();
                console.log(`Fetched ${tf} K-data for ${stockSymbol}:`, processed);
                setChartData(prev => ({ ...prev, [tf]: processed }));
            } catch (e) {
                console.error(`❌ Failed to fetch ${tf} chart`, e);
                setChartData(prev => ({ ...prev, [tf]: [] }));
            } finally {
                setLoading(prev => ({ ...prev, [tf]: false }));
            }
        });
    };

    useEffect(() => {
        if (symbol) fetchAllChartData(symbol);
    }, [symbol]);

    const timeframes = [
        { key: 'daily', label: 'Daily' },
        { key: 'weekly', label: 'Weekly' },
        { key: 'monthly', label: 'Monthly' }
    ];

    // ---- 价格区间描述 ----
    const rangeInfo = () => {
        if (!currentData || currentData.length < 2) return '';
        const first = new Date(currentData[0].datetime);
        const last = new Date(currentData[currentData.length - 1].datetime);
        if (selectedTimeframe === 'daily') return `${first.toLocaleDateString()} (30min intervals)`;
        if (selectedTimeframe === 'weekly') return `${first.toLocaleDateString()} - ${last.toLocaleDateString()} (1h intervals)`;
        return `${first.toLocaleDateString()} - ${last.toLocaleDateString()} (1day intervals)`;
    };

    // ---- 渲染K线图 ----
    const renderChart = () => {
        if (isLoading) return <div className="chart-loading"><p>Loading {selectedTimeframe} chart...</p></div>;
        if (!currentData || currentData.length === 0) return <div className="chart-error"><p>No chart data</p></div>;

        const allPrices = currentData.flatMap(d => [d.high, d.low]);
        const maxP = Math.max(...allPrices);
        const minP = Math.min(...allPrices);
        const range = maxP - minP || 1;

        return (
            <svg width="100%" height="100%" viewBox="0 0 800 500" preserveAspectRatio="none">
                <defs>
                    <linearGradient id="bullishGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#4CAF50" stopOpacity="0.8" />
                        <stop offset="100%" stopColor="#2E7D32" stopOpacity="1" />
                    </linearGradient>
                    <linearGradient id="bearishGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#f44336" stopOpacity="0.8" />
                        <stop offset="100%" stopColor="#C62828" stopOpacity="1" />
                    </linearGradient>
                </defs>

                {/* 网格 */}
                {[...Array(10)].map((_, i) => (
                    <line key={i} x1="60" y1={40 + i * 42} x2="740" y2={40 + i * 42} stroke="rgba(102,126,234,0.1)" strokeDasharray="3,3" />
                ))}

                {/* 分隔线：日期变化 */}
                {(selectedTimeframe !== 'monthly') && currentData.map((d, i) => {
                    if (i === 0) return null;
                    const prevDate = new Date(currentData[i - 1].datetime).toDateString();
                    const currDate = new Date(d.datetime).toDateString();
                    if (currDate !== prevDate) {
                        const x = 70 + (i * (660 / (currentData.length - 1 || 1)));
                        return <line key={`sep-${i}`} x1={x} y1="40" x2={x} y2="460" stroke="rgba(59,130,246,0.4)" strokeDasharray="5,5" />;
                    }
                    return null;
                })}

                {/* K线 */}
                {currentData.map((d, i) => {
                    const x = 70 + (i * (660 / (currentData.length - 1 || 1)));
                    const high = 50 + ((maxP - d.high) / range) * 400;
                    const low = 50 + ((maxP - d.low) / range) * 400;
                    const open = 50 + ((maxP - d.open) / range) * 400;
                    const close = 50 + ((maxP - d.close) / range) * 400;

                    const bullish = d.close >= d.open;
                    const color = bullish ? '#4CAF50' : '#f44336';
                    const gradient = bullish ? 'url(#bullishGradient)' : 'url(#bearishGradient)';

                    return (
                        <g key={i}>
                            <line x1={x} y1={high} x2={x} y2={low} stroke={color} strokeWidth="3" />
                            <rect x={x - 8} y={Math.min(open, close)} width="16" height={Math.max(Math.abs(close - open), 3)} fill={gradient} stroke={color} />
                            <title>{`${new Date(d.datetime).toLocaleString()}\nOpen:${d.open} High:${d.high} Low:${d.low} Close:${d.close}`}</title>
                        </g>
                    );
                })}

                {/* 时间标签 */}
                {currentData.map((d, i) => {
                    if (i % Math.ceil(currentData.length / 8) === 0 || i === currentData.length - 1) {
                        const x = 70 + (i * (660 / (currentData.length - 1 || 1)));
                        return <text key={i} x={x} y="485" fontSize="9" fill="#666" textAnchor="middle">{formatTimeLabel(d.datetime, selectedTimeframe, currentData)}</text>;
                    }
                    return null;
                })}
            </svg>
        );
    };

    return (
        <div className="chart-section">
            <div className="chart-header">
                <div className="chart-title-section">
                    <h3>Price Trend</h3>
                    {currentData?.length > 0 && <span className="chart-range">{rangeInfo()}</span>}
                </div>

                <div className="price-display">
                    <span className="current-price">${formatPrice(stock?.price)}</span>
                    <span className="price-change" style={{ color: getPriceChangeColor(stock?.change) }}>
                        {stock?.change >= 0 ? '+' : ''}${formatPrice(Math.abs(stock?.change))} ({stock?.changePercent?.toFixed(2)}%)
                    </span>
                </div>

                <div className="timeframe-buttons">
                    {timeframes.map(tf => (
                        <button key={tf.key} className={`timeframe-btn ${selectedTimeframe === tf.key ? 'active' : ''}`}
                            onClick={() => setSelectedTimeframe(tf.key)}>
                            {tf.label} {loading[tf.key] && <span>⏳</span>}
                        </button>
                    ))}
                </div>
            </div>

            <div className="chart-container">
                {renderChart()}
            </div>
        </div>
    );
};

export default KChart;
