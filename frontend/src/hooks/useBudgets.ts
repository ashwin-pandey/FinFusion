import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../store';
import {
  fetchBudgets,
  fetchBudgetById,
  createBudget,
  updateBudget,
  deleteBudget,
  fetchBudgetAlerts,
  acknowledgeBudgetAlert,
  fetchBudgetRecommendations,
  clearError,
} from '../store/slices/budgetSlice';
import { CreateBudgetData, UpdateBudgetData } from '../services/budgetService';

export const useBudgets = (active?: boolean, autoFetch: boolean = true) => {
  const dispatch = useAppDispatch();
  const { budgets, selectedBudget, alerts, recommendations, isLoading, error } = useAppSelector(
    (state) => state.budgets || {}
  ) as any;

  useEffect(() => {
    if (autoFetch) {
      dispatch(fetchBudgets(active));
    }
  }, [dispatch, active, autoFetch]);

  const handleFetchBudgets = (isActive?: boolean) => {
    return dispatch(fetchBudgets(isActive)).unwrap();
  };

  const handleFetchBudgetById = (id: string) => {
    return dispatch(fetchBudgetById(id)).unwrap();
  };

  const handleCreateBudget = (data: CreateBudgetData) => {
    return dispatch(createBudget(data)).unwrap();
  };

  const handleUpdateBudget = (id: string, data: UpdateBudgetData) => {
    return dispatch(updateBudget({ id, data })).unwrap();
  };

  const handleDeleteBudget = (id: string) => {
    return dispatch(deleteBudget(id)).unwrap();
  };

  const handleFetchAlerts = () => {
    return dispatch(fetchBudgetAlerts()).unwrap();
  };

  const handleAcknowledgeAlert = (alertId: string) => {
    return dispatch(acknowledgeBudgetAlert(alertId)).unwrap();
  };

  const handleFetchRecommendations = () => {
    return dispatch(fetchBudgetRecommendations()).unwrap();
  };

  const handleClearError = () => {
    dispatch(clearError());
  };

  return {
    budgets,
    selectedBudget,
    alerts,
    recommendations,
    isLoading,
    error,
    fetchBudgets: handleFetchBudgets,
    fetchBudgetById: handleFetchBudgetById,
    createBudget: handleCreateBudget,
    updateBudget: handleUpdateBudget,
    deleteBudget: handleDeleteBudget,
    fetchAlerts: handleFetchAlerts,
    acknowledgeAlert: handleAcknowledgeAlert,
    fetchRecommendations: handleFetchRecommendations,
    clearError: handleClearError,
  };
};

