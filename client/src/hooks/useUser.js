// 用户相关的自定义 Hook

import { useState, useEffect } from 'react';
import { userApi } from '../api';

export function useUser(userId) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    const fetchUser = async () => {
      try {
        setLoading(true);
        setError(null);
        const userData = await userApi.getUser(userId);
        setUser(userData);
      } catch (err) {
        setError(err.message);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [userId]);

  const updateUserBalance = async (newBalance) => {
    try {
      const updatedUser = await userApi.updateUserBalance(userId, newBalance);
      setUser(updatedUser);
      return updatedUser;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const createUser = async (userData) => {
    try {
      setLoading(true);
      setError(null);
      const newUser = await userApi.createUser(userData);
      setUser(newUser);
      return newUser;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    user,
    loading,
    error,
    updateUserBalance,
    createUser,
    refetch: () => fetchUser()
  };
}
