import { RecurringTransactionService } from './RecurringTransactionService';

export class CronService {
  /**
   * Process recurring transactions daily
   * This should be called by a cron job or scheduler
   */
  static async processRecurringTransactions(): Promise<void> {
    try {
      console.log('Starting recurring transaction processing...');
      await RecurringTransactionService.processRecurringTransactions();
      console.log('Recurring transaction processing completed.');
    } catch (error) {
      console.error('Error processing recurring transactions:', error);
    }
  }

  /**
   * Process recurring transactions for a specific date
   */
  static async processRecurringTransactionsForDate(date: Date): Promise<void> {
    try {
      console.log(`Processing recurring transactions for ${date.toISOString()}...`);
      await RecurringTransactionService.processRecurringTransactions(date);
      console.log('Recurring transaction processing completed.');
    } catch (error) {
      console.error('Error processing recurring transactions:', error);
    }
  }
}


