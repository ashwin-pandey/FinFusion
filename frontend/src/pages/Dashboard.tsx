import React, { useEffect, useState } from 'react';
import { useAnalytics } from '../hooks/useAnalytics';
import { useBudgets } from '../hooks/useBudgets';
import { useAccounts } from '../hooks/useAccounts';
import { useCurrency } from '../contexts/CurrencyContext';
import { formatPercentage, formatDate } from '../utils/formatters';
import { getDateRangeForPeriod, toISODateString } from '../utils/dateHelpers';
import { AreaChart, Area, PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { getBudgetUtilizationColor, getTransactionTypeColor } from '../utils/chartHelpers';
import StatCard from '../components/Cards/StatCard';
import ChartCard from '../components/Cards/ChartCard';
import ClickableNumber from '../components/ClickableNumber';
import {
  Text,
  Spinner,
  makeStyles,
  tokens,
  shorthands
} from '@fluentui/react-components';
import './Dashboard.css';

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
  periodSelector: {
    minWidth: '200px'
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: tokens.spacingHorizontalM,
    marginBottom: tokens.spacingVerticalL
  },
  statCard: {
    height: '100%'
  },
  statContent: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalM
  },
  statIcon: {
    width: '48px',
    height: '48px',
    borderRadius: tokens.borderRadiusCircular,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '24px'
  },
  statInfo: {
    flex: 1
  },
  statValue: {
    fontSize: tokens.fontSizeBase600,
    fontWeight: tokens.fontWeightBold,
    color: tokens.colorNeutralForeground1,
    margin: 0
  },
  statLabel: {
    fontSize: tokens.fontSizeBase200,
    color: tokens.colorNeutralForeground2,
    margin: 0,
    marginTop: tokens.spacingVerticalXS
  },
  chartsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
    gap: tokens.spacingHorizontalM,
    marginBottom: tokens.spacingVerticalL
  },
  chartCard: {
    height: '400px'
  },
  budgetsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: tokens.spacingHorizontalM
  },
  budgetCard: {
    height: '100%'
  },
  budgetHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: tokens.spacingVerticalM
  },
  budgetProgress: {
    marginBottom: tokens.spacingVerticalM
  },
  progressBar: {
    height: '8px',
    backgroundColor: tokens.colorNeutralBackground2,
    borderRadius: tokens.borderRadiusSmall,
    overflow: 'hidden',
    marginTop: tokens.spacingVerticalXS
  },
  progressFill: {
    height: '100%',
    transition: 'width 0.3s ease',
    borderRadius: tokens.borderRadiusSmall
  },
  loadingContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '400px'
  }
});

const Dashboard: React.FC = () => {
  const styles = useStyles();
  const { dashboard, spendingTrends, incomeBreakdown, expenseBreakdown, isLoading, fetchDashboard, fetchTrends, fetchBreakdown } = useAnalytics();
  const { budgets, fetchBudgets } = useBudgets(true, false);
  const { summary: accountSummary, fetchAccountSummary } = useAccounts(false);
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
        fetchBudgets(true),
        fetchAccountSummary()
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
        fetchBudgets(true),
        fetchAccountSummary()
      ]);
    }
  };

  if (isLoading && !dashboard) {
    return (
      <div className={styles.loadingContainer}>
        <Spinner size="large" label="Loading dashboard..." />
      </div>
    );
  }

  const summary = dashboard?.summary;
  const netIncomeColor = (summary?.netIncome || 0) >= 0 ? '#4CAF50' : '#F44336';

  return (
    <div className="dashboard-page">
      <div className="page-header">
        <h1>Dashboard</h1>
        <div>
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value as 'this_month' | 'last_month' | 'this_year' | 'last_90_days' | 'all_time')}
            className="fluent-select"
          >
            <option value="this_month">This Month</option>
            <option value="last_month">Last Month</option>
            <option value="last_90_days">Last 90 Days</option>
            <option value="this_year">This Year</option>
            <option value="all_time">All Time</option>
          </select>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="stats-grid">
        <StatCard
          icon="🏦"
          iconColor="#e3f2fd"
          value={<ClickableNumber value={accountSummary?.totalBalance || 0} />}
          label="Total Balance"
          subtitle="across all accounts"
        />
        
        <StatCard
          icon="💰"
          iconColor="#e8f5e9"
          value={<ClickableNumber value={summary?.totalIncome || 0} />}
          label="Total Income"
          subtitle={`${summary?.transactionCounts.income || 0} transactions`}
        />
        
        <StatCard
          icon="💸"
          iconColor="#ffebee"
          value={<ClickableNumber value={summary?.totalExpenses || 0} />}
          label="Total Expenses"
          subtitle={`${summary?.transactionCounts.expenses || 0} transactions`}
        />
        
        <StatCard
          icon="📊"
          iconColor={netIncomeColor === '#4CAF50' ? '#e8f5e9' : '#ffebee'}
          value={<ClickableNumber value={summary?.netIncome || 0} />}
          label="Net Income"
          subtitle={summary?.netIncome && summary.netIncome >= 0 ? 'Surplus' : 'Deficit'}
          valueColor={netIncomeColor}
        />
        
        <StatCard
          icon="🎯"
          iconColor="#e3f2fd"
          value={budgets.length}
          label="Active Budgets"
          subtitle="budget tracking"
        />
      </div>

      {/* Charts */}
      <div className="charts-grid">
        {/* Spending Trends */}
        {spendingTrends.length > 0 && (
          <div className="chart-card full-width">
            <h3>Spending Trends</h3>
            <div style={{ width: '100%', height: '300px' }}>
              <ResponsiveContainer width="100%" height="100%">
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
          </div>
        )}

        {/* Charts Row */}
        <div className="charts-row">
          {/* Income Breakdown */}
          {incomeBreakdown.length > 0 && (
            <div className="chart-card">
              <h3>Income by Category</h3>
              <div style={{ width: '100%', height: '300px' }}>
                <ResponsiveContainer width="100%" height="100%">
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
            </div>
          )}

          {/* Expense Breakdown */}
          {expenseBreakdown.length > 0 && (
            <div className="chart-card">
              <h3>Expenses by Category</h3>
              <div style={{ width: '100%', height: '300px' }}>
                <ResponsiveContainer width="100%" height="100%">
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
            </div>
          )}
        </div>

        {/* Budget Utilization */}
        {dashboard?.budgetUtilization && dashboard.budgetUtilization.length > 0 && (
          <div className="chart-card full-width">
            <h3>Budget Utilization</h3>
            <div style={{ width: '100%', height: '300px' }}>
              <ResponsiveContainer width="100%" height="100%">
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

