import api from './api';
import { Loan, LoanPayment, LoanSummary, LoanProgress, LoanType } from '../types';

export const loanService = {
  // Get all loans
  async getLoans(): Promise<Loan[]> {
    const response = await api.get('/loans');
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.error || 'Failed to fetch loans');
  },

  // Get loan by ID
  async getLoanById(id: string): Promise<Loan> {
    const response = await api.get(`/loans/${id}`);
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.error || 'Failed to fetch loan');
  },

  // Create loan
  async createLoan(loanData: {
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
    isExistingLoan?: boolean;
    totalPaid?: number;
    totalInterestPaid?: number;
    lastPaymentDate?: string;
  }): Promise<Loan> {
    const response = await api.post('/loans', loanData);
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.error || 'Failed to create loan');
  },

  // Update loan
  async updateLoan(id: string, updateData: {
    name?: string;
    currentBalance?: number;
    currentInterestRate?: number;
    remainingTermMonths?: number;
    status?: string;
    totalPaid?: number;
    totalInterestPaid?: number;
    lastPaymentDate?: string;
    nextPaymentDate?: string;
  }): Promise<Loan> {
    const response = await api.put(`/loans/${id}`, updateData);
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.error || 'Failed to update loan');
  },

  // Delete loan
  async deleteLoan(id: string): Promise<void> {
    const response = await api.delete(`/loans/${id}`);
    if (!response.data.success) {
      throw new Error(response.data.error || 'Failed to delete loan');
    }
  },

  // Get loan summary
  async getLoanSummary(): Promise<LoanSummary> {
    const response = await api.get('/loans/summary/overview');
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.error || 'Failed to fetch loan summary');
  },

  // Make loan payment
  async makeLoanPayment(loanId: string, paymentData: {
    amount: number;
    paymentDate: string;
    description?: string;
    isPrePayment?: boolean;
  }): Promise<{
    loan: Loan;
    payment: LoanPayment;
    transaction: any;
    isPrePayment?: boolean;
    prePaymentBenefits?: any;
  }> {
    const response = await api.post(`/loans/${loanId}/payments`, paymentData);
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.error || 'Failed to make loan payment');
  },

  // Get loan payments
  async getLoanPayments(loanId: string): Promise<LoanPayment[]> {
    const response = await api.get(`/loans/${loanId}/payments`);
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.error || 'Failed to fetch loan payments');
  },

  // Calculate EMI
  async calculateEMI(principal: number, annualRate: number, termMonths: number): Promise<{ emi: number }> {
    const response = await api.get('/loans/calculate/emi', {
      params: { principal, annualRate, termMonths }
    });
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.error || 'Failed to calculate EMI');
  },

  // Get loan progress
  async getLoanProgress(loanId: string): Promise<LoanProgress> {
    const response = await api.get(`/loans/${loanId}/progress`);
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.error || 'Failed to fetch loan progress');
  },

  // Calculate pre-payment scenario
  async calculatePrePayment(loanId: string, amount: number): Promise<any> {
    const response = await api.post(`/loans/${loanId}/calculate-prepayment`, { amount });
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.error || 'Failed to calculate pre-payment scenario');
  },

  // Get pre-payment analytics
  async getPrePaymentAnalytics(): Promise<any> {
    const response = await api.get('/loans/analytics/prepayments');
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.error || 'Failed to fetch pre-payment analytics');
  },

  // Scheduled payments
  async createScheduledPayments(loanId: string): Promise<void> {
    const response = await api.post(`/loans/${loanId}/scheduled-payments`);
    if (!response.data.success) {
      throw new Error(response.data.error || 'Failed to create scheduled payments');
    }
  },

  async deleteScheduledPayment(paymentId: string, reason?: string): Promise<void> {
    const response = await api.delete(`/loans/payments/${paymentId}`, { data: { reason } });
    if (!response.data.success) {
      throw new Error(response.data.error || 'Failed to delete scheduled payment');
    }
  },

  async getOverduePayments(): Promise<any[]> {
    const response = await api.get('/loans/overdue-payments');
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.error || 'Failed to fetch overdue payments');
  },

  async getPaymentHistory(loanId: string): Promise<any[]> {
    const response = await api.get(`/loans/${loanId}/payment-history`);
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.error || 'Failed to fetch payment history');
  }
};
