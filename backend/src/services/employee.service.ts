import { Employee, IEmployee } from '../models/Employee';
import { User } from '../models/User';
import { AssetSequence } from '../models/AssetSequence';

const EMPLOYEE_SEQUENCE_NAME = 'employee';
const EMPLOYEE_ID_REGEX = /^EMP-\d{3,}$/;
const formatEmployeeId = (seq: number) => `EMP-${String(seq).padStart(3, '0')}`;

export const getNextEmployeeId = async (): Promise<string> => {
  const counter = await AssetSequence.findOneAndUpdate(
    { name: EMPLOYEE_SEQUENCE_NAME },
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );
  return formatEmployeeId(counter.seq);
};

export const createEmployee = async (data: Partial<IEmployee>): Promise<IEmployee> => {
  const normalized: any = {
    ...data,
    status: data.status ? data.status.toUpperCase() : data.status,
  };

  if (normalized.employeeId) {
    normalized.employeeId = String(normalized.employeeId).trim().toUpperCase();
    if (!EMPLOYEE_ID_REGEX.test(normalized.employeeId)) {
      throw new Error('Employee ID must match format EMP-001');
    }
    const existing = await Employee.findOne({ employeeId: normalized.employeeId });
    if (existing) {
      throw new Error('Employee ID already exists');
    }
  } else {
    normalized.employeeId = await getNextEmployeeId();
  }

  const employee = new Employee(normalized);
  return employee.save();
};

export const getEmployees = async (filters?: { status?: string; department?: string }): Promise<IEmployee[]> => {
  const query: any = {};
  
  if (filters?.status) {
    const normalized = filters.status.toUpperCase();
    query.status = { $in: [normalized, normalized === 'ACTIVE' ? 'Active' : 'Inactive'] };
  }
  
  if (filters?.department) {
    query.department = filters.department;
  }

  return Employee.find(query).sort({ createdAt: -1 });
};

export const getEmployeesPaginated = async (params: {
  status?: string;
  department?: string;
  search?: string;
  page: number;
  limit: number;
}): Promise<{ employees: IEmployee[]; total: number }> => {
  const query: any = {};

  if (params.status) {
    const normalized = params.status.toUpperCase();
    query.status = { $in: [normalized, normalized === 'ACTIVE' ? 'Active' : 'Inactive'] };
  }
  if (params.department) query.department = params.department;

  const term = (params.search || '').trim();
  if (term) {
    const rx = new RegExp(term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
    query.$or = [{ employeeId: rx }, { name: rx }, { email: rx }, { department: rx }];
  }

  const page = Math.max(1, params.page);
  const limit = Math.min(50, Math.max(1, params.limit));
  const skip = (page - 1) * limit;

  const [employees, total] = await Promise.all([
    Employee.find(query)
      .select('_id employeeId name email department status')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Employee.countDocuments(query),
  ]);

  return { employees, total };
};

export const getEmployeeById = async (id: string): Promise<IEmployee | null> => {
  return Employee.findById(id);
};

export const updateEmployee = async (id: string, data: Partial<IEmployee>): Promise<IEmployee | null> => {
  const normalized = {
    ...data,
    status: data.status ? data.status.toUpperCase() : data.status,
  };
  const updatedEmployee = await Employee.findByIdAndUpdate(id, normalized, { new: true, runValidators: true });
  if (updatedEmployee && updatedEmployee.user && normalized.status) {
    await User.findByIdAndUpdate(updatedEmployee.user, { status: normalized.status });
  }
  return updatedEmployee;
};

export const deactivateEmployee = async (id: string): Promise<IEmployee | null> => {
  const updatedEmployee = await Employee.findByIdAndUpdate(id, { status: 'INACTIVE' }, { new: true });
  if (updatedEmployee && updatedEmployee.user) {
    await User.findByIdAndUpdate(updatedEmployee.user, { status: 'INACTIVE' });
  }
  return updatedEmployee;
};

export const updateEmployeeStatus = async (
  id: string,
  status: 'ACTIVE' | 'INACTIVE'
): Promise<IEmployee | null> => {
  const updatedEmployee = await Employee.findByIdAndUpdate(id, { status }, { new: true, runValidators: true });
  if (updatedEmployee && updatedEmployee.user) {
    await User.findByIdAndUpdate(updatedEmployee.user, { status });
  }
  return updatedEmployee;
};

