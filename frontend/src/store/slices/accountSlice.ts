import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import accountService, { Account, CreateAccountData, UpdateAccountData, AccountFilters, AccountSummary } from '../../services/accountService';

interface AccountState {
  accounts: Account[];
  selectedAccount: Account | null;
  summary: AccountSummary | null;
  isLoading: boolean;
  error: string | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

const initialState: AccountState = {
  accounts: [],
  selectedAccount: null,
  summary: null,
  isLoading: false,
  error: null,
  pagination: {
    page: 1,
    limit: 20,
    total: 0,
    pages: 0
  }
};

// Async thunks
export const fetchAccounts = createAsyncThunk(
  'accounts/fetchAccounts',
  async (filters: AccountFilters = {}, { rejectWithValue }) => {
    try {
      const result = await accountService.getAccounts(filters);
      return result;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch accounts');
    }
  }
);

export const fetchAccount = createAsyncThunk(
  'accounts/fetchAccount',
  async (id: string, { rejectWithValue }) => {
    try {
      const account = await accountService.getAccount(id);
      return account;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch account');
    }
  }
);

export const createAccount = createAsyncThunk(
  'accounts/createAccount',
  async (data: CreateAccountData, { rejectWithValue }) => {
    try {
      const account = await accountService.createAccount(data);
      return account;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to create account');
    }
  }
);

export const updateAccount = createAsyncThunk(
  'accounts/updateAccount',
  async ({ id, data }: { id: string; data: UpdateAccountData }, { rejectWithValue }) => {
    try {
      const account = await accountService.updateAccount(id, data);
      return account;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to update account');
    }
  }
);

export const deleteAccount = createAsyncThunk(
  'accounts/deleteAccount',
  async (id: string, { rejectWithValue }) => {
    try {
      await accountService.deleteAccount(id);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to delete account');
    }
  }
);

export const fetchAccountSummary = createAsyncThunk(
  'accounts/fetchAccountSummary',
  async (_, { rejectWithValue }) => {
    try {
      const summary = await accountService.getAccountSummary();
      return summary;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch account summary');
    }
  }
);

export const fetchAccountsByType = createAsyncThunk(
  'accounts/fetchAccountsByType',
  async (type: string, { rejectWithValue }) => {
    try {
      const accounts = await accountService.getAccountsByType(type);
      return accounts;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch accounts by type');
    }
  }
);

const accountSlice = createSlice({
  name: 'accounts',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setSelectedAccount: (state, action) => {
      state.selectedAccount = action.payload;
    },
    clearSelectedAccount: (state) => {
      state.selectedAccount = null;
    }
  },
  extraReducers: (builder) => {
    // Fetch accounts
    builder
      .addCase(fetchAccounts.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAccounts.fulfilled, (state, action) => {
        state.isLoading = false;
        state.accounts = action.payload.accounts;
        state.pagination = action.payload.pagination;
        state.error = null;
      })
      .addCase(fetchAccounts.rejected, (state, action) => {
        state.isLoading = false;
        state.accounts = []; // Reset to empty array on error
        state.error = action.payload as string;
      });

    // Fetch single account
    builder
      .addCase(fetchAccount.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAccount.fulfilled, (state, action) => {
        state.isLoading = false;
        state.selectedAccount = action.payload;
        state.error = null;
      })
      .addCase(fetchAccount.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Create account
    builder
      .addCase(createAccount.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createAccount.fulfilled, (state, action) => {
        state.isLoading = false;
        state.accounts.unshift(action.payload);
        state.error = null;
      })
      .addCase(createAccount.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Update account
    builder
      .addCase(updateAccount.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateAccount.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.accounts.findIndex(account => account.id === action.payload.id);
        if (index !== -1) {
          state.accounts[index] = action.payload;
        }
        if (state.selectedAccount && state.selectedAccount.id === action.payload.id) {
          state.selectedAccount = action.payload;
        }
        state.error = null;
      })
      .addCase(updateAccount.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Delete account
    builder
      .addCase(deleteAccount.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteAccount.fulfilled, (state, action) => {
        state.isLoading = false;
        state.accounts = state.accounts.filter(account => account.id !== action.payload);
        if (state.selectedAccount && state.selectedAccount.id === action.payload) {
          state.selectedAccount = null;
        }
        state.error = null;
      })
      .addCase(deleteAccount.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Fetch account summary
    builder
      .addCase(fetchAccountSummary.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAccountSummary.fulfilled, (state, action) => {
        state.isLoading = false;
        state.summary = action.payload;
        state.error = null;
      })
      .addCase(fetchAccountSummary.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Fetch accounts by type
    builder
      .addCase(fetchAccountsByType.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAccountsByType.fulfilled, (state, action) => {
        state.isLoading = false;
        state.accounts = action.payload;
        state.error = null;
      })
      .addCase(fetchAccountsByType.rejected, (state, action) => {
        state.isLoading = false;
        state.accounts = []; // Reset to empty array on error
        state.error = action.payload as string;
      });
  }
});

export const { clearError, setSelectedAccount, clearSelectedAccount } = accountSlice.actions;
export default accountSlice.reducer;
