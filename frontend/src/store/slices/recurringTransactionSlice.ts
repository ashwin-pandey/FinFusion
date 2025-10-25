import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { RecurringTransaction, CreateRecurringTransactionData } from '../../hooks/useRecurringTransactions';
import { API_ENDPOINTS } from '../../config/api';

interface RecurringTransactionState {
  recurringTransactions: RecurringTransaction[];
  isLoading: boolean;
  error: string | null;
}

const initialState: RecurringTransactionState = {
  recurringTransactions: [],
  isLoading: false,
  error: null
};

// Async thunks
export const fetchRecurringTransactions = createAsyncThunk(
  'recurringTransactions/fetchRecurringTransactions',
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('accessToken');
      console.log('Fetching recurring transactions from:', API_ENDPOINTS.RECURRING_TRANSACTIONS);
      console.log('Auth token:', token ? `${token.substring(0, 20)}...` : 'No token found');
      
      const response = await fetch(API_ENDPOINTS.RECURRING_TRANSACTIONS, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      console.log('Response status:', response.status);
      console.log('Response headers:', response.headers);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.log('Error response:', errorText);
        throw new Error('Failed to fetch recurring transactions');
      }
      
      const data = await response.json();
      console.log('Response data:', data);
      return data.data;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const createRecurringTransaction = createAsyncThunk(
  'recurringTransactions/createRecurringTransaction',
  async (data: CreateRecurringTransactionData, { rejectWithValue }) => {
    try {
      const response = await fetch(API_ENDPOINTS.RECURRING_TRANSACTIONS, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        },
        body: JSON.stringify(data)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create recurring transaction');
      }
      
      const result = await response.json();
      return result.data;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const deleteRecurringTransaction = createAsyncThunk(
  'recurringTransactions/deleteRecurringTransaction',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_ENDPOINTS.RECURRING_TRANSACTIONS}/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete recurring transaction');
      }
      
      return id;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

const recurringTransactionSlice = createSlice({
  name: 'recurringTransactions',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch recurring transactions
      .addCase(fetchRecurringTransactions.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchRecurringTransactions.fulfilled, (state, action) => {
        state.isLoading = false;
        state.recurringTransactions = action.payload;
      })
      .addCase(fetchRecurringTransactions.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Create recurring transaction
      .addCase(createRecurringTransaction.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createRecurringTransaction.fulfilled, (state, action) => {
        state.isLoading = false;
        state.recurringTransactions.push(action.payload);
      })
      .addCase(createRecurringTransaction.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Delete recurring transaction
      .addCase(deleteRecurringTransaction.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteRecurringTransaction.fulfilled, (state, action) => {
        state.isLoading = false;
        state.recurringTransactions = state.recurringTransactions.filter(
          transaction => transaction.id !== action.payload
        );
      })
      .addCase(deleteRecurringTransaction.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  }
});

export const { clearError } = recurringTransactionSlice.actions;
export default recurringTransactionSlice.reducer;
