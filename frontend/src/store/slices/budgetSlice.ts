import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import budgetService, { CreateBudgetData, UpdateBudgetData, BudgetRecommendation } from '../../services/budgetService';
import { Budget, BudgetAlert } from '../../types';

interface BudgetState {
  budgets: Budget[];
  selectedBudget: Budget | null;
  alerts: BudgetAlert[];
  recommendations: BudgetRecommendation[];
  isLoading: boolean;
  error: string | null;
}

const initialState: BudgetState = {
  budgets: [],
  selectedBudget: null,
  alerts: [],
  recommendations: [],
  isLoading: false,
  error: null,
};

// Async thunks
export const fetchBudgets = createAsyncThunk(
  'budgets/fetchAll',
  async (active: boolean | undefined, { rejectWithValue }) => {
    try {
      const budgets = await budgetService.getBudgets(active);
      return budgets;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch budgets');
    }
  }
);

export const fetchBudgetById = createAsyncThunk(
  'budgets/fetchById',
  async (id: string, { rejectWithValue }) => {
    try {
      const budget = await budgetService.getBudgetById(id);
      return budget;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch budget');
    }
  }
);

export const createBudget = createAsyncThunk(
  'budgets/create',
  async (data: CreateBudgetData, { rejectWithValue }) => {
    try {
      const budget = await budgetService.createBudget(data);
      return budget;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to create budget');
    }
  }
);

export const updateBudget = createAsyncThunk(
  'budgets/update',
  async ({ id, data }: { id: string; data: UpdateBudgetData }, { rejectWithValue }) => {
    try {
      const budget = await budgetService.updateBudget(id, data);
      return budget;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to update budget');
    }
  }
);

export const deleteBudget = createAsyncThunk(
  'budgets/delete',
  async (id: string, { rejectWithValue }) => {
    try {
      await budgetService.deleteBudget(id);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to delete budget');
    }
  }
);

export const fetchBudgetAlerts = createAsyncThunk(
  'budgets/fetchAlerts',
  async (_, { rejectWithValue }) => {
    try {
      const alerts = await budgetService.getBudgetAlerts();
      return alerts;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch alerts');
    }
  }
);

export const acknowledgeBudgetAlert = createAsyncThunk(
  'budgets/acknowledgeAlert',
  async (alertId: string, { rejectWithValue }) => {
    try {
      await budgetService.acknowledgeBudgetAlert(alertId);
      return alertId;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to acknowledge alert');
    }
  }
);

export const fetchBudgetRecommendations = createAsyncThunk(
  'budgets/fetchRecommendations',
  async (_, { rejectWithValue }) => {
    try {
      const recommendations = await budgetService.getBudgetRecommendations();
      return recommendations;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch recommendations');
    }
  }
);

// Slice
const budgetSlice = createSlice({
  name: 'budgets',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setSelectedBudget: (state, action: PayloadAction<Budget | null>) => {
      state.selectedBudget = action.payload;
    },
  },
  extraReducers: (builder) => {
    // Fetch budgets
    builder
      .addCase(fetchBudgets.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchBudgets.fulfilled, (state, action) => {
        state.isLoading = false;
        state.budgets = action.payload;
      })
      .addCase(fetchBudgets.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Fetch single budget
    builder
      .addCase(fetchBudgetById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchBudgetById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.selectedBudget = action.payload;
      })
      .addCase(fetchBudgetById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Create budget
    builder
      .addCase(createBudget.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createBudget.fulfilled, (state, action) => {
        state.isLoading = false;
        state.budgets.push(action.payload);
      })
      .addCase(createBudget.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Update budget
    builder
      .addCase(updateBudget.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateBudget.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.budgets.findIndex((b) => b.id === action.payload.id);
        if (index !== -1) {
          state.budgets[index] = action.payload;
        }
        if (state.selectedBudget?.id === action.payload.id) {
          state.selectedBudget = action.payload;
        }
      })
      .addCase(updateBudget.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Delete budget
    builder
      .addCase(deleteBudget.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteBudget.fulfilled, (state, action) => {
        state.isLoading = false;
        state.budgets = state.budgets.filter((b) => b.id !== action.payload);
        if (state.selectedBudget?.id === action.payload) {
          state.selectedBudget = null;
        }
      })
      .addCase(deleteBudget.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Fetch alerts
    builder
      .addCase(fetchBudgetAlerts.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchBudgetAlerts.fulfilled, (state, action) => {
        state.isLoading = false;
        state.alerts = action.payload;
      })
      .addCase(fetchBudgetAlerts.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Acknowledge alert
    builder
      .addCase(acknowledgeBudgetAlert.fulfilled, (state, action) => {
        const alert = state.alerts.find((a) => a.id === action.payload);
        if (alert) {
          alert.isAcknowledged = true;
        }
      });

    // Fetch recommendations
    builder
      .addCase(fetchBudgetRecommendations.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchBudgetRecommendations.fulfilled, (state, action) => {
        state.isLoading = false;
        state.recommendations = action.payload;
      })
      .addCase(fetchBudgetRecommendations.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError, setSelectedBudget } = budgetSlice.actions;
export default budgetSlice.reducer;



