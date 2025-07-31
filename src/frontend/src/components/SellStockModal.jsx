import React, { useState } from 'react';
import { tradingApi } from '../api';
import { useAuth } from '../hooks';
import './SellStockModal.css';

// 辅助函数：安全地格式化价格
const formatPrice = (price) => {
  const numPrice = parseFloat(price) || 0;
  return numPrice.toFixed(2);
};

const SellStockModal = ({ isOpen, onClose, stock, holdings, onSellSuccess }) => {
  const [shares, setShares] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { getCurrentUserId } = useAuth();

  // 找到当前股票的持仓信息
  const currentHolding = holdings?.find(h => h.symbol === stock?.symbol);
  const maxShares = currentHolding?.shares || 0;

  const handleSellStock = async () => {
    if (!shares || parseInt(shares) <= 0) {
      setError('Please enter a valid number of shares');
      return;
    }

    if (parseInt(shares) > maxShares) {
      setError(`You can only sell up to ${maxShares} shares`);
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const userId = getCurrentUserId();
      const orderData = {
        userId,
        symbol: stock.symbol,
        shares: parseInt(shares),
        price: parseFloat(stock.price) || 0
      };

      // 验证订单数据
      const validation = tradingApi.validateOrderData(orderData);
      if (!validation.valid) {
        setError(validation.error);
        setIsLoading(false);
        return;
      }

      const response = await tradingApi.executeSellOrder(orderData);
      

      if (response.success) {
        // 显示成功消息
        alert(`Successfully sold ${shares} shares of ${stock.symbol}!\nTotal proceeds: $${estimatedTotal}`);
        
        // 成功后的回调
        if (onSellSuccess) {
          onSellSuccess();
        }

        // 重置表单并关闭模态框
        setShares('');
        onClose();
      } else {
        console.error('Sell order failed:', response.error); // 调试日志
        setError(response.error || 'Failed to sell stock. Please try again.');
      }
    } catch (error) {
      console.error('Sell stock error:', error);
      setError(error.response?.data?.message || 'Failed to sell stock. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const estimatedTotal = shares ? (parseInt(shares) * parseFloat(stock?.price || 0)).toFixed(2) : '0.00';

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="sell-stock-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Sell {stock?.symbol}</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <div className="modal-content">
          <div className="modal-body">
            <div className="stock-info">
              <div className="stock-name">{stock?.name || stock?.symbol}</div>
              <div className="stock-price">
                Current Price: ${formatPrice(stock?.price)}
              </div>
              <div className="current-holding">
                Current Holdings: {maxShares} shares
              </div>
            </div>
            <div className="order-section">
              <div className="form-group">
                <label htmlFor="shares">Number of Shares to Sell:</label>
                <input
                  type="number"
                  id="shares"
                  value={shares}
                  onChange={(e) => setShares(e.target.value)}
                  placeholder="Enter shares"
                  min="1"
                  max={maxShares}
                  step="1"
                  disabled={isLoading}
                />
                <div className="max-shares">
                  Maximum: {maxShares} shares
                </div>
              </div>
              <div className="transaction-summary">
                <div className="summary-row">
                  <span>Shares to Sell:</span>
                  <span>{shares || '0'}</span>
                </div>
                <div className="summary-row">
                  <span>Price per Share:</span>
                  <span>${formatPrice(stock?.price)}</span>
                </div>
                <div className="summary-row total">
                  <span>Estimated Total:</span>
                  <span>${estimatedTotal}</span>
                </div>
              </div>
            </div>
          </div>
          {error && <div className="error-message">{error}</div>}
          <button 
            className="sell-btn" 
            onClick={handleSellStock}
            disabled={isLoading || !shares || parseInt(shares) <= 0 || parseInt(shares) > maxShares}
            style={{ marginTop: '20px', width: '100%' }}
          >
            {isLoading ? 'Selling...' : 'Sell Stock'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SellStockModal;
