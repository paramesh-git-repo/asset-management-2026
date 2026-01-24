import { Asset } from './asset.types';
import { Employee } from './employee.types';
import { User } from './auth.types';

export type AssignmentStatus = 'Active' | 'Returned';

export interface Assignment {
  _id: string;
  asset: Asset;
  employee: Employee;
  assignedDate: string;
  assignedAt?: string;
  returnDate?: string;
  returnedAt?: string | null;
  dueDate?: string;
  status: AssignmentStatus;
  assignedBy: User;
  notes?: string;
  condition?: 'GOOD' | 'DAMAGED';
  remarks?: string;
  accessories?: string[];
  accessoriesIssued?: Array<'CHARGER' | 'MOUSE' | 'HEADPHONES' | 'MONITOR'>;
  issuedAccessories?: string[];
  returnedAccessories?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateAssignmentRequest {
  assetId: string;
  employeeId: string;
  assignedDate: string;
  notes?: string;
  accessories?: string[];
}

export interface ReturnAssignmentRequest {
  assignmentId: string;
  condition?: 'GOOD' | 'DAMAGED';
  remarks?: string;
  returnedAccessories?: string[];
}

export interface UpdateAssignmentRequest {
  assignmentId: string;
  dueDate?: string;
  notes?: string;
  accessories?: string[];
  condition?: 'GOOD' | 'DAMAGED';
  returnedAccessories?: string[];
}

