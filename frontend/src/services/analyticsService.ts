import api from './api';
import { DashboardOverview, SpendingTrend, CategoryBreakdown, ApiResponse } from '../types';

class AnalyticsService {
  // Get dashboard overview
  async getDashboardOverview(startDate?: string, endDate?: string): Promise<DashboardOverview> {
    const response = await api.get<ApiResponse<DashboardOverview>>('/analytics/dashboard', {
      params: { startDate, endDate }
    });
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.error || 'Failed to get dashboard overview');
  }

  // Get spending trends
  async getSpendingTrends(
    startDate: string,
    endDate: string,
    groupBy: 'day' | 'week' | 'month' = 'month'
  ): Promise<SpendingTrend[]> {
    const response = await api.get<ApiResponse<SpendingTrend[]>>('/analytics/trends', {
      params: { startDate, endDate, groupBy }
    });
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.error || 'Failed to get spending trends');
  }

  // Get category breakdown
  async getCategoryBreakdown(
    type: 'INCOME' | 'EXPENSE',
    startDate?: string,
    endDate?: string
  ): Promise<CategoryBreakdown[]> {
    const response = await api.get<ApiResponse<CategoryBreakdown[]>>('/analytics/categories', {
      params: { type, startDate, endDate }
    });
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.error || 'Failed to get category breakdown');
  }
}

export default new AnalyticsService();

