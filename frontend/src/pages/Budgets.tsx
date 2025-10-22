import React, { useState, useEffect } from 'react';
import { useBudgets } from '../hooks/useBudgets';
import { useCategories } from '../hooks/useCategories';
import { Budget } from '../types';
import { formatCurrency, formatDate, formatPercentage } from '../utils/formatters';
import { getBudgetUtilizationColor } from '../utils/chartHelpers';
import { getStartOfMonth, getEndOfMonth, addMonths, toISODateString } from '../utils/dateHelpers';
import './Budgets.css';

const Budgets: React.FC = () => {
  const { budgets, alerts, recommendations, isLoading, createBudget, updateBudget, deleteBudget, fetchBudgets, fetchAlerts, fetchRecommendations, acknowledgeAlert } = useBudgets(undefined, false);
  const { expenseCategories, fetchCategories } = useCategories('EXPENSE', false);
  const [showModal, setShowModal] = useState(false);
  const [showRecommendations, setShowRecommendations] = useState(false);
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null);
  const [activeTab, setActiveTab] = useState<'active' | 'all' | 'alerts'>('active');
  const [formData, setFormData] = useState({
    categoryId: '',
    amount: '',
    periodType: 'MONTHLY' as 'MONTHLY' | 'QUARTERLY' | 'YEARLY',
    startDate: toISODateString(getStartOfMonth()),
    endDate: toISODateString(getEndOfMonth()),
    alertThreshold: '80',
    allowRollover: false,
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    await Promise.all([
      fetchBudgets(),
      fetchCategories(),
      fetchAlerts(),
    ]);
  };

  const handlePeriodChange = (period: 'MONTHLY' | 'QUARTERLY' | 'YEARLY') => {
    const start = getStartOfMonth();
    let end: Date;
    
    switch (period) {
      case 'QUARTERLY':
        end = getEndOfMonth(addMonths(start, 2));
        break;
      case 'YEARLY':
        end = getEndOfMonth(addMonths(start, 11));
        break;
      default:
        end = getEndOfMonth(start);
    }

    setFormData({
      ...formData,
      periodType: period,
      startDate: toISODateString(start),
      endDate: toISODateString(end),
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const budgetData = {
        ...formData,
        amount: parseFloat(formData.amount),
        alertThreshold: parseInt(formData.alertThreshold),
      };

      if (editingBudget) {
        await updateBudget(editingBudget.id, budgetData);
      } else {
        await createBudget(budgetData);
      }
      resetForm();
      loadData();
    } catch (error) {
      console.error('Failed to save budget:', error);
    }
  };

  const handleEdit = (budget: Budget) => {
    setEditingBudget(budget);
    setFormData({
      categoryId: budget.categoryId,
      amount: budget.amount.toString(),
      periodType: budget.periodType,
      startDate: new Date(budget.startDate).toISOString().split('T')[0],
      endDate: new Date(budget.endDate).toISOString().split('T')[0],
      alertThreshold: budget.alertThreshold.toString(),
      allowRollover: budget.allowRollover,
    });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this budget?')) {
      try {
        await deleteBudget(id);
        loadData();
      } catch (error) {
        console.error('Failed to delete budget:', error);
      }
    }
  };

  const handleAcknowledgeAlert = async (alertId: string) => {
    try {
      await acknowledgeAlert(alertId);
      fetchAlerts();
    } catch (error) {
      console.error('Failed to acknowledge alert:', error);
    }
  };

  const handleLoadRecommendations = async () => {
    await fetchRecommendations();
    setShowRecommendations(true);
  };

  const handleApplyRecommendation = (rec: any) => {
    setFormData({
      categoryId: rec.categoryId,
      amount: rec.recommendedAmount.toString(),
      periodType: 'MONTHLY',
      startDate: toISODateString(getStartOfMonth()),
      endDate: toISODateString(getEndOfMonth()),
      alertThreshold: '80',
      allowRollover: false,
    });
    setShowRecommendations(false);
    setShowModal(true);
  };

  const resetForm = () => {
    setShowModal(false);
    setEditingBudget(null);
    setFormData({
      categoryId: '',
      amount: '',
      periodType: 'MONTHLY',
      startDate: toISODateString(getStartOfMonth()),
      endDate: toISODateString(getEndOfMonth()),
      alertThreshold: '80',
      allowRollover: false,
    });
  };

  const activeBudgets = budgets.filter((b: Budget) => new Date(b.endDate) >= new Date());
  const unacknowledgedAlerts = alerts.filter((a: any) => !a.isAcknowledged);

  const displayBudgets = activeTab === 'active' ? activeBudgets : budgets;

  return (
    <div className="budgets-page">
      <div className="page-header">
        <h1>Budgets</h1>
        <div className="header-actions">
          <button className="btn btn-secondary" onClick={handleLoadRecommendations}>
            💡 Get Recommendations
          </button>
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>
            + Add Budget
          </button>
        </div>
      </div>

      {/* Alerts Banner */}
      {unacknowledgedAlerts.length > 0 && (
        <div className="alerts-banner">
          <div className="alert-icon">⚠️</div>
          <div className="alert-content">
            <strong>{unacknowledgedAlerts.length} Budget Alert{unacknowledgedAlerts.length > 1 ? 's' : ''}</strong>
            <p>You have budgets exceeding their thresholds</p>
          </div>
          <button className="btn btn-secondary" onClick={() => setActiveTab('alerts')}>
            View Alerts
          </button>
        </div>
      )}

      {/* Tabs */}
      <div className="tabs">
        <button
          className={`tab ${activeTab === 'active' ? 'active' : ''}`}
          onClick={() => setActiveTab('active')}
        >
          Active ({activeBudgets.length})
        </button>
        <button
          className={`tab ${activeTab === 'all' ? 'active' : ''}`}
          onClick={() => setActiveTab('all')}
        >
          All ({budgets.length})
        </button>
        <button
          className={`tab ${activeTab === 'alerts' ? 'active' : ''}`}
          onClick={() => setActiveTab('alerts')}
        >
          Alerts ({unacknowledgedAlerts.length})
        </button>
      </div>

      {/* Content */}
      {activeTab === 'alerts' ? (
        <div className="alerts-container">
          {unacknowledgedAlerts.length === 0 ? (
            <div className="empty-state">
              <p>🎉 No active alerts! Your budgets are on track.</p>
            </div>
          ) : (
            <div className="alerts-list">
              {unacknowledgedAlerts.map((alert: any) => {
                const budget = budgets.find((b: any) => b.id === alert.budgetId);
                return (
                  <div key={alert.id} className="alert-card">
                    <div className="alert-header">
                      <span className="alert-threshold">{formatPercentage(alert.thresholdPercentage)} Threshold Reached</span>
                      <span className="alert-date">{formatDate(alert.triggeredAt, 'relative')}</span>
                    </div>
                    {budget && (
                      <div className="alert-budget-info">
                        <h3>{budget.category?.icon} {budget.category?.name}</h3>
                        <div className="alert-stats">
                          <span>Budget: {formatCurrency(budget.amount)}</span>
                          <span>Spent: {formatCurrency(budget.spentAmount || 0)}</span>
                          <span>Remaining: {formatCurrency(budget.remainingAmount || 0)}</span>
                        </div>
                        <div className="budget-progress">
                          <div
                            className="progress-bar"
                            style={{
                              width: `${Math.min(budget.utilizationPercentage || 0, 100)}%`,
                              backgroundColor: getBudgetUtilizationColor(budget.utilizationPercentage || 0)
                            }}
                          />
                        </div>
                      </div>
                    )}
                    <button
                      className="btn btn-secondary btn-small"
                      onClick={() => handleAcknowledgeAlert(alert.id)}
                    >
                      Acknowledge
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ) : (
        <div className="budgets-container">
          {isLoading ? (
            <div className="loading">Loading budgets...</div>
          ) : displayBudgets.length === 0 ? (
            <div className="empty-state">
              <p>No budgets found</p>
              <button className="btn btn-primary" onClick={() => setShowModal(true)}>
                Create your first budget
              </button>
            </div>
          ) : (
            <div className="budgets-grid">
              {displayBudgets.map((budget: Budget) => (
                <div key={budget.id} className="budget-card">
                  <div className="budget-header">
                    <div className="budget-title">
                      <span className="budget-icon">{budget.category?.icon}</span>
                      <div>
                        <h3>{budget.category?.name}</h3>
                        <p className="budget-period">
                          {budget.periodType} • {formatDate(budget.startDate)} - {formatDate(budget.endDate)}
                        </p>
                      </div>
                    </div>
                    <div className="budget-actions">
                      <button className="btn-icon" onClick={() => handleEdit(budget)} title="Edit">
                        ✏️
                      </button>
                      <button className="btn-icon" onClick={() => handleDelete(budget.id)} title="Delete">
                        🗑️
                      </button>
                    </div>
                  </div>

                  <div className="budget-amount">
                    <div>
                      <p className="label">Budget</p>
                      <h2>{formatCurrency(budget.amount)}</h2>
                    </div>
                    <div>
                      <p className="label">Spent</p>
                      <h2 style={{ color: getBudgetUtilizationColor(budget.utilizationPercentage || 0) }}>
                        {formatCurrency(budget.spentAmount || 0)}
                      </h2>
                    </div>
                  </div>

                  <div className="budget-progress">
                    <div className="progress-header">
                      <span>{formatPercentage(budget.utilizationPercentage || 0)} used</span>
                      <span>{formatCurrency(budget.remainingAmount || 0)} left</span>
                    </div>
                    <div className="progress-bar-container">
                      <div
                        className="progress-bar"
                        style={{
                          width: `${Math.min(budget.utilizationPercentage || 0, 100)}%`,
                          backgroundColor: getBudgetUtilizationColor(budget.utilizationPercentage || 0)
                        }}
                      />
                    </div>
                  </div>

                  <div className="budget-footer">
                    {budget.allowRollover && <span className="badge badge-info">Rollover Enabled</span>}
                    {budget.alertThreshold && (
                      <span className="budget-alert-threshold">
                        Alert at {formatPercentage(budget.alertThreshold)}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Budget Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={resetForm}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingBudget ? 'Edit Budget' : 'Create Budget'}</h2>
              <button className="close-btn" onClick={resetForm}>×</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Category</label>
                <select
                  value={formData.categoryId}
                  onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                  required
                >
                  <option value="">Select category</option>
                  {expenseCategories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.icon} {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Budget Amount</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    placeholder="0.00"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Period Type</label>
                  <select
                    value={formData.periodType}
                    onChange={(e) => handlePeriodChange(e.target.value as any)}
                    required
                  >
                    <option value="MONTHLY">Monthly</option>
                    <option value="QUARTERLY">Quarterly</option>
                    <option value="YEARLY">Yearly</option>
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Start Date</label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>End Date</label>
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Alert Threshold (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={formData.alertThreshold}
                    onChange={(e) => setFormData({ ...formData, alertThreshold: e.target.value })}
                    required
                  />
                  <small>Get notified when spending reaches this percentage</small>
                </div>
                <div className="form-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={formData.allowRollover}
                      onChange={(e) => setFormData({ ...formData, allowRollover: e.target.checked })}
                    />
                    Allow unused budget to rollover
                  </label>
                </div>
              </div>

              <div className="form-actions">
                <button type="button" className="btn btn-secondary" onClick={resetForm}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingBudget ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Recommendations Modal */}
      {showRecommendations && (
        <div className="modal-overlay" onClick={() => setShowRecommendations(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>💡 Budget Recommendations</h2>
              <button className="close-btn" onClick={() => setShowRecommendations(false)}>×</button>
            </div>
            <div className="recommendations-content">
              {recommendations.length === 0 ? (
                <p>No recommendations available. Add more transactions to get personalized suggestions.</p>
              ) : (
                <div className="recommendations-list">
                  {recommendations.map((rec: any, index: number) => (
                    <div key={index} className="recommendation-card">
                      <h3>{rec.categoryName}</h3>
                      <p className="recommendation-amount">
                        Recommended: {formatCurrency(rec.recommendedAmount)}
                      </p>
                      <p className="recommendation-reason">Based on: {rec.basedOn}</p>
                      <p className="recommendation-confidence">
                        Confidence: {formatPercentage(rec.confidence * 100)}
                      </p>
                      <button
                        className="btn btn-primary btn-small"
                        onClick={() => handleApplyRecommendation(rec)}
                      >
                        Apply
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Budgets;
