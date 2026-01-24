export type UserRole = 'Admin' | 'Manager' | 'Employee';

export interface User {
  id: string;
  email: string;
  role: UserRole;
  name: string;
  status: 'ACTIVE' | 'INACTIVE';
  profileImage?: string | null;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: User;
  tokens: AuthTokens;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface RefreshTokenResponse {
  tokens: AuthTokens;
}

