import apiClient from './client';
import { LoginRequest, LoginResponse, RefreshTokenRequest, RefreshTokenResponse } from '../types/auth.types';

export const authApi = {
  login: async (data: LoginRequest): Promise<LoginResponse> => {
    const response = await apiClient.post<{ message: string; user: LoginResponse['user']; tokens: LoginResponse['tokens'] }>('/auth/login', data);
    return {
      user: response.data.user,
      tokens: response.data.tokens,
    };
  },

  refreshToken: async (data: RefreshTokenRequest): Promise<RefreshTokenResponse> => {
    const response = await apiClient.post<{ message: string; tokens: RefreshTokenResponse['tokens'] }>('/auth/refresh', data);
    return {
      tokens: response.data.tokens,
    };
  },

  logout: async (): Promise<void> => {
    await apiClient.post('/auth/logout');
  },

  changePassword: async (data: { currentPassword: string; newPassword: string }): Promise<void> => {
    await apiClient.post('/auth/change-password', data);
  },

  updateEmail: async (data: { email: string; password: string }): Promise<LoginResponse> => {
    const response = await apiClient.post<{ message: string; user: LoginResponse['user']; tokens: LoginResponse['tokens'] }>('/auth/update-email', data);
    return {
      user: response.data.user,
      tokens: response.data.tokens,
    };
  },
};

