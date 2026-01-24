import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
import { createEmployeeSchema, updateEmployeeSchema, updateEmployeeStatusSchema } from '../utils/zodSchemas';
import {
  createEmployee,
  getEmployees,
  getEmployeesPaginated,
  getNextEmployeeId,
  getEmployeeById,
  updateEmployee,
  deactivateEmployee,
  updateEmployeeStatus,
} from '../services/employee.service';

export const createEmployeeController = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const validatedData = createEmployeeSchema.parse(req.body);
    const employee = await createEmployee({
      ...validatedData,
      hireDate: new Date(validatedData.hireDate),
      status: validatedData.status,
    });
    res.status(201).json({ message: 'Employee created successfully', employee });
  } catch (error: any) {
    if (error.code === 11000) {
      if (error.keyPattern?.employeeId) {
        res.status(400).json({ message: 'Employee ID already exists' });
        return;
      }
      res.status(400).json({ message: 'Employee with this email already exists' });
      return;
    }
    if (error.message === 'Employee ID already exists') {
      res.status(400).json({ message: error.message });
      return;
    }
    if (error.message === 'Employee ID must match format EMP-001') {
      res.status(400).json({ message: error.message });
      return;
    }
    res.status(400).json({ message: error.message || 'Failed to create employee' });
  }
};

export const getNextEmployeeIdController = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const nextEmployeeId = await getNextEmployeeId();
    res.status(200).json({ nextEmployeeId });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to generate next Employee ID' });
  }
};

export const getEmployeesController = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { status, department, search, page, limit } = req.query;
    const filters: any = {};
    if (status) filters.status = status;
    if (department) filters.department = department;

    const pageNum = page ? Number(page) : undefined;
    const limitNum = limit ? Number(limit) : undefined;

    // Backward-compatible: only paginate when requested (page/limit/search present)
    if (search || pageNum || limitNum) {
      const resolvedPage = Number.isFinite(pageNum) && pageNum ? pageNum : 1;
      const resolvedLimit = Number.isFinite(limitNum) && limitNum ? limitNum : 10;

      const result = await getEmployeesPaginated({
        status: filters.status,
        department: filters.department,
        search: typeof search === 'string' ? search : undefined,
        page: resolvedPage,
        limit: resolvedLimit,
      });

      const totalPages = Math.ceil(result.total / resolvedLimit);
      res.status(200).json({
        employees: result.employees,
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

    const employees = await getEmployees(filters);
    res.status(200).json({ employees });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to fetch employees' });
  }
};

export const getEmployeeByIdController = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const employee = await getEmployeeById(req.params.id);
    if (!employee) {
      res.status(404).json({ message: 'Employee not found' });
      return;
    }
    res.status(200).json({ employee });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to fetch employee' });
  }
};

export const updateEmployeeController = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const validatedData = updateEmployeeSchema.parse(req.body);
    const updateData: any = { ...validatedData };
    
    if (validatedData.hireDate) {
      updateData.hireDate = new Date(validatedData.hireDate);
    }
    if (validatedData.status) {
      updateData.status = validatedData.status.toUpperCase();
    }

    const employee = await updateEmployee(req.params.id, updateData);
    if (!employee) {
      res.status(404).json({ message: 'Employee not found' });
      return;
    }
    res.status(200).json({ message: 'Employee updated successfully', employee });
  } catch (error: any) {
    if (error.name === 'ZodError') {
      console.error('Employee update validation error:', error.errors);
      res.status(400).json({ message: 'Validation error', errors: error.errors });
      return;
    }
    res.status(400).json({ message: error.message || 'Failed to update employee' });
  }
};

export const deactivateEmployeeController = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const employee = await deactivateEmployee(req.params.id);
    if (!employee) {
      res.status(404).json({ message: 'Employee not found' });
      return;
    }
    res.status(200).json({ message: 'Employee deactivated successfully', employee });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to deactivate employee' });
  }
};

export const updateEmployeeStatusController = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const validatedData = updateEmployeeStatusSchema.parse(req.body);
    const employee = await updateEmployeeStatus(req.params.id, validatedData.status);
    if (!employee) {
      res.status(404).json({ message: 'Employee not found' });
      return;
    }
    res.status(200).json({ message: 'Employee status updated successfully', employee });
  } catch (error: any) {
    res.status(400).json({ message: error.message || 'Failed to update employee status' });
  }
};

