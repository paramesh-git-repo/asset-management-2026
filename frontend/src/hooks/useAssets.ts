import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { assetApi } from '../api/asset.api';
import { CreateAssetRequest, UpdateAssetRequest } from '../types/asset.types';
import { ToastType } from '../components/ui/Toast';

interface UseAssetsOptions {
  status?: string;
  category?: string;
  onSuccess?: (message: string, type: ToastType) => void;
  onError?: (message: string) => void;
}

export const useAssets = (options?: UseAssetsOptions) => {
  const queryClient = useQueryClient();

  const assetsQuery = useQuery({
    queryKey: ['assets', options?.status, options?.category],
    queryFn: () => assetApi.getAssets({ status: options?.status, category: options?.category }),
    retry: false, // Don't retry on connection errors
    refetchOnWindowFocus: false,
  });

  const createMutation = useMutation({
    mutationFn: (data: CreateAssetRequest) => assetApi.createAsset(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assets'] });
      options?.onSuccess?.('Asset created successfully', 'success');
    },
    onError: (error: any) => {
      options?.onError?.(error.response?.data?.message || 'Failed to create asset');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateAssetRequest }) =>
      assetApi.updateAsset(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assets'] });
      options?.onSuccess?.('Asset updated successfully', 'success');
    },
    onError: (error: any) => {
      options?.onError?.(error.response?.data?.message || 'Failed to update asset');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => assetApi.deleteAsset(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assets'] });
      options?.onSuccess?.('Asset deleted successfully', 'success');
    },
    onError: (error: any) => {
      options?.onError?.(error.response?.data?.message || 'Failed to delete asset');
    },
  });

  return {
    assets: assetsQuery.data || [],
    isLoading: assetsQuery.isLoading,
    error: assetsQuery.error,
    createAsset: createMutation.mutate,
    updateAsset: updateMutation.mutate,
    deleteAsset: deleteMutation.mutate,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
};

export const useAsset = (id: string) => {
  return useQuery({
    queryKey: ['asset', id],
    queryFn: () => assetApi.getAssetById(id),
    enabled: !!id,
  });
};

