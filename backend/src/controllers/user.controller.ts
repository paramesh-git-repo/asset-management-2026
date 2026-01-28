import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
import { updateProfileImage, deleteProfileImage, updateProfileName } from '../services/user.service';
import { updateProfileSchema } from '../utils/zodSchemas';
import { logger } from '../utils/logger';
import fs from 'fs';
import path from 'path';

const buildProfileImageUrl = (req: AuthRequest, filename?: string | null) => {
  if (!filename) return null;
  return `${req.protocol}://${req.get('host')}/uploads/profile-images/${filename}`;
};

export const uploadProfileImageController = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    if (!req.file) {
      res.status(400).json({ message: 'No file uploaded' });
      return;
    }

    const user = await updateProfileImage(req.user.userId, req.file.filename);
    logger.info('Profile image upload', { userId: req.user.userId, size: req.file.size, mimeType: req.file.mimetype });

    res.status(200).json({
      message: 'Profile image uploaded successfully',
      user: {
        id: user._id.toString(),
        email: user.email,
        role: user.role,
        status: user.status || 'ACTIVE',
        name: user.name || '',
        profileImage: buildProfileImageUrl(req, user.profileImage),
      },
    });
  } catch (error: any) {
    // Clean up uploaded file if there's an error
    if (req.file) {
      const uploadDir = path.resolve(__dirname, '..', '..', 'uploads', 'profile-images');
      const filePath = path.join(uploadDir, req.file.filename);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    if (error.message === 'User not found') {
      res.status(404).json({ message: error.message });
      return;
    }
    res.status(400).json({ message: error.message || 'Failed to upload profile image' });
  }
};

export const deleteProfileImageController = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const user = await deleteProfileImage(req.user.userId);

    res.status(200).json({
      message: 'Profile image deleted successfully',
      user: {
        id: user._id.toString(),
        email: user.email,
        role: user.role,
        status: user.status || 'ACTIVE',
        name: user.name || '',
        profileImage: buildProfileImageUrl(req, user.profileImage),
      },
    });
  } catch (error: any) {
    if (error.message === 'User not found') {
      res.status(404).json({ message: error.message });
      return;
    }
    res.status(400).json({ message: error.message || 'Failed to delete profile image' });
  }
};

export const updateProfileNameController = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const validatedData = updateProfileSchema.parse(req.body);
    const user = await updateProfileName(req.user.userId, validatedData.name);

    res.status(200).json({
      message: 'Profile updated successfully',
      user: {
        id: user._id.toString(),
        email: user.email,
        role: user.role,
        status: user.status || 'ACTIVE',
        name: user.name || '',
        profileImage: buildProfileImageUrl(req, user.profileImage),
      },
    });
  } catch (error: any) {
    if (error.name === 'ZodError') {
      res.status(400).json({ message: 'Validation error', errors: error.errors });
      return;
    }
    if (error.message === 'User not found') {
      res.status(404).json({ message: error.message });
      return;
    }
    res.status(400).json({ message: error.message || 'Failed to update profile' });
  }
};
