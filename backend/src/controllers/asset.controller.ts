import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
import { createAssetSchema, updateAssetSchema } from '../utils/zodSchemas';
import {
  createAsset,
  getAssets,
  getAssetsPaginated,
  getAssetById,
  updateAsset,
  deleteAsset,
  getNextAssetId,
} from '../services/asset.service';

export const createAssetController = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const validatedData = createAssetSchema.parse(req.body);
    const assetData: any = {
      ...validatedData,
      purchaseDate: new Date(validatedData.purchaseDate),
    };
    
    if (validatedData.warrantyExpiration) {
      assetData.warrantyExpiration = new Date(validatedData.warrantyExpiration);
    }
    
    const asset = await createAsset(assetData);
    res.status(201).json({ message: 'Asset created successfully', asset });
  } catch (error: any) {
    if (error.message === 'Asset ID already exists') {
      res.status(400).json({ message: error.message });
      return;
    }
    if (error.message === 'Asset ID must match format AST-001') {
      res.status(400).json({ message: error.message });
      return;
    }
    if (error.code === 11000) {
      if (error.keyPattern?.assetId) {
        res.status(400).json({ message: 'Asset ID already exists' });
        return;
      }
      res.status(400).json({ message: 'Asset ID or Serial Number already exists' });
      return;
    }
    res.status(400).json({ message: error.message || 'Failed to create asset' });
  }
};

export const getNextAssetIdController = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const nextAssetId = await getNextAssetId();
    res.status(200).json({ nextAssetId });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to generate next Asset ID' });
  }
};

export const getAssetsController = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { status, category, search, page, limit } = req.query;
    const filters: any = {};
    if (status) filters.status = status;
    if (category) filters.category = category;

    const pageNum = page ? Number(page) : undefined;
    const limitNum = limit ? Number(limit) : undefined;

    // Backward-compatible: only paginate when requested (page/limit/search present)
    if (search || pageNum || limitNum) {
      const resolvedPage = Number.isFinite(pageNum) && pageNum ? pageNum : 1;
      const resolvedLimit = Number.isFinite(limitNum) && limitNum ? limitNum : 10;

      const result = await getAssetsPaginated({
        status: filters.status,
        category: filters.category,
        search: typeof search === 'string' ? search : undefined,
        page: resolvedPage,
        limit: resolvedLimit,
      });

      const totalPages = Math.ceil(result.total / resolvedLimit);
      res.status(200).json({
        assets: result.assets,
        pagination: {
          page: resolvedPage,
          limit: resolvedLimit,
          total: result.total,
          totalPages,
          hasMore: resolvedPage < totalPages,
        },
      });
      return;
    }

    const assets = await getAssets(filters);
    res.status(200).json({ assets });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to fetch assets' });
  }
};

export const getAssetByIdController = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const asset = await getAssetById(req.params.id);
    if (!asset) {
      res.status(404).json({ message: 'Asset not found' });
      return;
    }
    res.status(200).json({ asset });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to fetch asset' });
  }
};

export const updateAssetController = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const validatedData = updateAssetSchema.parse(req.body);
    const updateData: any = { ...validatedData };
    
    if (validatedData.purchaseDate) {
      updateData.purchaseDate = new Date(validatedData.purchaseDate);
    }
    if (validatedData.warrantyExpiration) {
      updateData.warrantyExpiration = new Date(validatedData.warrantyExpiration);
    }

    const asset = await updateAsset(req.params.id, updateData);
    if (!asset) {
      res.status(404).json({ message: 'Asset not found' });
      return;
    }
    res.status(200).json({ message: 'Asset updated successfully', asset });
  } catch (error: any) {
    res.status(400).json({ message: error.message || 'Failed to update asset' });
  }
};

export const deleteAssetController = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const asset = await deleteAsset(req.params.id);
    if (!asset) {
      res.status(404).json({ message: 'Asset not found' });
      return;
    }
    res.status(200).json({ message: 'Asset deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to delete asset' });
  }
};

