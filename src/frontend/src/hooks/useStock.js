// 股票相关的自定义 Hook

import { useState, useEffect, useCallback } from 'react';
import { stockApi } from '../api';

export function useStock(symbol) {
  const [stock, setStock] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchStock = useCallback(async () => {
    if (!symbol) return;

    try {
      setLoading(true);
      setError(null);
      const stockData = await stockApi.getStock(symbol);
      setStock(stockData);
    } catch (err) {
      setError(err.message);
      setStock(null);
    } finally {
      setLoading(false);
    }
  }, [symbol]);

  useEffect(() => {
    fetchStock();
  }, [fetchStock]);

  return {
    stock,
    loading,
    error,
    refetch: fetchStock
  };
}

export function useStockSearch() {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const search = useCallback(async (query) => {
    if (!query || query.length < 1) {
      setResults([]);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const searchResults = await stockApi.searchStocks(query);
      setResults(searchResults);
    } catch (err) {
      setError(err.message);
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const clearResults = useCallback(() => {
    setResults([]);
    setError(null);
  }, []);

  return {
    results,
    loading,
    error,
    search,
    clearResults
  };
}

export function useHistoricalData(symbol, startDate, endDate) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!symbol || !startDate || !endDate) {
      setData([]);
      return;
    }

    const fetchHistoricalData = async () => {
      try {
        setLoading(true);
        setError(null);
        const historicalData = await stockApi.getHistoricalData(symbol, startDate, endDate);
        setData(historicalData);
      } catch (err) {
        setError(err.message);
        setData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchHistoricalData();
  }, [symbol, startDate, endDate]);

  return {
    data,
    loading,
    error
  };
}

export function useMarketStatus() {
  const [marketStatus, setMarketStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMarketStatus = async () => {
      try {
        setLoading(true);
        setError(null);
        const status = await stockApi.getMarketStatus();
        setMarketStatus(status);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchMarketStatus();
  }, []);

  return {
    marketStatus,
    loading,
    error
  };
}
