import { Router } from 'express';
import { getDashboardStatsController } from '../controllers/dashboard.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();

router.use(authenticate);
router.get('/stats', getDashboardStatsController);

export default router;

