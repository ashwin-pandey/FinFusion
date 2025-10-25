import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface PaymentMethod {
  id: string;
  code: string;
  name: string;
  description?: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreatePaymentMethodData {
  code: string;
  name: string;
  description?: string;
  isActive?: boolean;
}

export interface UpdatePaymentMethodData {
  code?: string;
  name?: string;
  description?: string;
  isActive?: boolean;
}

export class PaymentMethodModel {
  static async findAll(): Promise<PaymentMethod[]> {
    return await prisma.paymentMethod.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' }
    });
  }

  static async findByCode(code: string): Promise<PaymentMethod | null> {
    return await prisma.paymentMethod.findUnique({
      where: { code }
    });
  }

  static async findById(id: string): Promise<PaymentMethod | null> {
    return await prisma.paymentMethod.findUnique({
      where: { id }
    });
  }

  static async create(data: CreatePaymentMethodData): Promise<PaymentMethod> {
    return await prisma.paymentMethod.create({
      data: {
        code: data.code,
        name: data.name,
        description: data.description,
        isActive: data.isActive ?? true
      }
    });
  }

  static async update(id: string, data: UpdatePaymentMethodData): Promise<PaymentMethod> {
    return await prisma.paymentMethod.update({
      where: { id },
      data: {
        code: data.code,
        name: data.name,
        description: data.description,
        isActive: data.isActive
      }
    });
  }

  static async delete(id: string): Promise<void> {
    await prisma.paymentMethod.delete({
      where: { id }
    });
  }

  static async deactivate(id: string): Promise<PaymentMethod> {
    return await prisma.paymentMethod.update({
      where: { id },
      data: { isActive: false }
    });
  }
}


