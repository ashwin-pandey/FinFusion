import React, { useEffect, useState } from 'react';
import { useAnalytics } from '../hooks/useAnalytics';
import { useBudgets } from '../hooks/useBudgets';
import { useCurrency } from '../contexts/CurrencyContext';
import { formatPercentage, formatDate } from '../utils/formatters';
import { getDateRangeForPeriod, toISODateString } from '../utils/dateHelpers';
import { AreaChart, Area, PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { getBudgetUtilizationColor, getTransactionTypeColor } from '../utils/chartHelpers';
import './Dashboard.css';

const Dashboard: React.FC = () => {
  const { dashboard, spendingTrends, incomeBreakdown, expenseBreakdown, isLoading, fetchDashboard, fetchTrends, fetchBreakdown } = useAnalytics();
  const { budgets, fetchBudgets } = useBudgets(true, false);
  const { formatCurrency } = useCurrency();
  const [period, setPeriod] = useState<'this_month' | 'last_month' | 'this_year' | 'last_90_days' | 'all_time'>('this_month');

  useEffect(() => {
    loadDashboardData();
  }, [period]);

  const loadDashboardData = async () => {
    if (period === 'all_time') {
      // For all time, don't pass date filters
      await Promise.all([
        fetchDashboard(),
        fetchTrends(), // No parameters for all time
        fetchBreakdown('INCOME'),
        fetchBreakdown('EXPENSE'),
        fetchBudgets(true)
      ]);
    } else {
      const { startDate, endDate } = getDateRangeForPeriod(period);
      const start = toISODateString(startDate);
      const end = toISODateString(endDate);

      await Promise.all([
        fetchDashboard(start, end),
        fetchTrends(start, end, 'month'),
        fetchBreakdown('INCOME', start, end),
        fetchBreakdown('EXPENSE', start, end),
        fetchBudgets(true)
      ]);
    }
  };

  if (isLoading && !dashboard) {
    return (
      <div className="loading-container">
        <div className="loading-spinner">Loading dashboard...</div>
      </div>
    );
  }

  const summary = dashboard?.summary;
  const netIncomeColor = (summary?.netIncome || 0) >= 0 ? '#4CAF50' : '#F44336';

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Dashboard</h1>
        <div className="period-selector">
          <select value={period} onChange={(e) => setPeriod(e.target.value as any)}>
            <option value="this_month">This Month</option>
            <option value="last_month">Last Month</option>
            <option value="last_90_days">Last 90 Days</option>
            <option value="this_year">This Year</option>
            <option value="all_time">All Time</option>
          </select>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="summary-cards">
        <div className="summary-card income">
          <div className="card-icon">💰</div>
          <div className="card-content">
            <p className="card-label">Total Income</p>
            <h2 className="card-value">{formatCurrency(summary?.totalIncome || 0)}</h2>
            <p className="card-subtitle">{summary?.transactionCounts.income || 0} transactions</p>
          </div>
        </div>

        <div className="summary-card expense">
          <div className="card-icon">💸</div>
          <div className="card-content">
            <p className="card-label">Total Expenses</p>
            <h2 className="card-value">{formatCurrency(summary?.totalExpenses || 0)}</h2>
            <p className="card-subtitle">{summary?.transactionCounts.expenses || 0} transactions</p>
          </div>
        </div>

        <div className="summary-card net">
          <div className="card-icon">📊</div>
          <div className="card-content">
            <p className="card-label">Net Income</p>
            <h2 className="card-value" style={{ color: netIncomeColor }}>
              {formatCurrency(summary?.netIncome || 0)}
            </h2>
            <p className="card-subtitle">
              {summary?.netIncome && summary.netIncome >= 0 ? 'Surplus' : 'Deficit'}
            </p>
          </div>
        </div>

        <div className="summary-card budgets">
          <div className="card-icon">🎯</div>
          <div className="card-content">
            <p className="card-label">Active Budgets</p>
            <h2 className="card-value">{budgets.length}</h2>
            <p className="card-subtitle">budget tracking</p>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="charts-grid">
        {/* Spending Trends */}
        {spendingTrends.length > 0 && (
          <div className="chart-card full-width">
            <h3>Spending Trends</h3>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={spendingTrends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="period" />
                <YAxis />
                <Tooltip formatter={(value: number) => formatCurrency(value)} />
                <Legend />
                <Area type="monotone" dataKey="income" stackId="1" stroke="#4CAF50" fill="#4CAF50" name="Income" />
                <Area type="monotone" dataKey="expenses" stackId="2" stroke="#F44336" fill="#F44336" name="Expenses" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Income Breakdown */}
        {incomeBreakdown.length > 0 && (
          <div className="chart-card">
            <h3>Income by Category</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={incomeBreakdown}
                  dataKey="amount"
                  nameKey="category.name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label={(entry: any) => `${entry.category.name} (${formatPercentage(entry.percentage)})`}
                >
                  {incomeBreakdown.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={entry.category.color || '#4CAF50'} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => formatCurrency(value)} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Expense Breakdown */}
        {expenseBreakdown.length > 0 && (
          <div className="chart-card">
            <h3>Expenses by Category</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={expenseBreakdown}
                  dataKey="amount"
                  nameKey="category.name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label={(entry: any) => `${entry.category.name} (${formatPercentage(entry.percentage)})`}
                >
                  {expenseBreakdown.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={entry.category.color || '#F44336'} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => formatCurrency(value)} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Budget Utilization */}
        {dashboard?.budgetUtilization && dashboard.budgetUtilization.length > 0 && (
          <div className="chart-card full-width">
            <h3>Budget Utilization</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={dashboard.budgetUtilization}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="categoryName" />
                <YAxis />
                <Tooltip formatter={(value: number) => formatCurrency(value)} />
                <Legend />
                <Bar dataKey="allocatedAmount" fill="#2196F3" name="Budget" />
                <Bar dataKey="spentAmount" fill="#FF9800" name="Spent" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Recent Budgets */}
      {budgets.length > 0 && (
        <div className="recent-section">
          <h3>Budget Overview</h3>
          <div className="budget-list">
            {budgets.slice(0, 5).map((budget: any) => (
              <div key={budget.id} className="budget-item">
                <div className="budget-header">
                  <span className="budget-category">
                    {budget.category?.icon} {budget.category?.name}
                  </span>
                  <span className="budget-amount">{formatCurrency(budget.amount)}</span>
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
                <div className="budget-stats">
                  <span>Spent: {formatCurrency(budget.spentAmount || 0)}</span>
                  <span>{formatPercentage(budget.utilizationPercentage || 0)} used</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;

