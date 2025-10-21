import { Request, Response } from 'express';
import { CategoryService } from '../services/CategoryService';
import { AuthRequest } from '../middleware/auth';

export class CategoryController {
  static async getCategories(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { type, isSystem } = req.query;
      
      const filters: any = {};
      if (type) filters.type = type;
      if (isSystem !== undefined) filters.isSystem = isSystem === 'true';

      const result = await CategoryService.getCategories(req.user!.id, filters);

      res.json({
        success: true,
        data: result.categories
      });
    } catch (error) {
      console.error('Get categories error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch categories'
      });
    }
  }

  static async getCategoryById(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const category = await CategoryService.getCategoryById(id, req.user!.id);

      res.json({
        success: true,
        data: category
      });
    } catch (error) {
      console.error('Get category error:', error);
      const statusCode = error instanceof Error && (
        error.message === 'Category not found' ||
        error.message === 'Access denied to category'
      ) ? 404 : 500;
      
      res.status(statusCode).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch category'
      });
    }
  }

  static async createCategory(req: AuthRequest, res: Response): Promise<void> {
    try {
      const {
        name,
        type,
        icon,
        color,
        parentCategoryId
      } = req.body;

      const categoryData = {
        userId: req.user!.id,
        name,
        type,
        icon,
        color,
        parentCategoryId
      };

      // Validate category data
      const validation = await CategoryService.validateCategoryData(categoryData);
      if (!validation.isValid) {
        res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: validation.errors
        });
        return;
      }

      const category = await CategoryService.createCategory(categoryData);

      res.status(201).json({
        success: true,
        data: category
      });
    } catch (error) {
      console.error('Create category error:', error);
      const statusCode = error instanceof Error && (
        error.message === 'Parent category not found' ||
        error.message === 'Access denied to parent category' ||
        error.message === 'Parent and child categories must have the same type' ||
        error.message === 'Category with this name already exists'
      ) ? 400 : 500;
      
      res.status(statusCode).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create category'
      });
    }
  }

  static async updateCategory(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const updateData = req.body;

      const category = await CategoryService.updateCategory(id, req.user!.id, updateData);

      res.json({
        success: true,
        data: category
      });
    } catch (error) {
      console.error('Update category error:', error);
      const statusCode = error instanceof Error && (
        error.message === 'Category not found' ||
        error.message === 'Cannot modify system category' ||
        error.message === 'Access denied to category' ||
        error.message === 'Parent category not found' ||
        error.message === 'Access denied to parent category' ||
        error.message === 'Parent and child categories must have the same type' ||
        error.message === 'Category with this name already exists'
      ) ? 400 : 500;
      
      res.status(statusCode).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update category'
      });
    }
  }

  static async deleteCategory(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      await CategoryService.deleteCategory(id, req.user!.id);

      res.json({
        success: true,
        message: 'Category deleted successfully'
      });
    } catch (error) {
      console.error('Delete category error:', error);
      const statusCode = error instanceof Error && (
        error.message === 'Category not found' ||
        error.message === 'Cannot delete system category' ||
        error.message === 'Access denied to category' ||
        error.message === 'Cannot delete category with existing transactions' ||
        error.message === 'Cannot delete category with subcategories'
      ) ? 400 : 500;
      
      res.status(statusCode).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to delete category'
      });
    }
  }

  static async getCategoryHierarchy(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { type } = req.query;
      const hierarchy = await CategoryService.getCategoryHierarchy(
        req.user!.id,
        type as 'INCOME' | 'EXPENSE'
      );

      res.json({
        success: true,
        data: hierarchy
      });
    } catch (error) {
      console.error('Get category hierarchy error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch category hierarchy'
      });
    }
  }

  static async getCategoryStats(req: AuthRequest, res: Response): Promise<void> {
    try {
      const stats = await CategoryService.getCategoryStats(req.user!.id);

      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      console.error('Get category stats error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch category statistics'
      });
    }
  }
}
