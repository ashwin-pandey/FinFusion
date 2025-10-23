import React, { useState, useEffect } from 'react';
import { useAccounts } from '../hooks/useAccounts';
import { useCurrency, CURRENCIES } from '../contexts/CurrencyContext';
import ClickableNumber from '../components/ClickableNumber';
import { CreateAccountData, UpdateAccountData, Account } from '../services/accountService';
import AccountCard from '../components/Cards/AccountCard';
import {
  Button,
  Input,
  Select,
  Option,
  Dialog,
  DialogTrigger,
  DialogSurface,
  DialogTitle,
  DialogBody,
  DialogActions,
  DialogContent,
  Field,
  Text,
  Spinner,
  MessageBar,
  MessageBarBody,
  MessageBarTitle,
  MessageBarIntent
} from '@fluentui/react-components';
import {
  Add24Regular,
  BuildingBank24Regular,
  Money24Regular,
  CreditCardClock24Regular,
  MoneyHand24Regular,
  ChartMultiple24Regular,
  Home24Regular,
  Document24Regular
} from '@fluentui/react-icons';
import './Accounts.css';


const Accounts: React.FC = () => {
  const { 
    accounts, 
    summary, 
    isLoading, 
    error, 
    fetchAccounts, 
    createAccount, 
    updateAccount, 
    deleteAccount, 
    fetchAccountSummary,
    clearError 
  } = useAccounts();
  
  const { currency, formatCurrency } = useCurrency();
  const [showModal, setShowModal] = useState(false);
  const [editingAccount, setEditingAccount] = useState<any>(null);
  const [formData, setFormData] = useState<CreateAccountData>({
    name: '',
    type: 'CHECKING',
    balance: 0,
    currency: 'USD'
  });
  const [filters, setFilters] = useState({
    type: '',
    search: ''
  });

  useEffect(() => {
    fetchAccounts(filters);
    fetchAccountSummary();
  }, [filters]);

  const resetForm = () => {
    setFormData({
      name: '',
      type: 'CHECKING',
      balance: 0,
      currency: 'USD'
    });
    setEditingAccount(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form data
    if (!formData.name.trim()) {
      alert('Please enter an account name');
      return;
    }

    try {
      if (editingAccount) {
        await updateAccount(editingAccount.id, formData);
      } else {
        await createAccount(formData);
      }
      // Refresh account summary after successful update/create
      await fetchAccountSummary();
      resetForm();
      setShowModal(false);
    } catch (error) {
      console.error('Failed to save account:', error);
      alert('Failed to save account. Please try again.');
    }
  };

  const handleEdit = (account: any) => {
    setEditingAccount(account);
    setFormData({
      name: account.name,
      type: account.type,
      balance: account.balance,
      currency: account.currency
    });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this account? This action cannot be undone.')) {
      try {
        await deleteAccount(id);
        // Refresh account summary after successful deletion
        await fetchAccountSummary();
      } catch (error) {
        console.error('Failed to delete account:', error);
        alert('Failed to delete account. Please try again.');
      }
    }
  };

  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const getAccountTypeIcon = (type: string) => {
    const icons: { [key: string]: React.ReactNode } = {
      CHECKING: <BuildingBank24Regular />,
      SAVINGS: <Money24Regular />,
      CREDIT_CARD: <CreditCardClock24Regular />,
      CASH: <MoneyHand24Regular />,
      INVESTMENT: <ChartMultiple24Regular />,
      LOAN: <Home24Regular />,
      OTHER: <Document24Regular />
    };
    return icons[type] || <Document24Regular />;
  };

  const getAccountTypeColor = (type: string) => {
    const colors: { [key: string]: string } = {
      CHECKING: '#e3f2fd',
      SAVINGS: '#e8f5e9',
      CREDIT_CARD: '#fff3e0',
      CASH: '#f3e5f5',
      INVESTMENT: '#e0f2f1',
      LOAN: '#ffebee',
      OTHER: '#f5f5f5'
    };
    return colors[type] || '#f5f5f5';
  };

  if (isLoading && accounts.length === 0) {
    return (
      <div className="loading-container">
        <Spinner size="large" label="Loading accounts..." />
      </div>
    );
  }

  return (
    <div className="accounts-page">
      <div className="page-header">
        <h1>Account Management</h1>
        <div className="page-actions">
            <button
            className="action-btn edit-btn"
            onClick={() => {
                setEditingAccount(null);
                resetForm();
                setShowModal(true);
            }}
            >
            <Add24Regular /> Add Account
            </button>
        </div>
      </div>

      {error && (
        <MessageBar intent="error">
          <MessageBarBody>
            <MessageBarTitle>Error</MessageBarTitle>
            {error.includes('400') || error.includes('Bad Request') 
              ? 'Unable to load accounts. This might be because the account feature is not yet set up in the database. Please try again later or contact support.'
              : error
            }
          </MessageBarBody>
          <Button appearance="transparent" onClick={clearError}>Dismiss</Button>
        </MessageBar>
      )}

      {/* Account Summary */}
      {summary && !error && (
        <div className="summary-card">
          <div className="summary-content">
            <div className="total-balance">
              <div className="balance-icon">💰</div>
              <div className="balance-info">
                <h2><ClickableNumber value={summary.totalBalance} /></h2>
                <p>Total Balance</p>
              </div>
            </div>
            <div className="summary-stats">
              <div className="stat-item">
                <span className="stat-number">{summary.accountsByType.checking}</span>
                <span className="stat-label">Checking</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">{summary.accountsByType.savings}</span>
                <span className="stat-label">Savings</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">{summary.accountsByType.creditCard}</span>
                <span className="stat-label">Credit Cards</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">{summary.accountsByType.cash}</span>
                <span className="stat-label">Cash</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="filters-section">
        <div className="filter-group">
          <label><Text weight="semibold">Account Type</Text></label>
          <select
            value={filters.type}
            onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value }))}
            className="fluent-select"
          >
            <option value="">All Types</option>
            <option value="CHECKING">Checking</option>
            <option value="SAVINGS">Savings</option>
            <option value="CREDIT_CARD">Credit Card</option>
            <option value="CASH">Cash</option>
            <option value="INVESTMENT">Investment</option>
            <option value="LOAN">Loan</option>
            <option value="OTHER">Other</option>
          </select>
        </div>
        <div className="filter-group">
          <label><Text weight="semibold">Search</Text></label>
          <input
            type="text"
            placeholder="Search accounts..."
            value={filters.search}
            onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
            className="fluent-input"
          />
        </div>
      </div>

      {/* Accounts List */}
      <div className="accounts-grid">
        {accounts.length === 0 ? (
          <div className="empty-state">
            <Text size={400} color="neutral">No accounts found. Create your first account to get started!</Text>
          </div>
        ) : (
          accounts.map((account: Account) => (
            <AccountCard
              key={account.id}
              id={account.id}
              name={account.name}
              type={account.type}
              balance={account.balance}
              currency={account.currency}
              icon={getAccountTypeIcon(account.type)}
              iconColor={getAccountTypeColor(account.type)}
              onEdit={handleEdit}
              onDelete={handleDelete}
              formatCurrency={formatCurrency}
            />
          ))
        )}
      </div>

      {/* Add/Edit Account Modal */}
      <Dialog open={showModal} onOpenChange={(_, data) => {
        if (!data.open) {
          setShowModal(false);
          setEditingAccount(null);
          resetForm();
        }
      }}>
        <DialogSurface>
          <DialogBody>
            <DialogTitle>{editingAccount ? 'Edit Account' : 'Add New Account'}</DialogTitle>
            <DialogContent>
              <form onSubmit={handleSubmit}>
                <Field label="Account Name" required>
                  <Input
                    value={formData.name}
                    onChange={(_, data) => setFormData({ ...formData, name: data.value })}
                    required
                  />
                </Field>
                <Field label="Account Type" required>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                    required
                    className="fluent-select"
                  >
                    <option value="CHECKING">Checking</option>
                    <option value="SAVINGS">Savings</option>
                    <option value="CREDIT_CARD">Credit Card</option>
                    <option value="CASH">Cash</option>
                    <option value="INVESTMENT">Investment</option>
                    <option value="LOAN">Loan</option>
                    <option value="OTHER">Other</option>
                  </select>
                </Field>
                <Field label="Initial Balance">
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.balance?.toString() || '0'}
                    onChange={(_, data) => setFormData({ ...formData, balance: parseFloat(data.value) || 0 })}
                  />
                </Field>
                <Field label="Currency">
                  <select
                    value={formData.currency}
                    onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                    className="fluent-select"
                  >
                    {CURRENCIES.map((curr) => (
                      <option key={curr.code} value={curr.code}>
                        {curr.symbol} {curr.code} - {curr.name}
                      </option>
                    ))}
                  </select>
                </Field>
              </form>
            </DialogContent>
            <DialogActions>
              <DialogTrigger disableButtonEnhancement>
                <Button appearance="secondary">Cancel</Button>
              </DialogTrigger>
              <Button appearance="primary" onClick={handleSubmit}>
                {editingAccount ? 'Update Account' : 'Create Account'}
              </Button>
            </DialogActions>
          </DialogBody>
        </DialogSurface>
      </Dialog>
    </div>
  );
};

export default Accounts;
