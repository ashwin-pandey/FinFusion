import { TransactionModel, CreateTransactionData, UpdateTransactionData, TransactionFilters, TransactionSummary } from '../models/Transaction';
import { CategoryModel } from '../models/Category';
import { AccountModel } from '../models/Account';

export interface TransactionListResult {
  transactions: any[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface TransactionAnalytics {
  summary: TransactionSummary;
  spendingByCategory: Array<{
    categoryId: string;
    categoryName: string;
    amount: number;
    transactionCount: number;
  }>;
  trends: Array<{
    period: string;
    income: number;
    expenses: number;
    netIncome: number;
  }>;
}

export class TransactionService {
  static async createTransaction(data: CreateTransactionData): Promise<any> {
    // Verify category exists and user has access (skip for transfers)
    if (data.type !== 'TRANSFER' && data.categoryId) {
      const category = await CategoryModel.findById(data.categoryId);
      if (!category) {
        throw new Error('Category not found');
      }

      // Check if category belongs to user or is system category
      if (category.userId && category.userId !== data.userId) {
        throw new Error('Access denied to category');
      }
    }

    // Handle transfer transactions
    if (data.type === 'TRANSFER') {
      if (!data.accountId || !data.toAccountId) {
        throw new Error('Both from and to accounts are required for transfers');
      }
      
      if (data.accountId === data.toAccountId) {
        throw new Error('Cannot transfer to the same account');
      }

      // Verify both accounts exist and user has access
      const fromAccount = await AccountModel.findById(data.accountId, data.userId);
      const toAccount = await AccountModel.findById(data.toAccountId, data.userId);
      
      if (!fromAccount) {
        throw new Error('From account not found');
      }
      if (!toAccount) {
        throw new Error('To account not found');
      }
      
      // Check if user has sufficient balance for transfer
      // Credit cards allow negative balances (debt), other accounts don't
      if (fromAccount.balance < data.amount && fromAccount.type !== 'CREDIT_CARD') {
        throw new Error(`Insufficient funds. Account balance: ${fromAccount.balance}, Required: ${data.amount}`);
      }
      
      // Prevent transferring money TO credit cards with zero balance (they should only have debt)
      if (toAccount.type === 'CREDIT_CARD' && toAccount.balance === 0) {
        throw new Error('Cannot transfer money to a credit card with zero balance. Credit cards should only receive payments when they have debt (negative balance).');
      }

      // Create or find the "Transfer" category for transfers
      let transferCategory = await CategoryModel.findByName('Transfer', data.userId);
      if (!transferCategory) {
        transferCategory = await CategoryModel.create({
          userId: data.userId,
          name: 'Transfer',
          type: 'EXPENSE', // Transfers are neutral, but we'll use EXPENSE as the base type
          icon: '🔄',
          color: '#6B7280'
        });
      }
      
      // Assign the transfer category
      data.categoryId = transferCategory.id;
    } else {
      // Verify account exists and user has access (if accountId is provided)
      if (data.accountId) {
        const account = await AccountModel.findById(data.accountId, data.userId);
        if (!account) {
          throw new Error('Account not found');
        }
        
        // Prevent income transactions to credit cards (credit cards should only have expenses)
        if (data.type === 'INCOME' && account.type === 'CREDIT_CARD') {
          throw new Error('Cannot add income to a credit card. Credit cards should only have expenses (debt).');
        }
        
        // Check if user has sufficient balance for expense transactions
        // Credit cards allow negative balances (debt), other accounts don't
        if (data.type === 'EXPENSE' && account.balance < data.amount && account.type !== 'CREDIT_CARD') {
          throw new Error(`Insufficient funds. Account balance: ${account.balance}, Required: ${data.amount}`);
        }
      }
    }

    const transaction = await TransactionModel.create(data);

    // Update account balance(s)
    if (data.type === 'TRANSFER') {
      // For transfers, decrease from account and increase to account
      await AccountModel.updateBalance(data.accountId!, -data.amount);
      await AccountModel.updateBalance(data.toAccountId!, data.amount);
    } else if (data.accountId) {
      // For regular transactions, update single account
      const amountChange = data.type === 'INCOME' ? data.amount : -data.amount;
      await AccountModel.updateBalance(data.accountId, amountChange);
    }

    return transaction;
  }

  static async getTransactions(
    userId: string,
    filters: Partial<TransactionFilters> = {},
    page: number = 1,
    limit: number = 20
  ): Promise<TransactionListResult> {
    const transactionFilters: TransactionFilters = {
      userId,
      ...filters
    };

    const { transactions, total } = await TransactionModel.findMany(
      transactionFilters,
      page,
      limit
    );

    return {
      transactions,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  }

  static async getTransactionById(id: string, userId: string): Promise<any> {
    const transaction = await TransactionModel.findById(id, userId);
    if (!transaction) {
      throw new Error('Transaction not found');
    }
    return transaction;
  }

  static async updateTransaction(
    id: string,
    userId: string,
    data: UpdateTransactionData
  ): Promise<any> {
    // Check if transaction exists and belongs to user
    const existingTransaction = await TransactionModel.findById(id, userId);
    if (!existingTransaction) {
      throw new Error('Transaction not found');
    }

    // If categoryId is being updated, verify access
    if (data.categoryId && data.categoryId !== existingTransaction.categoryId) {
      const category = await CategoryModel.findById(data.categoryId);
      if (!category) {
        throw new Error('Category not found');
      }

      if (category.userId && category.userId !== userId) {
        throw new Error('Access denied to category');
      }
    }

    return await TransactionModel.update(id, userId, data);
  }

  static async deleteTransaction(id: string, userId: string): Promise<void> {
    const transaction = await TransactionModel.findById(id, userId);
    if (!transaction) {
      throw new Error('Transaction not found');
    }

    // Reverse the account balance change before deleting
    if (transaction.accountId) {
      const amountChange = transaction.type === 'INCOME' ? -transaction.amount : transaction.amount;
      await AccountModel.updateBalance(transaction.accountId, amountChange);
    }

    await TransactionModel.delete(id, userId);
  }

  static async getTransactionAnalytics(
    userId: string,
    startDate?: Date,
    endDate?: Date
  ): Promise<TransactionAnalytics> {
    const filters: TransactionFilters = {
      userId,
      startDate,
      endDate
    };

    const [summary, spendingByCategory, trends] = await Promise.all([
      TransactionModel.getSummary(filters),
      TransactionModel.getSpendingByCategory(userId, startDate, endDate),
      this.getSpendingTrends(userId, startDate, endDate)
    ]);

    return {
      summary,
      spendingByCategory,
      trends
    };
  }

  static async getSpendingTrends(
    userId: string,
    startDate?: Date,
    endDate?: Date,
    groupBy: 'month' | 'quarter' | 'year' = 'month'
  ): Promise<Array<{ period: string; income: number; expenses: number; netIncome: number }>> {
    // Default to last 6 months if no dates provided
    const defaultStartDate = startDate || new Date(Date.now() - 6 * 30 * 24 * 60 * 60 * 1000);
    const defaultEndDate = endDate || new Date();

    const filters: TransactionFilters = {
      userId,
      startDate: defaultStartDate,
      endDate: defaultEndDate
    };

    const { transactions } = await TransactionModel.findMany(filters, 1, 1000);
    
    // Debug: Log transaction amounts
    console.log('Raw transactions from database:', transactions.map(t => ({
      id: t.id,
      amount: t.amount,
      type: t.type,
      date: t.date
    })));
    
    // Debug: Count transaction types
    const typeCounts = transactions.reduce((acc, t) => {
      acc[t.type] = (acc[t.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    console.log('Transaction type counts:', typeCounts);
    
    // Include all transactions (including opening balances as they represent initial income)
    const regularTransactions = transactions;

    // Group by selected period
    const groupedData: { [key: string]: { income: number; expenses: number } } = {};

    regularTransactions.forEach(transaction => {
      let periodKey: string;
      const date = new Date(transaction.date);
      
      switch (groupBy) {
        case 'month':
          periodKey = date.toISOString().substring(0, 7); // YYYY-MM
          break;
        case 'quarter':
          const quarter = Math.floor(date.getMonth() / 3) + 1;
          periodKey = `${date.getFullYear()}-Q${quarter}`; // YYYY-Q1
          break;
        case 'year':
          periodKey = date.getFullYear().toString(); // YYYY
          break;
        default:
          periodKey = date.toISOString().substring(0, 7); // Default to month
      }
      
      if (!groupedData[periodKey]) {
        groupedData[periodKey] = { income: 0, expenses: 0 };
      }

      // Convert Decimal to number properly
      const amount = Number(transaction.amount);

      if (transaction.type === 'INCOME' || transaction.isOpeningBalance) {
        groupedData[periodKey].income += amount;
        console.log(`Added ${transaction.isOpeningBalance ? 'OPENING_BALANCE' : 'INCOME'}: ${amount} to ${periodKey}`);
      } else if (transaction.type === 'EXPENSE') {
        groupedData[periodKey].expenses += amount;
        console.log(`Added EXPENSE: ${amount} to ${periodKey}`);
      } else if (transaction.type === 'OPENING_BALANCE') {
        groupedData[periodKey].income += amount;
        console.log(`Added OPENING_BALANCE: ${amount} to ${periodKey}`);
      } else {
        console.log(`Skipped ${transaction.type}: ${amount} for ${periodKey}`);
      }
      // Skip TRANSFER transactions for spending trends
    });

    const result = Object.entries(groupedData)
      .map(([period, data]) => ({
        period,
        income: Number(Number(data.income || 0).toFixed(2)),
        expenses: Number(Number(data.expenses || 0).toFixed(2)),
        netIncome: Number((Number(data.income || 0) - Number(data.expenses || 0)).toFixed(2))
      }))
      .sort((a, b) => a.period.localeCompare(b.period));
    
    // Debug: Log final calculated amounts
    console.log('Calculated monthly data:', result);
    
    return result;
  }

  static async importTransactions(
    userId: string,
    transactions: Array<{
      amount: number;
      type: 'INCOME' | 'EXPENSE';
      categoryId: string;
      date: Date;
      description?: string;
      paymentMethod?: string;
    }>
  ): Promise<{ success: number; errors: Array<{ row: number; error: string }> }> {
    const results = { success: 0, errors: [] as Array<{ row: number; error: string }> };

    for (let i = 0; i < transactions.length; i++) {
      try {
        const transaction = transactions[i];
        
        // Validate category access
        const category = await CategoryModel.findById(transaction.categoryId);
        if (!category) {
          results.errors.push({ row: i + 1, error: 'Category not found' });
          continue;
        }

        if (category.userId && category.userId !== userId) {
          results.errors.push({ row: i + 1, error: 'Access denied to category' });
          continue;
        }

        await TransactionModel.create({
          userId,
          amount: transaction.amount,
          type: transaction.type,
          categoryId: transaction.categoryId,
          date: transaction.date,
          description: transaction.description,
          paymentMethodId: transaction.paymentMethod as any
        });

        results.success++;
      } catch (error) {
        results.errors.push({ 
          row: i + 1, 
          error: error instanceof Error ? error.message : 'Unknown error' 
        });
      }
    }

    return results;
  }
}
