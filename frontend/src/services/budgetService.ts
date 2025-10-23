import api from './api';
import { Budget, BudgetAlert, ApiResponse } from '../types';

export interface CreateBudgetData {
  categoryId: string;
  amount: number;
  periodType: 'MONTHLY' | 'QUARTERLY' | 'YEARLY';
  startDate: string;
  endDate: string;
  alertThreshold?: number;
  allowRollover?: boolean;
}

export interface UpdateBudgetData extends Partial<CreateBudgetData> {}

export interface BudgetRecommendation {
  categoryId: string;
  categoryName: string;
  recommendedAmount: number;
  basedOn: string;
  confidence: number;
}

class BudgetService {
  // Get all budgets
  async getBudgets(active?: boolean): Promise<Budget[]> {
    const response = await api.get<ApiResponse<Budget[]>>('/budgets', {
      params: active !== undefined ? { active } : {}
    });
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.error || 'Failed to get budgets');
  }

  // Get single budget
  async getBudgetById(id: string): Promise<Budget> {
    const response = await api.get<ApiResponse<Budget>>(`/budgets/${id}`);
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.error || 'Failed to get budget');
  }

  // Create budget
  async createBudget(data: CreateBudgetData): Promise<Budget> {
    const response = await api.post<ApiResponse<Budget>>('/budgets', data);
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.error || 'Failed to create budget');
  }

  // Update budget
  async updateBudget(id: string, data: UpdateBudgetData): Promise<Budget> {
    const response = await api.put<ApiResponse<Budget>>(`/budgets/${id}`, data);
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.error || 'Failed to update budget');
  }

  // Delete budget
  async deleteBudget(id: string): Promise<void> {
    const response = await api.delete<ApiResponse<void>>(`/budgets/${id}`);
    if (!response.data.success) {
      throw new Error(response.data.error || 'Failed to delete budget');
    }
  }

  // Get budget alerts
  async getBudgetAlerts(): Promise<BudgetAlert[]> {
    // For now, return empty array since we need a budgetId for the endpoint
    // TODO: Implement proper alerts fetching when we have budget-specific alerts
    return [];
  }

  // Acknowledge budget alert
  async acknowledgeBudgetAlert(alertId: string): Promise<void> {
    const response = await api.put<ApiResponse<void>>(`/budgets/alerts/${alertId}/acknowledge`);
    if (!response.data.success) {
      throw new Error(response.data.error || 'Failed to acknowledge alert');
    }
  }

  // Get budget recommendations
  async getBudgetRecommendations(): Promise<BudgetRecommendation[]> {
    const response = await api.get<ApiResponse<BudgetRecommendation[]>>('/budgets/recommendations');
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.error || 'Failed to get recommendations');
  }
}

export default new BudgetService();



