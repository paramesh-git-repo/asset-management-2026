import { Router } from 'express';
import {
  createAssignmentController,
  getAssignmentsController,
  getAssignmentByIdController,
  returnAssignmentController,
  returnAssetByIdController,
  getAssignmentHistoryController,
  updateAssignmentController,
} from '../controllers/assignment.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { authorize } from '../middlewares/role.middleware';

const router = Router();

router.use(authenticate);

router.get('/', getAssignmentsController);
router.get('/history', getAssignmentHistoryController);
router.post('/', authorize('Admin', 'Manager'), createAssignmentController);
router.patch('/return', authorize('Admin', 'Manager'), returnAssignmentController);
// New proper return endpoint: POST /api/v1/assignments/:id/return (must be before /:id route)
router.post('/:id/return', authorize('Admin', 'Manager'), returnAssetByIdController);
router.patch('/:id', authorize('Admin', 'Manager'), updateAssignmentController);
router.get('/:id', getAssignmentByIdController);

export default router;

