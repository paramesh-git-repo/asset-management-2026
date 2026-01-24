import { useQuery } from '@tanstack/react-query';
import { dashboardApi } from '../api/dashboard.api';

export const useDashboard = () => {
  return useQuery({
    queryKey: ['dashboard'],
    queryFn: () => dashboardApi.getDashboardStats(),
    refetchInterval: 30000, // Refetch every 30 seconds
    retry: false, // Don't retry on connection errors
    refetchOnWindowFocus: false,
  });
};

