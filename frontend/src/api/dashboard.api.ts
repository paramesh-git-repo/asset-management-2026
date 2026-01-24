import apiClient from './client';
import { DashboardStats } from '../types/dashboard.types';

interface DashboardStatsResponse {
  stats: DashboardStats;
}

export const dashboardApi = {
  getDashboardStats: async (): Promise<DashboardStats> => {
    const response = await apiClient.get<DashboardStatsResponse>('/dashboard/stats');
    return response.data.stats;
  },
};

