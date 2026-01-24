import jwt, { SignOptions } from 'jsonwebtoken';
import { jwtConfig } from '../config/jwt';
import { User, IUser } from '../models/User';

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export const generateTokens = (user: { userId: string; email: string; role: string }): AuthTokens => {
  const accessToken = jwt.sign(
    { userId: user.userId, email: user.email, role: user.role },
    jwtConfig.accessSecret,
    { expiresIn: jwtConfig.accessExpiresIn } as SignOptions
  );

  const refreshToken = jwt.sign(
    { userId: user.userId },
    jwtConfig.refreshSecret,
    { expiresIn: jwtConfig.refreshExpiresIn } as SignOptions
  );

  return { accessToken, refreshToken };
};

export const login = async (email: string, password: string): Promise<{ user: IUser; tokens: AuthTokens }> => {
  const user = await User.findOne({ email: email.toLowerCase() });
  
  if (!user) {
    throw new Error('Invalid credentials');
  }

  if (user.status && user.status !== 'ACTIVE') {
    throw new Error('User is inactive');
  }

  const isPasswordValid = await user.comparePassword(password);
  
  if (!isPasswordValid) {
    throw new Error('Invalid credentials');
  }

  const tokens = generateTokens({
    userId: user._id.toString(),
    email: user.email,
    role: user.role,
  });

  user.refreshToken = tokens.refreshToken;
  await user.save();

  return { user, tokens };
};

export const refreshAccessToken = async (refreshToken: string): Promise<AuthTokens> => {
  try {
    const decoded = jwt.verify(refreshToken, jwtConfig.refreshSecret) as { userId: string };
    
    const user = await User.findById(decoded.userId);
    
    if (!user || user.refreshToken !== refreshToken) {
      throw new Error('Invalid refresh token');
    }

    const tokens = generateTokens({
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
    });

    user.refreshToken = tokens.refreshToken;
    await user.save();

    return tokens;
  } catch (error) {
    throw new Error('Invalid refresh token');
  }
};

export const logout = async (userId: string): Promise<void> => {
  await User.findByIdAndUpdate(userId, { $unset: { refreshToken: 1 } });
};

export const changePassword = async (
  userId: string,
  currentPassword: string,
  newPassword: string
): Promise<void> => {
  const user = await User.findById(userId);
  
  if (!user) {
    throw new Error('User not found');
  }

  // Verify current password
  const isPasswordValid = await user.comparePassword(currentPassword);
  if (!isPasswordValid) {
    throw new Error('Current password is incorrect');
  }

  // Update password (pre-save hook will hash it)
  user.password = newPassword;
  await user.save();
};

export const updateEmail = async (
  userId: string,
  newEmail: string,
  password: string
): Promise<IUser> => {
  const user = await User.findById(userId);
  
  if (!user) {
    throw new Error('User not found');
  }

  // Verify current password
  const isPasswordValid = await user.comparePassword(password);
  if (!isPasswordValid) {
    throw new Error('Password is incorrect');
  }

  // Check if email is already taken
  const existingUser = await User.findOne({ email: newEmail.toLowerCase() });
  if (existingUser && existingUser._id.toString() !== userId) {
    throw new Error('Email is already in use');
  }

  // Update email
  user.email = newEmail.toLowerCase();
  await user.save();

  return user;
};

