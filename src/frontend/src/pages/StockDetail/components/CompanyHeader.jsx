import React from 'react';

const CompanyHeader = ({ companyInfo, stockDetail, symbol, loading }) => {
    if (loading) {
        return (
            <div className="company-header-loading">
                <div className="logo-placeholder"></div>
                <div className="company-details">
                    <h3>Loading company info...</h3>
                    <span className="symbol">Symbol: {symbol}</span>
                </div>
            </div>
        );
    }

    const logoSrc = companyInfo?.logo || stockDetail?.logo || `https://via.placeholder.com/80x80/667eea/ffffff?text=${symbol}`;
    const companyName = companyInfo?.name || symbol;
    const companySymbol = companyInfo?.symbol || symbol;

    return (
        <div className="company-header">
            <img
                src={logoSrc}
                alt={`${companyName} logo`}
                className="company-logo"
                onError={(e) => {
                    e.target.src = `https://via.placeholder.com/80x80/667eea/ffffff?text=${symbol}`;
                }}
            />
            <div className="company-details">
                <h3>{companyName}</h3>
                <span className="symbol">Symbol: {companySymbol}</span>
                <span className="sector">Sector: {companyInfo?.sector || 'N/A'}</span>
                <span className="industry">Industry: {companyInfo?.industry || 'N/A'}</span>
                <span className="exchange">Exchange: {companyInfo?.basicInfo?.exchange || 'N/A'}</span>
            </div>
        </div>
    );
};

export default CompanyHeader;
