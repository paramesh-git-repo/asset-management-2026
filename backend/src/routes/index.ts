import { Router } from 'express';
import authRoutes from './auth.routes';
import employeeRoutes from './employee.routes';
import assetRoutes from './asset.routes';
import assignmentRoutes from './assignment.routes';
import dashboardRoutes from './dashboard.routes';
import userRoutes from './user.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/employees', employeeRoutes);
router.use('/assets', assetRoutes);
router.use('/assignments', assignmentRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/users', userRoutes);

export default router;

