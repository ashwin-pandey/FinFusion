import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import transactionService, { CreateTransactionData, UpdateTransactionData } from '../../services/transactionService';
import { Transaction, TransactionFilters, PaginatedResponse } from '../../types';

interface TransactionState {
  transactions: Transaction[];
  selectedTransaction: Transaction | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
  filters: TransactionFilters;
  isLoading: boolean;
  error: string | null;
}

const initialState: TransactionState = {
  transactions: [],
  selectedTransaction: null,
  pagination: {
    page: 1,
    limit: 20,
    total: 0,
    pages: 0,
  },
  filters: {
    page: 1,
    limit: 20,
  },
  isLoading: false,
  error: null,
};

// Async thunks
export const fetchTransactions = createAsyncThunk(
  'transactions/fetchAll',
  async (filters: TransactionFilters | undefined, { rejectWithValue }) => {
    try {
      const response = await transactionService.getTransactions(filters);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch transactions');
    }
  }
);

export const fetchTransactionById = createAsyncThunk(
  'transactions/fetchById',
  async (id: string, { rejectWithValue }) => {
    try {
      const transaction = await transactionService.getTransactionById(id);
      return transaction;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch transaction');
    }
  }
);

export const createTransaction = createAsyncThunk(
  'transactions/create',
  async (data: CreateTransactionData, { rejectWithValue }) => {
    try {
      const transaction = await transactionService.createTransaction(data);
      return transaction;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to create transaction');
    }
  }
);

export const updateTransaction = createAsyncThunk(
  'transactions/update',
  async ({ id, data }: { id: string; data: UpdateTransactionData }, { rejectWithValue }) => {
    try {
      const transaction = await transactionService.updateTransaction(id, data);
      return transaction;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to update transaction');
    }
  }
);

export const deleteTransaction = createAsyncThunk(
  'transactions/delete',
  async (id: string, { rejectWithValue }) => {
    try {
      await transactionService.deleteTransaction(id);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to delete transaction');
    }
  }
);

// Slice
const transactionSlice = createSlice({
  name: 'transactions',
  initialState,
  reducers: {
    setFilters: (state, action: PayloadAction<TransactionFilters>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = { page: 1, limit: 20 };
    },
    clearError: (state) => {
      state.error = null;
    },
    setSelectedTransaction: (state, action: PayloadAction<Transaction | null>) => {
      state.selectedTransaction = action.payload;
    },
  },
  extraReducers: (builder) => {
    // Fetch transactions
    builder
      .addCase(fetchTransactions.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchTransactions.fulfilled, (state, action) => {
        state.isLoading = false;
        state.transactions = action.payload.data;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchTransactions.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Fetch single transaction
    builder
      .addCase(fetchTransactionById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchTransactionById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.selectedTransaction = action.payload;
      })
      .addCase(fetchTransactionById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Create transaction
    builder
      .addCase(createTransaction.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createTransaction.fulfilled, (state, action) => {
        state.isLoading = false;
        state.transactions.unshift(action.payload);
        state.pagination.total += 1;
      })
      .addCase(createTransaction.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Update transaction
    builder
      .addCase(updateTransaction.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateTransaction.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.transactions.findIndex((t) => t.id === action.payload.id);
        if (index !== -1) {
          state.transactions[index] = action.payload;
        }
        if (state.selectedTransaction?.id === action.payload.id) {
          state.selectedTransaction = action.payload;
        }
      })
      .addCase(updateTransaction.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Delete transaction
    builder
      .addCase(deleteTransaction.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteTransaction.fulfilled, (state, action) => {
        state.isLoading = false;
        state.transactions = state.transactions.filter((t) => t.id !== action.payload);
        state.pagination.total -= 1;
        if (state.selectedTransaction?.id === action.payload) {
          state.selectedTransaction = null;
        }
      })
      .addCase(deleteTransaction.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { setFilters, clearFilters, clearError, setSelectedTransaction } = transactionSlice.actions;
export default transactionSlice.reducer;

