// 数据验证工具函数

/**
 * 验证股票代码格式
 * @param {string} symbol 股票代码
 * @returns {boolean} 是否有效
 */
function isValidStockSymbol(symbol) {
  if (typeof symbol !== 'string') return false;
  return /^[A-Z]{1,5}$/.test(symbol.toUpperCase());
}

/**
 * 验证邮箱格式
 * @param {string} email 邮箱地址
 * @returns {boolean} 是否有效
 */
function isValidEmail(email) {
  if (typeof email !== 'string') return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * 验证用户名格式
 * @param {string} username 用户名
 * @returns {boolean} 是否有效
 */
function isValidUsername(username) {
  if (typeof username !== 'string') return false;
  // 用户名：3-20个字符，只能包含字母、数字、下划线
  return /^[a-zA-Z0-9_]{3,20}$/.test(username);
}

/**
 * 验证日期格式 (YYYY-MM-DD)
 * @param {string} dateString 日期字符串
 * @returns {boolean} 是否有效
 */
function isValidDate(dateString) {
  if (typeof dateString !== 'string') return false;
  const date = new Date(dateString);
  return date instanceof Date && !isNaN(date) && dateString.match(/^\d{4}-\d{2}-\d{2}$/);
}

/**
 * 验证正数
 * @param {any} value 要验证的值
 * @returns {boolean} 是否为正数
 */
function isPositiveNumber(value) {
  const num = parseFloat(value);
  return !isNaN(num) && num > 0;
}

/**
 * 验证整数
 * @param {any} value 要验证的值
 * @returns {boolean} 是否为正整数
 */
function isPositiveInteger(value) {
  const num = parseInt(value);
  return !isNaN(num) && num > 0 && Number.isInteger(num);
}

/**
 * 验证交易类型
 * @param {string} type 交易类型
 * @returns {boolean} 是否有效
 */
function isValidTradeType(type) {
  return typeof type === 'string' && ['BUY', 'SELL'].includes(type.toUpperCase());
}

module.exports = {
  isValidStockSymbol,
  isValidEmail,
  isValidUsername,
  isValidDate,
  isPositiveNumber,
  isPositiveInteger,
  isValidTradeType
};
