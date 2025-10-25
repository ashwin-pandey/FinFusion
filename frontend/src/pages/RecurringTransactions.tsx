import React, { useState } from 'react';
import { useRecurringTransactions, CreateRecurringTransactionData } from '../hooks/useRecurringTransactions';
import { useCategories } from '../hooks/useCategories';
import { useAccounts } from '../hooks/useAccounts';
import { useCurrency } from '../contexts/CurrencyContext';
import {
  Button,
  Dialog,
  DialogSurface,
  DialogBody,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogTrigger,
  Field,
  Input,
  Select,
  Option,
  Textarea,
  Text,
  Spinner,
  MessageBar,
  MessageBarBody,
  MessageBarTitle,
  MessageBarIntent,
  makeStyles,
  tokens,
  shorthands
} from '@fluentui/react-components';
import {
  Add24Regular,
  Edit24Regular,
  Delete24Regular,
  Calendar24Regular,
  Replay24Regular
} from '@fluentui/react-icons';
import './RecurringTransactions.css';

const useStyles = makeStyles({
  container: {
    padding: tokens.spacingVerticalL,
    maxWidth: '1400px',
    margin: '0 auto'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: tokens.spacingVerticalL,
    ...shorthands.padding(tokens.spacingVerticalM, 0)
  },
  title: {
    fontSize: tokens.fontSizeHero900,
    fontWeight: tokens.fontWeightBold,
    color: tokens.colorNeutralForeground1
  },
  addButton: {
    minWidth: '200px'
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
    gap: tokens.spacingHorizontalM,
    marginBottom: tokens.spacingVerticalL
  },
  card: {
    backgroundColor: tokens.colorNeutralBackground1,
    border: `1px solid ${tokens.colorNeutralStroke2}`,
    borderRadius: tokens.borderRadiusMedium,
    ...shorthands.padding(tokens.spacingVerticalM),
    boxShadow: tokens.shadow4,
    transition: 'transform 0.2s, box-shadow 0.2s',
    '&:hover': {
      transform: 'translateY(-2px)',
      boxShadow: tokens.shadow8
    }
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: tokens.spacingVerticalM
  },
  cardTitle: {
    fontSize: tokens.fontSizeBase500,
    fontWeight: tokens.fontWeightSemibold,
    color: tokens.colorNeutralForeground1,
    marginBottom: tokens.spacingVerticalXS
  },
  cardAmount: {
    fontSize: tokens.fontSizeBase600,
    fontWeight: tokens.fontWeightBold,
    color: tokens.colorBrandForeground1
  },
  cardDetails: {
    marginBottom: tokens.spacingVerticalM
  },
  cardDetail: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: tokens.spacingVerticalXS,
    fontSize: tokens.fontSizeBase300
  },
  cardLabel: {
    color: tokens.colorNeutralForeground2,
    fontWeight: tokens.fontWeightMedium
  },
  cardValue: {
    color: tokens.colorNeutralForeground1,
    fontWeight: tokens.fontWeightRegular
  },
  cardActions: {
    display: 'flex',
    gap: tokens.spacingHorizontalS,
    justifyContent: 'flex-end'
  },
  emptyState: {
    textAlign: 'center',
    ...shorthands.padding(tokens.spacingVerticalXXL),
    color: tokens.colorNeutralForeground3
  },
  loadingContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '200px'
  }
});

const RecurringTransactions: React.FC = () => {
  const styles = useStyles();
  const { recurringTransactions, isLoading, error, createRecurringTransaction, deleteRecurringTransaction, clearError } = useRecurringTransactions();
  const { categories } = useCategories();
  const { accounts } = useAccounts();
  const { formatCurrency } = useCurrency();
  
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<any>(null);
  const [formData, setFormData] = useState<CreateRecurringTransactionData>({
    amount: 0,
    type: 'EXPENSE',
    categoryId: '',
    accountId: '',
    description: '',
    recurringFrequency: 'MONTHLY',
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    paymentMethod: 'CASH'
  });

  const handleCreate = async () => {
    try {
      await createRecurringTransaction(formData);
      setIsCreateModalOpen(false);
      setFormData({
        amount: 0,
        type: 'EXPENSE',
        categoryId: '',
        accountId: '',
        description: '',
        recurringFrequency: 'MONTHLY',
        startDate: new Date().toISOString().split('T')[0],
        endDate: '',
        paymentMethod: 'CASH'
      });
    } catch (error) {
      console.error('Error creating recurring transaction:', error);
    }
  };

  const handleEdit = (transaction: any) => {
    setEditingTransaction(transaction);
    setFormData({
      amount: transaction.amount,
      type: transaction.type,
      categoryId: transaction.categoryId,
      accountId: transaction.accountId || '',
      description: transaction.description,
      recurringFrequency: transaction.recurringFrequency,
      startDate: transaction.startDate.split('T')[0],
      endDate: transaction.endDate ? transaction.endDate.split('T')[0] : '',
      paymentMethod: transaction.paymentMethod || 'CASH'
    });
    setIsEditModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this recurring transaction?')) {
      try {
        await deleteRecurringTransaction(id);
      } catch (error) {
        console.error('Error deleting recurring transaction:', error);
      }
    }
  };

  const getFrequencyText = (frequency: string) => {
    const frequencyMap: { [key: string]: string } = {
      'DAILY': 'Daily',
      'WEEKLY': 'Weekly',
      'MONTHLY': 'Monthly',
      'QUARTERLY': 'Quarterly',
      'YEARLY': 'Yearly'
    };
    return frequencyMap[frequency] || frequency;
  };

  const getCategoryName = (categoryId: string) => {
    const category = categories.find(c => c.id === categoryId);
    return category ? category.name : 'Unknown Category';
  };

  const getAccountName = (accountId?: string) => {
    if (!accountId) return 'No Account';
    const account = accounts.find((a: any) => a.id === accountId);
    return account ? account.name : 'Unknown Account';
  };

  if (isLoading) {
    return (
      <div className={styles.loadingContainer}>
        <Text>Loading recurring transactions...</Text>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.container}>
        <Text style={{ color: 'red' }}>Error: {error}</Text>
      </div>
    );
  }

  if (isLoading && recurringTransactions.length === 0) {
    return (
      <div className="loading-container">
        <Spinner size="large" label="Loading recurring transactions..." />
      </div>
    );
  }

  return (
    <div className="recurring-transactions-page">
      <div className="page-header">
        <h1>Recurring Transactions</h1>
        <div className="page-actions">
          <button
            className="action-btn edit-btn"
            onClick={() => setIsCreateModalOpen(true)}
          >
            <Add24Regular /> Add Recurring Transaction
          </button>
        </div>
      </div>

      {error && (
        <MessageBar intent="error">
          <MessageBarBody>
            <MessageBarTitle>Error</MessageBarTitle>
            {error}
          </MessageBarBody>
          <Button appearance="transparent" onClick={clearError}>Dismiss</Button>
        </MessageBar>
      )}

      {/* Summary Section */}
      {/* {recurringTransactions.length > 0 && ( */}
        <div className="summary-card">
          <div className="summary-content">
            <div className="total-balance">
              <div className="balance-icon">🔄</div>
              <div className="balance-info">
                <h2>{recurringTransactions.length}</h2>
                <p>Active Recurring Transactions</p>
              </div>
            </div>
            <div className="summary-stats">
              <div className="stat-item">
                <span className="stat-number">
                  {recurringTransactions.filter(t => t.type === 'EXPENSE').length}
                </span>
                <span className="stat-label">Expenses</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">
                  {recurringTransactions.filter(t => t.type === 'INCOME').length}
                </span>
                <span className="stat-label">Income</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">
                  {recurringTransactions.filter(t => t.recurringFrequency === 'MONTHLY').length}
                </span>
                <span className="stat-label">Monthly</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">
                  {recurringTransactions.filter(t => t.recurringFrequency === 'WEEKLY').length}
                </span>
                <span className="stat-label">Weekly</span>
              </div>
            </div>
          </div>
        </div>
      {/* )} */}

      {/* Recurring Transactions Grid */}
      {recurringTransactions.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">🔄</div>
          <h3>No Recurring Transactions</h3>
          <p>Create your first recurring transaction to automate your finances.</p>
          <button
            className="action-btn edit-btn"
            onClick={() => setIsCreateModalOpen(true)}
          >
            <Add24Regular /> Add Recurring Transaction
          </button>
        </div>
      ) : (
        <div className="recurring-transactions-grid">
          {recurringTransactions.map((transaction) => (
            <div key={transaction.id} className="recurring-transaction-card">
              <div className="card-header">
                <div>
                  <h3>{transaction.description || 'Recurring Transaction'}</h3>
                  <p className="card-amount">{formatCurrency(transaction.amount)}</p>
                </div>
                <div className="card-actions">
                  <button
                    className="action-btn edit-btn"
                    onClick={() => handleEdit(transaction)}
                  >
                    <Edit24Regular />
                  </button>
                  <button
                    className="action-btn delete-btn"
                    onClick={() => handleDelete(transaction.id)}
                  >
                    <Delete24Regular />
                  </button>
                </div>
              </div>
              
              <div className="card-details">
                <div className="card-detail">
                  <span className="card-label">Type:</span>
                  <span className="card-value">{transaction.type}</span>
                </div>
                <div className="card-detail">
                  <span className="card-label">Category:</span>
                  <span className="card-value">{getCategoryName(transaction.categoryId)}</span>
                </div>
                <div className="card-detail">
                  <span className="card-label">Account:</span>
                  <span className="card-value">{getAccountName(transaction.accountId)}</span>
                </div>
                <div className="card-detail">
                  <span className="card-label">Frequency:</span>
                  <span className="card-value">{getFrequencyText(transaction.recurringFrequency)}</span>
                </div>
                <div className="card-detail">
                  <span className="card-label">Start Date:</span>
                  <span className="card-value">
                    {new Date(transaction.startDate).toLocaleDateString()}
                  </span>
                </div>
                {transaction.endDate && (
                  <div className="card-detail">
                    <span className="card-label">End Date:</span>
                    <span className="card-value">
                      {new Date(transaction.endDate).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      <Dialog open={isCreateModalOpen} onOpenChange={(_, data) => setIsCreateModalOpen(data.open)}>
        <DialogSurface>
          <DialogBody>
            <DialogTitle>Create Recurring Transaction</DialogTitle>
            <DialogContent>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <Field label="Amount" required>
                  <Input
                    type="number"
                    value={formData.amount.toString()}
                    onChange={(_, data) => setFormData({ ...formData, amount: parseFloat(data.value) || 0 })}
                    placeholder="0.00"
                  />
                </Field>
                
                <Field label="Type" required>
                  <Select
                    value={formData.type}
                    onChange={(_, data) => setFormData({ ...formData, type: data.value as 'INCOME' | 'EXPENSE' })}
                  >
                    <Option value="INCOME">Income</Option>
                    <Option value="EXPENSE">Expense</Option>
                  </Select>
                </Field>
                
                <Field label="Category" required>
                  <Select
                    value={formData.categoryId}
                    onChange={(_, data) => setFormData({ ...formData, categoryId: data.value })}
                  >
                    {categories.map(category => (
                      <Option key={category.id} value={category.id}>
                        {category.name}
                      </Option>
                    ))}
                  </Select>
                </Field>
                
                <Field label="Account">
                  <Select
                    value={formData.accountId}
                    onChange={(_, data) => setFormData({ ...formData, accountId: data.value })}
                  >
                    <Option value="">No Account</Option>
                    {accounts.map((account: any) => (
                      <Option key={account.id} value={account.id}>
                        {account.name}
                      </Option>
                    ))}
                  </Select>
                </Field>
                
                <Field label="Description">
                  <Textarea
                    value={formData.description}
                    onChange={(_, data) => setFormData({ ...formData, description: data.value })}
                    placeholder="Enter description..."
                  />
                </Field>
                
                <Field label="Frequency" required>
                  <Select
                    value={formData.recurringFrequency}
                    onChange={(_, data) => setFormData({ ...formData, recurringFrequency: data.value as any })}
                  >
                    <Option value="DAILY">Daily</Option>
                    <Option value="WEEKLY">Weekly</Option>
                    <Option value="MONTHLY">Monthly</Option>
                    <Option value="QUARTERLY">Quarterly</Option>
                    <Option value="YEARLY">Yearly</Option>
                  </Select>
                </Field>
                
                <Field label="Start Date" required>
                  <Input
                    type="date"
                    value={formData.startDate}
                    onChange={(_, data) => setFormData({ ...formData, startDate: data.value })}
                  />
                </Field>
                
                <Field label="End Date">
                  <Input
                    type="date"
                    value={formData.endDate}
                    onChange={(_, data) => setFormData({ ...formData, endDate: data.value })}
                  />
                </Field>
                
                <Field label="Payment Method">
                  <Select
                    value={formData.paymentMethod}
                    onChange={(_, data) => setFormData({ ...formData, paymentMethod: data.value as any })}
                  >
                    <Option value="CASH">Cash</Option>
                    <Option value="CARD">Card</Option>
                    <Option value="BANK_TRANSFER">Bank Transfer</Option>
                    <Option value="UPI">UPI</Option>
                    <Option value="OTHER">Other</Option>
                  </Select>
                </Field>
              </div>
            </DialogContent>
            <DialogActions>
              <Button appearance="secondary" onClick={() => setIsCreateModalOpen(false)}>
                Cancel
              </Button>
              <Button appearance="primary" onClick={handleCreate}>
                Create
              </Button>
            </DialogActions>
          </DialogBody>
        </DialogSurface>
      </Dialog>
    </div>
  );
};

export default RecurringTransactions;
