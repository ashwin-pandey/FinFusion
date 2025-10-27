import { LoanModel, LoanPaymentModel, CreateLoanData, UpdateLoanData, CreateLoanPaymentData } from '../models/Loan';
import { TransactionModel } from '../models/Transaction';
import { AccountModel } from '../models/Account';
import { CategoryModel } from '../models/Category';

export class LoanService {
  static async recalculateRemainingTerms(userId: string): Promise<void> {
    try {
      const loans = await LoanModel.findByUserId(userId);
      
      for (const loan of loans) {
        if (loan.remainingTermMonths === null || loan.remainingTermMonths === undefined || 
            loan.remainingTermMonths === loan.originalTermMonths) {
          
          const startDate = new Date(loan.originalStartDate);
          const currentDate = new Date();
          const monthsElapsed = (currentDate.getFullYear() - startDate.getFullYear()) * 12 + 
                               (currentDate.getMonth() - startDate.getMonth());
          const remainingMonths = Math.max(0, loan.originalTermMonths - monthsElapsed);
          
          await LoanModel.update(loan.id, {
            remainingTermMonths: remainingMonths
          });
        }
      }
    } catch (error) {
      console.error('Error recalculating remaining terms:', error);
      throw error;
    }
  }

  static async createLoan(data: CreateLoanData): Promise<any> {
    // Verify account exists and user has access
    const account = await AccountModel.findById(data.accountId, data.userId);
    if (!account) {
      throw new Error('Account not found');
    }

    // Calculate next payment date for new loans
    let nextPaymentDate: Date | undefined;
    if (!data.isExistingLoan) {
      nextPaymentDate = new Date();
      nextPaymentDate.setMonth(nextPaymentDate.getMonth() + 1);
    }

    const loan = await LoanModel.create({
      ...data,
      nextPaymentDate
    });

    return loan;
  }

  static async getLoans(userId: string): Promise<any[]> {
    return await LoanModel.findMany(userId);
  }

  static async getLoanById(id: string, userId: string): Promise<any> {
    const loan = await LoanModel.findById(id, userId);
    if (!loan) {
      throw new Error('Loan not found');
    }

    // Get payment summary
    const paymentSummary = await LoanPaymentModel.getPaymentSummary(id);
    
    return {
      ...loan,
      paymentSummary
    };
  }

  static async updateLoan(id: string, userId: string, data: UpdateLoanData): Promise<any> {
    const loan = await LoanModel.findById(id, userId);
    if (!loan) {
      throw new Error('Loan not found');
    }

    return await LoanModel.update(id, userId, data);
  }

  static async deleteLoan(id: string, userId: string): Promise<void> {
    const loan = await LoanModel.findById(id, userId);
    if (!loan) {
      throw new Error('Loan not found');
    }

    await LoanModel.delete(id, userId);
  }

  static async getLoanSummary(userId: string): Promise<any> {
    return await LoanModel.getLoanSummary(userId);
  }

  static async makeLoanPayment(
    loanId: string, 
    userId: string, 
    paymentData: {
      amount: number;
      paymentDate: Date;
      description?: string;
      isPrePayment?: boolean;
    }
  ): Promise<any> {
    const loan = await LoanModel.findById(loanId, userId);
    if (!loan) {
      throw new Error('Loan not found');
    }

    if (loan.status !== 'ACTIVE') {
      throw new Error('Cannot make payment on inactive loan');
    }

    if (paymentData.amount > Number(loan.currentBalance)) {
      throw new Error('Payment amount cannot exceed current balance');
    }

    // Calculate EMI for comparison
    const monthlyRate = Number(loan.currentInterestRate || loan.originalInterestRate) / 100 / 12;
    const months = loan.remainingTermMonths || loan.originalTermMonths;
    const principal = Number(loan.currentBalance);
    
    let emi = 0;
    if (monthlyRate === 0) {
      emi = principal / months;
    } else {
      emi = (principal * monthlyRate * Math.pow(1 + monthlyRate, months)) / 
            (Math.pow(1 + monthlyRate, months) - 1);
    }

    // Determine if this is a pre-payment
    const isPrePayment = paymentData.isPrePayment || paymentData.amount > emi;
    
    let interestAmount: number;
    let principalAmount: number;

    if (isPrePayment) {
      // For pre-payments, calculate interest only on the EMI portion
      const emiInterest = principal * monthlyRate;
      const emiPrincipal = emi - emiInterest;
      
      if (paymentData.amount <= emi) {
        // Partial pre-payment: pay EMI first, then apply remainder to principal
        interestAmount = Math.min(emiInterest, paymentData.amount);
        principalAmount = paymentData.amount - interestAmount;
      } else {
        // Full pre-payment: pay EMI interest, then all remainder goes to principal
        interestAmount = emiInterest;
        principalAmount = paymentData.amount - interestAmount;
      }
    } else {
      // Regular payment: standard EMI calculation
      interestAmount = principal * monthlyRate;
      principalAmount = Math.max(0, paymentData.amount - interestAmount);
    }

    // Create expense transaction for loan payment
    const loanCategory = await CategoryModel.findByName('Loan Payment', userId) || 
                        await CategoryModel.create({
                          userId,
                          name: 'Loan Payment',
                          type: 'EXPENSE',
                          icon: '🏦',
                          color: '#FF6B35'
                        });

    const transaction = await TransactionModel.create({
      userId,
      amount: paymentData.amount,
      type: 'EXPENSE',
      categoryId: loanCategory.id,
      accountId: loan.accountId,
      date: paymentData.paymentDate,
      description: paymentData.description || `Loan payment for ${loan.name}`,
      isRecurring: false
    });

    // Determine pre-payment type
    let prePaymentType = null;
    if (isPrePayment) {
      if (paymentData.amount >= Number(loan.currentBalance)) {
        prePaymentType = 'FULL';
      } else if (paymentData.amount > emi) {
        prePaymentType = 'PARTIAL';
      } else {
        prePaymentType = 'EMILY_ONLY';
      }
    }

    // Calculate pre-payment benefits first
    const newBalance = Number(loan.currentBalance) - paymentData.amount;
    let prePaymentBenefits = null;
    if (isPrePayment && newBalance > 0) {
      // Calculate new EMI and term with reduced principal
      const newMonths = loan.remainingTermMonths || loan.originalTermMonths;
      let newEmi = 0;
      let newTerm = newMonths;
      
      if (monthlyRate === 0) {
        newEmi = newBalance / newMonths;
      } else {
        // Calculate how many months it would take to pay off with current EMI
        const monthsToPayoff = Math.ceil(-Math.log(1 - (newBalance * monthlyRate) / emi) / Math.log(1 + monthlyRate));
        newTerm = Math.max(1, monthsToPayoff);
        newEmi = emi; // Keep same EMI, reduce term
      }
      
      const interestSavings = (emi * newMonths) - (emi * newTerm);
      const termReduction = newMonths - newTerm;
      
      prePaymentBenefits = {
        newEmi,
        newTerm,
        interestSavings,
        termReduction,
        newBalance
      };
    }

    // Create loan payment record
    const loanPayment = await LoanPaymentModel.create({
      loanId,
      amount: paymentData.amount,
      principalAmount,
      interestAmount,
      paymentDate: paymentData.paymentDate,
      transactionId: transaction.id,
      isPrePayment,
      prePaymentType,
      interestSavings: prePaymentBenefits?.interestSavings || 0,
      termReduction: prePaymentBenefits?.termReduction || 0
    });

    // Update loan totals
    const newTotalPaid = Number(loan.totalPaid) + paymentData.amount;
    const newTotalInterestPaid = Number(loan.totalInterestPaid) + interestAmount;
    const newTotalPrePayments = isPrePayment ? Number(loan.totalPrePayments || 0) + paymentData.amount : Number(loan.totalPrePayments || 0);
    const newTotalInterestSavings = Number(loan.totalInterestSavings || 0) + (prePaymentBenefits?.interestSavings || 0);

    // Calculate next payment date
    const nextPaymentDate = new Date(paymentData.paymentDate);
    nextPaymentDate.setMonth(nextPaymentDate.getMonth() + 1);

    const updatedLoan = await LoanModel.update(loanId, userId, {
      currentBalance: newBalance,
      totalPaid: newTotalPaid,
      totalInterestPaid: newTotalInterestPaid,
      totalPrePayments: newTotalPrePayments,
      totalInterestSavings: newTotalInterestSavings,
      lastPaymentDate: paymentData.paymentDate,
      nextPaymentDate: newBalance > 0 ? nextPaymentDate : undefined,
      status: newBalance <= 0 ? 'PAID_OFF' : 'ACTIVE',
      remainingTermMonths: isPrePayment && prePaymentBenefits ? prePaymentBenefits.newTerm : (loan.remainingTermMonths ? loan.remainingTermMonths - 1 : loan.originalTermMonths - 1)
    });

    // Update account balance
    await AccountModel.updateBalance(loan.accountId, -paymentData.amount);

    return {
      loan: updatedLoan,
      payment: loanPayment,
      transaction,
      isPrePayment,
      prePaymentBenefits
    };
  }

  static async getLoanPayments(loanId: string, userId: string): Promise<any[]> {
    const loan = await LoanModel.findById(loanId, userId);
    if (!loan) {
      throw new Error('Loan not found');
    }

    return await LoanPaymentModel.findByLoanId(loanId);
  }

  static async calculateEMI(
    principal: number,
    annualRate: number,
    termMonths: number
  ): Promise<number> {
    const monthlyRate = annualRate / 100 / 12;
    
    if (monthlyRate === 0) {
      return principal / termMonths;
    }

    const emi = (principal * monthlyRate * Math.pow(1 + monthlyRate, termMonths)) / 
                (Math.pow(1 + monthlyRate, termMonths) - 1);
    
    return Math.round(emi * 100) / 100; // Round to 2 decimal places
  }

  static async getLoanProgress(loanId: string, userId: string): Promise<any> {
    const loan = await LoanModel.findById(loanId, userId);
    if (!loan) {
      throw new Error('Loan not found');
    }

    const paymentSummary = await LoanPaymentModel.getPaymentSummary(loanId);
    
    const originalPrincipal = Number(loan.originalPrincipal);
    const currentBalance = Number(loan.currentBalance);
    const totalPaid = Number(loan.totalPaid);
    
    const progressPercentage = (totalPaid / originalPrincipal) * 100;
    const remainingAmount = currentBalance;
    const paidAmount = originalPrincipal - currentBalance;

    return {
      loan,
      progress: {
        percentage: Math.round(progressPercentage * 100) / 100,
        paidAmount,
        remainingAmount,
        totalPaid,
        totalInterestPaid: Number(loan.totalInterestPaid)
      },
      paymentSummary
    };
  }

  static async calculatePrePaymentScenario(
    loanId: string, 
    userId: string, 
    prePaymentAmount: number
  ): Promise<any> {
    const loan = await LoanModel.findById(loanId, userId);
    if (!loan) {
      throw new Error('Loan not found');
    }

    const monthlyRate = Number(loan.currentInterestRate || loan.originalInterestRate) / 100 / 12;
    const months = loan.remainingTermMonths || loan.originalTermMonths;
    const principal = Number(loan.currentBalance);
    
    // Calculate current EMI
    let currentEmi = 0;
    if (monthlyRate === 0) {
      currentEmi = principal / months;
    } else {
      currentEmi = (principal * monthlyRate * Math.pow(1 + monthlyRate, months)) / 
                  (Math.pow(1 + monthlyRate, months) - 1);
    }

    // Calculate new balance after pre-payment
    const newBalance = Math.max(0, principal - prePaymentAmount);
    
    if (newBalance === 0) {
      return {
        isFullPrePayment: true,
        interestSavings: (currentEmi * months) - principal,
        termReduction: months,
        newEmi: 0,
        newTerm: 0
      };
    }

    // Calculate new term with same EMI
    let newTerm = months;
    if (monthlyRate > 0) {
      newTerm = Math.ceil(-Math.log(1 - (newBalance * monthlyRate) / currentEmi) / Math.log(1 + monthlyRate));
    } else {
      newTerm = Math.ceil(newBalance / currentEmi);
    }

    const interestSavings = (currentEmi * months) - (currentEmi * newTerm);
    const termReduction = months - newTerm;

    return {
      isFullPrePayment: false,
      currentEmi,
      newBalance,
      newTerm,
      interestSavings,
      termReduction,
      monthlySavings: currentEmi * termReduction
    };
  }

  static async getPrePaymentAnalytics(userId: string): Promise<any> {
    const loans = await LoanModel.findMany(userId);
    
    const totalPrePayments = loans.reduce((sum, loan) => sum + Number(loan.totalPrePayments || 0), 0);
    const totalInterestSavings = loans.reduce((sum, loan) => sum + Number(loan.totalInterestSavings || 0), 0);
    
    // Get pre-payment history
    const prePaymentHistory = await prisma.loanPayment.findMany({
      where: {
        loan: { userId },
        isPrePayment: true
      },
      include: {
        loan: {
          select: {
            id: true,
            name: true,
            type: true
          }
        }
      },
      orderBy: {
        paymentDate: 'desc'
      },
      take: 10
    });

    return {
      totalPrePayments,
      totalInterestSavings,
      prePaymentCount: prePaymentHistory.length,
      recentPrePayments: prePaymentHistory,
      averagePrePayment: prePaymentHistory.length > 0 ? totalPrePayments / prePaymentHistory.length : 0
    };
  }
}
