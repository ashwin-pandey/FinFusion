import { Request, Response } from 'express';
import { PaymentMethodService } from '../services/PaymentMethodService';
import { logger } from '../utils/logger';

export class PaymentMethodController {
  static async getAllPaymentMethods(req: Request, res: Response): Promise<void> {
    try {
      const paymentMethods = await PaymentMethodService.getAllPaymentMethods();
      res.json({
        success: true,
        data: paymentMethods
      });
    } catch (error: any) {
      logger.error('Error in getAllPaymentMethods:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to fetch payment methods'
      });
    }
  }

  static async getPaymentMethodByCode(req: Request, res: Response): Promise<void> {
    try {
      const { code } = req.params;
      const paymentMethod = await PaymentMethodService.getPaymentMethodByCode(code);
      
      if (!paymentMethod) {
        res.status(404).json({
          success: false,
          error: 'Payment method not found'
        });
        return;
      }

      res.json({
        success: true,
        data: paymentMethod
      });
    } catch (error: any) {
      logger.error('Error in getPaymentMethodByCode:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to fetch payment method'
      });
    }
  }

  static async createPaymentMethod(req: Request, res: Response): Promise<void> {
    try {
      const { code, name, description, isActive } = req.body;
      
      if (!code || !name) {
        res.status(400).json({
          success: false,
          error: 'Code and name are required'
        });
        return;
      }

      const paymentMethod = await PaymentMethodService.createPaymentMethod({
        code,
        name,
        description,
        isActive
      });

      res.status(201).json({
        success: true,
        data: paymentMethod
      });
    } catch (error: any) {
      logger.error('Error in createPaymentMethod:', error);
      res.status(400).json({
        success: false,
        error: error.message || 'Failed to create payment method'
      });
    }
  }

  static async updatePaymentMethod(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { code, name, description, isActive } = req.body;

      const paymentMethod = await PaymentMethodService.updatePaymentMethod(id, {
        code,
        name,
        description,
        isActive
      });

      res.json({
        success: true,
        data: paymentMethod
      });
    } catch (error: any) {
      logger.error('Error in updatePaymentMethod:', error);
      res.status(400).json({
        success: false,
        error: error.message || 'Failed to update payment method'
      });
    }
  }

  static async deletePaymentMethod(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      await PaymentMethodService.deletePaymentMethod(id);

      res.json({
        success: true,
        message: 'Payment method deleted successfully'
      });
    } catch (error: any) {
      logger.error('Error in deletePaymentMethod:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to delete payment method'
      });
    }
  }

  static async deactivatePaymentMethod(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const paymentMethod = await PaymentMethodService.deactivatePaymentMethod(id);

      res.json({
        success: true,
        data: paymentMethod
      });
    } catch (error: any) {
      logger.error('Error in deactivatePaymentMethod:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to deactivate payment method'
      });
    }
  }
}


