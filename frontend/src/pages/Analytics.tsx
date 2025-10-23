import React, { useEffect, useState } from 'react';
import { useAnalytics } from '../hooks/useAnalytics';
import { useCurrency } from '../contexts/CurrencyContext';
import { formatPercentage, formatDate } from '../utils/formatters';
import { getDateRangeForPeriod, toISODateString } from '../utils/dateHelpers';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { getTransactionTypeColor, generateColorPalette } from '../utils/chartHelpers';
import './Analytics.css';

const Analytics: React.FC = () => {
  const { dashboard, spendingTrends, incomeBreakdown, expenseBreakdown, isLoading, error, fetchDashboard, fetchTrends, fetchBreakdown } = useAnalytics(false);
  const { formatCurrency } = useCurrency();
  const [period, setPeriod] = useState<'this_month' | 'last_month' | 'last_90_days' | 'this_year' | 'all_time'>('last_90_days');
  const [trendGroupBy, setTrendGroupBy] = useState<'day' | 'week' | 'month'>('week');

  useEffect(() => {
    loadAnalytics();
  }, [period, trendGroupBy]);

  const loadAnalytics = async () => {
    if (period === 'all_time') {
      // For all time, don't pass date filters
      await Promise.all([
        fetchDashboard(),
        fetchTrends(), // No parameters for all time
        fetchBreakdown('INCOME'),
        fetchBreakdown('EXPENSE'),
      ]);
    } else {
      const { startDate, endDate } = getDateRangeForPeriod(period);
      const start = toISODateString(startDate);
      const end = toISODateString(endDate);

      await Promise.all([
        fetchDashboard(start, end),
        fetchTrends(start, end, trendGroupBy),
        fetchBreakdown('INCOME', start, end),
        fetchBreakdown('EXPENSE', start, end),
      ]);
    }
  };

  if (isLoading && !dashboard) {
    return (
      <div className="loading-container">
        <div className="loading-spinner">Loading analytics...</div>
      </div>
    );
  }

  // Add error handling
  if (error) {
    return (
      <div className="error-container">
        <h2>Error loading analytics</h2>
        <p>{error}</p>
        <button onClick={() => window.location.reload()}>Retry</button>
      </div>
    );
  }

  if (!dashboard && !isLoading) {
    return (
      <div className="error-container">
        <h2>Unable to load analytics</h2>
        <p>Please try refreshing the page or check your connection.</p>
      </div>
    );
  }

  const summary = dashboard?.summary;
  const totalTransactions = (summary?.transactionCounts.income || 0) + (summary?.transactionCounts.expenses || 0);
  const avgIncome = summary ? summary.totalIncome / Math.max(summary.transactionCounts.income, 1) : 0;
  const avgExpense = summary ? summary.totalExpenses / Math.max(summary.transactionCounts.expenses, 1) : 0;

  // Debug logging
  console.log('Analytics data:', { dashboard, spendingTrends, incomeBreakdown, expenseBreakdown });

  // Prepare data for combined chart
  const combinedData = Array.isArray(spendingTrends) ? spendingTrends.map((trend: any) => ({
    period: trend.period,
    income: trend.income,
    expenses: trend.expenses,
    net: trend.netIncome,
  })) : [];

  // Top spending categories (top 5)
  const topExpenses = Array.isArray(expenseBreakdown) ? [...expenseBreakdown]
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 5) : [];

  // Calculate spending by day of week (mock data - would need backend support)
  const dayOfWeekData = [
    { day: 'Mon', amount: 0 },
    { day: 'Tue', amount: 0 },
    { day: 'Wed', amount: 0 },
    { day: 'Thu', amount: 0 },
    { day: 'Fri', amount: 0 },
    { day: 'Sat', amount: 0 },
    { day: 'Sun', amount: 0 },
  ];

  return (
    <div className="analytics-page">
      <div className="page-header">
        <h1>Analytics & Insights</h1>
        <div className="analytics-controls">
          <select value={period} onChange={(e) => setPeriod(e.target.value as any)}>
            <option value="this_month">This Month</option>
            <option value="last_month">Last Month</option>
            <option value="last_90_days">Last 90 Days</option>
            <option value="this_year">This Year</option>
            <option value="all_time">All Time</option>
          </select>
          <select value={trendGroupBy} onChange={(e) => setTrendGroupBy(e.target.value as any)}>
            <option value="day">By Day</option>
            <option value="week">By Week</option>
            <option value="month">By Month</option>
          </select>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="metrics-grid">
        <div className="metric-card">
          <div className="metric-icon">📊</div>
          <div className="metric-content">
            <p className="metric-label">Total Transactions</p>
            <h2 className="metric-value">{totalTransactions}</h2>
            <p className="metric-subtitle">
              {summary?.transactionCounts.income || 0} income • {summary?.transactionCounts.expenses || 0} expenses
            </p>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon">💵</div>
          <div className="metric-content">
            <p className="metric-label">Avg. Income</p>
            <h2 className="metric-value">{formatCurrency(avgIncome)}</h2>
            <p className="metric-subtitle">Per transaction</p>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon">💸</div>
          <div className="metric-content">
            <p className="metric-label">Avg. Expense</p>
            <h2 className="metric-value">{formatCurrency(avgExpense)}</h2>
            <p className="metric-subtitle">Per transaction</p>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon">📈</div>
          <div className="metric-content">
            <p className="metric-label">Savings Rate</p>
            <h2 className="metric-value">
              {summary && summary.totalIncome > 0
                ? formatPercentage((summary.netIncome / summary.totalIncome) * 100)
                : '0%'}
            </h2>
            <p className="metric-subtitle">Of total income</p>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="charts-container">
        {/* Income vs Expenses Trend */}
        {combinedData.length > 0 && (
          <div className="chart-card chart-full">
            <h3>Income vs Expenses Trend</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={combinedData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="period" />
                <YAxis />
                <Tooltip formatter={(value: number) => formatCurrency(value)} />
                <Legend />
                <Line type="monotone" dataKey="income" stroke="#4CAF50" strokeWidth={2} name="Income" />
                <Line type="monotone" dataKey="expenses" stroke="#F44336" strokeWidth={2} name="Expenses" />
                <Line type="monotone" dataKey="net" stroke="#2196F3" strokeWidth={2} name="Net" strokeDasharray="5 5" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Cashflow Area Chart */}
        {combinedData.length > 0 && (
          <div className="chart-card chart-full">
            <h3>Cash Flow</h3>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={combinedData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="period" />
                <YAxis />
                <Tooltip formatter={(value: number) => formatCurrency(value)} />
                <Legend />
                <Area type="monotone" dataKey="income" stackId="1" stroke="#4CAF50" fill="#4CAF50" fillOpacity={0.6} name="Income" />
                <Area type="monotone" dataKey="expenses" stackId="2" stroke="#F44336" fill="#F44336" fillOpacity={0.6} name="Expenses" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Top Spending Categories */}
        {topExpenses.length > 0 && (
          <div className="chart-card">
            <h3>Top Spending Categories</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={topExpenses} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="category.name" type="category" width={100} />
                <Tooltip formatter={(value: number) => formatCurrency(value)} />
                <Bar dataKey="amount" fill="#667eea">
                  {topExpenses.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={entry.category.color || '#667eea'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Expense Distribution */}
        {expenseBreakdown.length > 0 && (
          <div className="chart-card">
            <h3>Expense Distribution</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={expenseBreakdown}
                  dataKey="amount"
                  nameKey="category.name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label={(entry: any) => `${entry.category.name} (${formatPercentage(entry.percentage)})`}
                >
                  {expenseBreakdown.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={entry.category.color || generateColorPalette(expenseBreakdown.length)[index]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => formatCurrency(value)} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Income Distribution */}
        {incomeBreakdown.length > 0 && (
          <div className="chart-card">
            <h3>Income Distribution</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={incomeBreakdown}
                  dataKey="amount"
                  nameKey="category.name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label={(entry: any) => `${entry.category.name} (${formatPercentage(entry.percentage)})`}
                >
                  {incomeBreakdown.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={entry.category.color || generateColorPalette(incomeBreakdown.length)[index]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => formatCurrency(value)} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Insights Section */}
      <div className="insights-section">
        <h2>💡 Insights</h2>
        <div className="insights-grid">
          {summary && summary.netIncome > 0 && (
            <div className="insight-card positive">
              <h4>Great Job! 🎉</h4>
              <p>You saved {formatCurrency(summary.netIncome)} this period. Keep it up!</p>
            </div>
          )}

          {summary && summary.netIncome < 0 && (
            <div className="insight-card negative">
              <h4>Watch Out! ⚠️</h4>
              <p>You spent {formatCurrency(Math.abs(summary.netIncome))} more than you earned.</p>
            </div>
          )}

          {topExpenses.length > 0 && (
            <div className="insight-card">
              <h4>Top Spending Category</h4>
              <p>
                {topExpenses[0].category.icon} <strong>{topExpenses[0].category.name}</strong> - {formatCurrency(topExpenses[0].amount)} ({formatPercentage(topExpenses[0].percentage)})
              </p>
            </div>
          )}

          {expenseBreakdown.length > 0 && (
            <div className="insight-card">
              <h4>Category Diversity</h4>
              <p>You spent across {expenseBreakdown.length} different categories.</p>
            </div>
          )}
        </div>
      </div>

      {/* Category Breakdown Table */}
      {expenseBreakdown.length > 0 && (
        <div className="breakdown-section">
          <h2>Detailed Category Breakdown</h2>
          <div className="breakdown-table">
            <table>
              <thead>
                <tr>
                  <th>Category</th>
                  <th>Amount</th>
                  <th>Transactions</th>
                  <th>Percentage</th>
                  <th>Average</th>
                </tr>
              </thead>
              <tbody>
                {expenseBreakdown.map((item: any) => (
                  <tr key={item.category.id}>
                    <td>
                      <span className="category-cell">
                        <span style={{ fontSize: '20px' }}>{item.category.icon}</span>
                        <span>{item.category.name}</span>
                      </span>
                    </td>
                    <td className="amount-cell">{formatCurrency(item.amount)}</td>
                    <td>{item.transactionCount}</td>
                    <td>
                      <div className="percentage-bar">
                        <div
                          className="percentage-fill"
                          style={{
                            width: `${item.percentage}%`,
                            backgroundColor: item.category.color
                          }}
                        />
                        <span>{formatPercentage(item.percentage)}</span>
                      </div>
                    </td>
                    <td>{formatCurrency(item.amount / item.transactionCount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default Analytics;
