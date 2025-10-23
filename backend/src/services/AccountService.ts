import { AccountModel, CreateAccountData, UpdateAccountData, AccountFilters } from '../models/Account';

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
    const user = await AccountModel.findById(data.userId, data.userId);
    if (!user) {
      throw new Error('User not found');
    }

    return await AccountModel.create(data);
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
}
