import { CategoryModel, CreateCategoryData, UpdateCategoryData, CategoryFilters } from '../models/Category';

export interface CategoryListResult {
  categories: any[];
}

export interface CategoryValidationResult {
  isValid: boolean;
  errors: string[];
}

export class CategoryService {
  static async createCategory(data: CreateCategoryData): Promise<any> {
    // Validate parent category if provided
    if (data.parentCategoryId) {
      const parentCategory = await CategoryModel.findById(data.parentCategoryId);
      if (!parentCategory) {
        throw new Error('Parent category not found');
      }

      // Check if parent category belongs to user or is system category
      if (parentCategory.userId && parentCategory.userId !== data.userId) {
        throw new Error('Access denied to parent category');
      }

      // Ensure parent and child have same type
      if (parentCategory.type !== data.type) {
        throw new Error('Parent and child categories must have the same type');
      }
    }

    // Check for duplicate category name
    const existingCategory = await CategoryModel.findByNameAndType(
      data.name,
      data.type,
      data.userId
    );

    if (existingCategory) {
      throw new Error('Category with this name already exists');
    }

    return await CategoryModel.create(data);
  }

  static async getCategories(
    userId: string,
    filters: Partial<CategoryFilters> = {}
  ): Promise<CategoryListResult> {
    const categoryFilters: CategoryFilters = {
      userId,
      ...filters
    };

    const categories = await CategoryModel.findMany(categoryFilters);

    return { categories };
  }

  static async getCategoryById(id: string, userId: string): Promise<any> {
    const category = await CategoryModel.findById(id);
    if (!category) {
      throw new Error('Category not found');
    }

    // Check if category belongs to user or is system category
    if (category.userId && category.userId !== userId) {
      throw new Error('Access denied to category');
    }

    return category;
  }

  static async updateCategory(
    id: string,
    userId: string,
    data: UpdateCategoryData
  ): Promise<any> {
    const category = await CategoryModel.findById(id);
    if (!category) {
      throw new Error('Category not found');
    }

    // Check if category belongs to user (not system category)
    if (category.isSystem) {
      throw new Error('Cannot modify system category');
    }

    if (category.userId !== userId) {
      throw new Error('Access denied to category');
    }

    // Validate parent category if being updated
    if (data.parentCategoryId) {
      const parentCategory = await CategoryModel.findById(data.parentCategoryId);
      if (!parentCategory) {
        throw new Error('Parent category not found');
      }

      if (parentCategory.userId && parentCategory.userId !== userId) {
        throw new Error('Access denied to parent category');
      }

      if (parentCategory.type !== category.type) {
        throw new Error('Parent and child categories must have the same type');
      }
    }

    // Check for duplicate name if name is being updated
    if (data.name && data.name !== category.name) {
      const existingCategory = await CategoryModel.findByNameAndType(
        data.name,
        category.type,
        userId
      );

      if (existingCategory && existingCategory.id !== id) {
        throw new Error('Category with this name already exists');
      }
    }

    return await CategoryModel.update(id, data);
  }

  static async deleteCategory(id: string, userId: string): Promise<void> {
    const category = await CategoryModel.findById(id);
    if (!category) {
      throw new Error('Category not found');
    }

    // Check if category belongs to user (not system category)
    if (category.isSystem) {
      throw new Error('Cannot delete system category');
    }

    if (category.userId !== userId) {
      throw new Error('Access denied to category');
    }

    // Check if category has transactions
    const hasTransactions = await CategoryModel.hasTransactions(id);
    if (hasTransactions) {
      throw new Error('Cannot delete category with existing transactions');
    }

    // Check if category has subcategories
    const hasSubCategories = await CategoryModel.hasSubCategories(id);
    if (hasSubCategories) {
      throw new Error('Cannot delete category with subcategories');
    }

    await CategoryModel.delete(id);
  }

  static async validateCategoryData(data: CreateCategoryData): Promise<CategoryValidationResult> {
    const errors: string[] = [];

    // Validate name
    if (!data.name || data.name.trim().length === 0) {
      errors.push('Category name is required');
    } else if (data.name.length > 100) {
      errors.push('Category name must be 100 characters or less');
    }

    // Validate type
    if (!data.type || !['INCOME', 'EXPENSE'].includes(data.type)) {
      errors.push('Category type must be INCOME or EXPENSE');
    }

    // Validate icon (optional)
    if (data.icon && data.icon.length > 50) {
      errors.push('Icon must be 50 characters or less');
    }

    // Validate color (optional)
    if (data.color && !/^#[0-9A-F]{6}$/i.test(data.color)) {
      errors.push('Color must be a valid hex color (e.g., #FF0000)');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  static async getCategoryHierarchy(userId: string, type?: 'INCOME' | 'EXPENSE'): Promise<any[]> {
    const filters: CategoryFilters = { userId };
    if (type) filters.type = type;

    const categories = await CategoryModel.findMany(filters);

    // Build hierarchy
    const categoryMap = new Map();
    const rootCategories: any[] = [];

    // First pass: create map of all categories
    categories.forEach(category => {
      categoryMap.set(category.id, { ...category, subCategories: [] });
    });

    // Second pass: build hierarchy
    categories.forEach(category => {
      if (category.parentCategoryId) {
        const parent = categoryMap.get(category.parentCategoryId);
        if (parent) {
          parent.subCategories.push(categoryMap.get(category.id));
        }
      } else {
        rootCategories.push(categoryMap.get(category.id));
      }
    });

    return rootCategories;
  }

  static async getCategoryStats(userId: string): Promise<{
    totalCategories: number;
    incomeCategories: number;
    expenseCategories: number;
    customCategories: number;
    systemCategories: number;
  }> {
    const [allCategories, incomeCategories, expenseCategories, customCategories, systemCategories] = await Promise.all([
      CategoryModel.findMany({ userId }),
      CategoryModel.findMany({ userId, type: 'INCOME' }),
      CategoryModel.findMany({ userId, type: 'EXPENSE' }),
      CategoryModel.findMany({ userId, isSystem: false }),
      CategoryModel.findMany({ userId, isSystem: true })
    ]);

    return {
      totalCategories: allCategories.length,
      incomeCategories: incomeCategories.length,
      expenseCategories: expenseCategories.length,
      customCategories: customCategories.length,
      systemCategories: systemCategories.length
    };
  }
}
