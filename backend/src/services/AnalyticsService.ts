import { TransactionService } from './TransactionService';
import { BudgetService } from './BudgetService';
import { CategoryModel } from '../models/Category';

export interface DashboardOverview {
  period: {
    startDate: Date;
    endDate: Date;
  };
  summary: {
    totalIncome: number;
    totalExpenses: number;
    netIncome: number;
    transactionCounts: {
      income: number;
      expenses: number;
    };
  };
  budgetUtilization: Array<{
    budgetId: string;
    categoryName: string;
    allocatedAmount: number;
    spentAmount: number;
    remainingAmount: number;
    utilizationPercentage: number;
  }>;
}

export interface SpendingTrends {
  period: {
    startDate: Date;
    endDate: Date;
    groupBy: 'day' | 'week' | 'month';
  };
  trends: Array<{
    period: string;
    income: number;
    expenses: number;
    netIncome: number;
  }>;
}

export interface CategoryBreakdown {
  period: {
    startDate: Date;
    endDate: Date;
  };
  totalAmount: number;
  breakdown: Array<{
    category: {
      id: string;
      name: string;
      type: 'INCOME' | 'EXPENSE';
      icon?: string;
      color?: string;
    };
    amount: number;
    transactionCount: number;
    percentage: number;
  }>;
}

export class AnalyticsService {
  static async getDashboardOverview(
    userId: string,
    startDate?: Date,
    endDate?: Date
  ): Promise<DashboardOverview> {
    // Default to current month if no dates provided
    const now = new Date();
    const defaultStartDate = startDate || new Date(now.getFullYear(), now.getMonth(), 1);
    const defaultEndDate = endDate || new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const [transactionAnalytics, budgetAnalytics] = await Promise.all([
      TransactionService.getTransactionAnalytics(userId, defaultStartDate, defaultEndDate),
      BudgetService.getBudgetAnalytics(userId, defaultStartDate, defaultEndDate)
    ]);

    // Get budget utilization details
    const budgetUtilization = budgetAnalytics.budgets.map(budget => ({
      budgetId: budget.budgetId,
      categoryName: budget.categoryName,
      allocatedAmount: budget.allocatedAmount,
      spentAmount: budget.spentAmount,
      remainingAmount: budget.remainingAmount,
      utilizationPercentage: budget.utilizationPercentage
    }));

    return {
      period: {
        startDate: defaultStartDate,
        endDate: defaultEndDate
      },
      summary: {
        totalIncome: transactionAnalytics.summary.totalIncome,
        totalExpenses: transactionAnalytics.summary.totalExpenses,
        netIncome: transactionAnalytics.summary.netIncome,
        transactionCounts: {
          income: transactionAnalytics.summary.incomeCount,
          expenses: transactionAnalytics.summary.expenseCount
        }
      },
      budgetUtilization
    };
  }

  static async getSpendingTrends(
    userId: string,
    startDate?: Date,
    endDate?: Date,
    groupBy: 'day' | 'week' | 'month' = 'month'
  ): Promise<SpendingTrends> {
    // Default to last 6 months if no dates provided
    const now = new Date();
    const defaultStartDate = startDate || new Date(now.getFullYear(), now.getMonth() - 6, 1);
    const defaultEndDate = endDate || new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const trends = await TransactionService.getSpendingTrends(userId, defaultStartDate, defaultEndDate);

    return {
      period: {
        startDate: defaultStartDate,
        endDate: defaultEndDate,
        groupBy
      },
      trends
    };
  }

  static async getCategoryBreakdown(
    userId: string,
    startDate?: Date,
    endDate?: Date,
    type?: 'INCOME' | 'EXPENSE'
  ): Promise<CategoryBreakdown> {
    // Default to current month if no dates provided
    const now = new Date();
    const defaultStartDate = startDate || new Date(now.getFullYear(), now.getMonth(), 1);
    const defaultEndDate = endDate || new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const transactionAnalytics = await TransactionService.getTransactionAnalytics(
      userId,
      defaultStartDate,
      defaultEndDate
    );

    // Get category details
    const categoryDetails = await Promise.all(
      transactionAnalytics.spendingByCategory.map(async (item: any) => {
        const category = await CategoryModel.findById(item.categoryId);
        if (!category) return null;

        return {
          category: {
            id: category.id,
            name: category.name,
            type: category.type,
            icon: category.icon,
            color: category.color
          },
          amount: item.amount,
          transactionCount: item.transactionCount,
          percentage: 0 // Will be calculated below
        };
      })
    );

    const validCategoryDetails = categoryDetails.filter(Boolean) as any[];
    const totalAmount = validCategoryDetails.reduce((sum, item) => sum + (item.amount || 0), 0);

    // Calculate percentages
    const breakdown = validCategoryDetails.map(item => ({
      ...item,
      percentage: totalAmount > 0 ? Number(((item.amount / totalAmount) * 100).toFixed(2)) : 0
    }));

    return {
      period: {
        startDate: defaultStartDate,
        endDate: defaultEndDate
      },
      totalAmount: Number(totalAmount.toFixed(2)),
      breakdown: breakdown.sort((a, b) => b.amount - a.amount)
    };
  }

  static async getBudgetPerformance(
    userId: string,
    startDate?: Date,
    endDate?: Date
  ): Promise<any> {
    return await BudgetService.getBudgetPerformance(userId, startDate, endDate);
  }

  static async getFinancialInsights(userId: string): Promise<{
    monthlyAverage: {
      income: number;
      expenses: number;
      netIncome: number;
    };
    topSpendingCategories: Array<{
      categoryName: string;
      amount: number;
      percentage: number;
    }>;
    budgetHealth: {
      onTrack: number;
      warning: number;
      overBudget: number;
    };
    recommendations: string[];
  }> {
    // Get last 3 months of data
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

    const [transactionAnalytics, budgetAnalytics, categoryBreakdown] = await Promise.all([
      TransactionService.getTransactionAnalytics(userId, threeMonthsAgo, new Date()),
      BudgetService.getBudgetAnalytics(userId),
      this.getCategoryBreakdown(userId, threeMonthsAgo, new Date())
    ]);

    // Calculate monthly averages
    const monthlyAverage = {
      income: Number(((transactionAnalytics.summary.totalIncome || 0) / 3).toFixed(2)),
      expenses: Number(((transactionAnalytics.summary.totalExpenses || 0) / 3).toFixed(2)),
      netIncome: Number((((transactionAnalytics.summary.totalIncome || 0) - (transactionAnalytics.summary.totalExpenses || 0)) / 3).toFixed(2))
    };

    // Get top spending categories
    const topSpendingCategories = categoryBreakdown.breakdown
      .filter(item => item.category.type === 'EXPENSE')
      .slice(0, 5)
      .map(item => ({
        categoryName: item.category.name,
        amount: item.amount,
        percentage: item.percentage
      }));

    // Generate recommendations
    const recommendations: string[] = [];

    if (monthlyAverage.netIncome < 0) {
      recommendations.push('Your expenses exceed your income. Consider reducing spending or increasing income.');
    }

    if (budgetAnalytics.overallUtilization > 90) {
      recommendations.push('You\'re using over 90% of your budget. Consider reviewing your spending habits.');
    }

    if (budgetAnalytics.statusCounts['over-budget'] > 0) {
      recommendations.push(`You have ${budgetAnalytics.statusCounts['over-budget']} budget(s) that are over budget.`);
    }

    if (topSpendingCategories.length > 0) {
      const topCategory = topSpendingCategories[0];
      if (topCategory.percentage > 30) {
        recommendations.push(`${topCategory.categoryName} accounts for ${topCategory.percentage}% of your spending. Consider if this is necessary.`);
      }
    }

    if (recommendations.length === 0) {
      recommendations.push('Great job! Your finances look healthy. Keep up the good work!');
    }

    return {
      monthlyAverage,
      topSpendingCategories,
      budgetHealth: {
        onTrack: budgetAnalytics.statusCounts['on-track'],
        warning: budgetAnalytics.statusCounts['warning'],
        overBudget: budgetAnalytics.statusCounts['over-budget']
      },
      recommendations
    };
  }
}
