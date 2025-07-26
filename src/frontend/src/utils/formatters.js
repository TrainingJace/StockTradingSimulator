// 通用工具函数

/**
 * 格式化价格
 * @param {number} price - 价格
 * @param {number} decimals - 小数位数，默认2位
 * @returns {string} 格式化后的价格字符串
 */
export const formatPrice = (price, decimals = 2) => {
  if (typeof price !== 'number' || isNaN(price)) return '0.00';
  return price.toFixed(decimals);
};

/**
 * 格式化百分比
 * @param {number} percentage - 百分比数值
 * @param {boolean} showSign - 是否显示正号，默认true
 * @returns {string} 格式化后的百分比字符串
 */
export const formatPercentage = (percentage, showSign = true) => {
  if (typeof percentage !== 'number' || isNaN(percentage)) return '0.00%';
  const sign = showSign && percentage > 0 ? '+' : '';
  return `${sign}${percentage.toFixed(2)}%`;
};

/**
 * 格式化大数字（K, M, B）
 * @param {number} num - 数字
 * @returns {string} 格式化后的字符串
 */
export const formatLargeNumber = (num) => {
  if (typeof num !== 'number' || isNaN(num)) return '0';
  
  const abs = Math.abs(num);
  if (abs >= 1e9) return (num / 1e9).toFixed(1) + 'B';
  if (abs >= 1e6) return (num / 1e6).toFixed(1) + 'M';
  if (abs >= 1e3) return (num / 1e3).toFixed(1) + 'K';
  return num.toString();
};

/**
 * 格式化数字（别名）
 * @param {number} num - 数字
 * @returns {string} 格式化后的字符串
 */
export const formatNumber = formatLargeNumber;

/**
 * 获取价格变化的颜色类名
 * @param {number} change - 价格变化
 * @returns {string} CSS类名
 */
export const getPriceChangeClass = (change) => {
  if (change > 0) return 'price-positive';
  if (change < 0) return 'price-negative';
  return 'price-neutral';
};

/**
 * 获取价格变化的颜色
 * @param {number} change - 价格变化
 * @returns {string} 颜色值
 */
export const getPriceChangeColor = (change) => {
  if (change > 0) return '#4CAF50';
  if (change < 0) return '#f44336';
  return '#666';
};

/**
 * 格式化日期时间
 * @param {string|Date} date - 日期
 * @param {string} format - 格式类型 'date'|'time'|'datetime'
 * @returns {string} 格式化后的日期字符串
 */
export const formatDateTime = (date, format = 'datetime') => {
  if (!date) return '';
  
  const d = new Date(date);
  if (isNaN(d.getTime())) return '';
  
  const options = {
    date: { year: 'numeric', month: '2-digit', day: '2-digit' },
    time: { hour: '2-digit', minute: '2-digit' },
    datetime: { 
      year: 'numeric', 
      month: '2-digit', 
      day: '2-digit',
      hour: '2-digit', 
      minute: '2-digit' 
    }
  };
  
  return d.toLocaleDateString('zh-CN', options[format]);
};

/**
 * 格式化日期（只显示日期部分）
 * @param {string|Date} date - 日期
 * @returns {string} 格式化后的日期字符串
 */
export const formatDate = (date) => {
  return formatDateTime(date, 'date');
};

/**
 * 防抖函数
 * @param {Function} func - 要防抖的函数
 * @param {number} delay - 延迟时间（毫秒）
 * @returns {Function} 防抖后的函数
 */
export const debounce = (func, delay) => {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func.apply(null, args), delay);
  };
};

/**
 * 节流函数
 * @param {Function} func - 要节流的函数
 * @param {number} delay - 节流间隔（毫秒）
 * @returns {Function} 节流后的函数
 */
export const throttle = (func, delay) => {
  let lastCall = 0;
  return (...args) => {
    const now = Date.now();
    if (now - lastCall >= delay) {
      lastCall = now;
      return func.apply(null, args);
    }
  };
};

// 验证函数
export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePassword = (password) => {
  return password && password.length >= 6;
};

export const validateRequired = (value) => {
  return value !== null && value !== undefined && value !== '';
};

// 错误处理
export const getErrorMessage = (error) => {
  if (typeof error === 'string') {
    return error;
  }
  
  if (error?.message) {
    return error.message;
  }
  
  if (error?.response?.data?.message) {
    return error.response.data.message;
  }
  
  return '操作失败，请稍后重试';
};

// API响应处理
export const handleApiResponse = (response) => {
  if (response?.success) {
    return response.data;
  }
  throw new Error(response?.message || '请求失败');
};

// 本地存储工具
export const storage = {
  get: (key) => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.error('读取本地存储失败:', error);
      return null;
    }
  },
  
  set: (key, value) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      console.error('保存到本地存储失败:', error);
      return false;
    }
  },
  
  remove: (key) => {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error('删除本地存储失败:', error);
      return false;
    }
  },
  
  clear: () => {
    try {
      localStorage.clear();
      return true;
    } catch (error) {
      console.error('清空本地存储失败:', error);
      return false;
    }
  }
};
