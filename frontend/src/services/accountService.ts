import api from './api';
import { ApiResponse } from '../types';

export interface Account {
  id: string;
  userId: string;
  name: string;
  type: 'CHECKING' | 'SAVINGS' | 'CREDIT_CARD' | 'CASH' | 'INVESTMENT' | 'LOAN' | 'OTHER';
  balance: number;
  currency: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAccountData {
  name: string;
  type: 'CHECKING' | 'SAVINGS' | 'CREDIT_CARD' | 'CASH' | 'INVESTMENT' | 'LOAN' | 'OTHER';
  balance?: number;
  currency?: string;
}

export interface UpdateAccountData {
  name?: string;
  type?: 'CHECKING' | 'SAVINGS' | 'CREDIT_CARD' | 'CASH' | 'INVESTMENT' | 'LOAN' | 'OTHER';
  balance?: number;
  currency?: string;
  isActive?: boolean;
}

export interface AccountFilters {
  type?: string;
  isActive?: boolean;
  search?: string;
  page?: number;
  limit?: number;
}

export interface AccountSummary {
  totalBalance: number;
  accountsByType: {
    checking: number;
    savings: number;
    creditCard: number;
    cash: number;
    investment: number;
    loan: number;
  };
  balancesByType: {
    checking: number;
    savings: number;
    creditCard: number;
    cash: number;
    investment: number;
    loan: number;
  };
}

class AccountService {
  // Get all accounts
  async getAccounts(filters: AccountFilters = {}): Promise<{ accounts: Account[]; pagination: any }> {
    // Filter out empty values to avoid 400 errors
    const cleanFilters = Object.fromEntries(
      Object.entries(filters).filter(([_, value]) => 
        value !== undefined && value !== null && value !== ''
      )
    );

    const response = await api.get<ApiResponse<{ accounts: Account[]; pagination: any }>>('/accounts', {
      params: cleanFilters
    });
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.error || 'Failed to get accounts');
  }

  // Get single account
  async getAccount(id: string): Promise<Account> {
    const response = await api.get<ApiResponse<Account>>(`/accounts/${id}`);
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.error || 'Failed to get account');
  }

  // Create account
  async createAccount(data: CreateAccountData): Promise<Account> {
    const response = await api.post<ApiResponse<Account>>('/accounts', data);
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.error || 'Failed to create account');
  }

  // Update account
  async updateAccount(id: string, data: UpdateAccountData): Promise<Account> {
    const response = await api.put<ApiResponse<Account>>(`/accounts/${id}`, data);
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.error || 'Failed to update account');
  }

  // Delete account
  async deleteAccount(id: string): Promise<void> {
    const response = await api.delete<ApiResponse<void>>(`/accounts/${id}`);
    if (!response.data.success) {
      throw new Error(response.data.error || 'Failed to delete account');
    }
  }

  // Get account summary
  async getAccountSummary(): Promise<AccountSummary> {
    const response = await api.get<ApiResponse<AccountSummary>>('/accounts/summary/overview');
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.error || 'Failed to get account summary');
  }

  // Get accounts by type
  async getAccountsByType(type: string): Promise<Account[]> {
    const response = await api.get<ApiResponse<Account[]>>(`/accounts/type/${type}`);
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.error || 'Failed to get accounts by type');
  }
}

export default new AccountService();
