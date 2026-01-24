import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { AuthRequest } from './auth.middleware';

// Ensure upload directory exists
const uploadDir = path.resolve(__dirname, '..', '..', 'uploads', 'profile-images');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Get userId from request (set by auth middleware)
    const authReq = req as AuthRequest;
    const userId = authReq.user?.userId;
    if (!userId) {
      return cb(new Error('User ID not found'), '');
    }

    // Generate filename: userId-timestamp.ext
    const timestamp = Date.now();
    const ext = path.extname(file.originalname).toLowerCase();
    const filename = `${userId}-${timestamp}${ext}`;
    cb(null, filename);
  },
});

// File filter - only accept images
const fileFilter = (req: Express.Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedTypes = /jpeg|jpg|png/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPEG, JPG, and PNG images are allowed.'));
  }
};

// Configure multer
export const uploadProfileImage = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
  fileFilter,
});
