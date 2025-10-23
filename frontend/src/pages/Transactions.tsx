import React, { useState, useEffect, useRef } from 'react';
import { useTransactions } from '../hooks/useTransactions';
import { useCategories } from '../hooks/useCategories';
import { useAccounts } from '../hooks/useAccounts';
import { useCurrency } from '../contexts/CurrencyContext';
import ClickableNumber from '../components/ClickableNumber';
import { Account } from '../services/accountService';
import { formatDate, formatPaymentMethod } from '../utils/formatters';
import { Transaction } from '../types';
import { exportToCSV } from '../utils/exportHelpers';
import transactionService from '../services/transactionService';
import { Button, Input, Select, Option, Text, makeStyles, tokens } from '@fluentui/react-components';
import { 
  ArrowClockwise24Regular, 
  ArrowDownload24Regular, 
  ArrowUpload24Regular, 
  Add24Regular,
  Edit24Regular,
  Delete24Regular,
  ChevronLeft24Regular,
  ChevronRight24Regular
} from '@fluentui/react-icons';
import './Transactions.css';

const useStyles = makeStyles({
  pageActions: {
    display: 'flex',
    gap: tokens.spacingHorizontalM,
    flexWrap: 'wrap',
    alignItems: 'center',
  },
  actionButtons: {
    display: 'flex',
    gap: tokens.spacingHorizontalS,
  },
  pagination: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalM,
    justifyContent: 'center',
    marginTop: tokens.spacingVerticalL,
  },
  formActions: {
    display: 'flex',
    gap: tokens.spacingHorizontalM,
    justifyContent: 'flex-end',
    marginTop: tokens.spacingVerticalL,
    alignItems: 'center',
  },
});

const Transactions: React.FC = () => {
  const styles = useStyles();
  const { transactions, pagination, filters, isLoading, fetchTransactions, createTransaction, updateTransaction, deleteTransaction, setFilters } = useTransactions(false);
  const { categories, fetchCategories, error: categoriesError } = useCategories(undefined, false);
  const { accounts, fetchAccounts, error: accountsError } = useAccounts(false);
  const { formatCurrency } = useCurrency();
  const [showModal, setShowModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState({
    amount: '',
    type: 'EXPENSE' as 'INCOME' | 'EXPENSE',
    categoryId: '',
    accountId: '',
    date: new Date().toISOString().split('T')[0],
    description: '',
    paymentMethod: 'CASH' as any,
  });

  useEffect(() => {
    fetchTransactions();
    fetchCategories();
    fetchAccounts();
  }, []);

  const handleRefreshData = async () => {
    try {
      await fetchCategories();
      await fetchAccounts();
    } catch (error) {
      console.error('Error refreshing data:', error);
    }
  };

  const handleFilterChange = (key: string, value: any) => {
    setFilters({ ...filters, [key]: value, page: 1 });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form data
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      alert('Please enter a valid amount');
      return;
    }
    
    if (!formData.categoryId) {
      alert('Please select a category');
      return;
    }
    
    if (!formData.date) {
      alert('Please select a date');
      return;
    }
    
    try {
      console.log('Submitting transaction:', formData);
      
      if (editingTransaction) {
        console.log('Updating transaction:', editingTransaction.id);
        await updateTransaction(editingTransaction.id, {
          ...formData,
          amount: parseFloat(formData.amount),
        });
      } else {
        console.log('Creating new transaction');
        await createTransaction({
          ...formData,
          amount: parseFloat(formData.amount),
        });
      }
      resetForm();
      // Don't call fetchTransactions() - the Redux action already updates the state
    } catch (error) {
      console.error('Failed to save transaction:', error);
      alert('Failed to save transaction. Please try again.');
    }
  };

  const handleEdit = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setFormData({
      amount: transaction.amount.toString(),
      type: transaction.type,
      categoryId: transaction.categoryId,
      accountId: transaction.accountId || '',
      date: new Date(transaction.date).toISOString().split('T')[0],
      description: transaction.description || '',
      paymentMethod: transaction.paymentMethod || 'CASH',
    });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this transaction?')) {
      try {
        await deleteTransaction(id);
        // Don't call fetchTransactions() - the Redux action already updates the state
      } catch (error) {
        console.error('Failed to delete transaction:', error);
        alert('Failed to delete transaction. Please try again.');
      }
    }
  };

  const resetForm = () => {
    setShowModal(false);
    setEditingTransaction(null);
    setFormData({
      amount: '',
      type: 'EXPENSE',
      categoryId: '',
      accountId: '',
      date: new Date().toISOString().split('T')[0],
      description: '',
      paymentMethod: 'CASH',
    });
  };

  const handleExport = () => {
    if (transactions.length === 0) {
      alert('No transactions to export');
      return;
    }
    
    const filename = `transactions_${new Date().toISOString().split('T')[0]}.csv`;
    exportToCSV(transactions, filename);
  };

  const handleImportClick = () => {
    setShowImportModal(true);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImportFile(e.target.files[0]);
    }
  };

  const handleImport = async () => {
    if (!importFile) {
      alert('Please select a file');
      return;
    }

    setImporting(true);
    try {
      const result = await transactionService.importTransactions(importFile);
      alert(`Import successful! Imported: ${result.imported}, Failed: ${result.failed}`);
      setShowImportModal(false);
      setImportFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      fetchTransactions();
    } catch (error: any) {
      alert(`Import failed: ${error.message}`);
    } finally {
      setImporting(false);
    }
  };

  const filteredCategories = categories.filter((c) => c.type === formData.type);
  

  return (
    <div className="transactions-page">
      <div className="page-header">
        <h1>Transactions</h1>
        <div className={styles.pageActions}>
          <button className="action-btn edit-btn" onClick={handleRefreshData}>
            <ArrowClockwise24Regular /> Refresh Data
          </button>
          <button className="action-btn edit-btn" onClick={handleExport} disabled={transactions.length === 0}>
            <ArrowDownload24Regular /> Export CSV
          </button>
          <button className="action-btn edit-btn" onClick={handleImportClick}>
            <ArrowUpload24Regular /> Import CSV
          </button>
          <button className="action-btn edit-btn" onClick={() => setShowModal(true)}>
            <Add24Regular /> Add Transaction
          </button>
        </div>
      </div>

      {/* Transaction Summary */}
      {transactions.length > 0 && (
        <div className="summary-card">
          <div className="summary-content">
            <div className="total-balance">
              <div className="balance-icon">💰</div>
              <div className="balance-info">
                <h2><ClickableNumber value={transactions.reduce((sum: number, t: Transaction) => sum + (t.type === 'INCOME' ? t.amount : -t.amount), 0)} /></h2>
                <p>Net Balance</p>
              </div>
            </div>
            <div className="summary-stats">
              <div className="stat-item">
                <span className="stat-number">{transactions.filter((t: Transaction) => t.type === 'INCOME').length}</span>
                <span className="stat-label">Income</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">{transactions.filter((t: Transaction) => t.type === 'EXPENSE').length}</span>
                <span className="stat-label">Expenses</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">{transactions.length}</span>
                <span className="stat-label">Total</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="filters-section">
        <div className="filter-group">
          <label><Text weight="semibold">Transaction Type</Text></label>
          <select
            value={filters.type || ''}
            onChange={(e) => handleFilterChange('type', e.target.value || undefined)}
            className="fluent-select"
          >
            <option value="">All Types</option>
            <option value="INCOME">Income</option>
            <option value="EXPENSE">Expense</option>
          </select>
        </div>

        <div className="filter-group">
          <label><Text weight="semibold">Category</Text></label>
          <select
            value={filters.categoryId || ''}
            onChange={(e) => handleFilterChange('categoryId', e.target.value || undefined)}
            className="fluent-select"
          >
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.icon} {cat.name}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label><Text weight="semibold">Search</Text></label>
          <input
            type="text"
            placeholder="Search transactions..."
            value={filters.search || ''}
            onChange={(e) => handleFilterChange('search', e.target.value || undefined)}
            className="fluent-input"
          />
        </div>
      </div>

      {/* Transactions Table */}
      <div className="table-container">
        {isLoading ? (
          <div className="loading">Loading transactions...</div>
        ) : transactions.length === 0 ? (
          <div className="empty-state">
            <p>No transactions found</p>
            <button className="action-btn edit-btn" onClick={() => setShowModal(true)}>
              <Add24Regular /> Add your first transaction
            </button>
          </div>
        ) : (
          <table className="transactions-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Category</th>
                <th>Account</th>
                <th>Description</th>
                <th>Type</th>
                <th>Amount</th>
                <th>Payment</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((transaction: Transaction) => (
                <tr key={transaction.id}>
                  <td>{formatDate(transaction.date)}</td>
                  <td>
                    <span className="category">
                      {transaction.category?.icon} {transaction.category?.name}
                    </span>
                  </td>
                  <td>
                    {transaction.account ? (
                      <span className="account">
                        {transaction.account.name} ({transaction.account.type.replace('_', ' ')})
                      </span>
                    ) : (
                      <span className="no-account">No account</span>
                    )}
                  </td>
                  <td>{transaction.description || '-'}</td>
                  <td>
                    <span className={`badge badge-${transaction.type.toLowerCase()}`}>
                      {transaction.type}
                    </span>
                  </td>
                  <td className={`amount ${transaction.type.toLowerCase()}`}>
                    {transaction.type === 'INCOME' ? '+' : '-'}
                    <ClickableNumber value={transaction.amount} />
                  </td>
                  <td>{formatPaymentMethod(transaction.paymentMethod || 'N/A')}</td>
                  <td>
                    <div className={styles.actionButtons}>
                      <button className="action-btn edit-btn" onClick={() => handleEdit(transaction)}>
                        <Edit24Regular /> Edit
                      </button>
                      <button className="action-btn delete-btn" onClick={() => handleDelete(transaction.id)}>
                        <Delete24Regular /> Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className={styles.pagination}>
            <button 
              className="action-btn edit-btn"
              disabled={pagination.page === 1}
              onClick={() => handleFilterChange('page', pagination.page - 1)}
            >
              <ChevronLeft24Regular /> Previous
            </button>
            <span>
              Page {pagination.page} of {pagination.pages}
            </span>
            <button 
              className="action-btn edit-btn"
              disabled={pagination.page === pagination.pages}
              onClick={() => handleFilterChange('page', pagination.page + 1)}
            >
              Next <ChevronRight24Regular />
            </button>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={resetForm}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingTransaction ? 'Edit Transaction' : 'Add Transaction'}</h2>
              <button className="close-btn" onClick={resetForm}>×</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label><Text weight="semibold">Type</Text></label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as any, categoryId: '' })}
                    className="fluent-select"
                  >
                    <option value="EXPENSE">Expense</option>
                    <option value="INCOME">Income</option>
                  </select>
                </div>
                <div className="form-group">
                  <label><Text weight="semibold">Amount</Text></label>
                  <Input
                    type="number"
                    value={formData.amount}
                    onChange={(_, data) => setFormData({ ...formData, amount: data.value })}
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label><Text weight="semibold">Category</Text></label>
                  <select
                    value={formData.categoryId}
                    onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                    className="fluent-select"
                    required
                  >
                    <option value="">Select category</option>
                    {filteredCategories.length > 0 ? (
                      filteredCategories.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.icon} {cat.name}
                        </option>
                      ))
                    ) : categories.length > 0 ? (
                      // Show all categories if filtered is empty
                      categories.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.icon} {cat.name} ({cat.type})
                        </option>
                      ))
                    ) : (
                      <option value="" disabled>
                        {categoriesError ? 'Error loading categories' : 'Loading categories...'}
                      </option>
                    )}
                  </select>
                </div>
                <div className="form-group">
                  <label><Text weight="semibold">Account (Optional)</Text></label>
                  <select
                    value={formData.accountId}
                    onChange={(e) => setFormData({ ...formData, accountId: e.target.value })}
                    className="fluent-select"
                  >
                    <option value="">No account</option>
                    {accounts.length > 0 ? (
                      accounts.map((account: Account) => (
                        <option key={account.id} value={account.id}>
                          {account.name} ({account.type.replace('_', ' ')}) - <ClickableNumber value={account.balance} />
                        </option>
                      ))
                    ) : (
                      <option value="" disabled>
                        {accountsError ? 'Error loading accounts' : 'Loading accounts...'}
                      </option>
                    )}
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label><Text weight="semibold">Date</Text></label>
                  <Input
                    type="date"
                    value={formData.date}
                    onChange={(_, data) => setFormData({ ...formData, date: data.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label><Text weight="semibold">Payment Method</Text></label>
                  <select
                    value={formData.paymentMethod}
                    onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value as any })}
                    className="fluent-select"
                  >
                    <option value="CASH">Cash</option>
                    <option value="CARD">Card</option>
                    <option value="BANK_TRANSFER">Bank Transfer</option>
                    <option value="DIGITAL_WALLET">Digital Wallet</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label><Text weight="semibold">Description (Optional)</Text></label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  placeholder="Add notes about this transaction..."
                />
              </div>

              <div className={styles.formActions}>
                <button className="action-btn edit-btn" type="button" onClick={resetForm}>
                  Cancel
                </button>
                <button className="action-btn edit-btn" type="submit">
                  {editingTransaction ? (
                    <>
                      <Edit24Regular /> Update
                    </>
                  ) : (
                    <>
                      <Add24Regular /> Create
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Import Modal */}
      {showImportModal && (
        <div className="modal-overlay" onClick={() => !importing && setShowImportModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Import Transactions from CSV</h2>
              <button className="close-btn" onClick={() => !importing && setShowImportModal(false)} disabled={importing}>×</button>
            </div>
            <div className="import-content">
              <div className="import-instructions">
                <h4>CSV Format Requirements:</h4>
                <p>Your CSV file should have the following columns:</p>
                <ul>
                  <li><strong>Date</strong> - Transaction date (YYYY-MM-DD)</li>
                  <li><strong>Type</strong> - INCOME or EXPENSE</li>
                  <li><strong>Category</strong> - Category name</li>
                  <li><strong>Amount</strong> - Transaction amount (decimal)</li>
                  <li><strong>Description</strong> - (Optional) Transaction notes</li>
                  <li><strong>Payment Method</strong> - (Optional) CASH, CARD, etc.</li>
                </ul>
                <p className="note">
                  <strong>Note:</strong> Categories must exist in your account. Create them first if needed.
                </p>
              </div>

              <div className="file-upload">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv"
                  onChange={handleFileSelect}
                  disabled={importing}
                />
                {importFile && (
                  <p className="file-selected">
                    Selected: {importFile.name} ({(importFile.size / 1024).toFixed(2)} KB)
                  </p>
                )}
              </div>

              <div className="form-actions">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowImportModal(false)}
                  disabled={importing}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleImport}
                  disabled={!importFile || importing}
                >
                  {importing ? 'Importing...' : 'Import'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Transactions;

