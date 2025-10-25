import express, { Request, Response } from 'express';
import { authenticate } from '../middleware/auth';
import { adminAuth } from '../middleware/adminAuth';

const router = express.Router();

// Test route
router.get('/test', (req: Request, res: Response) => {
  res.json({ message: 'Recurring transactions route is working!' });
});

// User routes (require authentication)
router.post('/', authenticate, async (req: Request, res: Response) => {
  try {
    res.status(201).json({
      success: true,
      message: 'Recurring transaction created successfully',
      data: { id: 'temp-id', ...req.body }
    });
  } catch (error: any) {
    console.error('Create recurring transaction error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to create recurring transaction'
    });
  }
});

router.get('/', authenticate, async (req: Request, res: Response) => {
  try {
    res.status(200).json({
      success: true,
      data: []
    });
  } catch (error: any) {
    console.error('Get recurring transactions error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to get recurring transactions'
    });
  }
});

router.delete('/:id', authenticate, async (req: Request, res: Response) => {
  try {
    res.status(200).json({
      success: true,
      message: 'Recurring transaction deleted successfully'
    });
  } catch (error: any) {
    console.error('Delete recurring transaction error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to delete recurring transaction'
    });
  }
});

export default router;
