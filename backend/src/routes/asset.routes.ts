import { Router } from 'express';
import {
  createAssetController,
  getAssetsController,
  getAssetByIdController,
  updateAssetController,
  deleteAssetController,
  getNextAssetIdController,
} from '../controllers/asset.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { authorize } from '../middlewares/role.middleware';

const router = Router();

router.use(authenticate);

router.get('/', getAssetsController);
router.get('/next-id', getNextAssetIdController);
router.get('/:id', getAssetByIdController);
router.post('/', authorize('Admin', 'Manager'), createAssetController);
router.put('/:id', authorize('Admin', 'Manager'), updateAssetController);
router.delete('/:id', authorize('Admin'), deleteAssetController);

export default router;

