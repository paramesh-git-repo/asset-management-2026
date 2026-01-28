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

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_MIMES = ['image/jpeg', 'image/png', 'image/webp'] as const;

const fileFilter = (req: Express.Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  if (ALLOWED_MIMES.includes(file.mimetype as (typeof ALLOWED_MIMES)[number])) {
    return cb(null, true);
  }
  cb(new Error('Only JPEG, PNG, WEBP allowed'));
};

export const uploadProfileImage = multer({
  storage,
  limits: { fileSize: MAX_FILE_SIZE },
  fileFilter,
});
