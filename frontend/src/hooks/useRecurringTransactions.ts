import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../store';
import {
  fetchRecurringTransactions,
  createRecurringTransaction,
  deleteRecurringTransaction,
  clearError
} from '../store/slices/recurringTransactionSlice';

export interface RecurringTransaction {
  id: string;
  amount: number;
  type: 'INCOME' | 'EXPENSE';
  categoryId: string;
  accountId?: string;
  description: string;
  recurringFrequency: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'QUARTERLY' | 'YEARLY';
  startDate: string;
  endDate?: string;
  paymentMethod?: 'CASH' | 'CARD' | 'BANK_TRANSFER' | 'UPI' | 'OTHER';
  category?: {
    id: string;
    name: string;
    type: 'INCOME' | 'EXPENSE';
    icon?: string;
    color?: string;
  };
  account?: {
    id: string;
    name: string;
    type: string;
    balance: number;
    currency: string;
  };
}

export interface CreateRecurringTransactionData {
  amount: number;
  type: 'INCOME' | 'EXPENSE';
  categoryId: string;
  accountId?: string;
  description: string;
  recurringFrequency: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'QUARTERLY' | 'YEARLY';
  startDate: string;
  endDate?: string;
  paymentMethod?: 'CASH' | 'CARD' | 'BANK_TRANSFER' | 'UPI' | 'OTHER';
}

export const useRecurringTransactions = (autoFetch: boolean = true) => {
  const dispatch = useAppDispatch();
  const { recurringTransactions, isLoading, error } = useAppSelector(
    (state) => state.recurringTransactions || {}
  );

  const fetchRecurringTransactionsData = async () => {
    dispatch(fetchRecurringTransactions());
  };

  const createRecurringTransactionData = async (data: CreateRecurringTransactionData) => {
    try {
      await dispatch(createRecurringTransaction(data)).unwrap();
    } catch (error) {
      throw error;
    }
  };

  const deleteRecurringTransactionData = async (id: string) => {
    try {
      await dispatch(deleteRecurringTransaction(id)).unwrap();
    } catch (error) {
      throw error;
    }
  };

  const clearErrorData = () => {
    dispatch(clearError());
  };

  useEffect(() => {
    if (autoFetch) {
      fetchRecurringTransactionsData();
    }
  }, [autoFetch]);

  return {
    recurringTransactions,
    isLoading,
    error,
    fetchRecurringTransactions: fetchRecurringTransactionsData,
    createRecurringTransaction: createRecurringTransactionData,
    deleteRecurringTransaction: deleteRecurringTransactionData,
    clearError: clearErrorData
  };
};
