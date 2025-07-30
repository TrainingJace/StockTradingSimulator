import React from 'react';

const CompanyInfo = ({ 
    companyInfo, 
    loadingCompanyInfo, 
    stock 
}) => {
    if (loadingCompanyInfo) {
        return (
            <div className="company-info-section">
                <div className="company-loading">
                    <p>Loading company information...</p>
                </div>
            </div>
        );
    }

    if (!companyInfo) {
        return (
            <div className="company-info-section">
                <div className="company-error">
                    <p>Failed to load company information</p>
                </div>
            </div>
        );
    }

    return (
        <div className="company-info-section">
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
            <div className="company-description">
                <p>{companyInfo.description || 'No description available.'}</p>
            </div>

            {/* 基本信息 */}
            <div className="basic-info">
                <h4>Basic Information</h4>
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
        </div>
    );
};

export default CompanyInfo;
