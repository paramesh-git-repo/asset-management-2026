import { Router } from 'express';
import {
  createEmployeeController,
  getEmployeesController,
  getNextEmployeeIdController,
  getEmployeeByIdController,
  updateEmployeeController,
  deactivateEmployeeController,
  updateEmployeeStatusController,
} from '../controllers/employee.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { authorize } from '../middlewares/role.middleware';

const router = Router();

router.use(authenticate);

router.get('/', getEmployeesController);
router.get('/next-id', getNextEmployeeIdController);
router.get('/:id', getEmployeeByIdController);
router.post('/', authorize('Admin', 'Manager'), createEmployeeController);
router.put('/:id', authorize('Admin', 'Manager'), updateEmployeeController);
router.patch('/:id/status', authorize('Admin', 'Manager'), updateEmployeeStatusController);
router.patch('/:id/deactivate', authorize('Admin', 'Manager'), deactivateEmployeeController);

export default router;

