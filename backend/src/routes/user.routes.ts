import { Router, Request, Response, NextFunction } from 'express';
import { authenticate } from '../middlewares/auth.middleware';
import { uploadProfileImage } from '../middlewares/upload.middleware';
import { uploadProfileImageController, deleteProfileImageController, updateProfileNameController } from '../controllers/user.controller';
import multer from 'multer';

const router = Router();

// All routes require authentication
router.use(authenticate);

const handleMulterError = (err: any, req: Request, res: Response, next: NextFunction) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(413).json({ message: 'Image size exceeds 10MB limit' });
    }
    return res.status(400).json({ message: err.message || 'File upload error' });
  }
  if (err && err.message && (err.message.includes('Only JPEG, PNG, WEBP allowed') || err.message.includes('Invalid file type'))) {
    return res.status(400).json({ message: 'Only JPEG, PNG, WEBP allowed' });
  }
  if (err && err.message && err.message.includes('User ID not found')) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  next(err);
};

// Upload or replace profile image
router.post(
  '/profile-image',
  uploadProfileImage.single('image'),
  handleMulterError,
  uploadProfileImageController
);

// Update profile name
router.patch('/profile', updateProfileNameController);

// Delete profile image
router.delete('/profile-image', deleteProfileImageController);

export default router;
