// Auth Types
export interface User {
  id: string;
  email: string;
  username?: string;
  name: string;
  profilePicture?: string;
  role?: string;
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
  isEssential: boolean;
  createdAt: string;
  updatedAt: string;
  parentCategory?: Category;
  subCategories?: Category[];
}

// Transaction Types
export type TransactionType = 'INCOME' | 'EXPENSE' | 'OPENING_BALANCE' | 'TRANSFER';
export interface PaymentMethod {
  id: string;
  code: string;
  name: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}
export type RecurringFrequency = 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'QUARTERLY' | 'YEARLY';

export interface Transaction {
  id: string;
  userId: string;
  amount: number;
  type: TransactionType;
  categoryId: string;
  accountId?: string;
  toAccountId?: string; // For transfers - destination account
  date: string;
  description?: string;
  paymentMethodId?: string;
  paymentMethod?: PaymentMethod;
  isRecurring: boolean;
  recurringFrequency?: RecurringFrequency;
  isOpeningBalance: boolean;
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
  toAccount?: {
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
  isEssential?: boolean;
}

// Notification Types
export type NotificationType = 'SUCCESS' | 'ERROR' | 'WARNING' | 'INFO';

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: NotificationType;
  isRead: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationFilters {
  page?: number;
  limit?: number;
  isRead?: boolean;
  type?: NotificationType;
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

// Loan Types
export type LoanType = 'PERSONAL' | 'HOME' | 'CAR' | 'EDUCATION' | 'BUSINESS' | 'CREDIT_CARD' | 'OTHER';
export type LoanStatus = 'ACTIVE' | 'PAID_OFF' | 'DEFAULTED' | 'REFINANCED' | 'PAUSED';

export interface Loan {
  id: string;
  userId: string;
  name: string;
  type: LoanType;
  originalPrincipal: number;
  originalInterestRate: number;
  originalTermMonths: number;
  originalStartDate: string;
  currentBalance: number;
  currentInterestRate?: number;
  remainingTermMonths?: number;
  accountId: string;
  status: LoanStatus;
  totalPaid: number;
  totalInterestPaid: number;
  totalPrePayments?: number;
  totalInterestSavings?: number;
  lastPaymentDate?: string;
  nextPaymentDate?: string;
  isExistingLoan: boolean;
  createdAt: string;
  updatedAt: string;
  account: {
    id: string;
    name: string;
    type: string;
    balance: number;
    currency: string;
  };
  payments?: LoanPayment[];
  paymentSummary?: {
    totalPayments: number;
    totalAmount: number;
    totalPrincipal: number;
    totalInterest: number;
    lastPaymentDate: string | null;
  };
}

export interface LoanPayment {
  id: string;
  loanId: string;
  amount: number;
  principalAmount: number;
  interestAmount: number;
  paymentDate: string;
  transactionId?: string;
  isPrePayment?: boolean;
  prePaymentType?: string;
  interestSavings?: number;
  termReduction?: number;
  createdAt: string;
  loan?: {
    id: string;
    name: string;
    type: LoanType;
  };
  transaction?: {
    id: string;
    amount: number;
    date: string;
    description?: string;
  };
}

export interface LoanSummary {
  totalLoans: number;
  activeLoans: number;
  totalOutstanding: number;
  totalPaid: number;
  monthlyPayments: number;
}

export interface LoanProgress {
  loan: Loan;
  progress: {
    percentage: number;
    paidAmount: number;
    remainingAmount: number;
    totalPaid: number;
    totalInterestPaid: number;
  };
  paymentSummary: {
    totalPayments: number;
    totalAmount: number;
    totalPrincipal: number;
    totalInterest: number;
    lastPaymentDate: string | null;
  };
}

export interface PrePaymentAnalytics {
  totalPrePayments: number;
  totalInterestSavings: number;
  prePaymentCount: number;
  recentPrePayments: LoanPayment[];
  averagePrePayment: number;
}


