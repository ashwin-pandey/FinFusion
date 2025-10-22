import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../store';
import {
  fetchTransactions,
  fetchTransactionById,
  createTransaction,
  updateTransaction,
  deleteTransaction,
  setFilters,
  clearFilters,
  clearError,
} from '../store/slices/transactionSlice';
import { CreateTransactionData, UpdateTransactionData } from '../services/transactionService';
import { TransactionFilters } from '../types';

export const useTransactions = (autoFetch: boolean = true) => {
  const dispatch = useAppDispatch();
  const { transactions, selectedTransaction, pagination, filters, isLoading, error } = useAppSelector(
    (state) => state.transactions || {}
  ) as any;

  useEffect(() => {
    if (autoFetch) {
      dispatch(fetchTransactions(filters));
    }
  }, [dispatch, filters, autoFetch]);

  const handleFetchTransactions = (customFilters?: TransactionFilters) => {
    return dispatch(fetchTransactions(customFilters || filters)).unwrap();
  };

  const handleFetchTransactionById = (id: string) => {
    return dispatch(fetchTransactionById(id)).unwrap();
  };

  const handleCreateTransaction = (data: CreateTransactionData) => {
    return dispatch(createTransaction(data)).unwrap();
  };

  const handleUpdateTransaction = (id: string, data: UpdateTransactionData) => {
    return dispatch(updateTransaction({ id, data })).unwrap();
  };

  const handleDeleteTransaction = (id: string) => {
    return dispatch(deleteTransaction(id)).unwrap();
  };

  const handleSetFilters = (newFilters: TransactionFilters) => {
    dispatch(setFilters(newFilters));
  };

  const handleClearFilters = () => {
    dispatch(clearFilters());
  };

  const handleClearError = () => {
    dispatch(clearError());
  };

  return {
    transactions,
    selectedTransaction,
    pagination,
    filters,
    isLoading,
    error,
    fetchTransactions: handleFetchTransactions,
    fetchTransactionById: handleFetchTransactionById,
    createTransaction: handleCreateTransaction,
    updateTransaction: handleUpdateTransaction,
    deleteTransaction: handleDeleteTransaction,
    setFilters: handleSetFilters,
    clearFilters: handleClearFilters,
    clearError: handleClearError,
  };
};

