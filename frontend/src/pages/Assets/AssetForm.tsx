import React, { useEffect, useState } from 'react';
import { useAsset, useAssets } from '../../hooks/useAssets';
import { useToast } from '../../context/ToastContext';
import { Modal } from '../../components/ui/Modal';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { ASSET_STATUS } from '../../utils/constants';
import { AssetStatus } from '../../types/asset.types';
import { assetApi } from '../../api/asset.api';

interface AssetFormProps {
  assetId?: string;
  onClose: () => void;
  onSuccess: () => void;
  isModal?: boolean;
}

export const AssetForm: React.FC<AssetFormProps> = ({
  assetId,
  onClose,
  onSuccess,
  isModal = false,
}) => {
  const { data: asset } = useAsset(assetId || '');
  const { showToast } = useToast();
  const { createAsset, updateAsset, isCreating, isUpdating } = useAssets({
    onSuccess: (message, type) => {
      showToast(message, type);
      onSuccess();
    },
    onError: (message) => showToast(message, 'error'),
  });

  const [formData, setFormData] = useState<{
    assetId: string;
    name: string;
    category: string;
    serialNumber: string;
    status: string;
    purchaseDate: string;
    warrantyExpiration: string;
    department: string;
  }>({
    assetId: '',
    name: '',
    category: '',
    serialNumber: '',
    status: ASSET_STATUS.AVAILABLE,
    purchaseDate: '',
    warrantyExpiration: '',
    department: '',
  });
  const [isFetchingNextId, setIsFetchingNextId] = useState(false);

  useEffect(() => {
    if (asset) {
      setFormData({
        assetId: asset.assetId,
        name: asset.name,
        category: asset.category,
        serialNumber: asset.serialNumber,
        status: asset.status,
        purchaseDate: asset.purchaseDate.split('T')[0],
        warrantyExpiration: asset.warrantyExpiration ? asset.warrantyExpiration.split('T')[0] : '',
        department: asset.department || '',
      });
    }
  }, [asset]);

  useEffect(() => {
    if (assetId || formData.assetId) return;
    setIsFetchingNextId(true);
    assetApi
      .getNextAssetId()
      .then((nextId) => {
        setFormData((prev) => ({ ...prev, assetId: nextId }));
      })
      .catch(() => {
        showToast('Failed to load next Asset ID', 'error');
      })
      .finally(() => setIsFetchingNextId(false));
  }, [assetId, formData.assetId, showToast]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const normalizedAssetId = formData.assetId.trim().toUpperCase();
    const assetIdPattern = /^AST-\d{3,}$/;
    if (!normalizedAssetId) {
      showToast('Asset ID is required', 'error');
      return;
    }
    if (!assetIdPattern.test(normalizedAssetId)) {
      showToast('Asset ID must match format AST-001', 'error');
      return;
    }

    const submitData = {
      ...formData,
      assetId: normalizedAssetId,
      status: formData.status as AssetStatus,
      purchaseDate: new Date(formData.purchaseDate).toISOString(),
      warrantyExpiration: formData.warrantyExpiration ? new Date(formData.warrantyExpiration).toISOString() : undefined,
      department: formData.department || undefined,
    };

    if (assetId) {
      updateAsset({ id: assetId, data: submitData });
    } else {
      createAsset(submitData);
    }
  };

  const formContent = (
    <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              Asset ID
            </label>
            <Input
              value={formData.assetId}
              onChange={(e) => setFormData({ ...formData, assetId: e.target.value })}
              required
              disabled={!!assetId}
              placeholder="e.g. AST-001"
            />
            {!assetId && (
              <p className="text-xs text-gray-500">
                {isFetchingNextId ? 'Generating Asset ID...' : 'Auto-generated. You can edit if needed.'}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              Name
            </label>
            <Input
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              placeholder="Asset Name"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              Category
            </label>
            <Input
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              required
              placeholder="e.g. Laptop, Monitor"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              Serial Number
            </label>
            <Input
              value={formData.serialNumber}
              onChange={(e) => setFormData({ ...formData, serialNumber: e.target.value })}
              required
              disabled={!!assetId}
              placeholder="Serial Number"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              Purchase Date
            </label>
            <Input
              type="date"
              value={formData.purchaseDate}
              onChange={(e) => setFormData({ ...formData, purchaseDate: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              Status
            </label>
            <Select
              options={[
                { value: ASSET_STATUS.AVAILABLE, label: 'Available' },
                { value: ASSET_STATUS.ASSIGNED, label: 'Assigned' },
                { value: ASSET_STATUS.IN_REPAIR, label: 'In Repair' },
                { value: ASSET_STATUS.RETIRED, label: 'Retired' },
              ]}
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              Warranty Expiration
            </label>
            <Input
              type="date"
              value={formData.warrantyExpiration}
              onChange={(e) => setFormData({ ...formData, warrantyExpiration: e.target.value })}
              placeholder="Optional"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              Department
            </label>
            <Input
              value={formData.department}
              onChange={(e) => setFormData({ ...formData, department: e.target.value })}
              placeholder="Optional"
            />
          </div>
        </div>

        <div className="flex justify-end space-x-2 pt-4">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" isLoading={isCreating || isUpdating}>
            {assetId ? 'Update' : 'Create'}
          </Button>
        </div>
      </form>
  );

  if (isModal) {
    return (
      <Modal
        isOpen={true}
        onClose={onClose}
        title={assetId ? 'Edit Asset' : 'Add Asset'}
        size="lg"
      >
        {formContent}
      </Modal>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-2xl font-bold">{assetId ? 'Edit Asset' : 'Add Asset'}</div>
      {formContent}
    </div>
  );
};
