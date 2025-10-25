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
  const [chartGrouping, setChartGrouping] = useState<'month' | 'quarter' | 'year'>('month');

  useEffect(() => {
    loadDashboardData();
  }, [period, chartGrouping]);

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

      // Determine chart grouping based on period length
      const periodLength = endDate.getTime() - startDate.getTime();
      const oneYearInMs = 365 * 24 * 60 * 60 * 1000;
      
      // If period is less than a year, show current year data
      let chartStartDate = start;
      let chartEndDate = end;
      let chartGroupBy: 'day' | 'week' | 'month' | 'quarter' | 'year' = chartGrouping;
      
      if (periodLength < oneYearInMs) {
        // For periods less than a year, show current year data
        const currentYear = new Date().getFullYear();
        const yearStart = new Date(currentYear, 0, 1);
        const yearEnd = new Date(currentYear, 11, 31);
        chartStartDate = toISODateString(yearStart);
        chartEndDate = toISODateString(yearEnd);
        console.log(`Period is less than a year, showing current year data: ${chartStartDate} to ${chartEndDate}`);
      } else {
        // For periods longer than a year, use the selected period
        chartStartDate = start;
        chartEndDate = end;
        console.log(`Period is longer than a year, using selected period: ${chartStartDate} to ${chartEndDate}`);
      }

      await Promise.all([
        fetchDashboard(start, end), // Dashboard stats use the selected period
        fetchTrends(chartStartDate, chartEndDate, chartGroupBy as any), // Charts use adjusted period
        fetchBreakdown('INCOME', start, end),
        fetchBreakdown('EXPENSE', start, end),
        fetchBudgets(true),
        fetchAccountSummary()
      ]);
    }
    
    // Debug logging
    console.log('Dashboard data loaded:', {
      spendingTrends,
      incomeBreakdown,
      expenseBreakdown,
      dashboard
    });
    
    // Check if spendingTrends has the correct structure
    if (spendingTrends && typeof spendingTrends === 'object' && 'trends' in spendingTrends) {
      console.log('SpendingTrends object structure:', spendingTrends);
      console.log('Trends array:', (spendingTrends as any).trends);
    }
    
    // Debug the actual data values will be added after trendsData is declared
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
  
  // Extract trends array from spendingTrends object
  const trendsData = spendingTrends && typeof spendingTrends === 'object' && 'trends' in spendingTrends 
    ? (spendingTrends as any).trends 
    : Array.isArray(spendingTrends) 
      ? spendingTrends 
      : [];

  // Debug the actual data values
  if (trendsData.length > 0) {
    console.log('Trends data for charts:', trendsData);
    console.log('Sample values:', {
      income: trendsData[0]?.income,
      expenses: trendsData[0]?.expenses,
      netIncome: trendsData[0]?.netIncome
    });
  }

  return (
    <div className="dashboard-page">
      <div className="page-header">
        <h1>Dashboard</h1>
        <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
          <div>
            <label style={{ display: 'block', fontSize: '14px', marginBottom: '5px', fontWeight: '500' }}>Time Period:</label>
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
          <div>
            <label style={{ display: 'block', fontSize: '14px', marginBottom: '5px', fontWeight: '500' }}>Chart Grouping:</label>
            <select
              value={chartGrouping}
              onChange={(e) => setChartGrouping(e.target.value as 'month' | 'quarter' | 'year')}
              className="fluent-select"
              style={{ minWidth: '150px' }}
            >
              <option value="month">📅 Monthly</option>
              <option value="quarter">📊 Quarterly</option>
              <option value="year">📈 Yearly</option>
            </select>
          </div>
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
        {trendsData.length > 0 && (
          <div className="chart-card full-width">
            <h3>💰 {chartGrouping === 'month' ? 'Monthly' : chartGrouping === 'quarter' ? 'Quarterly' : 'Yearly'} Income vs Expenses</h3>
            <p style={{ color: '#666', fontSize: '14px', marginBottom: '20px' }}>
              Compare your {chartGrouping === 'month' ? 'monthly' : chartGrouping === 'quarter' ? 'quarterly' : 'yearly'} income (green) with expenses (red) to track spending patterns
              {(() => {
                const periodLength = new Date().getTime() - new Date(new Date().getFullYear(), 0, 1).getTime();
                const oneYearInMs = 365 * 24 * 60 * 60 * 1000;
                const selectedPeriodLength = period === 'all_time' ? Infinity : 
                  new Date(getDateRangeForPeriod(period).endDate).getTime() - new Date(getDateRangeForPeriod(period).startDate).getTime();
                
                if (selectedPeriodLength < oneYearInMs && period !== 'all_time') {
                  return <span style={{ color: '#2196F3', fontWeight: 'bold' }}> • Showing current year data for better monthly trends</span>;
                }
                return '';
              })()}
            </p>
            <div style={{ width: '100%', height: '300px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={trendsData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis 
                    dataKey="period" 
                    tick={{ fontSize: 12 }}
                    tickFormatter={(value) => {
                      // Handle different period formats
                      if (value.includes('-Q')) {
                        // Quarterly format: 2024-Q1
                        const [year, quarter] = value.split('-Q');
                        return `Q${quarter} ${year}`;
                      } else if (value.match(/^\d{4}$/)) {
                        // Yearly format: 2024
                        return value;
                      } else if (value.match(/^\d{4}-\d{2}$/)) {
                        // Monthly format: 2024-01
                        const date = new Date(value + '-01');
                        return date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
                      } else {
                        return value;
                      }
                    }}
                  />
                  <YAxis 
                    tick={{ fontSize: 12 }}
                    tickFormatter={(value) => {
                      // Auto-scale based on data - use compact notation for large numbers
                      const absValue = Math.abs(value);
                      if (absValue >= 1000000) {
                        return `₹${(value / 1000000).toFixed(1)}M`;
                      } else if (absValue >= 100000) {
                        return `₹${(value / 100000).toFixed(1)}L`;
                      } else if (absValue >= 1000) {
                        return `₹${(value / 1000).toFixed(1)}K`;
                      } else {
                        return `₹${value.toFixed(0)}`;
                      }
                    }}
                  />
                  <Tooltip 
                    formatter={(value: number) => [formatCurrency(value), '']}
                    labelFormatter={(label) => {
                      // Handle different period formats
                      if (label.includes('-Q')) {
                        // Quarterly format: 2024-Q1
                        const [year, quarter] = label.split('-Q');
                        return `Q${quarter} ${year}`;
                      } else if (label.match(/^\d{4}$/)) {
                        // Yearly format: 2024
                        return label;
                      } else if (label.match(/^\d{4}-\d{2}$/)) {
                        // Monthly format: 2024-01
                        const date = new Date(label + '-01');
                        return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
                      } else {
                        return label;
                      }
                    }}
                    contentStyle={{ backgroundColor: '#fff', border: '1px solid #ccc', borderRadius: '8px' }}
                  />
                  <Legend />
                  <Bar dataKey="income" fill="#4CAF50" name="💰 Income" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="expenses" fill="#F44336" name="💸 Expenses" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}


        {/* Two charts in one row */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
          {/* Monthly Net Income Trend */}
          <div className="chart-card">
            <h3>📈 {chartGrouping === 'month' ? 'Monthly' : chartGrouping === 'quarter' ? 'Quarterly' : 'Yearly'} Savings (Net Income)</h3>
            <p style={{ color: '#666', fontSize: '14px', marginBottom: '20px' }}>
              Shows how much you saved each {chartGrouping === 'month' ? 'month' : chartGrouping === 'quarter' ? 'quarter' : 'year'} (positive = savings, negative = overspending)
              {(() => {
                const oneYearInMs = 365 * 24 * 60 * 60 * 1000;
                const selectedPeriodLength = period === 'all_time' ? Infinity : 
                  new Date(getDateRangeForPeriod(period).endDate).getTime() - new Date(getDateRangeForPeriod(period).startDate).getTime();
                
                if (selectedPeriodLength < oneYearInMs && period !== 'all_time') {
                  return <span style={{ color: '#2196F3', fontWeight: 'bold' }}> • Current year data</span>;
                }
                return '';
              })()}
            </p>
            {trendsData.length > 0 ? (
              <div style={{ width: '100%', height: '300px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={trendsData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis 
                      dataKey="period" 
                      tick={{ fontSize: 12 }}
                      tickFormatter={(value) => {
                        // Handle different period formats
                        if (value.includes('-Q')) {
                          // Quarterly format: 2024-Q1
                          const [year, quarter] = value.split('-Q');
                          return `Q${quarter} ${year}`;
                        } else if (value.match(/^\d{4}$/)) {
                          // Yearly format: 2024
                          return value;
                        } else if (value.match(/^\d{4}-\d{2}$/)) {
                          // Monthly format: 2024-01
                          const date = new Date(value + '-01');
                          return date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
                        } else {
                          return value;
                        }
                      }}
                    />
                    <YAxis 
                      tick={{ fontSize: 12 }}
                      tickFormatter={(value) => {
                        // Auto-scale based on data - use compact notation for large numbers
                        const absValue = Math.abs(value);
                        if (absValue >= 1000000) {
                          return `₹${(value / 1000000).toFixed(1)}M`;
                        } else if (absValue >= 100000) {
                          return `₹${(value / 100000).toFixed(1)}L`;
                        } else if (absValue >= 1000) {
                          return `₹${(value / 1000).toFixed(1)}K`;
                        } else {
                          return `₹${value.toFixed(0)}`;
                        }
                      }}
                    />
                    <Tooltip 
                      formatter={(value: number) => [formatCurrency(value), '']}
                      labelFormatter={(label) => {
                        const date = new Date(label + '-01');
                        return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
                      }}
                      contentStyle={{ backgroundColor: '#fff', border: '1px solid #ccc', borderRadius: '8px' }}
                    />
                    <Legend />
                    <Area 
                      type="monotone" 
                      dataKey="netIncome" 
                      stroke="#2196F3" 
                      fill="#2196F3" 
                      fillOpacity={0.3}
                      name="💰 Net Income (Savings)" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div style={{ width: '100%', height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#666' }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '48px', marginBottom: '16px' }}>📈</div>
                  <p style={{ fontSize: '16px', marginBottom: '8px' }}>No savings data available</p>
                  <p style={{ fontSize: '14px' }}>Add some transactions to see your monthly savings trends</p>
                </div>
              </div>
            )}
          </div>

          {/* Monthly Savings Rate */}
          <div className="chart-card">
            <h3>💯 {chartGrouping === 'month' ? 'Monthly' : chartGrouping === 'quarter' ? 'Quarterly' : 'Yearly'} Savings Rate (%)</h3>
            <p style={{ color: '#666', fontSize: '14px', marginBottom: '20px' }}>
              Percentage of income you saved each {chartGrouping === 'month' ? 'month' : chartGrouping === 'quarter' ? 'quarter' : 'year'} (higher is better!)
              {(() => {
                const oneYearInMs = 365 * 24 * 60 * 60 * 1000;
                const selectedPeriodLength = period === 'all_time' ? Infinity : 
                  new Date(getDateRangeForPeriod(period).endDate).getTime() - new Date(getDateRangeForPeriod(period).startDate).getTime();
                
                if (selectedPeriodLength < oneYearInMs && period !== 'all_time') {
                  return <span style={{ color: '#2196F3', fontWeight: 'bold' }}> • Current year data</span>;
                }
                return '';
              })()}
            </p>
            {trendsData.length > 0 ? (
              <div style={{ width: '100%', height: '300px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={trendsData.map((trend: any) => ({
                    ...trend,
                    savingsRate: trend.income > 0 ? ((trend.netIncome / trend.income) * 100) : 0
                  }))} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis 
                      dataKey="period" 
                      tick={{ fontSize: 12 }}
                      tickFormatter={(value) => {
                        // Handle different period formats
                        if (value.includes('-Q')) {
                          // Quarterly format: 2024-Q1
                          const [year, quarter] = value.split('-Q');
                          return `Q${quarter} ${year}`;
                        } else if (value.match(/^\d{4}$/)) {
                          // Yearly format: 2024
                          return value;
                        } else if (value.match(/^\d{4}-\d{2}$/)) {
                          // Monthly format: 2024-01
                          const date = new Date(value + '-01');
                          return date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
                        } else {
                          return value;
                        }
                      }}
                    />
                    <YAxis 
                      tick={{ fontSize: 12 }}
                      tickFormatter={(value) => `${value}%`}
                    />
                    <Tooltip 
                      formatter={(value: number) => [`${value.toFixed(1)}%`, 'Savings Rate']}
                      labelFormatter={(label) => {
                        const date = new Date(label + '-01');
                        return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
                      }}
                      contentStyle={{ backgroundColor: '#fff', border: '1px solid #ccc', borderRadius: '8px' }}
                    />
                    <Legend />
                    <Bar 
                      dataKey="savingsRate" 
                      fill="#4CAF50" 
                      name="💯 Savings Rate (%)" 
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div style={{ width: '100%', height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#666' }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '48px', marginBottom: '16px' }}>💯</div>
                  <p style={{ fontSize: '16px', marginBottom: '8px' }}>No savings rate data available</p>
                  <p style={{ fontSize: '14px' }}>Add some transactions to see your savings rate trends</p>
                </div>
              </div>
            )}
          </div>
        </div>

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

