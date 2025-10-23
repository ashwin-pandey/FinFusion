import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../store';
import {
  fetchCategories,
  fetchCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
  clearError,
} from '../store/slices/categorySlice';
import { CreateCategoryData, UpdateCategoryData } from '../services/categoryService';

export const useCategories = (type?: 'INCOME' | 'EXPENSE', autoFetch: boolean = true) => {
  const dispatch = useAppDispatch();
  const { categories, incomeCategories, expenseCategories, selectedCategory, isLoading, error } = useAppSelector(
    (state) => state.categories
  );

  useEffect(() => {
    if (autoFetch) {
      dispatch(fetchCategories(type));
    }
  }, [dispatch, type, autoFetch]);

  const handleFetchCategories = (categoryType?: 'INCOME' | 'EXPENSE') => {
    return dispatch(fetchCategories(categoryType)).unwrap();
  };

  const handleFetchCategoryById = (id: string) => {
    return dispatch(fetchCategoryById(id)).unwrap();
  };

  const handleCreateCategory = (data: CreateCategoryData) => {
    return dispatch(createCategory(data)).unwrap();
  };

  const handleUpdateCategory = (id: string, data: UpdateCategoryData) => {
    return dispatch(updateCategory({ id, data })).unwrap();
  };

  const handleDeleteCategory = (id: string) => {
    return dispatch(deleteCategory(id)).unwrap();
  };

  const handleClearError = () => {
    dispatch(clearError());
  };

  return {
    categories: type === 'INCOME' ? incomeCategories : type === 'EXPENSE' ? expenseCategories : categories,
    incomeCategories,
    expenseCategories,
    selectedCategory,
    isLoading,
    error,
    fetchCategories: handleFetchCategories,
    fetchCategoryById: handleFetchCategoryById,
    createCategory: handleCreateCategory,
    updateCategory: handleUpdateCategory,
    deleteCategory: handleDeleteCategory,
    clearError: handleClearError,
  };
};



