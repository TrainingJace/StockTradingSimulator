// 投资组合相关的自定义 Hook

import { useState, useEffect, useCallback } from 'react';
import { portfolioApi } from '../api';

export function usePortfolio(userId) {
  const [portfolio, setPortfolio] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchPortfolio = useCallback(async () => {
    if (!userId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const portfolioData = await portfolioApi.getPortfolio(userId);
      setPortfolio(portfolioData);
    } catch (err) {
      setError(err.message);
      setPortfolio(null);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchPortfolio();
  }, [fetchPortfolio]);

  const executeTrade = async (tradeData) => {
    try {
      const transaction = await portfolioApi.executeTrade(userId, tradeData);
      // 重新获取投资组合数据
      await fetchPortfolio();
      return transaction;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const updatePortfolioValues = async (stockPrices) => {
    try {
      const updatedPortfolio = await portfolioApi.updatePortfolioValues(userId, stockPrices);
      setPortfolio(updatedPortfolio);
      return updatedPortfolio;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  return {
    portfolio,
    loading,
    error,
    executeTrade,
    updatePortfolioValues,
    refetch: fetchPortfolio
  };
}

export function useTransactionHistory(userId, limit = 50) {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    const fetchTransactions = async () => {
      try {
        setLoading(true);
        setError(null);
        const transactionData = await portfolioApi.getTransactionHistory(userId, limit);
        setTransactions(transactionData);
      } catch (err) {
        setError(err.message);
        setTransactions([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, [userId, limit]);

  return {
    transactions,
    loading,
    error
  };
}

export function usePortfolioStats(userId, period = '1M') {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    const fetchStats = async () => {
      try {
        setLoading(true);
        setError(null);
        const statsData = await portfolioApi.getPortfolioStats(userId, period);
        setStats(statsData);
      } catch (err) {
        setError(err.message);
        setStats(null);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [userId, period]);

  return {
    stats,
    loading,
    error
  };
}

// 交易执行 Hook
export function useTrade() {
  const [isExecuting, setIsExecuting] = useState(false);
  const [error, setError] = useState(null);

  const executeTrade = async (userId, tradeData) => {
    try {
      setIsExecuting(true);
      setError(null);
      
      const transaction = await portfolioApi.executeTrade(userId, tradeData);
      return transaction;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setIsExecuting(false);
    }
  };

  const clearError = () => setError(null);

  return {
    executeTrade,
    isExecuting,
    error,
    clearError
  };
}
