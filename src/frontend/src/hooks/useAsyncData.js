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

/**
 * 混合搜索Hook - 结合本地过滤和外部API搜索
 * @param {Function} fetchAllFunction - 获取所有数据的函数
 * @param {Function} searchApiFunction - 外部搜索API函数
 * @param {Function} filterFunction - 本地过滤函数
 * @param {Array} dependencies - 依赖数组
 * @returns {Object} 包含搜索相关状态和方法的对象
 */
export const useHybridSearch = (fetchAllFunction, searchApiFunction, filterFunction, dependencies = []) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [lastSearchTerm, setLastSearchTerm] = useState(''); // 记录上次搜索的词

  // 使用useRef保存最新的函数和数据，避免频繁重创建
  const searchApiRef = useRef(searchApiFunction);
  const filterFunctionRef = useRef(filterFunction);
  searchApiRef.current = searchApiFunction;
  filterFunctionRef.current = filterFunction;

  // 获取所有数据（用于本地过滤）
  const {
    data: allData,
    loading: allDataLoading,
    error: allDataError,
    refetch: refetchAll
  } = useAsyncData(fetchAllFunction, dependencies);

  // 执行搜索
  const performSearch = useCallback(async (query) => {
    if (!query || query.trim().length === 0) {
      setSearchResults([]);
      setSearchError(null);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    setSearchError(null);

    try {
      // 首先尝试外部API搜索
      const response = await searchApiRef.current(query.trim());
      if (response.success && response.data) {
        setSearchResults(response.data);
      } else {
        // 如果外部API失败，使用本地过滤
        if (allData && Array.isArray(allData)) {
          const filtered = allData.filter(item => filterFunctionRef.current(item, query));
          setSearchResults(filtered);
        } else {
          setSearchResults([]);
        }
      }
    } catch (error) {
      setSearchError(error.message);
      // 发生错误时，尝试本地过滤作为备选
      if (allData && Array.isArray(allData)) {
        const filtered = allData.filter(item => filterFunctionRef.current(item, query));
        setSearchResults(filtered);
      } else {
        setSearchResults([]);
      }
    } finally {
      setIsSearching(false);
    }
  }, [allData]); // 只依赖allData

  // 搜索词变化时触发搜索
  useEffect(() => {
    const timeoutId = setTimeout(async () => {
      if (searchTerm && searchTerm.trim()) {
        const trimmedTerm = searchTerm.trim();

        // 只有当搜索词真正变化时才进行外部API搜索
        if (trimmedTerm !== lastSearchTerm) {
          setHasSearched(true);
          setIsSearching(true);
          setSearchError(null);
          setLastSearchTerm(trimmedTerm);

          try {
            // 首先尝试外部API搜索
            const response = await searchApiRef.current(trimmedTerm);
            if (response.success && response.data) {
              setSearchResults(response.data);
            } else {
              // 如果外部API失败，使用本地过滤
              if (allData && Array.isArray(allData)) {
                const filtered = allData.filter(item => filterFunctionRef.current(item, trimmedTerm));
                setSearchResults(filtered);
              } else {
                setSearchResults([]);
              }
            }
          } catch (error) {
            setSearchError(error.message);
            // 发生错误时，尝试本地过滤作为备选
            if (allData && Array.isArray(allData)) {
              const filtered = allData.filter(item => filterFunctionRef.current(item, trimmedTerm));
              setSearchResults(filtered);
            } else {
              setSearchResults([]);
            }
          } finally {
            setIsSearching(false);
          }
        } else if (allData && Array.isArray(allData) && searchResults.length === 0) {
          // 如果搜索词没变但allData更新了，且当前没有搜索结果，尝试本地过滤
          const filtered = allData.filter(item => filterFunctionRef.current(item, trimmedTerm));
          if (filtered.length > 0) {
            setSearchResults(filtered);
          }
        }
      } else {
        setSearchResults([]);
        setSearchError(null);
        setIsSearching(false);
        setHasSearched(false);
        setLastSearchTerm('');
      }
    }, 500); // 增加防抖时间到500ms

    return () => clearTimeout(timeoutId);
  }, [searchTerm, allData, lastSearchTerm, searchResults.length]);

  const clearSearch = useCallback(() => {
    setSearchTerm('');
    setSearchResults([]);
    setSearchError(null);
    setIsSearching(false);
    setHasSearched(false);
    setLastSearchTerm('');
  }, []);

  // 决定显示哪些数据 - 修复逻辑避免状态跳转
  const hasSearchTerm = searchTerm && searchTerm.trim();
  const displayData = hasSearchTerm ? searchResults : allData;
  // 只有在没有搜索时才显示allDataLoading状态
  const isLoading = hasSearchTerm ? isSearching : (allDataLoading && !hasSearched);
  const error = searchError || allDataError;

  return {
    data: displayData,
    loading: isLoading,
    error,
    searchTerm,
    setSearchTerm,
    clearSearch,
    refetch: refetchAll,
    isSearching,
    searchResults,
    allData,
    hasSearched
  };
};
