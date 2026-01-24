import apiClient from './client';
import { Asset, CreateAssetRequest, UpdateAssetRequest } from '../types/asset.types';

interface AssetsResponse {
  assets: Asset[];
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasMore: boolean;
}

interface AssetsPaginatedResponse {
  assets: Asset[];
  pagination: PaginationMeta;
}

interface AssetResponse {
  asset: Asset;
}

interface NextAssetIdResponse {
  nextAssetId: string;
}

export const assetApi = {
  getAssets: async (filters?: { status?: string; category?: string }): Promise<Asset[]> => {
    const response = await apiClient.get<AssetsResponse>('/assets', { params: filters });
    return response.data.assets;
  },

  searchAssets: async (params: {
    status?: string;
    category?: string;
    search?: string;
    page: number;
    limit: number;
  }): Promise<{ assets: Asset[]; pagination: PaginationMeta }> => {
    const response = await apiClient.get<AssetsPaginatedResponse>('/assets', { params });
    return { assets: response.data.assets, pagination: response.data.pagination };
  },

  getAssetById: async (id: string): Promise<Asset> => {
    const response = await apiClient.get<AssetResponse>(`/assets/${id}`);
    return response.data.asset;
  },

  createAsset: async (data: CreateAssetRequest): Promise<Asset> => {
    const response = await apiClient.post<{ message: string; asset: Asset }>('/assets', data);
    return response.data.asset;
  },

  updateAsset: async (id: string, data: UpdateAssetRequest): Promise<Asset> => {
    const response = await apiClient.put<{ message: string; asset: Asset }>(`/assets/${id}`, data);
    return response.data.asset;
  },

  deleteAsset: async (id: string): Promise<void> => {
    await apiClient.delete(`/assets/${id}`);
  },

  getNextAssetId: async (): Promise<string> => {
    const response = await apiClient.get<NextAssetIdResponse>('/assets/next-id');
    return response.data.nextAssetId;
  },
};

