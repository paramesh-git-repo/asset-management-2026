import apiClient from './client';
import { User } from '../types/auth.types';

interface UserResponse {
  user: User;
}

export const userApi = {
  updateProfile: async (data: { name: string }): Promise<User> => {
    const response = await apiClient.patch<UserResponse>('/users/profile', data);
    return response.data.user;
  },

  uploadProfileImage: async (file: File): Promise<User> => {
    const formData = new FormData();
    formData.append('image', file);
    const response = await apiClient.post<UserResponse>('/users/profile-image', formData);
    return response.data.user;
  },
};
