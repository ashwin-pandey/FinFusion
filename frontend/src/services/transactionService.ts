import api from './api';
import { Transaction, TransactionFilters, ApiResponse, PaginatedResponse } from '../types';

export interface CreateTransactionData {
  amount: number;
  type: 'INCOME' | 'EXPENSE' | 'TRANSFER';
  categoryId: string;
  accountId?: string;
  toAccountId?: string;
  date: string;
  description?: string;
  paymentMethod?: 'CASH' | 'CARD' | 'BANK_TRANSFER' | 'DIGITAL_WALLET' | 'OTHER';
  isRecurring?: boolean;
  recurringFrequency?: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'QUARTERLY' | 'YEARLY';
}

export interface UpdateTransactionData {
  amount?: number;
  type?: 'INCOME' | 'EXPENSE' | 'TRANSFER';
  categoryId?: string;
  accountId?: string;
  toAccountId?: string;
  date?: string;
  description?: string;
  paymentMethod?: 'CASH' | 'CARD' | 'BANK_TRANSFER' | 'DIGITAL_WALLET' | 'OTHER';
  isRecurring?: boolean;
  recurringFrequency?: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'QUARTERLY' | 'YEARLY';
}

class TransactionService {
  // Get all transactions with filters
  async getTransactions(filters?: TransactionFilters): Promise<PaginatedResponse<Transaction>> {
    const response = await api.get<PaginatedResponse<Transaction>>('/transactions', {
      params: filters
    });
    return response.data;
  }

  // Get single transaction
  async getTransactionById(id: string): Promise<Transaction> {
    const response = await api.get<ApiResponse<Transaction>>(`/transactions/${id}`);
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.error || 'Failed to get transaction');
  }

  // Create transaction
  async createTransaction(data: CreateTransactionData): Promise<Transaction> {
    const response = await api.post<ApiResponse<Transaction>>('/transactions', data);
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.error || 'Failed to create transaction');
  }

  // Update transaction
  async updateTransaction(id: string, data: UpdateTransactionData): Promise<Transaction> {
    const response = await api.put<ApiResponse<Transaction>>(`/transactions/${id}`, data);
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.error || 'Failed to update transaction');
  }

  // Delete transaction
  async deleteTransaction(id: string): Promise<void> {
    const response = await api.delete<ApiResponse<void>>(`/transactions/${id}`);
    if (!response.data.success) {
      throw new Error(response.data.error || 'Failed to delete transaction');
    }
  }

  // Import transactions from CSV
  async importTransactions(file: File): Promise<{ imported: number; failed: number }> {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await api.post<ApiResponse<{ imported: number; failed: number }>>(
      '/transactions/import',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      }
    );
    
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.error || 'Failed to import transactions');
  }

  // Export transactions to CSV
  async exportTransactions(filters?: TransactionFilters): Promise<Blob> {
    const response = await api.get('/transactions/export', {
      params: filters,
      responseType: 'blob'
    });
    return response.data;
  }
}

export default new TransactionService();



