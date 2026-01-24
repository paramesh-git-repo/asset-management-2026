import { Assignment } from './assignment.types';

export interface DashboardStats {
  totalAssets: number;
  availableAssets: number;
  assignedAssets: number;
  assetsInRepair: number;
  totalEmployees: number;
  activeAssignments: number;
  recentAssignments: Assignment[];
}

