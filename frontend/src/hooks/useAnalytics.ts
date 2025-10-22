import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../store';
import {
  fetchDashboardOverview,
  fetchSpendingTrends,
  fetchCategoryBreakdown,
  clearError,
} from '../store/slices/analyticsSlice';

export const useAnalytics = (autoFetch: boolean = true) => {
  const dispatch = useAppDispatch();
  const { dashboard, spendingTrends, incomeBreakdown, expenseBreakdown, isLoading, error } = useAppSelector(
    (state) => state.analytics || {}
  ) as any;

  useEffect(() => {
    if (autoFetch) {
      dispatch(fetchDashboardOverview({}));
    }
  }, [dispatch, autoFetch]);

  const handleFetchDashboard = (startDate?: string, endDate?: string) => {
    return dispatch(fetchDashboardOverview({ startDate, endDate })).unwrap();
  };

  const handleFetchTrends = (startDate: string, endDate: string, groupBy?: 'day' | 'week' | 'month') => {
    return dispatch(fetchSpendingTrends({ startDate, endDate, groupBy })).unwrap();
  };

  const handleFetchBreakdown = (type: 'INCOME' | 'EXPENSE', startDate?: string, endDate?: string) => {
    return dispatch(fetchCategoryBreakdown({ type, startDate, endDate })).unwrap();
  };

  const handleClearError = () => {
    dispatch(clearError());
  };

  return {
    dashboard,
    spendingTrends,
    incomeBreakdown,
    expenseBreakdown,
    isLoading,
    error,
    fetchDashboard: handleFetchDashboard,
    fetchTrends: handleFetchTrends,
    fetchBreakdown: handleFetchBreakdown,
    clearError: handleClearError,
  };
};

