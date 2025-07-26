// 通用的数据获取Hook

import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * 通用的异步数据获取Hook
 * @param {Function} fetchFunction - 获取数据的异步函数
 * @param {Array} dependencies - 依赖数组，变化时重新获取数据
 * @param {Object} options - 配置选项
 * @returns {Object} { data, loading, error, refetch }
 */
export const useAsyncData = (fetchFunction, dependencies = [], options = {}) => {
  const {
    initialData = null,
    immediate = true,
    onSuccess,
    onError
  } = options;

  const [data, setData] = useState(initialData);
  const [loading, setLoading] = useState(immediate);
  const [error, setError] = useState(null);

  // 使用 useRef 保存 fetchFunction，避免每次重新创建导致无限循环
  const fetchFunctionRef = useRef(fetchFunction);
  fetchFunctionRef.current = fetchFunction;

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await fetchFunctionRef.current();
      
      // 处理API响应格式
      const responseData = result?.success ? result.data : result;
      setData(responseData);
      
      // 成功回调
      if (onSuccess) {
        onSuccess(responseData);
      }
      
    } catch (err) {
      const errorMessage = err.message || '获取数据失败';
      setError(errorMessage);
      
      // 错误回调
      if (onError) {
        onError(err);
      }
      
      console.error('数据获取错误:', err);
    } finally {
      setLoading(false);
    }
  }, [onSuccess, onError]);

  useEffect(() => {
    if (immediate) {
      fetchData();
    }
  }, [...dependencies]);

  const refetch = useCallback(() => {
    return fetchData();
  }, [fetchData]);

  return {
    data,
    loading,
    error,
    refetch
  };
};

/**
 * 带搜索功能的数据Hook
 * @param {Function} fetchFunction - 获取数据的函数
 * @param {Function} filterFunction - 过滤数据的函数
 * @param {Array} dependencies - 依赖数组
 * @returns {Object} 包含搜索相关状态和方法的对象
 */
export const useSearchableData = (fetchFunction, filterFunction, dependencies = []) => {
  const [searchTerm, setSearchTerm] = useState('');
  
  const {
    data: rawData,
    loading,
    error,
    refetch
  } = useAsyncData(fetchFunction, dependencies);

  const filteredData = rawData && Array.isArray(rawData) 
    ? rawData.filter(item => filterFunction(item, searchTerm))
    : rawData;

  const clearSearch = () => setSearchTerm('');

  return {
    data: filteredData,
    rawData,
    loading,
    error,
    refetch,
    searchTerm,
    setSearchTerm,
    clearSearch
  };
};

/**
 * 定时刷新数据的Hook
 * @param {Function} fetchFunction - 获取数据的函数
 * @param {number} interval - 刷新间隔（毫秒）
 * @param {Array} dependencies - 依赖数组
 * @returns {Object} 数据状态和控制方法
 */
export const usePollingData = (fetchFunction, interval = 30000, dependencies = []) => {
  const [isPolling, setIsPolling] = useState(true);
  
  const {
    data,
    loading,
    error,
    refetch
  } = useAsyncData(fetchFunction, dependencies);

  useEffect(() => {
    if (!isPolling) return;

    const intervalId = setInterval(() => {
      refetch();
    }, interval);

    return () => clearInterval(intervalId);
  }, [isPolling, interval, refetch]);

  const startPolling = () => setIsPolling(true);
  const stopPolling = () => setIsPolling(false);
  const togglePolling = () => setIsPolling(prev => !prev);

  return {
    data,
    loading,
    error,
    refetch,
    isPolling,
    startPolling,
    stopPolling,
    togglePolling
  };
};
