import fs from 'fs';
import path from 'path';
import { User, IUser } from '../models/User';

const uploadDir = path.resolve(__dirname, '..', '..', 'uploads', 'profile-images');

export const updateProfileImage = async (
  userId: string,
  filename: string
): Promise<IUser> => {
  const user = await User.findById(userId);
  
  if (!user) {
    throw new Error('User not found');
  }

  // Delete old profile image if exists
  if (user.profileImage) {
    const oldImagePath = path.join(uploadDir, user.profileImage);
    if (fs.existsSync(oldImagePath)) {
      fs.unlinkSync(oldImagePath);
    }
  }

  // Update user profile image
  user.profileImage = filename;
  await user.save();

  return user;
};

export const deleteProfileImage = async (userId: string): Promise<IUser> => {
  const user = await User.findById(userId);
  
  if (!user) {
    throw new Error('User not found');
  }

  // Delete profile image file if exists
  if (user.profileImage) {
    const imagePath = path.join(uploadDir, user.profileImage);
    if (fs.existsSync(imagePath)) {
      fs.unlinkSync(imagePath);
    }
  }

  // Clear profile image from user
  user.profileImage = null;
  await user.save();

  return user;
};

export const getUserById = async (userId: string): Promise<IUser | null> => {
  return User.findById(userId);
};

export const updateProfileName = async (userId: string, name: string): Promise<IUser> => {
  const user = await User.findById(userId);
  if (!user) {
    throw new Error('User not found');
  }

  user.name = name.trim();
  await user.save();
  return user;
};
