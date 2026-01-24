import { Asset, IAsset } from '../models/Asset';
import { AssetSequence } from '../models/AssetSequence';

const ASSET_SEQUENCE_NAME = 'asset';
const ASSET_ID_REGEX = /^AST-\d{3,}$/;

const formatAssetId = (seq: number) => `AST-${String(seq).padStart(3, '0')}`;

export const getNextAssetId = async (): Promise<string> => {
  const counter = await AssetSequence.findOneAndUpdate(
    { name: ASSET_SEQUENCE_NAME },
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );

  return formatAssetId(counter.seq);
};

export const createAsset = async (data: Partial<IAsset>): Promise<IAsset> => {
  const assetData: any = { ...data };
  
  if (assetData.assetId) {
    assetData.assetId = assetData.assetId.trim().toUpperCase();
    if (!ASSET_ID_REGEX.test(assetData.assetId)) {
      throw new Error('Asset ID must match format AST-001');
    }
    const existingAsset = await Asset.findOne({ assetId: assetData.assetId });
    if (existingAsset) {
      throw new Error('Asset ID already exists');
    }
  } else {
    assetData.assetId = await getNextAssetId();
  }

  if (data.purchaseDate) {
    assetData.purchaseDate = new Date(data.purchaseDate);
  }
  if (data.warrantyExpiration) {
    assetData.warrantyExpiration = new Date(data.warrantyExpiration);
  }
  if (!assetData.maintenanceHistory) {
    assetData.maintenanceHistory = [];
  }
  
  const asset = new Asset(assetData);
  return asset.save();
};

export const getAssets = async (filters?: { status?: string; category?: string }): Promise<IAsset[]> => {
  const query: any = {};
  
  if (filters?.status) {
    query.status = filters.status;
  }
  
  if (filters?.category) {
    query.category = filters.category;
  }

  return Asset.find(query)
    .populate('currentHolder', 'name email')
    .sort({ createdAt: -1 });
};

export const getAssetsPaginated = async (params: {
  status?: string;
  category?: string;
  search?: string;
  page: number;
  limit: number;
}): Promise<{ assets: IAsset[]; total: number }> => {
  const query: any = {};

  if (params.status) query.status = params.status;
  if (params.category) query.category = params.category;

  const term = (params.search || '').trim();
  if (term) {
    const rx = new RegExp(term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
    query.$or = [
      { name: rx },
      { assetId: rx },
      { serialNumber: rx },
      { category: rx },
    ];
  }

  const page = Math.max(1, params.page);
  const limit = Math.min(50, Math.max(1, params.limit));
  const skip = (page - 1) * limit;

  const [assets, total] = await Promise.all([
    Asset.find(query)
      .select('_id name assetId status category serialNumber')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Asset.countDocuments(query),
  ]);

  return { assets, total };
};

export const getAssetById = async (id: string): Promise<IAsset | null> => {
  return Asset.findById(id).populate('currentHolder', 'name email');
};

export const getAssetByAssetId = async (assetId: string): Promise<IAsset | null> => {
  return Asset.findOne({ assetId });
};

export const updateAsset = async (id: string, data: Partial<IAsset>): Promise<IAsset | null> => {
  return Asset.findByIdAndUpdate(id, data, { new: true, runValidators: true });
};

export const deleteAsset = async (id: string): Promise<IAsset | null> => {
  return Asset.findByIdAndDelete(id);
};

