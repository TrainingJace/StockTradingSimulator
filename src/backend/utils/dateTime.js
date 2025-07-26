// 日期和时间工具函数

/**
 * 获取当前时间戳（ISO 格式）
 * @returns {string} ISO 时间戳
 */
function getCurrentTimestamp() {
  return new Date().toISOString();
}

/**
 * 格式化日期为 YYYY-MM-DD
 * @param {Date|string} date 日期对象或字符串
 * @returns {string} 格式化的日期字符串
 */
function formatDate(date) {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * 获取指定天数前的日期
 * @param {number} days 天数
 * @returns {string} YYYY-MM-DD 格式的日期
 */
function getDaysAgo(days) {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return formatDate(date);
}

/**
 * 检查是否在交易时间内
 * @param {Date} date 要检查的时间
 * @param {string} timezone 时区
 * @returns {boolean} 是否在交易时间内
 */
function isMarketHours(date = new Date(), timezone = 'America/New_York') {
  // 简化实现，实际项目中可能需要考虑节假日等
  const options = {
    timeZone: timezone,
    hour12: false,
    hour: '2-digit',
    minute: '2-digit'
  };
  
  const timeString = date.toLocaleTimeString('en-US', options);
  const [hours, minutes] = timeString.split(':').map(Number);
  const currentMinutes = hours * 60 + minutes;
  
  const marketOpen = 9 * 60 + 30; // 09:30
  const marketClose = 16 * 60;    // 16:00
  
  return currentMinutes >= marketOpen && currentMinutes <= marketClose;
}

/**
 * 获取下一个交易日
 * @param {Date} date 基准日期，默认为今天
 * @returns {Date} 下一个交易日
 */
function getNextTradingDay(date = new Date()) {
  const nextDay = new Date(date);
  do {
    nextDay.setDate(nextDay.getDate() + 1);
  } while (nextDay.getDay() === 0 || nextDay.getDay() === 6); // 跳过周末
  
  return nextDay;
}

/**
 * 计算两个日期之间的交易日数量
 * @param {Date|string} startDate 开始日期
 * @param {Date|string} endDate 结束日期
 * @returns {number} 交易日数量
 */
function getTradingDaysBetween(startDate, endDate) {
  const start = new Date(startDate);
  const end = new Date(endDate);
  let count = 0;
  const current = new Date(start);
  
  while (current <= end) {
    if (current.getDay() !== 0 && current.getDay() !== 6) { // 不是周末
      count++;
    }
    current.setDate(current.getDate() + 1);
  }
  
  return count;
}

/**
 * 将时间戳转换为用户友好的格式
 * @param {string|Date} timestamp 时间戳
 * @returns {string} 格式化的时间字符串
 */
function formatTimestamp(timestamp) {
  const date = new Date(timestamp);
  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
}

module.exports = {
  getCurrentTimestamp,
  formatDate,
  getDaysAgo,
  isMarketHours,
  getNextTradingDay,
  getTradingDaysBetween,
  formatTimestamp
};
