import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../store';
import {
  fetchAccounts,
  fetchAccount,
  createAccount,
  updateAccount,
  deleteAccount,
  fetchAccountSummary,
  fetchAccountsByType,
  clearError,
  setSelectedAccount,
  clearSelectedAccount
} from '../store/slices/accountSlice';
import { AccountFilters, CreateAccountData, UpdateAccountData } from '../services/accountService';

export const useAccounts = (autoFetch: boolean = true) => {
  const dispatch = useAppDispatch();
  const { accounts, selectedAccount, summary, isLoading, error, pagination } = useAppSelector(
    (state) => state.accounts || {}
  ) as any;

  // Ensure accounts is always an array
  const safeAccounts = accounts || [];

  useEffect(() => {
    if (autoFetch) {
      dispatch(fetchAccounts({}));
    }
  }, [dispatch, autoFetch]);

  const handleFetchAccounts = (filters: AccountFilters = {}) => {
    return dispatch(fetchAccounts(filters)).unwrap();
  };

  const handleFetchAccount = (id: string) => {
    return dispatch(fetchAccount(id)).unwrap();
  };

  const handleCreateAccount = (data: CreateAccountData) => {
    return dispatch(createAccount(data)).unwrap();
  };

  const handleUpdateAccount = (id: string, data: UpdateAccountData) => {
    return dispatch(updateAccount({ id, data })).unwrap();
  };

  const handleDeleteAccount = (id: string) => {
    return dispatch(deleteAccount(id)).unwrap();
  };

  const handleFetchAccountSummary = () => {
    return dispatch(fetchAccountSummary()).unwrap();
  };

  const handleFetchAccountsByType = (type: string) => {
    return dispatch(fetchAccountsByType(type)).unwrap();
  };

  const handleSetSelectedAccount = (account: any) => {
    dispatch(setSelectedAccount(account));
  };

  const handleClearSelectedAccount = () => {
    dispatch(clearSelectedAccount());
  };

  const handleClearError = () => {
    dispatch(clearError());
  };

  return {
    accounts: safeAccounts,
    selectedAccount,
    summary,
    isLoading,
    error,
    pagination,
    fetchAccounts: handleFetchAccounts,
    fetchAccount: handleFetchAccount,
    createAccount: handleCreateAccount,
    updateAccount: handleUpdateAccount,
    deleteAccount: handleDeleteAccount,
    fetchAccountSummary: handleFetchAccountSummary,
    fetchAccountsByType: handleFetchAccountsByType,
    setSelectedAccount: handleSetSelectedAccount,
    clearSelectedAccount: handleClearSelectedAccount,
    clearError: handleClearError,
  };
};
