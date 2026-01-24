import { Request, Response } from 'express';
import { loginSchema, refreshTokenSchema, changePasswordSchema, updateEmailSchema } from '../utils/zodSchemas';
import { login, refreshAccessToken, logout, changePassword, updateEmail, generateTokens } from '../services/auth.service';
import { authenticate, AuthRequest } from '../middlewares/auth.middleware';

const buildProfileImageUrl = (req: Request, filename?: string | null) => {
  if (!filename) return null;
  return `${req.protocol}://${req.get('host')}/uploads/profile-images/${filename}`;
};

export const loginController = async (req: Request, res: Response): Promise<void> => {
  try {
    const validatedData = loginSchema.parse(req.body);
    const { user, tokens } = await login(validatedData.email, validatedData.password);

    res.status(200).json({
      message: 'Login successful',
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        status: user.status || 'ACTIVE',
        name: user.name || '',
        profileImage: buildProfileImageUrl(req, user.profileImage),
      },
      tokens,
    });
  } catch (error: any) {
    res.status(401).json({ message: error.message || 'Login failed' });
  }
};

export const refreshTokenController = async (req: Request, res: Response): Promise<void> => {
  try {
    const validatedData = refreshTokenSchema.parse(req.body);
    const tokens = await refreshAccessToken(validatedData.refreshToken);

    res.status(200).json({
      message: 'Token refreshed successfully',
      tokens,
    });
  } catch (error: any) {
    res.status(401).json({ message: error.message || 'Token refresh failed' });
  }
};

export const logoutController = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (req.user) {
      await logout(req.user.userId);
    }
    res.status(200).json({ message: 'Logout successful' });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Logout failed' });
  }
};

export const changePasswordController = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const validatedData = changePasswordSchema.parse(req.body);
    await changePassword(
      req.user.userId,
      validatedData.currentPassword,
      validatedData.newPassword
    );

    res.status(200).json({ message: 'Password changed successfully' });
  } catch (error: any) {
    if (error.message === 'User not found') {
      res.status(404).json({ message: error.message });
      return;
    }
    if (error.message === 'Current password is incorrect') {
      res.status(400).json({ message: error.message });
      return;
    }
    res.status(400).json({ message: error.message || 'Failed to change password' });
  }
};

export const updateEmailController = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const validatedData = updateEmailSchema.parse(req.body);
    const updatedUser = await updateEmail(
      req.user.userId,
      validatedData.email,
      validatedData.password
    );

    // Generate new tokens with updated email
    const tokens = generateTokens({
      userId: updatedUser._id.toString(),
      email: updatedUser.email,
      role: updatedUser.role,
    });

    // Update refresh token
    updatedUser.refreshToken = tokens.refreshToken;
    await updatedUser.save();

    res.status(200).json({
      message: 'Email updated successfully',
      user: {
        id: updatedUser._id.toString(),
        email: updatedUser.email,
        role: updatedUser.role,
        status: updatedUser.status || 'ACTIVE',
        name: updatedUser.name || '',
        profileImage: buildProfileImageUrl(req, updatedUser.profileImage),
      },
      tokens,
    });
  } catch (error: any) {
    if (error.message === 'User not found') {
      res.status(404).json({ message: error.message });
      return;
    }
    if (error.message === 'Password is incorrect') {
      res.status(400).json({ message: error.message });
      return;
    }
    if (error.message === 'Email is already in use') {
      res.status(409).json({ message: error.message });
      return;
    }
    res.status(400).json({ message: error.message || 'Failed to update email' });
  }
};

