import { useState, useEffect } from 'react';
import paymentMethodService, { PaymentMethod } from '../services/paymentMethodService';

export const usePaymentMethods = () => {
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPaymentMethods = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const methods = await paymentMethodService.getAllPaymentMethods();
      setPaymentMethods(methods);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch payment methods');
      console.error('Error fetching payment methods:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const createPaymentMethod = async (data: {
    code: string;
    name: string;
    description?: string;
    isActive?: boolean;
  }) => {
    try {
      const newMethod = await paymentMethodService.createPaymentMethod(data);
      setPaymentMethods(prev => [...prev, newMethod]);
      return newMethod;
    } catch (err: any) {
      setError(err.message || 'Failed to create payment method');
      throw err;
    }
  };

  const updatePaymentMethod = async (id: string, data: {
    code?: string;
    name?: string;
    description?: string;
    isActive?: boolean;
  }) => {
    try {
      const updatedMethod = await paymentMethodService.updatePaymentMethod(id, data);
      setPaymentMethods(prev => 
        prev.map(method => method.id === id ? updatedMethod : method)
      );
      return updatedMethod;
    } catch (err: any) {
      setError(err.message || 'Failed to update payment method');
      throw err;
    }
  };

  const deletePaymentMethod = async (id: string) => {
    try {
      await paymentMethodService.deletePaymentMethod(id);
      setPaymentMethods(prev => prev.filter(method => method.id !== id));
    } catch (err: any) {
      setError(err.message || 'Failed to delete payment method');
      throw err;
    }
  };

  useEffect(() => {
    fetchPaymentMethods();
  }, []);

  return {
    paymentMethods,
    isLoading,
    error,
    fetchPaymentMethods,
    createPaymentMethod,
    updatePaymentMethod,
    deletePaymentMethod,
  };
};


