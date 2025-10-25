// API configuration
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

export const API_ENDPOINTS = {
  BASE_URL: API_BASE_URL,
  RECURRING_TRANSACTIONS: `${API_BASE_URL}/api/recurring-transactions`,
  TRANSACTIONS: `${API_BASE_URL}/api/transactions`,
  ACCOUNTS: `${API_BASE_URL}/api/accounts`,
  CATEGORIES: `${API_BASE_URL}/api/categories`,
  BUDGETS: `${API_BASE_URL}/api/budgets`,
  ANALYTICS: `${API_BASE_URL}/api/analytics`,
  AUTH: `${API_BASE_URL}/api/auth`,
  PAYMENT_METHODS: `${API_BASE_URL}/api/payment-methods`,
  NOTIFICATIONS: `${API_BASE_URL}/api/notifications`,
};

export default API_BASE_URL;
