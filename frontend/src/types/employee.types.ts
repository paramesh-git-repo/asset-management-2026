export type EmployeeStatus = 'ACTIVE' | 'INACTIVE';

export interface Employee {
  _id: string;
  employeeId: string;
  name: string;
  email: string;
  phone: string;
  department: string;
  position: string;
  status: EmployeeStatus;
  hireDate: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateEmployeeRequest {
  name: string;
  email: string;
  phone: string;
  department: string;
  position: string;
  hireDate: string;
}

export interface UpdateEmployeeRequest extends Partial<CreateEmployeeRequest> {}

