import { Request, Response, NextFunction } from 'express';
import { LoanService } from '../services/LoanService';
import { LoanSchedulerService } from '../services/LoanSchedulerService';
import { AuthRequest } from '../types/auth';

export class LoanController {
  static async createLoan(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const {
        name,
        type,
        originalPrincipal,
        originalInterestRate,
        originalTermMonths,
        originalStartDate,
        currentBalance,
        currentInterestRate,
        remainingTermMonths,
        accountId,
        isExistingLoan,
        totalPaid,
        totalInterestPaid,
        lastPaymentDate
      } = req.body;

      const loan = await LoanService.createLoan({
        userId: req.user!.id,
        name,
        type,
        originalPrincipal: parseFloat(originalPrincipal),
        originalInterestRate: parseFloat(originalInterestRate),
        originalTermMonths: parseInt(originalTermMonths),
        originalStartDate: new Date(originalStartDate),
        currentBalance: parseFloat(currentBalance),
        currentInterestRate: currentInterestRate ? parseFloat(currentInterestRate) : undefined,
        remainingTermMonths: remainingTermMonths ? parseInt(remainingTermMonths) : (() => {
          const startDate = new Date(originalStartDate);
          const currentDate = new Date();
          const monthsElapsed = (currentDate.getFullYear() - startDate.getFullYear()) * 12 + 
                               (currentDate.getMonth() - startDate.getMonth());
          return Math.max(0, parseInt(originalTermMonths) - monthsElapsed);
        })(),
        accountId,
        isExistingLoan: isExistingLoan || false,
        totalPaid: totalPaid ? parseFloat(totalPaid) : 0,
        totalInterestPaid: totalInterestPaid ? parseFloat(totalInterestPaid) : 0,
        lastPaymentDate: lastPaymentDate ? new Date(lastPaymentDate) : undefined
      });

      res.json({
        success: true,
        data: loan
      });
    } catch (error) {
      console.error('Create loan error:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create loan'
      });
    }
  }

  static async getLoans(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const loans = await LoanService.getLoans(req.user!.id);

      res.json({
        success: true,
        data: loans
      });
    } catch (error) {
      console.error('Get loans error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch loans'
      });
    }
  }

  static async getLoanById(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const loan = await LoanService.getLoanById(id, req.user!.id);

      res.json({
        success: true,
        data: loan
      });
    } catch (error) {
      console.error('Get loan error:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch loan'
      });
    }
  }

  static async updateLoan(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const updateData = req.body;

      const loan = await LoanService.updateLoan(id, req.user!.id, updateData);

      res.json({
        success: true,
        data: loan
      });
    } catch (error) {
      console.error('Update loan error:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update loan'
      });
    }
  }

  static async deleteLoan(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      await LoanService.deleteLoan(id, req.user!.id);

      res.json({
        success: true,
        message: 'Loan deleted successfully'
      });
    } catch (error) {
      console.error('Delete loan error:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to delete loan'
      });
    }
  }

  static async getLoanSummary(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const summary = await LoanService.getLoanSummary(req.user!.id);

      res.json({
        success: true,
        data: summary
      });
    } catch (error) {
      console.error('Get loan summary error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch loan summary'
      });
    }
  }

  static async makeLoanPayment(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const { amount, paymentDate, description } = req.body;

      const result = await LoanService.makeLoanPayment(id, req.user!.id, {
        amount: parseFloat(amount),
        paymentDate: new Date(paymentDate),
        description
      });

      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      console.error('Make loan payment error:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to make loan payment'
      });
    }
  }

  static async getLoanPayments(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const payments = await LoanService.getLoanPayments(id, req.user!.id);

      res.json({
        success: true,
        data: payments
      });
    } catch (error) {
      console.error('Get loan payments error:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch loan payments'
      });
    }
  }

  static async calculateEMI(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { principal, annualRate, termMonths } = req.query;

      const emi = await LoanService.calculateEMI(
        parseFloat(principal as string),
        parseFloat(annualRate as string),
        parseInt(termMonths as string)
      );

      res.json({
        success: true,
        data: { emi }
      });
    } catch (error) {
      console.error('Calculate EMI error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to calculate EMI'
      });
    }
  }

  static async getLoanProgress(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const progress = await LoanService.getLoanProgress(id, req.user!.id);

      res.json({
        success: true,
        data: progress
      });
    } catch (error) {
      console.error('Get loan progress error:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch loan progress'
      });
    }
  }

  static async calculatePrePayment(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const { amount } = req.body;

      const scenario = await LoanService.calculatePrePaymentScenario(id, req.user!.id, parseFloat(amount));

      res.json({
        success: true,
        data: scenario
      });
    } catch (error) {
      console.error('Calculate pre-payment error:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to calculate pre-payment scenario'
      });
    }
  }

  static async getPrePaymentAnalytics(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const analytics = await LoanService.getPrePaymentAnalytics(req.user!.id);

      res.json({
        success: true,
        data: analytics
      });
    } catch (error) {
      console.error('Get pre-payment analytics error:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch pre-payment analytics'
      });
    }
  }

  static async createScheduledPayments(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { loanId } = req.params;
      const userId = req.user!.id;

      await LoanSchedulerService.createScheduledPayments(loanId);
      
      res.json({
        success: true,
        message: 'Scheduled payments created successfully'
      });
    } catch (error) {
      console.error('Create scheduled payments error:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create scheduled payments'
      });
    }
  }

  static async deleteScheduledPayment(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { paymentId } = req.params;
      const { reason } = req.body;
      const userId = req.user!.id;

      // Verify payment ownership
      const payment = await LoanService.getLoanPaymentById(paymentId);
      if (!payment || payment.loan.userId !== userId) {
        res.status(404).json({ 
          success: false,
          error: 'Payment not found' 
        });
        return;
      }

      await LoanSchedulerService.deleteScheduledPayment(paymentId, reason || 'User cancelled');
      
      res.json({
        success: true,
        message: 'Scheduled payment deleted successfully'
      });
    } catch (error) {
      console.error('Delete scheduled payment error:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to delete scheduled payment'
      });
    }
  }

  static async getOverduePayments(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const overduePayments = await LoanSchedulerService.getOverduePayments(userId);
      
      res.json({
        success: true,
        data: overduePayments
      });
    } catch (error) {
      console.error('Get overdue payments error:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch overdue payments'
      });
    }
  }

  static async getPaymentHistory(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { loanId } = req.params;
      const userId = req.user!.id;

      // Verify loan ownership
      const loan = await LoanService.getLoanById(loanId);
      if (!loan || loan.userId !== userId) {
        res.status(404).json({ 
          success: false,
          error: 'Loan not found' 
        });
        return;
      }

      const paymentHistory = await LoanSchedulerService.getPaymentHistory(loanId);
      
      res.json({
        success: true,
        data: paymentHistory
      });
    } catch (error) {
      console.error('Get payment history error:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch payment history'
      });
    }
  }

  static async recalculateRemainingTerms(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({
          success: false,
          error: 'User not authenticated'
        });
        return;
      }

      await LoanService.recalculateRemainingTerms(userId);

      res.json({
        success: true,
        message: 'Remaining terms recalculated successfully'
      });
    } catch (error) {
      console.error('Recalculate remaining terms error:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to recalculate remaining terms'
      });
    }
  }
}
