import React, { useState, useEffect } from 'react';
import { useLoans } from '../hooks/useLoans';
import { useAccounts } from '../hooks/useAccounts';
import { useCurrency } from '../contexts/CurrencyContext';
import { useNotification } from '../contexts/NotificationContext';
import { formatCurrency, formatDate } from '../utils/formatters';
import ClickableNumber from '../components/ClickableNumber';
import { Loan, LoanType } from '../types';
import {
  Button,
  Input,
  Text,
  Spinner,
  Dialog,
  DialogTrigger,
  DialogSurface,
  DialogTitle,
  DialogBody,
  DialogActions,
  DialogContent,
  Field,
  Badge,
  Card,
  CardHeader,
  CardPreview,
  CardFooter,
  Divider,
  ProgressBar,
  makeStyles,
  tokens,
  shorthands
} from '@fluentui/react-components';
import { 
  Add24Regular, 
  Edit24Regular, 
  Delete24Regular, 
  Money24Regular,
  BuildingBank24Filled,
  Calendar24Regular,
  Calculator24Regular,
  ChartMultiple24Regular,
  Info24Regular,
  CheckmarkCircle24Regular,
  Warning24Regular,
  Clock24Regular,
  BuildingBank24Regular,
  Warning24Filled,
  CheckmarkCircle24Filled,
  Calendar24Filled,
  Dismiss24Regular
} from '@fluentui/react-icons';
import './Loans.css';

const useStyles = makeStyles({
  formGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: tokens.spacingHorizontalM,
    marginBottom: tokens.spacingVerticalM
  },
  loadingContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '400px',
    flexDirection: 'column',
    gap: tokens.spacingVerticalM
  },
  loanCard: {
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    padding: '28px',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
    border: '1px solid #e9ecef',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    height: 'auto',
    display: 'flex',
    flexDirection: 'column',
    position: 'relative',
    overflow: 'hidden',
    '&:hover': {
      transform: 'translateY(-6px)',
      boxShadow: '0 8px 25px rgba(0, 0, 0, 0.15)'
    },
  },
  loanHeader: {
    paddingBottom: '20px',
    borderBottom: '1px solid #f3f2f1'
  },
  loanBadges: {
    display: 'flex',
    gap: '10px',
    flexWrap: 'wrap',
    marginTop: '12px',
    alignItems: 'center'
  },
  loanActions: {
    display: 'flex',
    gap: tokens.spacingHorizontalXS,
    flexWrap: 'wrap'
  },
  progressSection: {
    padding: '20px',
    backgroundColor: '#f8f9fa',
    borderRadius: '8px',
    border: '1px solid #e9ecef',
    marginBottom: '20px'
  },
  progressHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: tokens.spacingVerticalXS
  },
  loanDetails: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '18px',
    marginBottom: '20px'
  },
  loanDetailItem: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
    padding: '20px',
    background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
    borderRadius: '8px',
    border: '1px solid #e9ecef',
    transition: 'all 0.2s ease',
    '&:hover': {
      background: 'linear-gradient(135deg, #e9ecef 0%, #dee2e6 100%)',
      transform: 'translateY(-2px)',
      boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)'
    }
  },
  loanDetailLabel: {
    fontSize: '11px',
    fontWeight: '600',
    color: '#6c757d',
    textTransform: 'uppercase',
    letterSpacing: '0.8px',
    marginBottom: '10px'
  },
  loanDetailValue: {
    fontSize: '20px',
    fontWeight: '700',
    color: '#212529',
    marginBottom: '0px',
    lineHeight: '1.3'
  },
  loanFooter: {
    display: 'flex',
    flexDirection: 'column',
    marginTop: 'auto',
    paddingTop: '20px',
    borderTop: '1px solid #f3f2f1',
    backgroundColor: '#faf9f8',
    padding: '16px 20px',
    margin: '0 -28px -28px -28px',
    borderRadius: '0 0 12px 12px',
    gap: '16px'
  },
  footerInfo: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px'
  },
  footerActions: {
    display: 'flex',
    gap: '8px',
    alignItems: 'center',
    flexWrap: 'nowrap',
    '& > *': {
      marginRight: '0 !important'
    }
  }
});

const Loans: React.FC = () => {
  const styles = useStyles();
  const { 
    loans, 
    summary, 
    isLoading, 
    error, 
    createLoan, 
    updateLoan, 
    deleteLoan, 
    makePayment, 
    calculatePrePayment, 
    fetchLoans, 
    fetchSummary,
    createScheduledPayments,
    deleteScheduledPayment,
    getOverduePayments,
    getPaymentHistory
  } = useLoans();
  const { accounts } = useAccounts();
  const { formatCurrency } = useCurrency();
  const { showSuccess, showError, showWarning, showInfo } = useNotification();
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [showScheduledPaymentsDialog, setShowScheduledPaymentsDialog] = useState(false);
  const [showOverduePaymentsDialog, setShowOverduePaymentsDialog] = useState(false);
  const [showAnalyticsDialog, setShowAnalyticsDialog] = useState(false);
  const [showEMICalculatorDialog, setShowEMICalculatorDialog] = useState(false);
  const [selectedLoan, setSelectedLoan] = useState<Loan | null>(null);
  const [scheduledPayments, setScheduledPayments] = useState<any[]>([]);
  const [overduePayments, setOverduePayments] = useState<any[]>([]);
  const [emiCalculatorData, setEmiCalculatorData] = useState({
    principal: '',
    interestRate: '',
    termMonths: '',
    emi: 0,
    totalAmount: 0,
    totalInterest: 0
  });
  const [formData, setFormData] = useState({
    name: '',
    type: 'PERSONAL' as LoanType,
    originalPrincipal: '',
    originalInterestRate: '',
    originalTermMonths: '',
    originalStartDate: '',
    currentBalance: '',
    currentInterestRate: '',
    remainingTermMonths: '',
    accountId: '',
    isExistingLoan: false,
    totalPaid: '',
    totalInterestPaid: '',
    lastPaymentDate: ''
  });
  const [paymentData, setPaymentData] = useState({
    amount: '',
    paymentDate: new Date().toISOString().split('T')[0],
    description: '',
    isPrePayment: false
  });
  const [prePaymentScenario, setPrePaymentScenario] = useState<any>(null);
  const [showPrePaymentCalculator, setShowPrePaymentCalculator] = useState(false);

  const handleCreateLoan = async () => {
    try {
      await createLoan({
        name: formData.name,
        type: formData.type,
        originalPrincipal: parseFloat(formData.originalPrincipal),
        originalInterestRate: parseFloat(formData.originalInterestRate),
        originalTermMonths: parseInt(formData.originalTermMonths),
        originalStartDate: formData.originalStartDate,
        currentBalance: parseFloat(formData.currentBalance),
        currentInterestRate: formData.currentInterestRate ? parseFloat(formData.currentInterestRate) : undefined,
        remainingTermMonths: formData.remainingTermMonths ? parseInt(formData.remainingTermMonths) : undefined,
        accountId: formData.accountId,
        isExistingLoan: formData.isExistingLoan,
        totalPaid: formData.totalPaid ? parseFloat(formData.totalPaid) : undefined,
        totalInterestPaid: formData.totalInterestPaid ? parseFloat(formData.totalInterestPaid) : undefined,
        lastPaymentDate: formData.lastPaymentDate || undefined
      });
      setShowCreateDialog(false);
      resetForm();
      showSuccess('Loan Created', `Loan "${formData.name}" has been created successfully!`);
    } catch (error) {
      console.error('Error creating loan:', error);
      showError('Failed to Create Loan', 'Unable to create the loan. Please check your inputs and try again.');
    }
  };

  const handleCreateScheduledPayments = async (loanId: string) => {
    try {
      await createScheduledPayments(loanId);
      showSuccess('Scheduled Payments Created', 'All scheduled payments have been created successfully!');
    } catch (error) {
      console.error('Error creating scheduled payments:', error);
      showError('Failed to Create Scheduled Payments', 'Unable to create scheduled payments. Please try again.');
    }
  };

  const handleDeleteScheduledPayment = async (paymentId: string, reason: string) => {
    try {
      await deleteScheduledPayment(paymentId, reason);
      showSuccess('Payment Cancelled', 'Scheduled payment has been cancelled successfully.');
      // Refresh scheduled payments if dialog is open
      if (showScheduledPaymentsDialog && selectedLoan) {
        const history = await getPaymentHistory(selectedLoan.id);
        setScheduledPayments(history);
      }
    } catch (error) {
      console.error('Error deleting scheduled payment:', error);
      showError('Failed to Cancel Payment', 'Unable to cancel the scheduled payment. Please try again.');
    }
  };

  const handleViewScheduledPayments = async (loan: Loan) => {
    try {
      setSelectedLoan(loan);
      const history = await getPaymentHistory(loan.id);
      if (history && history.length > 0) {
        setScheduledPayments(history);
        setShowScheduledPaymentsDialog(true);
      } else {
        showInfo('No Scheduled Payments', 'This loan has no scheduled payment history yet.');
      }
    } catch (error) {
      console.error('Error fetching payment history:', error);
      showError('Failed to Load Payment History', 'Unable to load payment history. Please try again.');
    }
  };

  const handleViewOverduePayments = async () => {
    try {
      const overdue = await getOverduePayments();
      setOverduePayments(overdue);
      setShowOverduePaymentsDialog(true);
      if (overdue.length > 0) {
        showWarning('Overdue Payments Found', `You have ${overdue.length} overdue payment(s) that need attention.`);
      } else {
        showSuccess('All Payments Current', 'Great! You have no overdue payments.');
      }
    } catch (error) {
      console.error('Error fetching overdue payments:', error);
      showError('Failed to Load Overdue Payments', 'Unable to load overdue payments. Please try again.');
    }
  };

  const handleViewAnalytics = () => {
    setShowAnalyticsDialog(true);
  };

  const handleRecalculateTerms = async () => {
    try {
      showInfo('Recalculating Terms', 'Updating remaining terms for all loans...');
      
      const response = await fetch('/api/loans/recalculate-terms', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        showSuccess('Terms Updated', 'Remaining terms have been recalculated successfully!');
        // Refresh the loans data
        window.location.reload();
      } else {
        const error = await response.json();
        showError('Recalculation Failed', error.error || 'Failed to recalculate terms');
      }
    } catch (error) {
      showError('Recalculation Failed', 'An error occurred while recalculating terms');
    }
  };

  const handleEditLoan = (loan: any) => {
    setSelectedLoan(loan);
    setFormData({
      name: loan.name,
      type: loan.type,
      originalPrincipal: loan.originalPrincipal.toString(),
      originalInterestRate: loan.originalInterestRate.toString(),
      originalTermMonths: loan.originalTermMonths.toString(),
      originalStartDate: loan.originalStartDate.split('T')[0],
      currentBalance: loan.currentBalance.toString(),
      currentInterestRate: loan.currentInterestRate?.toString() || '',
      accountId: loan.accountId,
      isExistingLoan: loan.isExistingLoan || false,
      totalPaid: loan.totalPaid?.toString() || '0',
      totalInterestPaid: loan.totalInterestPaid?.toString() || '0',
      lastPaymentDate: loan.lastPaymentDate ? loan.lastPaymentDate.split('T')[0] : '',
      remainingTermMonths: loan.remainingTermMonths?.toString() || ''
    });
    setShowCreateDialog(true);
  };

  const handleDeleteLoan = async (loan: any) => {
    if (window.confirm(`Are you sure you want to delete the loan "${loan.name}"? This action cannot be undone.`)) {
      try {
        await deleteLoan(loan.id);
        showSuccess('Loan Deleted', `Loan "${loan.name}" has been deleted successfully.`);
      } catch (error) {
        showError('Delete Failed', 'Failed to delete the loan. Please try again.');
      }
    }
  };

  const handleUpdateLoan = async () => {
    try {
      if (!selectedLoan) return;

      await updateLoan(selectedLoan.id, {
        name: formData.name,
        currentBalance: parseFloat(formData.currentBalance),
        currentInterestRate: formData.currentInterestRate ? parseFloat(formData.currentInterestRate) : undefined,
        remainingTermMonths: formData.remainingTermMonths ? parseInt(formData.remainingTermMonths) : undefined,
        totalPaid: formData.totalPaid ? parseFloat(formData.totalPaid) : 0,
        totalInterestPaid: formData.totalInterestPaid ? parseFloat(formData.totalInterestPaid) : 0,
        lastPaymentDate: formData.lastPaymentDate || undefined
      });

      showSuccess('Loan Updated', `Loan "${formData.name}" has been updated successfully.`);
      setShowCreateDialog(false);
      setSelectedLoan(null);
      resetForm();
    } catch (error) {
      console.error('Error updating loan:', error);
      showError('Failed to Update Loan', 'Unable to update the loan. Please check your inputs and try again.');
    }
  };

  const handleOpenEMICalculator = () => {
    setShowEMICalculatorDialog(true);
  };

  const handleCalculateEMI = () => {
    const principal = parseFloat(emiCalculatorData.principal);
    const rate = parseFloat(emiCalculatorData.interestRate);
    const months = parseInt(emiCalculatorData.termMonths);

    if (principal && rate && months) {
      const monthlyRate = rate / 100 / 12;
      const emi = (principal * monthlyRate * Math.pow(1 + monthlyRate, months)) / 
                  (Math.pow(1 + monthlyRate, months) - 1);
      const totalAmount = emi * months;
      const totalInterest = totalAmount - principal;

      setEmiCalculatorData(prev => ({
        ...prev,
        emi: Math.round(emi * 100) / 100,
        totalAmount: Math.round(totalAmount * 100) / 100,
        totalInterest: Math.round(totalInterest * 100) / 100
      }));

      showSuccess('EMI Calculated', `EMI: ₹${emi.toLocaleString()}, Total Interest: ₹${totalInterest.toLocaleString()}`);
    } else {
      showError('Invalid Input', 'Please enter valid values for all fields.');
    }
  };

  const resetEMICalculator = () => {
    setEmiCalculatorData({
      principal: '',
      interestRate: '',
      termMonths: '',
      emi: 0,
      totalAmount: 0,
      totalInterest: 0
    });
  };

  const handleMakePayment = async () => {
    if (!selectedLoan) return;
    
    try {
      const result = await makePayment(selectedLoan.id, {
        amount: parseFloat(paymentData.amount),
        paymentDate: paymentData.paymentDate,
        description: paymentData.description,
        isPrePayment: paymentData.isPrePayment
      });
      
      // Show pre-payment benefits if applicable
      if (result.isPrePayment && result.prePaymentBenefits) {
        const benefits = result.prePaymentBenefits;
        showSuccess('Pre-payment Made!', 
          `Great! You saved ₹${benefits.interestSavings?.toLocaleString()} in interest and reduced your term by ${benefits.termReduction} months.`);
      } else {
        showSuccess('Payment Made', `Payment of ₹${parseFloat(paymentData.amount).toLocaleString()} has been recorded successfully.`);
      }
      
      setShowPaymentDialog(false);
      setSelectedLoan(null);
      setPaymentData({
        amount: '',
        paymentDate: new Date().toISOString().split('T')[0],
        description: '',
        isPrePayment: false
      });
      setPrePaymentScenario(null);
    } catch (error) {
      console.error('Error making payment:', error);
      showError('Payment Failed', 'Unable to process the payment. Please check your account balance and try again.');
    }
  };

  const handlePrePaymentCalculation = async () => {
    if (!selectedLoan || !paymentData.amount) return;
    
    try {
      const scenario = await calculatePrePayment(selectedLoan.id, parseFloat(paymentData.amount));
      setPrePaymentScenario(scenario);
      showInfo('Pre-payment Analysis', 'Pre-payment scenario calculated successfully. Review the benefits below.');
    } catch (error) {
      console.error('Error calculating pre-payment:', error);
      showError('Calculation Failed', 'Unable to calculate pre-payment scenario. Please try again.');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      type: 'PERSONAL',
      originalPrincipal: '',
      originalInterestRate: '',
      originalTermMonths: '',
      originalStartDate: '',
      currentBalance: '',
      currentInterestRate: '',
      remainingTermMonths: '',
      accountId: '',
      isExistingLoan: false,
      totalPaid: '',
      totalInterestPaid: '',
      lastPaymentDate: ''
    });
  };


  if (isLoading && !loans.length) {
    return (
      <div className={styles.loadingContainer}>
        <Spinner size="large" label="Loading loans..." />
        <Text size={400} style={{ color: tokens.colorNeutralForeground2 }}>
          Setting up your loan management dashboard...
        </Text>
      </div>
    );
  }

  return (
    <div className="loans-page">
      <div className="page-header">
        <h1>Loan Management</h1>
        <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
          <button 
            className="action-btn edit-btn" 
            onClick={handleViewAnalytics}
          >
            <ChartMultiple24Regular /> Analytics
          </button>
          <button 
            className="action-btn edit-btn" 
            onClick={handleOpenEMICalculator}
          >
            <Calculator24Regular /> EMI Calculator
          </button>
          <button 
            className="action-btn secondary-btn" 
            onClick={handleViewOverduePayments}
          >
            <Warning24Filled /> Overdue Payments
          </button>
          <button 
            className="action-btn edit-btn" 
            onClick={handleRecalculateTerms}
          >
            <Clock24Regular /> Recalculate Terms
          </button>
          <button 
            className="action-btn edit-btn" 
            onClick={() => setShowCreateDialog(true)}
          >
            <Add24Regular /> Add Loan
          </button>
        </div>
      </div>
        <Dialog open={showCreateDialog} onOpenChange={(_, data) => setShowCreateDialog(data.open)}>
          <DialogTrigger disableButtonEnhancement>
            <div style={{ display: 'none' }} />
          </DialogTrigger>
            <DialogSurface>
            <DialogBody>
              <DialogTitle>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>{selectedLoan ? 'Edit Loan' : 'Add New Loan'}</span>
                  <Button 
                    appearance="subtle" 
                    icon={<Dismiss24Regular />} 
                    onClick={() => {
                      setShowCreateDialog(false);
                      setSelectedLoan(null);
                      resetForm();
                    }}
                    style={{ minWidth: 'auto', padding: '4px' }}
                  />
                </div>
              </DialogTitle>
              <DialogContent>
                <div className={styles.formGrid}>
                  <Field label="Loan Name" required>
                    <Input
                      value={formData.name}
                      onChange={(_, data) => setFormData({ ...formData, name: data.value })}
                      placeholder="e.g., Home Loan, Car Loan"
                    />
                  </Field>
                  
                  <Field label="Loan Type" required>
                    <select
                      value={formData.type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value as LoanType })}
                      className="fluent-select"
                    >
                      <option value="">Select loan type</option>
                      <option value="PERSONAL">Personal Loan</option>
                      <option value="HOME">Home Loan</option>
                      <option value="CAR">Car Loan</option>
                      <option value="EDUCATION">Education Loan</option>
                      <option value="BUSINESS">Business Loan</option>
                      <option value="CREDIT_CARD">Credit Card</option>
                      <option value="OTHER">Other</option>
                    </select>
                  </Field>

                  <Field label="Original Principal Amount" required>
                    <Input
                      type="number"
                      value={formData.originalPrincipal}
                      onChange={(_, data) => setFormData({ ...formData, originalPrincipal: data.value })}
                      placeholder="500000"
                    />
                  </Field>

                  <Field label="Original Interest Rate (%)" required>
                    <Input
                      type="number"
                      step="0.01"
                      value={formData.originalInterestRate}
                      onChange={(_, data) => setFormData({ ...formData, originalInterestRate: data.value })}
                      placeholder="8.5"
                    />
                  </Field>

                  <Field label="Original Term (Months)" required>
                    <Input
                      type="number"
                      value={formData.originalTermMonths}
                      onChange={(_, data) => setFormData({ ...formData, originalTermMonths: data.value })}
                      placeholder="60"
                    />
                  </Field>

                  <Field label="Original Start Date" required>
                    <Input
                      type="date"
                      value={formData.originalStartDate}
                      onChange={(_, data) => setFormData({ ...formData, originalStartDate: data.value })}
                    />
                  </Field>

                  <Field label="Current Balance" required>
                    <Input
                      type="number"
                      value={formData.currentBalance}
                      onChange={(_, data) => setFormData({ ...formData, currentBalance: data.value })}
                      placeholder="300000"
                    />
                  </Field>

                  <Field label="Remaining Term (Months)">
                    <Input
                      type="number"
                      value={formData.remainingTermMonths}
                      onChange={(_, data) => setFormData({ ...formData, remainingTermMonths: data.value })}
                      placeholder="24"
                    />
                  </Field>

                  <Field label="Deduction Account" required>
                    <select
                      value={formData.accountId}
                      onChange={(e) => setFormData({ ...formData, accountId: e.target.value })}
                      className="fluent-select"
                    >
                      <option value="">Select Account</option>
                      {accounts.map((account: any) => (
                        <option key={account.id} value={account.id}>
                          {account.name} ({account.type})
                        </option>
                      ))}
                    </select>
                  </Field>
                </div>
              </DialogContent>
              <DialogActions>
                <DialogTrigger disableButtonEnhancement>
                  <Button 
                    appearance="secondary"
                    onClick={() => {
                      setSelectedLoan(null);
                      resetForm();
                    }}
                  >
                    Cancel
                  </Button>
                </DialogTrigger>
                <Button appearance="primary" onClick={selectedLoan ? handleUpdateLoan : handleCreateLoan}>
                  {selectedLoan ? 'Update Loan' : 'Create Loan'}
                </Button>
              </DialogActions>
            </DialogBody>
          </DialogSurface>
        </Dialog>

        {/* Summary Stats */}
      {summary && (
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon" style={{ backgroundColor: '#0078d4' }}>
              <BuildingBank24Filled style={{ fontSize: '24px', color: 'white' }} />
            </div>
            <div className="stat-content">
              <h2 className="stat-value">
                {summary.totalLoans}
              </h2>
              <p className="stat-label">Total Loans</p>
              <p className="stat-subtitle">{summary.activeLoans} active • {summary.totalLoans - summary.activeLoans} completed</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon" style={{ backgroundColor: '#d13438' }}>
              <Warning24Filled style={{ fontSize: '24px', color: 'white' }} />
            </div>
            <div className="stat-content">
              <h2 className="stat-value" style={{ color: '#d13438' }}>
                <ClickableNumber value={summary.totalOutstanding} />
              </h2>
              <p className="stat-label">Outstanding Balance</p>
              <p className="stat-subtitle">Total debt remaining</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon" style={{ backgroundColor: '#107c10' }}>
              <CheckmarkCircle24Filled style={{ fontSize: '24px', color: 'white' }} />
            </div>
            <div className="stat-content">
              <h2 className="stat-value" style={{ color: '#107c10' }}>
                <ClickableNumber value={summary.totalPaid} />
              </h2>
              <p className="stat-label">Total Paid</p>
              <p className="stat-subtitle">Amount repaid to date</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon" style={{ backgroundColor: '#0078d4' }}>
              <Calendar24Filled style={{ fontSize: '24px', color: 'white' }} />
            </div>
            <div className="stat-content">
              <h2 className="stat-value">
                <ClickableNumber value={summary.monthlyPayments} />
              </h2>
              <p className="stat-label">Monthly Payments</p>
              <p className="stat-subtitle">Total EMI per month</p>
            </div>
          </div>
        </div>
      )}

      {/* Loans Section */}
      <div className="loans-section">
        <div className="section-header">
          <h2>Your Loans</h2>
          <p style={{ color: '#666', fontSize: '14px', margin: '8px 0 20px 0' }}>
            Manage your loans, track payments, and optimize your debt strategy
          </p>
        </div>

        {loans.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">
              <BuildingBank24Filled style={{ fontSize: '64px', color: '#ccc' }} />
            </div>
            <h3>No loans yet</h3>
            <p>Start by adding your first loan to track payments, progress, and optimize your debt management strategy.</p>
            <button 
              className="action-btn primary-btn" 
              onClick={() => setShowCreateDialog(true)}
            >
              <Add24Regular /> Add Your First Loan
            </button>
          </div>
        ) : (
          <div className="loans-grid">
          {loans.map(loan => {
            const progressPercentage = (Number(loan.totalPaid) / Number(loan.originalPrincipal)) * 100;
            const isOverdue = loan.nextPaymentDate && new Date(loan.nextPaymentDate) < new Date();
            
            return (
              <div key={loan.id} className={styles.loanCard}>
                <div className={styles.loanHeader}>
                  <div>
                    <Text size={500} weight="semibold" style={{ color: tokens.colorNeutralForeground1 }}>
                      {loan.name}
                    </Text>
                    <div className={styles.loanBadges}>
                      <span className={`badge badge-${loan.type.toLowerCase()}`}>
                        {loan.type.replace('_', ' ')}
                      </span>
                      <span className={`badge badge-${loan.status.toLowerCase()}`}>
                        {loan.status.replace('_', ' ')}
                      </span>
                      {isOverdue && (
                        <span className="badge badge-overdue">
                          Overdue
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className={styles.progressSection}>
                  <div className={styles.progressHeader}>
                    <Text size={300} weight="semibold" style={{ color: tokens.colorNeutralForeground1 }}>
                      Loan Progress
                    </Text>
                    <Text size={300} weight="semibold" style={{ color: tokens.colorBrandForeground1 }}>
                      {progressPercentage.toFixed(1)}%
                    </Text>
                  </div>
                  <ProgressBar 
                    value={progressPercentage / 100}
                    color={progressPercentage >= 100 ? 'success' : 'brand'}
                  />
                </div>

                <div className={styles.loanDetails}>
                  <div className={styles.loanDetailItem}>
                    <Text className={styles.loanDetailLabel}>Current Balance</Text>
                    <Text className={styles.loanDetailValue}>
                      <ClickableNumber value={Number(loan.currentBalance)} />
                    </Text>
                  </div>
                  <div className={styles.loanDetailItem}>
                    <Text className={styles.loanDetailLabel}>Total Paid</Text>
                    <Text className={styles.loanDetailValue}>
                      <ClickableNumber value={Number(loan.totalPaid)} />
                    </Text>
                  </div>
                  <div className={styles.loanDetailItem}>
                    <Text className={styles.loanDetailLabel}>Interest Rate</Text>
                    <Text className={styles.loanDetailValue}>
                      {Number(loan.currentInterestRate || loan.originalInterestRate || 0).toFixed(2)}%
                    </Text>
                  </div>
                  <div className={styles.loanDetailItem}>
                    <Text className={styles.loanDetailLabel}>Account</Text>
                    <Text className={styles.loanDetailValue}>
                      {loan.account.name}
                    </Text>
                  </div>
                </div>

                <div className={styles.loanFooter}>
                  <div className={styles.footerInfo}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Clock24Regular style={{ fontSize: '16px', color: tokens.colorNeutralForeground2 }} />
                      <Text size={300} style={{ color: tokens.colorNeutralForeground2 }}>
                        {loan.nextPaymentDate ? `Next: ${formatDate(loan.nextPaymentDate)}` : 'No upcoming payments'}
                      </Text>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Info24Regular style={{ fontSize: '16px', color: tokens.colorNeutralForeground2 }} />
                      <Text size={300} style={{ color: tokens.colorNeutralForeground2 }}>
                        {(() => {
                          if (loan.remainingTermMonths !== null && loan.remainingTermMonths !== undefined) {
                            return `${loan.remainingTermMonths} months left`;
                          }
                          
                          // Calculate remaining months based on time elapsed
                          const startDate = new Date(loan.originalStartDate);
                          const currentDate = new Date();
                          
                          // More accurate month calculation
                          let monthsElapsed = (currentDate.getFullYear() - startDate.getFullYear()) * 12 + 
                                             (currentDate.getMonth() - startDate.getMonth());
                          
                          // Adjust for day difference
                          if (currentDate.getDate() < startDate.getDate()) {
                            monthsElapsed--;
                          }
                          
                          const remaining = Math.max(0, loan.originalTermMonths - monthsElapsed);
                          return `${remaining} months left`;
                        })()}
                      </Text>
                    </div>
                  </div>
                  <div className={styles.footerActions}>
                    <Button
                      size="small"
                      appearance="primary"
                      icon={<Money24Regular />}
                      onClick={() => {
                        setSelectedLoan(loan);
                        setShowPaymentDialog(true);
                      }}
                    >
                      Pay
                    </Button>
                    <Button 
                      size="small" 
                      appearance="secondary"
                      icon={<Edit24Regular />}
                      onClick={() => handleEditLoan(loan)}
                    >
                      Edit
                    </Button>
                    <Button 
                      size="small" 
                      appearance="secondary"
                      icon={<Delete24Regular />}
                      onClick={() => handleDeleteLoan(loan)}
                    >
                      Delete
                    </Button>
                    <Button 
                      size="small" 
                      appearance="secondary"
                      icon={<Calendar24Filled />}
                      onClick={() => handleViewScheduledPayments(loan)}
                    >
                      Schedule
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
          </div>
        )}
      </div>

      {/* Payment Dialog */}
      <Dialog open={showPaymentDialog} onOpenChange={(_, data) => setShowPaymentDialog(data.open)}>
        <DialogSurface>
          <DialogBody>
            <DialogTitle>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>Make Loan Payment</span>
                <Button 
                  appearance="subtle" 
                  icon={<Dismiss24Regular />} 
                  onClick={() => setShowPaymentDialog(false)}
                  style={{ minWidth: 'auto', padding: '4px' }}
                />
              </div>
            </DialogTitle>
            <DialogContent>
              {selectedLoan && (
                <div>
                  <Text size={400} weight="semibold" style={{ marginBottom: '15px', display: 'block' }}>
                    {selectedLoan.name}
                  </Text>
                  <div style={{ display: 'grid', gap: '15px' }}>
                    <Field label="Payment Amount" required>
                      <Input
                        type="number"
                        value={paymentData.amount}
                        onChange={(_, data) => {
                          setPaymentData({ ...paymentData, amount: data.value });
                          setPrePaymentScenario(null); // Clear previous calculation
                        }}
                        placeholder="Enter amount"
                      />
                    </Field>
                    
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                      <Button 
                        size="small" 
                        onClick={handlePrePaymentCalculation}
                        disabled={!paymentData.amount}
                      >
                        Calculate Pre-payment Benefits
                      </Button>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <input
                          type="checkbox"
                          checked={paymentData.isPrePayment}
                          onChange={(e) => setPaymentData({ ...paymentData, isPrePayment: e.target.checked })}
                        />
                        <Text size={300}>Mark as Pre-payment</Text>
                      </label>
                    </div>

                    {prePaymentScenario && (
                      <div style={{ 
                        backgroundColor: tokens.colorBrandBackground2, 
                        borderRadius: tokens.borderRadiusLarge,
                        padding: tokens.spacingVerticalM,
                        border: `1px solid ${tokens.colorBrandStroke1}`,
                        marginBottom: tokens.spacingVerticalM
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacingHorizontalXS, marginBottom: tokens.spacingVerticalM }}>
                          <Calculator24Regular style={{ fontSize: '20px', color: tokens.colorBrandForeground1 }} />
                          <Text size={400} weight="semibold" style={{ color: tokens.colorBrandForeground1 }}>
                            Pre-payment Benefits
                          </Text>
                        </div>
                        {prePaymentScenario.isFullPrePayment ? (
                          <div style={{ textAlign: 'center', padding: tokens.spacingVerticalM }}>
                            <CheckmarkCircle24Regular style={{ fontSize: '32px', color: tokens.colorStatusSuccessForeground1, marginBottom: tokens.spacingVerticalXS }} />
                            <Text size={400} weight="semibold" style={{ color: tokens.colorStatusSuccessForeground1, display: 'block', marginBottom: tokens.spacingVerticalXS }}>
                              🎉 Full Loan Payoff!
                            </Text>
                            <Text size={300} style={{ color: tokens.colorBrandForeground1 }}>
                              Interest savings: <ClickableNumber value={prePaymentScenario.interestSavings} />
                            </Text>
                          </div>
                        ) : (
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: tokens.spacingHorizontalM }}>
                            <div>
                              <Text size={300} style={{ color: tokens.colorBrandForeground1 }}>Interest Savings</Text>
                              <Text size={400} weight="semibold" style={{ color: tokens.colorStatusSuccessForeground1 }}>
                                <ClickableNumber value={prePaymentScenario.interestSavings} />
                              </Text>
                            </div>
                            <div>
                              <Text size={300} style={{ color: tokens.colorBrandForeground1 }}>Term Reduction</Text>
                              <Text size={400} weight="semibold" style={{ color: tokens.colorBrandForeground1 }}>
                                {prePaymentScenario.termReduction} months
                              </Text>
                            </div>
                            <div>
                              <Text size={300} style={{ color: tokens.colorBrandForeground1 }}>New Balance</Text>
                              <Text size={400} weight="semibold" style={{ color: tokens.colorBrandForeground1 }}>
                                <ClickableNumber value={prePaymentScenario.newBalance} />
                              </Text>
                            </div>
                            <div>
                              <Text size={300} style={{ color: tokens.colorBrandForeground1 }}>Remaining Term</Text>
                              <Text size={400} weight="semibold" style={{ color: tokens.colorBrandForeground1 }}>
                                {prePaymentScenario.newTerm} months
                              </Text>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    <Field label="Payment Date" required>
                      <Input
                        type="date"
                        value={paymentData.paymentDate}
                        onChange={(_, data) => setPaymentData({ ...paymentData, paymentDate: data.value })}
                      />
                    </Field>
                    <Field label="Description">
                      <Input
                        value={paymentData.description}
                        onChange={(_, data) => setPaymentData({ ...paymentData, description: data.value })}
                        placeholder="Optional description"
                      />
                    </Field>
                  </div>
                </div>
              )}
            </DialogContent>
            <DialogActions>
              <DialogTrigger disableButtonEnhancement>
                <Button appearance="secondary">Cancel</Button>
              </DialogTrigger>
              <Button appearance="primary" onClick={handleMakePayment}>
                Make Payment
              </Button>
            </DialogActions>
          </DialogBody>
        </DialogSurface>
      </Dialog>

      {/* Scheduled Payments Dialog */}
      <Dialog open={showScheduledPaymentsDialog} onOpenChange={(_, data) => setShowScheduledPaymentsDialog(data.open)}>
        <DialogSurface>
          <DialogBody>
            <DialogTitle>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Calendar24Filled />
                  <span>Scheduled Payments - {selectedLoan?.name}</span>
                </div>
                <Button 
                  appearance="subtle" 
                  icon={<Dismiss24Regular />} 
                  onClick={() => setShowScheduledPaymentsDialog(false)}
                  style={{ minWidth: 'auto', padding: '4px' }}
                />
              </div>
            </DialogTitle>
            <div style={{ marginBottom: '20px' }}>
              <Button 
                appearance="primary" 
                onClick={() => selectedLoan && handleCreateScheduledPayments(selectedLoan.id)}
              >
                <Add24Regular /> Create Scheduled Payments
              </Button>
            </div>
            <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
              {scheduledPayments.map((payment, index) => (
                <div key={payment.id || index} style={{ 
                  padding: '12px', 
                  border: '1px solid #ddd', 
                  borderRadius: '8px', 
                  marginBottom: '8px',
                  backgroundColor: payment.status === 'SCHEDULED' ? '#f0f8ff' : 
                                 payment.status === 'COMPLETED' ? '#f0fff0' :
                                 payment.status === 'DEFAULTED' ? '#fff0f0' : '#f5f5f5'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <Text weight="semibold">
                        {formatCurrency(Number(payment.amount))}
                      </Text>
                      <Text size={200} style={{ color: '#666', display: 'block' }}>
                        Due: {new Date(payment.scheduledDate || payment.paymentDate).toLocaleDateString()}
                      </Text>
                      <Text size={200} style={{ color: '#666' }}>
                        Status: {payment.status}
                      </Text>
                    </div>
                    <div>
                      {payment.status === 'SCHEDULED' && (
                        <Button 
                          size="small" 
                          appearance="secondary"
                          onClick={() => {
                            const reason = prompt('Reason for cancellation:');
                            if (reason) {
                              handleDeleteScheduledPayment(payment.id, reason);
                            }
                          }}
                        >
                          <Delete24Regular /> Cancel
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </DialogBody>
        </DialogSurface>
      </Dialog>

      {/* Overdue Payments Dialog */}
      <Dialog open={showOverduePaymentsDialog} onOpenChange={(_, data) => setShowOverduePaymentsDialog(data.open)}>
        <DialogSurface>
          <DialogBody>
            <DialogTitle>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Warning24Filled />
                  <span>Overdue Payments</span>
                </div>
                <Button 
                  appearance="subtle" 
                  icon={<Dismiss24Regular />} 
                  onClick={() => setShowOverduePaymentsDialog(false)}
                  style={{ minWidth: 'auto', padding: '4px' }}
                />
              </div>
            </DialogTitle>
            <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
              {overduePayments.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
                  <CheckmarkCircle24Filled style={{ fontSize: '48px', color: '#4CAF50', marginBottom: '16px' }} />
                  <Text size={400}>No overdue payments found!</Text>
                </div>
              ) : (
                overduePayments.map((payment, index) => (
                  <div key={payment.id || index} style={{ 
                    padding: '12px', 
                    border: '1px solid #ff6b6b', 
                    borderRadius: '8px', 
                    marginBottom: '8px',
                    backgroundColor: '#fff5f5'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <Text weight="semibold" style={{ color: '#d32f2f' }}>
                          {formatCurrency(Number(payment.amount))} - {payment.loan?.name}
                        </Text>
                        <Text size={200} style={{ color: '#666', display: 'block' }}>
                          Due: {new Date(payment.scheduledDate).toLocaleDateString()}
                        </Text>
                        <Text size={200} style={{ color: '#666' }}>
                          Days overdue: {Math.ceil((new Date().getTime() - new Date(payment.scheduledDate).getTime()) / (1000 * 60 * 60 * 24))}
                        </Text>
                      </div>
                      <div>
                        <Button 
                          size="small" 
                          appearance="secondary"
                          onClick={() => {
                            const reason = prompt('Reason for cancellation:');
                            if (reason) {
                              handleDeleteScheduledPayment(payment.id, reason);
                            }
                          }}
                        >
                          <Delete24Regular /> Cancel
                        </Button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </DialogBody>
        </DialogSurface>
      </Dialog>

      {/* Analytics Panel */}
      {showAnalyticsDialog && (
        <div className="loans-analytics-panel">
          <div className="loans-analytics-panel-header">
            <div className="loans-analytics-panel-title">
              <ChartMultiple24Regular />
              <span>Loan Analytics</span>
            </div>
            <Button 
              appearance="subtle" 
              icon={<Dismiss24Regular />} 
              onClick={() => setShowAnalyticsDialog(false)}
            />
          </div>
          <div className="loans-analytics-panel-content">
            <div className="loans-analytics-grid">
              <div className="loans-analytics-card">
                <h3>Loan Distribution</h3>
                <div className="loans-analytics-item">
                  <span>Personal Loans:</span>
                  <span>{loans.filter(loan => loan.type === 'PERSONAL').length}</span>
                </div>
                <div className="loans-analytics-item">
                  <span>Home Loans:</span>
                  <span>{loans.filter(loan => loan.type === 'HOME').length}</span>
                </div>
                <div className="loans-analytics-item">
                  <span>Car Loans:</span>
                  <span>{loans.filter(loan => loan.type === 'CAR').length}</span>
                </div>
                <div className="loans-analytics-item">
                  <span>Other Loans:</span>
                  <span>{loans.filter(loan => !['PERSONAL', 'HOME', 'CAR'].includes(loan.type)).length}</span>
                </div>
              </div>

              <div className="loans-analytics-card">
                <h3>Payment Status</h3>
                <div className="loans-analytics-item">
                  <span>Active Loans:</span>
                  <span>{loans.filter(loan => loan.status === 'ACTIVE').length}</span>
                </div>
                <div className="loans-analytics-item">
                  <span>Paid Off:</span>
                  <span>{loans.filter(loan => loan.status === 'PAID_OFF').length}</span>
                </div>
                <div className="loans-analytics-item">
                  <span>Defaulted:</span>
                  <span>{loans.filter(loan => loan.status === 'DEFAULTED').length}</span>
                </div>
                <div className="loans-analytics-item">
                  <span>Refinanced:</span>
                  <span>{loans.filter(loan => loan.status === 'REFINANCED').length}</span>
                </div>
              </div>

              <div className="loans-analytics-card">
                <h3>Financial Overview</h3>
                <div className="loans-analytics-item">
                  <span>Total Outstanding:</span>
                  <span className="loans-analytics-value loans-outstanding">
                    <ClickableNumber value={summary?.totalOutstanding || 0} />
                  </span>
                </div>
                <div className="loans-analytics-item">
                  <span>Total Paid:</span>
                  <span className="loans-analytics-value loans-paid">
                    <ClickableNumber value={summary?.totalPaid || 0} />
                  </span>
                </div>
                <div className="loans-analytics-item">
                  <span>Monthly Payments:</span>
                  <span className="loans-analytics-value loans-monthly">
                    <ClickableNumber value={summary?.monthlyPayments || 0} />
                  </span>
                </div>
                <div className="loans-analytics-item">
                  <span>Total Loans:</span>
                  <span className="loans-analytics-value loans-total">
                    {summary?.totalLoans || 0}
                  </span>
                </div>
              </div>

              <div className="loans-analytics-card">
                <h3>Loan Insights</h3>
                <div className="loans-analytics-item">
                  <span>Avg Loan Amount:</span>
                  <span className="loans-analytics-value">
                    <ClickableNumber value={loans.length > 0 ? loans.reduce((sum, loan) => sum + Number(loan.originalPrincipal), 0) / loans.length : 0} />
                  </span>
                </div>
                <div className="loans-analytics-item">
                  <span>Avg Interest Rate:</span>
                  <span className="loans-analytics-value">
                    {loans.length > 0 ? (loans.reduce((sum, loan) => sum + Number(loan.originalInterestRate || 0), 0) / loans.length).toFixed(2) : 0}%
                  </span>
                </div>
                <div className="loans-analytics-item">
                  <span>Avg Term:</span>
                  <span className="loans-analytics-value">
                    {loans.length > 0 ? Math.round(loans.reduce((sum, loan) => sum + loan.originalTermMonths, 0) / loans.length) : 0} months
                  </span>
                </div>
                <div className="loans-analytics-item">
                  <span>Completion Rate:</span>
                  <span className="loans-analytics-value">
                    {loans.length > 0 ? ((loans.filter(loan => loan.status === 'PAID_OFF').length / loans.length) * 100).toFixed(1) : 0}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* EMI Calculator Panel */}
      {showEMICalculatorDialog && (
        <div className="loans-emi-panel">
          <div className="loans-emi-panel-header">
            <div className="loans-emi-panel-title">
              <Calculator24Regular />
              <span>EMI Calculator</span>
            </div>
            <Button 
              appearance="subtle" 
              icon={<Dismiss24Regular />} 
              onClick={() => setShowEMICalculatorDialog(false)}
            />
          </div>
          <div className="loans-emi-panel-content">
            <div className="loans-emi-calculator-grid">
              <Field label="Loan Amount (Principal)" required>
                <Input
                  type="number"
                  value={emiCalculatorData.principal}
                  onChange={(_, data) => setEmiCalculatorData(prev => ({ ...prev, principal: data.value }))}
                  placeholder="Enter loan amount"
                />
              </Field>

              <Field label="Annual Interest Rate (%)" required>
                <Input
                  type="number"
                  value={emiCalculatorData.interestRate}
                  onChange={(_, data) => setEmiCalculatorData(prev => ({ ...prev, interestRate: data.value }))}
                  placeholder="Enter interest rate"
                />
              </Field>

              <Field label="Loan Term (Months)" required>
                <Input
                  type="number"
                  value={emiCalculatorData.termMonths}
                  onChange={(_, data) => setEmiCalculatorData(prev => ({ ...prev, termMonths: data.value }))}
                  placeholder="Enter term in months"
                />
              </Field>

              <div className="loans-emi-buttons">
                <Button appearance="primary" onClick={handleCalculateEMI}>
                  Calculate EMI
                </Button>
                <Button appearance="secondary" onClick={resetEMICalculator}>
                  Reset
                </Button>
              </div>
            </div>

            {emiCalculatorData.emi > 0 && (
              <div className="loans-emi-results">
                <h3>EMI Calculation Results</h3>
                <div className="loans-emi-results-grid">
                  <div className="loans-emi-result-item">
                    <div className="loans-emi-result-value loans-emi-amount">
                      ₹{emiCalculatorData.emi.toLocaleString()}
                    </div>
                    <div className="loans-emi-result-label">Monthly EMI</div>
                  </div>
                  <div className="loans-emi-result-item">
                    <div className="loans-emi-result-value loans-emi-total">
                      ₹{emiCalculatorData.totalAmount.toLocaleString()}
                    </div>
                    <div className="loans-emi-result-label">Total Amount</div>
                  </div>
                  <div className="loans-emi-result-item">
                    <div className="loans-emi-result-value loans-emi-interest">
                      ₹{emiCalculatorData.totalInterest.toLocaleString()}
                    </div>
                    <div className="loans-emi-result-label">Total Interest</div>
                  </div>
                </div>
              </div>
            )}

            <div className="loans-emi-tips">
              <h4>💡 EMI Tips</h4>
              <ul>
                <li>Lower interest rates reduce your EMI and total interest</li>
                <li>Shorter loan terms increase EMI but reduce total interest</li>
                <li>Consider pre-payments to reduce total interest burden</li>
                <li>Compare different loan offers before finalizing</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Loans;
