export const jwtConfig = {
  accessSecret: process.env.JWT_ACCESS_SECRET || 'your-access-token-secret-key-change-in-production',
  refreshSecret: process.env.JWT_REFRESH_SECRET || 'your-refresh-token-secret-key-change-in-production',
  accessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m',
  refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
};

