import { Employee, IEmployee } from '../models/Employee';
import { User } from '../models/User';
import { Assignment } from '../models/Assignment';
import mongoose from 'mongoose';

const COMPANY_PREFIX: Record<string, string> = {
  'V-Accel': 'VA',
  'Axess Technology': 'AT',
};

const VA_AT_REGEX = /^(VA|AT)(\d+)$/i;
const EMP_REGEX = /^EMP-\d{3,}$/;

function getPrefixForCompany(company: string): string | null {
  return COMPANY_PREFIX[company] ?? null;
}

/** Get next employee ID for a company (VA1000, AT1000, etc.). Each company has its own sequence. */
export const getNextEmployeeIdForCompany = async (company: string): Promise<string> => {
  const prefix = getPrefixForCompany(company);
  if (!prefix) {
    throw new Error(`Invalid company for ID generation: ${company}`);
  }
  const employees = await Employee.find({ company }).select('employeeId').lean();
  let maxNum = 999;
  for (const e of employees) {
    const m = String(e.employeeId || '').match(new RegExp(`^${prefix}(\\d+)$`, 'i'));
    if (m) {
      const n = parseInt(m[1], 10);
      if (n > maxNum) maxNum = n;
    }
  }
  return `${prefix}${maxNum + 1}`;
};

/** Legacy: single global sequence (EMP-001). Kept for backward compatibility when company not used. */
export const getNextEmployeeId = async (company?: string): Promise<string> => {
  if (company && getPrefixForCompany(company)) {
    return getNextEmployeeIdForCompany(company);
  }
  const { AssetSequence } = await import('../models/AssetSequence');
  const counter = await AssetSequence.findOneAndUpdate(
    { name: 'employee' },
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );
  return `EMP-${String(counter.seq).padStart(3, '0')}`;
};

const isValidEmployeeIdFormat = (id: string): boolean =>
  /^(VA|AT)\d{4,}$/i.test(id) || EMP_REGEX.test(id);

export const createEmployee = async (data: Partial<IEmployee>): Promise<IEmployee> => {
  const normalized: any = {
    ...data,
    status: data.status === 'Relieved' ? 'Relieved' : data.status ? String(data.status).toUpperCase() : data.status,
  };
  if (normalized.status === 'Relieved') {
    if (normalized.exitDate == null || normalized.exitDate === '') {
      throw new Error('Exit date is required when status is Relieved');
    }
  } else {
    normalized.exitDate = null;
  }

  if (normalized.employeeId) {
    normalized.employeeId = String(normalized.employeeId).trim().toUpperCase();
    if (!isValidEmployeeIdFormat(normalized.employeeId)) {
      throw new Error('Employee ID must match format VA1000, AT1000, or EMP-001');
    }
    const existing = await Employee.findOne({ employeeId: normalized.employeeId });
    if (existing) {
      throw new Error('Employee ID already exists.');
    }
  } else {
    if (normalized.company && getPrefixForCompany(normalized.company)) {
      normalized.employeeId = await getNextEmployeeIdForCompany(normalized.company);
    } else {
      normalized.employeeId = await getNextEmployeeId();
    }
  }

  const employee = new Employee(normalized);
  return employee.save();
};

/** Count assignments where status = "Active" (not returned). */
export const getActiveAssignmentCount = async (employeeId: string): Promise<number> => {
  return Assignment.countDocuments({
    employee: new mongoose.Types.ObjectId(employeeId),
    status: 'Active',
  });
};

async function attachActiveAssetCounts<T extends { _id?: unknown }>(
  employees: T[]
): Promise<(T & { activeAssetCount: number })[]> {
  if (employees.length === 0) return [];
  const ids = employees.map((e) => e._id);
  const counts = await Assignment.aggregate<{ _id: mongoose.Types.ObjectId; count: number }>([
    { $match: { status: 'Active', employee: { $in: ids } } },
    { $group: { _id: '$employee', count: { $sum: 1 } } },
  ]);
  const map = new Map(counts.map((c) => [c._id.toString(), c.count]));
  return employees.map((e) => ({
    ...e,
    activeAssetCount: map.get(String(e._id ?? '')) ?? 0,
  }));
}

export const getEmployees = async (filters?: { status?: string; department?: string }): Promise<(IEmployee & { activeAssetCount: number })[]> => {
  const query: any = {};
  
  if (filters?.status) {
    const s = filters.status.trim();
    query.status = s === 'Relieved' ? 'Relieved' : s.toUpperCase();
  }
  
  if (filters?.department) {
    query.department = filters.department;
  }

  const list = await Employee.find(query).sort({ createdAt: -1 }).lean();
  return attachActiveAssetCounts(list as unknown as IEmployee[]);
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
    const s = params.status.trim();
    query.status = s === 'Relieved' ? 'Relieved' : s.toUpperCase();
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

  const [rawEmployees, total] = await Promise.all([
    Employee.find(query)
      .select('_id employeeId company name email department status')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Employee.countDocuments(query),
  ]);

  const employees = await attachActiveAssetCounts(rawEmployees as unknown as IEmployee[]);
  return { employees, total };
};

export const getEmployeeById = async (id: string): Promise<IEmployee | null> => {
  return Employee.findById(id);
};

export const updateEmployee = async (id: string, data: Partial<IEmployee>): Promise<IEmployee | null> => {
  const normalized: any = {
    ...data,
    status: data.status === 'Relieved' ? 'Relieved' : data.status ? String(data.status).toUpperCase() : data.status,
  };
  if (normalized.status === 'Relieved') {
    if (normalized.exitDate == null || normalized.exitDate === '') {
      throw new Error('Exit date is required when status is Relieved');
    }
  } else {
    normalized.exitDate = null;
  }
  if (normalized.employeeId != null && normalized.employeeId !== '') {
    normalized.employeeId = String(normalized.employeeId).trim().toUpperCase();
    const existing = await Employee.findOne({
      employeeId: normalized.employeeId,
      _id: { $ne: id },
    });
    if (existing) {
      throw new Error('Employee ID already exists.');
    }
  }
  const updatedEmployee = await Employee.findByIdAndUpdate(id, normalized, { new: true, runValidators: true });
  if (updatedEmployee && updatedEmployee.user && normalized.status) {
    const userStatus = normalized.status === 'Relieved' ? 'INACTIVE' : normalized.status;
    await User.findByIdAndUpdate(updatedEmployee.user, { status: userStatus });
  }
  return updatedEmployee;
};

export const deactivateEmployee = async (id: string): Promise<IEmployee | null> => {
  const activeCount = await getActiveAssignmentCount(id);
  if (activeCount > 0) {
    throw new Error('Employee cannot be deactivated while holding active assets.');
  }
  const exitDate = new Date();
  const updatedEmployee = await Employee.findByIdAndUpdate(
    id,
    { status: 'Relieved', exitDate },
    { new: true, runValidators: true }
  );
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

