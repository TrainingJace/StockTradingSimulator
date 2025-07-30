import React, { useState, useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { newsApi } from '../../api/newsApi.js';
import { stockApi } from '../../api';
import { authApi } from '../../api/authApi.js';
import BuyStockModal from '../../components/BuyStockModal.jsx';
import KChart from './components/KChart.jsx';
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

    const currentNews = useMemo(() => {
        const newsList = stockDetail?.news || [];
        if (newsList.length === 0) return null;
        return newsList[currentNewsIndex % newsList.length];
    }, [stockDetail?.news, currentNewsIndex]);

    useEffect(() => {
        if (symbol) {
            fetchUserData();
            fetchStockData(symbol);
            fetchCompanyInfo(symbol);
        }
    }, [symbol]);

    useEffect(() => {
        if (stock && stockDetail && symbol) {
            if (!stockDetail.news || stockDetail.news.length === 0) {
                setCurrentNewsIndex(0);
                fetchStockNews(symbol);
            }
        }
    }, [stock, symbol]);

    const fetchUserData = async () => {
        try {
            const response = await authApi.getCurrentUser();
            if (response.success && response.data) {
                setUserSimulationDate(response.data.simulation_date);
            }
        } catch (error) {
            console.error('Failed to fetch user data:', error);
        }
    };

    const fetchStockData = async (stockSymbol) => {
        try {
            setLoadingStock(true);
            const response = await stockApi.getStocks();
            if (response.success && response.data) {
                const foundStock = response.data.find(s => s.symbol === stockSymbol);
                if (foundStock) {
                    setStock(foundStock);
                    setStockDetail({ logo: `https://financialmodelingprep.com/image-stock/${stockSymbol}.png`, news: [] });
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
            const response = await stockApi.getCompanyInfo(stockSymbol);
            if (response.success && response.data) {
                setCompanyInfo(response.data);
            } else {
                setCompanyInfo(null);
            }
        } catch (error) {
            setCompanyInfo(null);
        } finally {
            setLoadingCompanyInfo(false);
        }
    };

    const fetchStockNews = async (stockSymbol) => {
        try {
            setLoadingNews(true);
            const response = await newsApi.getStockNews(stockSymbol, { limit: 3 });
            if (response.success && response.data?.length > 0) {
                const processedNews = response.data.map(n => ({
                    title: n.title,
                    summary: n.summary || n.content?.substring(0, 200) + '...',
                    content: n.content || 'N/A',
                    sentimentScore: n.sentimentScore ?? 'N/A',
                    date: new Date(n.published_date || n.date).toLocaleDateString('en-US'),
                    source: n.source || 'N/A'
                }));
                setStockDetail(prev => ({ ...prev, news: processedNews }));
            }
        } catch {
            setStockDetail(prev => ({ ...prev, news: [] }));
        } finally {
            setLoadingNews(false);
        }
    };

    if (loadingStock) {
        return <div className="stock-detail-loading"><h2>Loading stock information...</h2></div>;
    }
    if (!stock || !stockDetail) {
        return <div className="stock-detail-error"><h2>Stock information not found</h2></div>;
    }



    return (
        <div className="stock-detail-page">
            <div className="page-content">
                {/* K 线图部分 */}
               <KChart symbol={symbol} stock={stock} />

                {/* 右侧公司信息 */}
                <div className="company-info-section">
                    {loadingCompanyInfo ? (
                        <div className="company-loading">
                            <p>Loading company information...</p>
                        </div>
                    ) : !companyInfo ? (
                        <div className="company-error">
                            <p>Failed to load company information</p>
                        </div>
                    ) : (
                        <>


                           

                            {/* 财务指标 */}
                            <div className="financial-metrics">
                                <h4>Financial Metrics</h4>
                                <div className="metrics-grid">
                                    <div className="metric">
                                        <span className="metric-label">Market Cap</span>
                                        <span className="metric-value">
                                            {companyInfo.financialMetrics?.marketCapitalization ?
                                                `$${(parseFloat(companyInfo.financialMetrics.marketCapitalization) / 1000000000).toFixed(1)}B` :
                                                'N/A'
                                            }
                                        </span>
                                    </div>
                                    <div className="metric">
                                        <span className="metric-label">EBITDA</span>
                                        <span className="metric-value">
                                            {companyInfo.financialMetrics?.ebitda ?
                                                `$${(parseFloat(companyInfo.financialMetrics.ebitda) / 1000000000).toFixed(1)}B` :
                                                'N/A'
                                            }
                                        </span>
                                    </div>
                                    <div className="metric">
                                        <span className="metric-label">PE Ratio</span>
                                        <span className="metric-value">{companyInfo.financialMetrics?.peRatio || 'N/A'}</span>
                                    </div>
                                    <div className="metric">
                                        <span className="metric-label">PEG Ratio</span>
                                        <span className="metric-value">{companyInfo.financialMetrics?.pegRatio || 'N/A'}</span>
                                    </div>
                                    <div className="metric">
                                        <span className="metric-label">Book Value</span>
                                        <span className="metric-value">
                                            {companyInfo.financialMetrics?.bookValue ?
                                                `$${companyInfo.financialMetrics.bookValue}` : 'N/A'}
                                        </span>
                                    </div>
                                    <div className="metric">
                                        <span className="metric-label">Volume</span>
                                        <span className="metric-value">
                                            {stock?.volume ? `${(stock.volume / 1000000).toFixed(1)}M` : 'N/A'}
                                        </span>
                                    </div>
                                    
                                </div>
                                
                            </div>

                             {/* 基本信息 */}
                            <div className="basic-info">
                                <h4>Basic Information</h4>
                                <div className="company-description">
                                <p>{companyInfo.description || 'No description available.'}</p>
                            </div>
                                <div className="info-grid">
                                    <div className="info-item">
                                        <span className="info-label">CIK</span>
                                        <span className="info-value">{companyInfo.basicInfo?.cik || 'N/A'}</span>
                                    </div>
                                    <div className="info-item">
                                        <span className="info-label">Currency</span>
                                        <span className="info-value">{companyInfo.basicInfo?.currency || 'N/A'}</span>
                                    </div>
                                    <div className="info-item">
                                        <span className="info-label">Country</span>
                                        <span className="info-value">{companyInfo.basicInfo?.country || 'N/A'}</span>
                                    </div>
                                    <div className="info-item">
                                        <span className="info-label">Address</span>
                                        <span className="info-value">{companyInfo.basicInfo?.address || 'N/A'}</span>
                                    </div>
                                    <div className="info-item">
                                        <span className="info-label">Official Website</span>
                                        <span className="info-value">
                                            {companyInfo.basicInfo?.officialSite ? (
                                                <a href={companyInfo.basicInfo.officialSite} target="_blank" rel="noopener noreferrer">
                                                    Visit Website
                                                </a>
                                            ) : 'N/A'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}
                </div>

                <div className="right-panel">
                    
                    <div className="actions-section">
                                                    <div className="company-header">
                                <img
                                    src={companyInfo.logo}
                                    alt={`${companyInfo.name} logo`}
                                    className="company-logo"
                                    onError={(e) => {
                                        e.target.src = `https://via.placeholder.com/80x80/667eea/ffffff?text=${companyInfo.symbol}`;
                                    }}
                                />
                                <div className="company-details">
                                    <h3>{companyInfo.name}</h3>
                                    <span className="symbol">Symbol: {companyInfo.symbol}</span>
                                    <span className="sector">Sector: {companyInfo.sector || 'N/A'}</span>
                                    <span className="industry">Industry: {companyInfo.industry || 'N/A'}</span>
                                    <span className="exchange">Exchange: {companyInfo.basicInfo?.exchange || 'N/A'}</span>
                                </div>
                            </div>
                            

                        <button className="action-btn buy-btn" onClick={() => setShowBuyModal(true)}>
                            <span className="btn-icon">💰</span> Buy Stock
                        </button>

                    </div>
                                    {/* 公司新闻 */}
                <div className="news-section">
                    <h3>Latest News</h3>
                    {loadingNews ? <p>Loading news...</p> : (
                        Array.isArray(stockDetail.news) && stockDetail.news.length > 0 ?
                            <div className="news-item">
                                <h4>{currentNews?.title}</h4>
                                <p>{currentNews?.summary}</p>
                                <span>{currentNews?.date}</span>
                            </div> :
                            <p>No related news</p>
                    )}
                </div>
                </div>


            </div>

            <BuyStockModal isOpen={showBuyModal} onClose={() => setShowBuyModal(false)} symbol={stock?.symbol} />
        </div>
    );
};

export default StockDetail;
