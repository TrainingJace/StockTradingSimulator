// 财务计算工具函数

/**
 * 计算百分比变化
 * @param {number} oldValue 旧值
 * @param {number} newValue 新值
 * @returns {number} 百分比变化
 */
function calculatePercentChange(oldValue, newValue) {
  if (oldValue === 0) return 0;
  return ((newValue - oldValue) / oldValue) * 100;
}

/**
 * 计算投资回报率 (ROI)
 * @param {number} currentValue 当前价值
 * @param {number} initialInvestment 初始投资
 * @returns {number} ROI 百分比
 */
function calculateROI(currentValue, initialInvestment) {
  return calculatePercentChange(initialInvestment, currentValue);
}

/**
 * 计算加权平均成本
 * @param {Array} positions 持仓数组，每个元素包含 {shares, price}
 * @returns {number} 加权平均成本
 */
function calculateWeightedAverageCost(positions) {
  if (!positions || positions.length === 0) return 0;
  
  let totalCost = 0;
  let totalShares = 0;
  
  positions.forEach(position => {
    totalCost += position.shares * position.price;
    totalShares += position.shares;
  });
  
  return totalShares > 0 ? totalCost / totalShares : 0;
}

/**
 * 计算投资组合的总价值
 * @param {Array} positions 持仓数组
 * @returns {object} 包含总成本、当前价值、收益等信息
 */
function calculatePortfolioValue(positions) {
  let totalCost = 0;
  let currentValue = 0;
  
  positions.forEach(position => {
    totalCost += position.shares * position.avgCost;
    currentValue += position.shares * position.currentPrice;
  });
  
  const totalReturn = currentValue - totalCost;
  const totalReturnPercent = totalCost > 0 ? (totalReturn / totalCost) * 100 : 0;
  
  return {
    totalCost: parseFloat(totalCost.toFixed(2)),
    currentValue: parseFloat(currentValue.toFixed(2)),
    totalReturn: parseFloat(totalReturn.toFixed(2)),
    totalReturnPercent: parseFloat(totalReturnPercent.toFixed(2))
  };
}

/**
 * 计算波动率（简化版本）
 * @param {Array} prices 价格数组
 * @returns {number} 波动率
 */
function calculateVolatility(prices) {
  if (!prices || prices.length < 2) return 0;
  
  const returns = [];
  for (let i = 1; i < prices.length; i++) {
    const dailyReturn = (prices[i] - prices[i-1]) / prices[i-1];
    returns.push(dailyReturn);
  }
  
  const avgReturn = returns.reduce((sum, ret) => sum + ret, 0) / returns.length;
  const variance = returns.reduce((sum, ret) => sum + Math.pow(ret - avgReturn, 2), 0) / returns.length;
  
  return Math.sqrt(variance) * Math.sqrt(252); // 年化波动率
}

/**
 * 计算移动平均线
 * @param {Array} prices 价格数组
 * @param {number} period 周期
 * @returns {Array} 移动平均线数组
 */
function calculateMovingAverage(prices, period) {
  if (!prices || prices.length < period) return [];
  
  const movingAverages = [];
  for (let i = period - 1; i < prices.length; i++) {
    const sum = prices.slice(i - period + 1, i + 1).reduce((a, b) => a + b, 0);
    movingAverages.push(sum / period);
  }
  
  return movingAverages;
}

/**
 * 格式化货币金额
 * @param {number} amount 金额
 * @param {string} currency 货币符号，默认为 '$'
 * @returns {string} 格式化的货币字符串
 */
function formatCurrency(amount, currency = '$') {
  if (typeof amount !== 'number') return `${currency}0.00`;
  
  return `${currency}${amount.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })}`;
}

/**
 * 格式化百分比
 * @param {number} percentage 百分比数值
 * @param {number} decimals 小数位数，默认为2
 * @returns {string} 格式化的百分比字符串
 */
function formatPercentage(percentage, decimals = 2) {
  if (typeof percentage !== 'number') return '0.00%';
  
  const sign = percentage >= 0 ? '+' : '';
  return `${sign}${percentage.toFixed(decimals)}%`;
}

/**
 * 计算复合年增长率 (CAGR)
 * @param {number} beginningValue 初始值
 * @param {number} endingValue 结束值
 * @param {number} years 年数
 * @returns {number} CAGR 百分比
 */
function calculateCAGR(beginningValue, endingValue, years) {
  if (beginningValue <= 0 || years <= 0) return 0;
  return (Math.pow(endingValue / beginningValue, 1 / years) - 1) * 100;
}

module.exports = {
  calculatePercentChange,
  calculateROI,
  calculateWeightedAverageCost,
  calculatePortfolioValue,
  calculateVolatility,
  calculateMovingAverage,
  formatCurrency,
  formatPercentage,
  calculateCAGR
};
