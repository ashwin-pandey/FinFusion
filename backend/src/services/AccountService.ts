import { AccountModel, CreateAccountData, UpdateAccountData, AccountFilters } from '../models/Account';
import { UserModel } from '../models/User';
import { TransactionModel } from '../models/Transaction';

export interface AccountListResult {
  accounts: any[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export class AccountService {
  static async createAccount(data: CreateAccountData): Promise<any> {
    // Verify user exists
    const user = await UserModel.findById(data.userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Create the account first
    const account = await AccountModel.create(data);

    // If there's an initial balance, create an opening balance transaction
    if (data.balance && data.balance !== 0) {
      try {
        // Find or create a system category for opening balances
        const openingBalanceCategory = await this.getOrCreateOpeningBalanceCategory(data.userId);
        
        // Create opening balance transaction
        await TransactionModel.create({
          userId: data.userId,
          amount: Math.abs(data.balance), // Always positive amount
          type: 'OPENING_BALANCE',
          categoryId: openingBalanceCategory.id,
          accountId: account.id,
          date: new Date(),
          description: `Opening balance for ${account.name}`,
          isOpeningBalance: true,
          isRecurring: false
        });

        console.log(`Created opening balance transaction for account ${account.name} with amount ${data.balance}`);
      } catch (error) {
        console.error('Error creating opening balance transaction:', error);
        // Don't fail account creation if opening balance transaction fails
      }
    }

    return account;
  }

  private static async getOrCreateOpeningBalanceCategory(userId: string): Promise<any> {
    // This is a simplified approach - in a real app, you might want to create
    // a proper system category for opening balances
    // For now, we'll use a generic approach
    const { CategoryModel } = await import('../models/Category');
    
    // Try to find an existing opening balance category
    let category = await CategoryModel.findByName('Opening Balance', userId);
    
    if (!category) {
      // Create a system category for opening balances
      category = await CategoryModel.create({
        userId,
        name: 'Opening Balance',
        type: 'INCOME', // Opening balances are treated as income for categorization
        isSystem: true
      });
    }
    
    return category;
  }

  static async getAccount(id: string, userId: string): Promise<any> {
    const account = await AccountModel.findById(id, userId);
    if (!account) {
      throw new Error('Account not found');
    }
    return account;
  }

  static async getAccounts(
    userId: string,
    filters: Partial<AccountFilters>,
    page: number = 1,
    limit: number = 20
  ): Promise<AccountListResult> {
    const accountFilters: AccountFilters = {
      userId,
      ...filters
    };

    const { accounts, total } = await AccountModel.findMany(accountFilters, page, limit);

    return {
      accounts,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  }

  static async updateAccount(id: string, userId: string, data: UpdateAccountData): Promise<any> {
    const account = await AccountModel.findById(id, userId);
    if (!account) {
      throw new Error('Account not found');
    }

    return await AccountModel.update(id, userId, data);
  }

  static async deleteAccount(id: string, userId: string): Promise<void> {
    const account = await AccountModel.findById(id, userId);
    if (!account) {
      throw new Error('Account not found');
    }

    await AccountModel.delete(id, userId);
  }

  static async updateAccountBalance(id: string, userId: string, amount: number): Promise<any> {
    const account = await AccountModel.findById(id, userId);
    if (!account) {
      throw new Error('Account not found');
    }

    return await AccountModel.updateBalance(id, amount);
  }

  static async getTotalBalance(userId: string): Promise<number> {
    return await AccountModel.getTotalBalance(userId);
  }

  static async getAccountsByType(userId: string, type: string): Promise<any[]> {
    return await AccountModel.getAccountsByType(userId, type);
  }

  static async getAccountSummary(userId: string): Promise<any> {
    const [totalBalance, accountsByType] = await Promise.all([
      AccountModel.getTotalBalance(userId),
      Promise.all([
        AccountModel.getAccountsByType(userId, 'CHECKING'),
        AccountModel.getAccountsByType(userId, 'SAVINGS'),
        AccountModel.getAccountsByType(userId, 'CREDIT_CARD'),
        AccountModel.getAccountsByType(userId, 'CASH'),
        AccountModel.getAccountsByType(userId, 'INVESTMENT'),
        AccountModel.getAccountsByType(userId, 'LOAN')
      ])
    ]);

    const [checking, savings, creditCard, cash, investment, loan] = accountsByType;

    return {
      totalBalance,
      accountsByType: {
        checking: checking.length,
        savings: savings.length,
        creditCard: creditCard.length,
        cash: cash.length,
        investment: investment.length,
        loan: loan.length
      },
      balancesByType: {
        checking: checking.reduce((sum, acc) => sum + Number(acc.balance), 0),
        savings: savings.reduce((sum, acc) => sum + Number(acc.balance), 0),
        creditCard: creditCard.reduce((sum, acc) => sum + Number(acc.balance), 0),
        cash: cash.reduce((sum, acc) => sum + Number(acc.balance), 0),
        investment: investment.reduce((sum, acc) => sum + Number(acc.balance), 0),
        loan: loan.reduce((sum, acc) => sum + Number(acc.balance), 0)
      }
    };
  }

  /**
   * Get credit account information (available credit, debt, etc.)
   */
  static async getCreditAccountInfo(accountId: string, userId: string, creditLimit?: number): Promise<any> {
    const account = await AccountModel.findById(accountId, userId);
    if (!account) {
      throw new Error('Account not found');
    }

    if (account.type !== 'CREDIT_CARD') {
      throw new Error('Account is not a credit card');
    }

    const balance = parseFloat(account.balance.toString());
    const debt = balance; // Positive balance = debt
    const availableCredit = creditLimit ? creditLimit - debt : null;

    return {
      account,
      debt,
      availableCredit,
      creditLimit,
      creditUtilization: creditLimit ? (debt / creditLimit) * 100 : null
    };
  }

  /**
   * Update credit limit for a credit card
   */
  static async updateCreditLimit(accountId: string, userId: string, creditLimit: number): Promise<any> {
    const account = await AccountModel.findById(accountId, userId);
    if (!account) {
      throw new Error('Account not found');
    }

    if (account.type !== 'CREDIT_CARD') {
      throw new Error('Account is not a credit card');
    }

    // Store credit limit in account metadata or separate table
    // For now, we'll add it as a note in the account name or description
    return await AccountModel.update(accountId, {
      name: `${account.name} (Limit: ${creditLimit})`
    });
  }
}
