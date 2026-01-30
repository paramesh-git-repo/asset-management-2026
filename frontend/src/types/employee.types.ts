export type EmployeeStatus = 'ACTIVE' | 'INACTIVE' | 'Relieved';

export const EMPLOYEE_COMPANIES = ['V-Accel', 'Axess Technology'] as const;
export type EmployeeCompany = (typeof EMPLOYEE_COMPANIES)[number];

export interface Employee {
  _id: string;
  employeeId: string;
  company?: string;
  name: string;
  email: string;
  phone: string;
  department: string;
  position: string;
  status: EmployeeStatus;
  hireDate: string;
  exitDate?: string | null;
  createdAt: string;
  updatedAt: string;
  activeAssetCount?: number;
}

export interface CreateEmployeeRequest {
  company: EmployeeCompany;
  name: string;
  email: string;
  phone: string;
  department: string;
  position: string;
  hireDate: string;
  status?: EmployeeStatus;
  exitDate?: string | null;
  employeeId?: string;
}


export interface UpdateEmployeeRequest extends Partial<Omit<CreateEmployeeRequest, 'company'>> {
  company?: EmployeeCompany;
  employeeId?: string;
}

