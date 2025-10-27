import { PrismaClient, Loan, LoanPayment, LoanType, LoanStatus } from '@prisma/client';

const prisma = new PrismaClient();

export interface CreateLoanData {
  userId: string;
  name: string;
  type: LoanType;
  originalPrincipal: number;
  originalInterestRate: number;
  originalTermMonths: number;
  originalStartDate: Date;
  currentBalance: number;
  currentInterestRate?: number;
  remainingTermMonths?: number;
  accountId: string;
  isExistingLoan?: boolean;
  totalPaid?: number;
  totalInterestPaid?: number;
  totalPrePayments?: number;
  totalInterestSavings?: number;
  lastPaymentDate?: Date;
}

export interface UpdateLoanData {
  name?: string;
  currentBalance?: number;
  currentInterestRate?: number;
  remainingTermMonths?: number;
  status?: LoanStatus;
  totalPaid?: number;
  totalInterestPaid?: number;
  lastPaymentDate?: Date;
  nextPaymentDate?: Date;
}

export interface CreateLoanPaymentData {
  loanId: string;
  amount: number;
  principalAmount: number;
  interestAmount: number;
  paymentDate: Date;
  transactionId?: string;
  isPrePayment?: boolean;
  prePaymentType?: string;
  interestSavings?: number;
  termReduction?: number;
}

export class LoanModel {
  static async create(data: CreateLoanData): Promise<Loan> {
    return await prisma.loan.create({
      data: {
        userId: data.userId,
        name: data.name,
        type: data.type,
        originalPrincipal: data.originalPrincipal,
        originalInterestRate: data.originalInterestRate,
        originalTermMonths: data.originalTermMonths,
        originalStartDate: data.originalStartDate,
        currentBalance: data.currentBalance,
        currentInterestRate: data.currentInterestRate,
        remainingTermMonths: data.remainingTermMonths,
        accountId: data.accountId,
        isExistingLoan: data.isExistingLoan || false,
        totalPaid: data.totalPaid || 0,
        totalInterestPaid: data.totalInterestPaid || 0,
        lastPaymentDate: data.lastPaymentDate,
      },
      include: {
        account: {
          select: {
            id: true,
            name: true,
            type: true,
            balance: true,
            currency: true
          }
        },
        payments: {
          orderBy: {
            paymentDate: 'desc'
          },
          take: 5
        }
      }
    });
  }

  static async findMany(userId: string): Promise<Loan[]> {
    return await prisma.loan.findMany({
      where: { userId },
      include: {
        account: {
          select: {
            id: true,
            name: true,
            type: true,
            balance: true,
            currency: true
          }
        },
        payments: {
          orderBy: {
            paymentDate: 'desc'
          },
          take: 5
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
  }

  static async findById(id: string, userId: string): Promise<Loan | null> {
    return await prisma.loan.findFirst({
      where: { id, userId },
      include: {
        account: {
          select: {
            id: true,
            name: true,
            type: true,
            balance: true,
            currency: true
          }
        },
        payments: {
          orderBy: {
            paymentDate: 'desc'
          }
        }
      }
    });
  }

  static async update(id: string, userId: string, data: UpdateLoanData): Promise<Loan> {
    // First verify the loan belongs to the user
    const existingLoan = await prisma.loan.findFirst({
      where: { id, userId }
    });

    if (!existingLoan) {
      throw new Error('Loan not found or access denied');
    }

    return await prisma.loan.update({
      where: { id },
      data: {
        ...data,
        updatedAt: new Date()
      },
      include: {
        account: {
          select: {
            id: true,
            name: true,
            type: true,
            balance: true,
            currency: true
          }
        },
        payments: {
          orderBy: {
            paymentDate: 'desc'
          },
          take: 5
        }
      }
    });
  }

  static async delete(id: string, userId: string): Promise<void> {
    await prisma.loan.delete({
      where: { id, userId }
    });
  }

  static async getLoanSummary(userId: string): Promise<{
    totalLoans: number;
    activeLoans: number;
    totalOutstanding: number;
    totalPaid: number;
    monthlyPayments: number;
  }> {
    const loans = await prisma.loan.findMany({
      where: { userId, status: 'ACTIVE' }
    });

    const totalLoans = await prisma.loan.count({
      where: { userId }
    });

    const totalOutstanding = loans.reduce((sum, loan) => sum + Number(loan.currentBalance), 0);
    const totalPaid = loans.reduce((sum, loan) => sum + Number(loan.totalPaid), 0);
    
    // Calculate monthly payments (simplified - would need EMI calculation)
    const monthlyPayments = loans.reduce((sum, loan) => {
      const monthlyRate = Number(loan.currentInterestRate || loan.originalInterestRate) / 100 / 12;
      const months = loan.remainingTermMonths || loan.originalTermMonths;
      const principal = Number(loan.currentBalance);
      
      if (monthlyRate === 0) {
        return sum + (principal / months);
      }
      
      const emi = (principal * monthlyRate * Math.pow(1 + monthlyRate, months)) / 
                  (Math.pow(1 + monthlyRate, months) - 1);
      return sum + emi;
    }, 0);

    return {
      totalLoans,
      activeLoans: loans.length,
      totalOutstanding,
      totalPaid,
      monthlyPayments
    };
  }
}

export class LoanPaymentModel {
  static async create(data: CreateLoanPaymentData): Promise<LoanPayment> {
    return await prisma.loanPayment.create({
      data: {
        loanId: data.loanId,
        amount: data.amount,
        principalAmount: data.principalAmount,
        interestAmount: data.interestAmount,
        paymentDate: data.paymentDate,
        transactionId: data.transactionId,
        isPrePayment: data.isPrePayment || false,
        prePaymentType: data.prePaymentType,
        interestSavings: data.interestSavings,
        termReduction: data.termReduction
      },
      include: {
        loan: {
          select: {
            id: true,
            name: true,
            type: true
          }
        },
        transaction: {
          select: {
            id: true,
            amount: true,
            date: true,
            description: true
          }
        }
      }
    });
  }

  static async findByLoanId(loanId: string): Promise<LoanPayment[]> {
    return await prisma.loanPayment.findMany({
      where: { loanId },
      include: {
        transaction: {
          select: {
            id: true,
            amount: true,
            date: true,
            description: true
          }
        }
      },
      orderBy: {
        paymentDate: 'desc'
      }
    });
  }

  static async getPaymentSummary(loanId: string): Promise<{
    totalPayments: number;
    totalAmount: number;
    totalPrincipal: number;
    totalInterest: number;
    lastPaymentDate: Date | null;
  }> {
    const payments = await prisma.loanPayment.findMany({
      where: { loanId }
    });

    const totalPayments = payments.length;
    const totalAmount = payments.reduce((sum, payment) => sum + Number(payment.amount), 0);
    const totalPrincipal = payments.reduce((sum, payment) => sum + Number(payment.principalAmount), 0);
    const totalInterest = payments.reduce((sum, payment) => sum + Number(payment.interestAmount), 0);
    const lastPaymentDate = payments.length > 0 ? payments[0].paymentDate : null;

    return {
      totalPayments,
      totalAmount,
      totalPrincipal,
      totalInterest,
      lastPaymentDate
    };
  }
}
