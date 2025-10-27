import { PrismaClient } from '@prisma/client';
import { LoanService } from './LoanService';
import { TransactionService } from './TransactionService';

const prisma = new PrismaClient();

export class LoanSchedulerService {
  /**
   * Process scheduled loan payments for today
   * This should be called by a cron job daily
   */
  static async processScheduledPayments(): Promise<void> {
    try {
      console.log('Starting scheduled loan payment processing...');
      
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      // Find all scheduled payments due today
      const scheduledPayments = await prisma.loanPayment.findMany({
        where: {
          isScheduled: true,
          status: 'SCHEDULED',
          scheduledDate: {
            gte: today,
            lt: new Date(today.getTime() + 24 * 60 * 60 * 1000) // Next day
          }
        },
        include: {
          loan: {
            include: {
              account: true,
              user: true
            }
          }
        }
      });

      console.log(`Found ${scheduledPayments.length} scheduled payments for today`);

      for (const payment of scheduledPayments) {
        try {
          await this.executeScheduledPayment(payment);
          console.log(`Successfully processed payment ${payment.id} for loan ${payment.loanId}`);
        } catch (error) {
          console.error(`Failed to process payment ${payment.id}:`, error);
          // Mark as defaulted if execution fails
          await this.markPaymentAsDefaulted(payment.id, 'Payment execution failed');
        }
      }

      console.log('Scheduled loan payment processing completed.');
    } catch (error) {
      console.error('Error processing scheduled loan payments:', error);
    }
  }

  /**
   * Execute a scheduled payment
   */
  private static async executeScheduledPayment(payment: any): Promise<void> {
    const { loan } = payment;
    
    // Check if account has sufficient balance
    if (Number(loan.account.balance) < Number(payment.amount)) {
      throw new Error('Insufficient account balance');
    }

    // Create the transaction
    const transaction = await TransactionService.createTransaction({
      userId: loan.userId,
      amount: payment.amount,
      type: 'EXPENSE',
      categoryId: await this.getLoanExpenseCategoryId(loan.userId),
      accountId: loan.accountId,
      date: new Date(),
      description: `Scheduled payment for ${loan.name}`,
      paymentMethodId: await this.getDefaultPaymentMethodId(loan.userId)
    });

    // Update the loan payment with transaction ID
    await prisma.loanPayment.update({
      where: { id: payment.id },
      data: {
        transactionId: transaction.id,
        status: 'COMPLETED',
        paymentDate: new Date(),
        isScheduled: false
      }
    });

    // Update loan balance and next payment date
    await LoanService.updateLoanAfterPayment(loan.id, payment.amount);
  }

  /**
   * Mark a payment as defaulted
   */
  private static async markPaymentAsDefaulted(paymentId: string, reason: string): Promise<void> {
    await prisma.loanPayment.update({
      where: { id: paymentId },
      data: {
        status: 'DEFAULTED',
        defaultReason: reason,
        updatedAt: new Date()
      }
    });
  }

  /**
   * Create scheduled payments for a loan
   */
  static async createScheduledPayments(loanId: string): Promise<void> {
    const loan = await prisma.loan.findUnique({
      where: { id: loanId },
      include: { account: true }
    });

    if (!loan || loan.status !== 'ACTIVE') {
      throw new Error('Loan not found or not active');
    }

    // Calculate EMI amount
    const emiAmount = this.calculateEMI(
      Number(loan.currentBalance),
      Number(loan.currentInterestRate || loan.originalInterestRate),
      loan.remainingTermMonths || loan.originalTermMonths
    );

    // Create scheduled payments for the remaining term
    const payments = [];
    const startDate = loan.nextPaymentDate || new Date();
    
    for (let i = 0; i < (loan.remainingTermMonths || loan.originalTermMonths); i++) {
      const paymentDate = new Date(startDate);
      paymentDate.setMonth(paymentDate.getMonth() + i);
      
      payments.push({
        loanId,
        amount: emiAmount,
        principalAmount: 0, // Will be calculated when payment is executed
        interestAmount: 0, // Will be calculated when payment is executed
        paymentDate: paymentDate,
        isScheduled: true,
        scheduledDate: paymentDate,
        status: 'SCHEDULED'
      });
    }

    await prisma.loanPayment.createMany({
      data: payments
    });

    console.log(`Created ${payments.length} scheduled payments for loan ${loanId}`);
  }

  /**
   * Delete a scheduled payment (for defaults)
   */
  static async deleteScheduledPayment(paymentId: string, reason: string): Promise<void> {
    const payment = await prisma.loanPayment.findUnique({
      where: { id: paymentId },
      include: { loan: true }
    });

    if (!payment) {
      throw new Error('Payment not found');
    }

    if (payment.status !== 'SCHEDULED') {
      throw new Error('Can only delete scheduled payments');
    }

    // Mark as cancelled instead of deleting to maintain audit trail
    await prisma.loanPayment.update({
      where: { id: paymentId },
      data: {
        status: 'CANCELLED',
        defaultReason: reason,
        updatedAt: new Date()
      }
    });

    // Update loan's next payment date
    const nextScheduledPayment = await prisma.loanPayment.findFirst({
      where: {
        loanId: payment.loanId,
        status: 'SCHEDULED',
        scheduledDate: { gt: payment.scheduledDate }
      },
      orderBy: { scheduledDate: 'asc' }
    });

    if (nextScheduledPayment) {
      await prisma.loan.update({
        where: { id: payment.loanId },
        data: { nextPaymentDate: nextScheduledPayment.scheduledDate }
      });
    }

    console.log(`Cancelled scheduled payment ${paymentId} for loan ${payment.loanId}`);
  }

  /**
   * Get default payment method for user
   */
  private static async getDefaultPaymentMethodId(userId: string): Promise<string | null> {
    const paymentMethod = await prisma.paymentMethod.findFirst({
      where: { userId, isActive: true },
      orderBy: { createdAt: 'asc' }
    });
    return paymentMethod?.id || null;
  }

  /**
   * Get loan expense category ID
   */
  private static async getLoanExpenseCategoryId(userId: string): Promise<string> {
    let category = await prisma.category.findFirst({
      where: { 
        userId, 
        name: 'Loan Payment',
        type: 'EXPENSE'
      }
    });

    if (!category) {
      // Create loan payment category if it doesn't exist
      category = await prisma.category.create({
        data: {
          userId,
          name: 'Loan Payment',
          type: 'EXPENSE',
          description: 'Scheduled loan payments'
        }
      });
    }

    return category.id;
  }

  /**
   * Calculate EMI amount
   */
  private static calculateEMI(principal: number, rate: number, months: number): number {
    const monthlyRate = rate / 100 / 12;
    const emi = (principal * monthlyRate * Math.pow(1 + monthlyRate, months)) / 
                (Math.pow(1 + monthlyRate, months) - 1);
    return Math.round(emi * 100) / 100;
  }

  /**
   * Get overdue payments
   */
  static async getOverduePayments(userId?: string): Promise<any[]> {
    const whereClause: any = {
      status: 'SCHEDULED',
      scheduledDate: { lt: new Date() }
    };

    if (userId) {
      whereClause.loan = { userId };
    }

    return await prisma.loanPayment.findMany({
      where: whereClause,
      include: {
        loan: {
          include: {
            account: true,
            user: true
          }
        }
      },
      orderBy: { paymentDate: 'asc' }
    });
  }

  /**
   * Get payment history with defaults
   */
  static async getPaymentHistory(loanId: string): Promise<any[]> {
    return await prisma.loanPayment.findMany({
      where: { loanId },
      orderBy: { paymentDate: 'desc' },
      include: {
        transaction: true
      }
    });
  }
}
