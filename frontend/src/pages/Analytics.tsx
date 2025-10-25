import React, { useEffect, useState } from 'react';
import { useAnalytics } from '../hooks/useAnalytics';
import { useCurrency } from '../contexts/CurrencyContext';
import { formatPercentage, formatDate } from '../utils/formatters';
import { getDateRangeForPeriod, toISODateString } from '../utils/dateHelpers';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { getTransactionTypeColor, generateColorPalette } from '../utils/chartHelpers';
import { Text } from '@fluentui/react-components';
import StatCard from '../components/Cards/StatCard';
import ClickableNumber from '../components/ClickableNumber';
import './Analytics.css';
import './EnhancedAnalytics.css';

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

  // Enhanced analytics calculations with proper null checks
  const savingsRate = summary && summary.totalIncome && summary.totalIncome > 0 
    ? (summary.netIncome || 0) / summary.totalIncome * 100 
    : 0;
  
  const expenseVelocity = summary && summary.totalExpenses && summary.totalExpenses > 0
    ? summary.totalExpenses / 30 // Daily spending rate
    : 0;
  
  const budgetHealth = summary && summary.totalIncome && summary.totalIncome > 0
    ? Math.min(100, ((summary.netIncome || 0) / summary.totalIncome) * 100)
    : 0;
  
  // Spending pattern analysis with null checks
  const hasHighSpending = topExpenses.length > 0 && topExpenses[0] && topExpenses[0].percentage > 40;
  const hasDiverseSpending = expenseBreakdown && expenseBreakdown.length > 5;
  const isOverspending = summary && (summary.netIncome || 0) < 0;
  
  // Financial health score (0-100) with safe calculations
  const healthScore = Math.max(0, Math.min(100, 
    (savingsRate * 0.4) + 
    (budgetHealth * 0.3) + 
    (hasDiverseSpending ? 20 : 0) + 
    (isOverspending ? -30 : 20)
  ));

  return (
    <div className="analytics-page">
      <div className="page-header">
        <h1>Analytics & Insights</h1>
        <div>
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value as 'this_month' | 'last_month' | 'last_90_days' | 'this_year' | 'all_time')}
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

      {/* Key Metrics */}
      <div className="summary-grid">
        <StatCard
          icon="📊"
          iconColor="#e3f2fd"
          value={<ClickableNumber value={totalTransactions} showCurrency={false} />}
          label="Total Transactions"
        />

        <StatCard
          icon="💵"
          iconColor="#e8f5e9"
          value={<ClickableNumber value={avgIncome} />}
          label="Avg. Income"
        />

        <StatCard
          icon="💸"
          iconColor="#ffebee"
          value={<ClickableNumber value={avgExpense} />}
          label="Avg. Expense"
        />

        <StatCard
          icon="📈"
          iconColor="#f3e5f5"
          value={
            summary && summary.totalIncome > 0
              ? formatPercentage((summary.netIncome / summary.totalIncome) * 100)
              : '0%'
          }
          label="Savings Rate"
        />

        <StatCard
          icon="💸"
          iconColor="#fff3e0"
          value={<ClickableNumber value={expenseVelocity || 0} />}
          label="Daily Spending Rate"
        />

        <StatCard
          icon="🏥"
          iconColor={healthScore >= 70 ? "#e8f5e9" : healthScore >= 40 ? "#fff3e0" : "#ffebee"}
          value={`${Math.round(healthScore || 0)}/100`}
          label="Financial Health Score"
        />

        <StatCard
          icon="📊"
          iconColor="#e3f2fd"
          value={(expenseBreakdown?.length || 0).toString()}
          label="Spending Categories"
        />
      </div>

      {/* Charts Grid */}
      <div className="charts-grid">
        {/* Income vs Expenses Trend */}
        {combinedData.length > 0 && (
          <div className="chart-card full-width">
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
          <div className="chart-card full-width">
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

      {/* Enhanced Insights Section */}
      <div className="insights-section">
        <h2>💡 Smart Insights & Recommendations</h2>
        <div className="insights-grid">
          {/* Financial Health Assessment */}
          <div className={`insight-card ${healthScore >= 70 ? 'positive' : healthScore >= 40 ? 'warning' : 'negative'}`}>
            <h4>{healthScore >= 70 ? 'Excellent Financial Health! 🎉' : healthScore >= 40 ? 'Good Progress 📈' : 'Needs Attention ⚠️'}</h4>
            <p>
              {healthScore >= 70 
                ? `Your financial health score is ${Math.round(healthScore)}/100. You're doing great!`
                : healthScore >= 40 
                ? `Your financial health score is ${Math.round(healthScore)}/100. Keep improving!`
                : `Your financial health score is ${Math.round(healthScore)}/100. Consider reducing expenses or increasing income.`
              }
            </p>
          </div>

          {/* Savings Analysis */}
          {summary && (
            <div className={`insight-card ${(summary.netIncome || 0) > 0 ? 'positive' : 'negative'}`}>
              <h4>{(summary.netIncome || 0) > 0 ? 'Savings Success! 💰' : 'Overspending Alert! 🚨'}</h4>
              <p>
                {(summary.netIncome || 0) > 0 
                  ? `You saved ${formatCurrency(summary.netIncome || 0)} (${formatPercentage(savingsRate)} of income). Excellent work!`
                  : `You spent ${formatCurrency(Math.abs(summary.netIncome || 0))} more than you earned. Consider reviewing your budget.`
                }
              </p>
            </div>
          )}

          {/* Spending Pattern Analysis */}
          {hasHighSpending && topExpenses[0] && (
            <div className="insight-card warning">
              <h4>Concentrated Spending ⚠️</h4>
              <p>
                {topExpenses[0].category?.icon || '📊'} <strong>{topExpenses[0].category?.name || 'Unknown'}</strong> represents {formatPercentage(topExpenses[0].percentage || 0)} of your spending. 
                Consider diversifying your expenses.
              </p>
            </div>
          )}

          {/* Spending Diversity */}
          {hasDiverseSpending && (
            <div className="insight-card positive">
              <h4>Diverse Spending Pattern ✅</h4>
              <p>Great! You're spending across {expenseBreakdown?.length || 0} different categories, showing good financial diversity.</p>
            </div>
          )}

          {/* Daily Spending Rate */}
          {expenseVelocity > 0 && (
            <div className="insight-card">
              <h4>Daily Spending Rate 📊</h4>
              <p>You're spending an average of {formatCurrency(expenseVelocity || 0)} per day. 
                {(expenseVelocity || 0) > ((summary?.totalIncome || 0) / 30)
                  ? ' This is above your daily income rate.' 
                  : ' This is within a healthy range.'
                }
              </p>
            </div>
          )}

          {/* Top Category Recommendation */}
          {topExpenses.length > 0 && topExpenses[0] && (
            <div className="insight-card">
              <h4>Top Spending Category 📈</h4>
              <p>
                {topExpenses[0].category?.icon || '📊'} <strong>{topExpenses[0].category?.name || 'Unknown'}</strong> - {formatCurrency(topExpenses[0].amount || 0)} ({formatPercentage(topExpenses[0].percentage || 0)})
                {(topExpenses[0].percentage || 0) > 30 && ' - Consider if this spending is necessary.'}
              </p>
            </div>
          )}

          {/* Budget Recommendations */}
          {summary && (summary.totalIncome || 0) > 0 && (
            <div className="insight-card">
              <h4>Budget Recommendations 💡</h4>
              <p>
                {(savingsRate || 0) < 10 
                  ? 'Try to save at least 10% of your income. Consider the 50/30/20 rule: 50% needs, 30% wants, 20% savings.'
                  : (savingsRate || 0) < 20
                  ? 'Good savings rate! Consider increasing to 20% for better financial security.'
                  : 'Excellent savings rate! You\'re on track for financial independence.'
                }
              </p>
            </div>
          )}

          {/* Transaction Frequency */}
          {totalTransactions > 0 && (
            <div className="insight-card">
              <h4>Transaction Activity 📱</h4>
              <p>
                You made {totalTransactions} transactions this period. 
                {totalTransactions > 50 
                  ? ' High transaction frequency - consider consolidating smaller purchases.'
                  : ' Good transaction frequency - not too many, not too few.'
                }
              </p>
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
