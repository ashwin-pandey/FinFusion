import { PaymentMethodModel, PaymentMethod, CreatePaymentMethodData, UpdatePaymentMethodData } from '../models/PaymentMethod';
import { logger } from '../utils/logger';

export class PaymentMethodService {
  static async getAllPaymentMethods(): Promise<PaymentMethod[]> {
    try {
      return await PaymentMethodModel.findAll();
    } catch (error) {
      logger.error('Error fetching payment methods:', error);
      throw new Error('Failed to fetch payment methods');
    }
  }

  static async getPaymentMethodByCode(code: string): Promise<PaymentMethod | null> {
    try {
      return await PaymentMethodModel.findByCode(code);
    } catch (error) {
      logger.error('Error fetching payment method by code:', error);
      throw new Error('Failed to fetch payment method');
    }
  }

  static async getPaymentMethodById(id: string): Promise<PaymentMethod | null> {
    try {
      return await PaymentMethodModel.findById(id);
    } catch (error) {
      logger.error('Error fetching payment method by id:', error);
      throw new Error('Failed to fetch payment method');
    }
  }

  static async createPaymentMethod(data: CreatePaymentMethodData): Promise<PaymentMethod> {
    try {
      // Check if payment method with same code already exists
      const existing = await PaymentMethodModel.findByCode(data.code);
      if (existing) {
        throw new Error('Payment method with this code already exists');
      }

      return await PaymentMethodModel.create(data);
    } catch (error) {
      logger.error('Error creating payment method:', error);
      throw error;
    }
  }

  static async updatePaymentMethod(id: string, data: UpdatePaymentMethodData): Promise<PaymentMethod> {
    try {
      // If updating code, check if new code already exists
      if (data.code) {
        const existing = await PaymentMethodModel.findByCode(data.code);
        if (existing && existing.id !== id) {
          throw new Error('Payment method with this code already exists');
        }
      }

      return await PaymentMethodModel.update(id, data);
    } catch (error) {
      logger.error('Error updating payment method:', error);
      throw error;
    }
  }

  static async deletePaymentMethod(id: string): Promise<void> {
    try {
      await PaymentMethodModel.delete(id);
    } catch (error) {
      logger.error('Error deleting payment method:', error);
      throw new Error('Failed to delete payment method');
    }
  }

  static async deactivatePaymentMethod(id: string): Promise<PaymentMethod> {
    try {
      return await PaymentMethodModel.deactivate(id);
    } catch (error) {
      logger.error('Error deactivating payment method:', error);
      throw new Error('Failed to deactivate payment method');
    }
  }
}


