import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import multer from 'multer';

export const errorHandler = (
  err: Error | ZodError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // Handle multer errors
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      res.status(400).json({
        message: 'File too large. Maximum size is 2MB.',
      });
      return;
    }
    res.status(400).json({
      message: err.message || 'File upload error',
    });
    return;
  }

  // Handle multer file filter errors
  if (err.message && err.message.includes('Invalid file type')) {
    res.status(400).json({
      message: 'Invalid file type. Only JPEG, JPG, and PNG images are allowed.',
    });
    return;
  }

  if (err instanceof ZodError) {
    res.status(400).json({
      message: 'Validation error',
      errors: err.errors.map((error) => ({
        path: error.path.join('.'),
        message: error.message,
      })),
    });
    return;
  }

  console.error('Error:', err);
  res.status(500).json({
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined,
  });
};

