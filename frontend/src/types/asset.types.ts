export type AssetStatus = 'Available' | 'Assigned' | 'In Repair' | 'Retired';

export interface MaintenanceRecord {
  _id: string;
  date: string;
  type: string;
  description: string;
  cost: number;
  performedBy: string;
}

export interface Asset {
  _id: string;
  assetId: string;
  name: string;
  category: string;
  serialNumber: string;
  status: AssetStatus;
  purchaseDate: string;
  warrantyExpiration?: string;
  department?: string;
  currentHolder?: {
    _id: string;
    name: string;
  };
  maintenanceHistory: MaintenanceRecord[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateAssetRequest {
  assetId?: string;
  name: string;
  category: string;
  serialNumber: string;
  purchaseDate: string;
  warrantyExpiration?: string;
  department?: string;
}

export interface UpdateAssetRequest extends Partial<CreateAssetRequest> {
  status?: AssetStatus;
}

