import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext.jsx';
import { tradingApi, stockApi } from '../api';
import './BuyStockModal.css';

// 辅助函数：安全地格式化价格
const formatPrice = (price) => {
  const numPrice = parseFloat(price) || 0;
  return numPrice.toFixed(2);
};

const BuyStockModal = ({ isOpen, onClose, symbol, onBuySuccess }) => {
  const { user } = useAuth();
  const [shares, setShares] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [stock, setStock] = useState(null);
  const [fetchingStock, setFetchingStock] = useState(false);

  // 当模态框打开且有symbol时，获取股票信息
  useEffect(() => {
    if (isOpen && symbol && symbol !== stock?.symbol) {
      fetchStockData();
    }
  }, [isOpen, symbol]);

  const fetchStockData = async () => {
    setFetchingStock(true);
    setError('');
    try {
      // stockApi会自动从localStorage获取用户的simulation_date
      const response = await stockApi.getStock(symbol);
      if (response.success && response.data) {
        setStock(response.data);
      } else {
        setError('Failed to fetch stock information');
      }
    } catch (error) {
      console.error('Failed to fetch stock data:', error);
      setError('Failed to fetch stock information');
    } finally {
      setFetchingStock(false);
    }
  };

  const handleQuantityChange = (e) => {
    const value = parseInt(e.target.value);
    if (value > 0) {
      setShares(value);
      setError('');
    }
  };

  const handleBuyStock = async () => {
    if (!user) {
      setError('请先登录');
      return;
    }

    // 验证输入
    if (!shares || shares <= 0) {
      setError('请输入有效的股数');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const orderData = {
        symbol: stock.symbol,
        shares: shares,
        price: parseFloat(stock.price) || 0
      };

      // 验证订单数据
      const validation = tradingApi.validateOrderData(orderData);
      if (!validation.valid) {
        setError(validation.error);
        setLoading(false);
        return;
      }

      const response = await tradingApi.executeBuyOrder(orderData);

      if (response.success) {
        // 购买成功
        alert(`成功购买 ${shares} 股 ${stock.symbol}！\n总价：$${(shares * parseFloat(stock.price)).toFixed(2)}`);
        
        // 调用成功回调
        if (onBuySuccess) {
          onBuySuccess();
        }
        
        onClose();
        // 触发投资组合刷新事件
        window.dispatchEvent(new CustomEvent('portfolioUpdate'));
        // 重置表单
        setShares(1);
        setStock(null);
      } else {
        setError(response.error || '购买失败，请重试');
      }
    } catch (error) {
      console.error('Buy stock error:', error);
      setError('网络错误，请重试');
    } finally {
      setLoading(false);
    }
  };

  const totalCost = shares * parseFloat(stock?.price || 0);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="buy-stock-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>购买股票 {symbol && `- ${symbol}`}</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <div className="modal-content">
          {fetchingStock ? (
            <div className="loading-container">
              <div className="loading-spinner"></div>
              <p>正在获取股票信息...</p>
            </div>
          ) : error && !stock ? (
            <div className="error-container">
              <div className="error-message">{error}</div>
              <button onClick={fetchStockData} className="retry-btn">
                重新获取
              </button>
            </div>
          ) : stock ? (
            <>
              <div className="stock-info">
                <div className="stock-name">
                  <span className="symbol">{stock.symbol}</span>
                  <span className="name">{stock.name}</span>
                </div>
                <div className="stock-price">
                  <span className="price">${formatPrice(stock.price)}</span>
                  {(stock.change !== undefined || stock.changePercent !== undefined) && (
                    <span 
                      className={`change ${(parseFloat(stock.change) || 0) >= 0 ? 'positive' : 'negative'}`}
                    >
                      {(parseFloat(stock.change) || 0) >= 0 ? '+' : ''}${formatPrice(Math.abs(parseFloat(stock.change) || 0))}
                      ({formatPrice(stock.changePercent)}%)
                    </span>
                  )}
                </div>
              </div>

              <div className="order-form">
                <div className="form-group">
                  <label htmlFor="shares">股数：</label>
                  <input
                    type="number"
                    id="shares"
                    value={shares}
                    min="1"
                    step="1"
                    onChange={handleQuantityChange}
                    disabled={loading}
                  />
                </div>

                <div className="order-summary">
                  <div className="summary-row">
                    <span>单价：</span>
                    <span>${formatPrice(stock.price)}</span>
                  </div>
                  <div className="summary-row">
                    <span>数量：</span>
                    <span>{shares} 股</span>
                  </div>
                  <div className="summary-row total">
                    <span>总计：</span>
                    <span>${totalCost.toFixed(2)}</span>
                  </div>
                </div>

                {error && (
                  <div className="error-message">
                    {error}
                  </div>
                )}
              </div>

              <div className="modal-footer">
                <button 
                  className="cancel-btn" 
                  onClick={onClose}
                  disabled={loading}
                >
                  取消
                </button>
                <button 
                  className="buy-btn" 
                  onClick={handleBuyStock}
                  disabled={loading}
                >
                  {loading ? '处理中...' : `买入 $${totalCost.toFixed(2)}`}
                </button>
              </div>
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default BuyStockModal;
