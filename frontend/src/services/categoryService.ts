import api from './api';
import { Category, ApiResponse } from '../types';

export interface CreateCategoryData {
  name: string;
  type: 'INCOME' | 'EXPENSE';
  icon?: string;
  color?: string;
  parentCategoryId?: string;
}

export interface UpdateCategoryData extends Partial<CreateCategoryData> {}

class CategoryService {
  // Get all categories
  async getCategories(type?: 'INCOME' | 'EXPENSE'): Promise<Category[]> {
    const response = await api.get<ApiResponse<Category[]>>('/categories', {
      params: type ? { type } : {}
    });
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.error || 'Failed to get categories');
  }

  // Get single category
  async getCategoryById(id: string): Promise<Category> {
    const response = await api.get<ApiResponse<Category>>(`/categories/${id}`);
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.error || 'Failed to get category');
  }

  // Create category
  async createCategory(data: CreateCategoryData): Promise<Category> {
    const response = await api.post<ApiResponse<Category>>('/categories', data);
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.error || 'Failed to create category');
  }

  // Update category
  async updateCategory(id: string, data: UpdateCategoryData): Promise<Category> {
    const response = await api.put<ApiResponse<Category>>(`/categories/${id}`, data);
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.error || 'Failed to update category');
  }

  // Delete category
  async deleteCategory(id: string): Promise<void> {
    const response = await api.delete<ApiResponse<void>>(`/categories/${id}`);
    if (!response.data.success) {
      throw new Error(response.data.error || 'Failed to delete category');
    }
  }
}

export default new CategoryService();



