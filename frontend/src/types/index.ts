// Auth Types
export interface User {
  id: string;
  email: string;
  name: string;
  profilePicture?: string;
  createdAt: string;
}

export interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

// Category Types
export type CategoryType = 'INCOME' | 'EXPENSE';

export interface Category {
  id: string;
  userId?: string;
  name: string;
  type: CategoryType;
  icon?: string;
  color?: string;
  parentCategoryId?: string;
  isSystem: boolean;
  createdAt: string;
  updatedAt: string;
  parentCategory?: Category;
  subCategories?: Category[];
}

// Transaction Types
export type TransactionType = 'INCOME' | 'EXPENSE';
export type PaymentMethod = 'CASH' | 'CARD' | 'BANK_TRANSFER' | 'DIGITAL_WALLET' | 'OTHER';
export type RecurringFrequency = 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'QUARTERLY' | 'YEARLY';

export interface Transaction {
  id: string;
  userId: string;
  amount: number;
  type: TransactionType;
  categoryId: string;
  accountId?: string;
  date: string;
  description?: string;
  paymentMethod?: PaymentMethod;
  isRecurring: boolean;
  recurringFrequency?: RecurringFrequency;
  createdAt: string;
  updatedAt: string;
  category?: {
    id: string;
    name: string;
    type: CategoryType;
    icon?: string;
    color?: string;
  };
  account?: {
    id: string;
    name: string;
    type: 'CHECKING' | 'SAVINGS' | 'CREDIT_CARD' | 'CASH' | 'INVESTMENT' | 'LOAN' | 'OTHER';
    balance: number;
    currency: string;
  };
}

export interface TransactionFilters {
  page?: number;
  limit?: number;
  type?: TransactionType;
  categoryId?: string;
  startDate?: string;
  endDate?: string;
  search?: string;
}

// Budget Types
export type PeriodType = 'MONTHLY' | 'QUARTERLY' | 'YEARLY';

export interface Budget {
  id: string;
  userId: string;
  categoryId: string;
  amount: number;
  periodType: PeriodType;
  startDate: string;
  endDate: string;
  alertThreshold: number;
  allowRollover: boolean;
  createdAt: string;
  updatedAt: string;
  category?: {
    id: string;
    name: string;
    type: CategoryType;
    icon?: string;
    color?: string;
  };
  spentAmount?: number;
  remainingAmount?: number;
  utilizationPercentage?: number;
}

export interface BudgetAlert {
  id: string;
  budgetId: string;
  thresholdPercentage: number;
  triggeredAt: string;
  isAcknowledged: boolean;
}

// Analytics Types
export interface DashboardOverview {
  period: {
    startDate: string;
    endDate: string;
  };
  summary: {
    totalIncome: number;
    totalExpenses: number;
    netIncome: number;
    transactionCounts: {
      income: number;
      expenses: number;
    };
  };
  budgetUtilization: Array<{
    budgetId: string;
    categoryName: string;
    allocatedAmount: number;
    spentAmount: number;
    remainingAmount: number;
    utilizationPercentage: number;
  }>;
}

export interface SpendingTrend {
  period: string;
  income: number;
  expenses: number;
  netIncome: number;
}

export interface CategoryBreakdown {
  category: {
    id: string;
    name: string;
    type: CategoryType;
    icon?: string;
    color?: string;
  };
  amount: number;
  transactionCount: number;
  percentage: number;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  details?: any;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}


