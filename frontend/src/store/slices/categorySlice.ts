import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import categoryService, { CreateCategoryData, UpdateCategoryData } from '../../services/categoryService';
import { Category } from '../../types';

interface CategoryState {
  categories: Category[];
  incomeCategories: Category[];
  expenseCategories: Category[];
  selectedCategory: Category | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: CategoryState = {
  categories: [],
  incomeCategories: [],
  expenseCategories: [],
  selectedCategory: null,
  isLoading: false,
  error: null,
};

// Async thunks
export const fetchCategories = createAsyncThunk(
  'categories/fetchAll',
  async (type: 'INCOME' | 'EXPENSE' | undefined, { rejectWithValue }) => {
    try {
      const categories = await categoryService.getCategories(type);
      return { categories, type };
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch categories');
    }
  }
);

export const fetchCategoryById = createAsyncThunk(
  'categories/fetchById',
  async (id: string, { rejectWithValue }) => {
    try {
      const category = await categoryService.getCategoryById(id);
      return category;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch category');
    }
  }
);

export const createCategory = createAsyncThunk(
  'categories/create',
  async (data: CreateCategoryData, { rejectWithValue }) => {
    try {
      const category = await categoryService.createCategory(data);
      return category;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to create category');
    }
  }
);

export const updateCategory = createAsyncThunk(
  'categories/update',
  async ({ id, data }: { id: string; data: UpdateCategoryData }, { rejectWithValue }) => {
    try {
      const category = await categoryService.updateCategory(id, data);
      return category;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to update category');
    }
  }
);

export const deleteCategory = createAsyncThunk(
  'categories/delete',
  async (id: string, { rejectWithValue }) => {
    try {
      await categoryService.deleteCategory(id);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to delete category');
    }
  }
);

// Slice
const categorySlice = createSlice({
  name: 'categories',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setSelectedCategory: (state, action: PayloadAction<Category | null>) => {
      state.selectedCategory = action.payload;
    },
  },
  extraReducers: (builder) => {
    // Fetch categories
    builder
      .addCase(fetchCategories.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.isLoading = false;
        const { categories, type } = action.payload;
        
        if (type === 'INCOME') {
          state.incomeCategories = categories;
        } else if (type === 'EXPENSE') {
          state.expenseCategories = categories;
        } else {
          state.categories = categories;
          state.incomeCategories = categories.filter((c) => c.type === 'INCOME');
          state.expenseCategories = categories.filter((c) => c.type === 'EXPENSE');
        }
      })
      .addCase(fetchCategories.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Fetch single category
    builder
      .addCase(fetchCategoryById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchCategoryById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.selectedCategory = action.payload;
      })
      .addCase(fetchCategoryById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Create category
    builder
      .addCase(createCategory.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createCategory.fulfilled, (state, action) => {
        state.isLoading = false;
        state.categories.push(action.payload);
        if (action.payload.type === 'INCOME') {
          state.incomeCategories.push(action.payload);
        } else {
          state.expenseCategories.push(action.payload);
        }
      })
      .addCase(createCategory.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Update category
    builder
      .addCase(updateCategory.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateCategory.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.categories.findIndex((c) => c.id === action.payload.id);
        if (index !== -1) {
          state.categories[index] = action.payload;
        }
        
        const incomeIndex = state.incomeCategories.findIndex((c) => c.id === action.payload.id);
        if (incomeIndex !== -1) {
          state.incomeCategories[incomeIndex] = action.payload;
        }
        
        const expenseIndex = state.expenseCategories.findIndex((c) => c.id === action.payload.id);
        if (expenseIndex !== -1) {
          state.expenseCategories[expenseIndex] = action.payload;
        }
        
        if (state.selectedCategory?.id === action.payload.id) {
          state.selectedCategory = action.payload;
        }
      })
      .addCase(updateCategory.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Delete category
    builder
      .addCase(deleteCategory.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteCategory.fulfilled, (state, action) => {
        state.isLoading = false;
        state.categories = state.categories.filter((c) => c.id !== action.payload);
        state.incomeCategories = state.incomeCategories.filter((c) => c.id !== action.payload);
        state.expenseCategories = state.expenseCategories.filter((c) => c.id !== action.payload);
        if (state.selectedCategory?.id === action.payload) {
          state.selectedCategory = null;
        }
      })
      .addCase(deleteCategory.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError, setSelectedCategory } = categorySlice.actions;
export default categorySlice.reducer;

