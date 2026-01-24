import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
import { getDashboardStats } from '../services/dashboard.service';

export const getDashboardStatsController = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const stats = await getDashboardStats();
    res.status(200).json({ stats });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to fetch dashboard stats' });
  }
};

