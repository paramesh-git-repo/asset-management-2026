export interface CategoryReport {
  category: string;
  count: number;
}

export interface DepartmentReport {
  department: string;
  count: number;
}

export interface AssetSummaryReport {
  totalAssets: number;
  assignedAssets: number;
  availableAssets: number;
  inRepairAssets: number;
  retiredAssets: number;
}

export interface EmployeeAssetSummary {
  employeeId: string;
  employeeName: string;
  department: string;
  assignedCount: number;
  assets: Array<{
    assetId: string;
    assetName: string;
    category: string;
    assignedDate: string;
  }>;
}
