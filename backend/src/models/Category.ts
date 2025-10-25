import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface Category {
  id: string;
  userId?: string;
  name: string;
  type: 'INCOME' | 'EXPENSE';
  icon?: string;
  color?: string;
  parentCategoryId?: string;
  isSystem: boolean;
  createdAt: Date;
  updatedAt: Date;
  parentCategory?: Category;
  subCategories?: Category[];
}

export interface CreateCategoryData {
  userId?: string;
  name: string;
  type: 'INCOME' | 'EXPENSE';
  icon?: string;
  color?: string;
  parentCategoryId?: string;
  isSystem?: boolean;
}

export interface UpdateCategoryData {
  name?: string;
  icon?: string;
  color?: string;
  parentCategoryId?: string;
}

export interface CategoryFilters {
  userId?: string;
  type?: 'INCOME' | 'EXPENSE';
  isSystem?: boolean;
  parentCategoryId?: string;
}

export class CategoryModel {
  static async create(data: CreateCategoryData): Promise<Category> {
    return await prisma.category.create({
      data: {
        userId: data.userId,
        name: data.name,
        type: data.type,
        icon: data.icon,
        color: data.color,
        parentCategoryId: data.parentCategoryId,
        isSystem: data.isSystem || false
      },
      include: {
        parentCategory: {
          select: {
            id: true,
            name: true,
            type: true,
            icon: true,
            color: true
          }
        },
        subCategories: {
          select: {
            id: true,
            name: true,
            type: true,
            icon: true,
            color: true
          }
        }
      }
    });
  }

  static async findById(id: string): Promise<Category | null> {
    return await prisma.category.findUnique({
      where: { id },
      include: {
        parentCategory: {
          select: {
            id: true,
            name: true,
            type: true,
            icon: true,
            color: true
          }
        },
        subCategories: {
          select: {
            id: true,
            name: true,
            type: true,
            icon: true,
            color: true
          }
        }
      }
    });
  }

  static async findMany(filters: CategoryFilters = {}): Promise<Category[]> {
    const where: any = {};
    
    if (filters.userId !== undefined) {
      where.OR = [
        { userId: filters.userId },
        { isSystem: true }
      ];
    }
    
    if (filters.type) {
      where.type = filters.type;
    }
    
    if (filters.isSystem !== undefined) {
      where.isSystem = filters.isSystem;
    }
    
    if (filters.parentCategoryId !== undefined) {
      where.parentCategoryId = filters.parentCategoryId;
    }

    return await prisma.category.findMany({
      where,
      include: {
        parentCategory: {
          select: {
            id: true,
            name: true,
            type: true,
            icon: true,
            color: true
          }
        },
        subCategories: {
          select: {
            id: true,
            name: true,
            type: true,
            icon: true,
            color: true
          }
        }
      },
      orderBy: [
        { isSystem: 'desc' },
        { type: 'asc' },
        { name: 'asc' }
      ]
    });
  }

  static async update(id: string, data: UpdateCategoryData): Promise<Category> {
    return await prisma.category.update({
      where: { id },
      data,
      include: {
        parentCategory: {
          select: {
            id: true,
            name: true,
            type: true,
            icon: true,
            color: true
          }
        },
        subCategories: {
          select: {
            id: true,
            name: true,
            type: true,
            icon: true,
            color: true
          }
        }
      }
    });
  }

  static async delete(id: string): Promise<void> {
    await prisma.category.delete({
      where: { id }
    });
  }

  static async findByName(name: string, userId?: string): Promise<Category | null> {
    return await prisma.category.findFirst({
      where: {
        name,
        OR: [
          { userId },
          { isSystem: true }
        ]
      }
    });
  }

  static async findByNameAndType(name: string, type: 'INCOME' | 'EXPENSE', userId?: string): Promise<Category | null> {
    return await prisma.category.findFirst({
      where: {
        name,
        type,
        OR: [
          { userId },
          { isSystem: true }
        ]
      }
    });
  }

  static async countByUserId(userId: string): Promise<number> {
    return await prisma.category.count({
      where: { userId }
    });
  }

  static async hasTransactions(id: string): Promise<boolean> {
    const count = await prisma.transaction.count({
      where: { categoryId: id }
    });
    return count > 0;
  }

  static async hasSubCategories(id: string): Promise<boolean> {
    const count = await prisma.category.count({
      where: { parentCategoryId: id }
    });
    return count > 0;
  }
}
