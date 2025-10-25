import { API_ENDPOINTS } from '../config/api';

export interface PaymentMethod {
  id: string;
  code: string;
  name: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

class PaymentMethodService {
  private async makeRequest(endpoint: string, options: RequestInit = {}) {
    const token = localStorage.getItem('accessToken');
    
    const response = await fetch(`${API_ENDPOINTS.BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  async getAllPaymentMethods(): Promise<PaymentMethod[]> {
    const response = await this.makeRequest('/api/payment-methods');
    return response.data;
  }

  async getPaymentMethodByCode(code: string): Promise<PaymentMethod> {
    const response = await this.makeRequest(`/api/payment-methods/code/${code}`);
    return response.data;
  }

  async createPaymentMethod(data: {
    code: string;
    name: string;
    description?: string;
    isActive?: boolean;
  }): Promise<PaymentMethod> {
    const response = await this.makeRequest('/api/payment-methods', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return response.data;
  }

  async updatePaymentMethod(id: string, data: {
    code?: string;
    name?: string;
    description?: string;
    isActive?: boolean;
  }): Promise<PaymentMethod> {
    const response = await this.makeRequest(`/api/payment-methods/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return response.data;
  }

  async deletePaymentMethod(id: string): Promise<void> {
    await this.makeRequest(`/api/payment-methods/${id}`, {
      method: 'DELETE',
    });
  }
}

export default new PaymentMethodService();


