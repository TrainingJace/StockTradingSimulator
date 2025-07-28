import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext.jsx';
import { tradingApi } from '../api';
import './BuyStockModal.css';

const BuyStockModal = ({ isOpen, onClose, stock }) => {
  const { user } = useAuth();
  const [shares, setShares] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

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
        price: stock.price
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
        alert(`成功购买 ${shares} 股 ${stock.symbol}！\n总价：$${(shares * stock.price).toFixed(2)}`);
        onClose();
        // 触发投资组合刷新事件
        window.dispatchEvent(new CustomEvent('portfolioUpdate'));
        // 重置表单
        setShares(1);
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

  const totalCost = shares * (stock?.price || 0);

  if (!isOpen || !stock) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="buy-stock-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>购买股票</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <div className="modal-content">
          <div className="stock-info">
            <div className="stock-name">
              <span className="symbol">{stock.symbol}</span>
              <span className="name">{stock.name}</span>
            </div>
            <div className="stock-price">
              <span className="price">${stock.price.toFixed(2)}</span>
              <span 
                className={`change ${stock.change >= 0 ? 'positive' : 'negative'}`}
              >
                {stock.change >= 0 ? '+' : ''}${Math.abs(stock.change).toFixed(2)}
                ({stock.changePercent?.toFixed(2)}%)
              </span>
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
                <span>${stock.price.toFixed(2)}</span>
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
      </div>
    </div>
  );
};

export default BuyStockModal;
