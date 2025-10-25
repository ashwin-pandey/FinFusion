import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import analyticsService from '../../services/analyticsService';
import { DashboardOverview, SpendingTrend, CategoryBreakdown } from '../../types';

interface AnalyticsState {
  dashboard: DashboardOverview | null;
  spendingTrends: SpendingTrend[];
  incomeBreakdown: CategoryBreakdown[];
  expenseBreakdown: CategoryBreakdown[];
  isLoading: boolean;
  error: string | null;
}

const initialState: AnalyticsState = {
  dashboard: null,
  spendingTrends: [],
  incomeBreakdown: [],
  expenseBreakdown: [],
  isLoading: false,
  error: null,
};

// Async thunks
export const fetchDashboardOverview = createAsyncThunk(
  'analytics/fetchDashboard',
  async ({ startDate, endDate }: { startDate?: string; endDate?: string }, { rejectWithValue }) => {
    try {
      const dashboard = await analyticsService.getDashboardOverview(startDate, endDate);
      return dashboard;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch dashboard');
    }
  }
);

export const fetchSpendingTrends = createAsyncThunk(
  'analytics/fetchTrends',
  async (
    { startDate, endDate, groupBy }: { startDate?: string; endDate?: string; groupBy?: 'day' | 'week' | 'month' | 'quarter' | 'year' },
    { rejectWithValue }
  ) => {
    try {
      const trends = await analyticsService.getSpendingTrends(startDate, endDate, groupBy);
      return trends;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch trends');
    }
  }
);

export const fetchCategoryBreakdown = createAsyncThunk(
  'analytics/fetchBreakdown',
  async (
    { type, startDate, endDate }: { type: 'INCOME' | 'EXPENSE'; startDate?: string; endDate?: string },
    { rejectWithValue }
  ) => {
    try {
      const breakdown = await analyticsService.getCategoryBreakdown(type, startDate, endDate);
      return { type, breakdown };
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch breakdown');
    }
  }
);

// Slice
const analyticsSlice = createSlice({
  name: 'analytics',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch dashboard
    builder
      .addCase(fetchDashboardOverview.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchDashboardOverview.fulfilled, (state, action) => {
        state.isLoading = false;
        state.dashboard = action.payload;
      })
      .addCase(fetchDashboardOverview.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Fetch spending trends
    builder
      .addCase(fetchSpendingTrends.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchSpendingTrends.fulfilled, (state, action) => {
        state.isLoading = false;
        state.spendingTrends = action.payload;
      })
      .addCase(fetchSpendingTrends.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Fetch category breakdown
    builder
      .addCase(fetchCategoryBreakdown.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchCategoryBreakdown.fulfilled, (state, action) => {
        state.isLoading = false;
        if (action.payload.type === 'INCOME') {
          state.incomeBreakdown = action.payload.breakdown;
        } else {
          state.expenseBreakdown = action.payload.breakdown;
        }
      })
      .addCase(fetchCategoryBreakdown.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError } = analyticsSlice.actions;
export default analyticsSlice.reducer;



