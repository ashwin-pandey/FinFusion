import { useState, useEffect } from 'react';
import { loanService } from '../services/loanService';
import { Loan, LoanSummary, LoanProgress, LoanPayment, LoanType } from '../types';

export const useLoans = (autoFetch: boolean = true) => {
  const [loans, setLoans] = useState<Loan[]>([]);
  const [summary, setSummary] = useState<LoanSummary | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchLoans = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await loanService.getLoans();
      setLoans(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch loans');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchSummary = async () => {
    try {
      setError(null);
      const data = await loanService.getLoanSummary();
      setSummary(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch loan summary');
    }
  };

  const createLoan = async (loanData: {
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
  }) => {
    try {
      setIsLoading(true);
      setError(null);
      const newLoan = await loanService.createLoan(loanData);
      setLoans(prev => [newLoan, ...prev]);
      await fetchSummary();
      return newLoan;
    } catch (err: any) {
      setError(err.message || 'Failed to create loan');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const updateLoan = async (id: string, updateData: {
    name?: string;
    currentBalance?: number;
    currentInterestRate?: number;
    remainingTermMonths?: number;
    status?: string;
    totalPaid?: number;
    totalInterestPaid?: number;
    lastPaymentDate?: string;
    nextPaymentDate?: string;
  }) => {
    try {
      setIsLoading(true);
      setError(null);
      const updatedLoan = await loanService.updateLoan(id, updateData);
      setLoans(prev => prev.map(loan => loan.id === id ? updatedLoan : loan));
      await fetchSummary();
      return updatedLoan;
    } catch (err: any) {
      setError(err.message || 'Failed to update loan');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteLoan = async (id: string) => {
    try {
      setIsLoading(true);
      setError(null);
      await loanService.deleteLoan(id);
      setLoans(prev => prev.filter(loan => loan.id !== id));
      await fetchSummary();
    } catch (err: any) {
      setError(err.message || 'Failed to delete loan');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const makePayment = async (loanId: string, paymentData: {
    amount: number;
    paymentDate: string;
    description?: string;
    isPrePayment?: boolean;
  }) => {
    try {
      setIsLoading(true);
      setError(null);
      const result = await loanService.makeLoanPayment(loanId, paymentData);
      await fetchLoans();
      await fetchSummary();
      return result;
    } catch (err: any) {
      setError(err.message || 'Failed to make loan payment');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const calculateEMI = async (principal: number, annualRate: number, termMonths: number) => {
    try {
      setError(null);
      const result = await loanService.calculateEMI(principal, annualRate, termMonths);
      return result.emi;
    } catch (err: any) {
      setError(err.message || 'Failed to calculate EMI');
      throw err;
    }
  };

  const getLoanProgress = async (loanId: string) => {
    try {
      setError(null);
      const progress = await loanService.getLoanProgress(loanId);
      return progress;
    } catch (err: any) {
      setError(err.message || 'Failed to fetch loan progress');
      throw err;
    }
  };

  const getLoanPayments = async (loanId: string) => {
    try {
      setError(null);
      const payments = await loanService.getLoanPayments(loanId);
      return payments;
    } catch (err: any) {
      setError(err.message || 'Failed to fetch loan payments');
      throw err;
    }
  };

  const calculatePrePayment = async (loanId: string, amount: number) => {
    try {
      setError(null);
      const scenario = await loanService.calculatePrePayment(loanId, amount);
      return scenario;
    } catch (err: any) {
      setError(err.message || 'Failed to calculate pre-payment scenario');
      throw err;
    }
  };

  const getPrePaymentAnalytics = async () => {
    try {
      setError(null);
      const analytics = await loanService.getPrePaymentAnalytics();
      return analytics;
    } catch (err: any) {
      setError(err.message || 'Failed to fetch pre-payment analytics');
      throw err;
    }
  };

  // Scheduled payments
  const createScheduledPayments = async (loanId: string) => {
    try {
      setError(null);
      await loanService.createScheduledPayments(loanId);
      await fetchLoans(); // Refresh loans list
    } catch (err: any) {
      setError(err.message || 'Failed to create scheduled payments');
      throw err;
    }
  };

  const deleteScheduledPayment = async (paymentId: string, reason?: string) => {
    try {
      setError(null);
      await loanService.deleteScheduledPayment(paymentId, reason);
      await fetchLoans(); // Refresh loans list
    } catch (err: any) {
      setError(err.message || 'Failed to delete scheduled payment');
      throw err;
    }
  };

  const getOverduePayments = async () => {
    try {
      setError(null);
      const overduePayments = await loanService.getOverduePayments();
      return overduePayments;
    } catch (err: any) {
      setError(err.message || 'Failed to fetch overdue payments');
      throw err;
    }
  };

  const getPaymentHistory = async (loanId: string) => {
    try {
      setError(null);
      const paymentHistory = await loanService.getPaymentHistory(loanId);
      return paymentHistory;
    } catch (err: any) {
      setError(err.message || 'Failed to fetch payment history');
      throw err;
    }
  };

  useEffect(() => {
    if (autoFetch) {
      fetchLoans();
      fetchSummary();
    }
  }, [autoFetch]);

  return {
    loans,
    summary,
    isLoading,
    error,
    fetchLoans,
    fetchSummary,
    createLoan,
    updateLoan,
    deleteLoan,
    makePayment,
    calculateEMI,
    getLoanProgress,
    getLoanPayments,
    calculatePrePayment,
    getPrePaymentAnalytics,
    createScheduledPayments,
    deleteScheduledPayment,
    getOverduePayments,
    getPaymentHistory,
    clearError: () => setError(null)
  };
};
