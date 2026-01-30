import apiClient from './client';
import { Employee, CreateEmployeeRequest, UpdateEmployeeRequest } from '../types/employee.types';
import type { PaginationMeta } from './asset.api';

interface EmployeesResponse {
  employees: Employee[];
}

interface EmployeesPaginatedResponse {
  employees: Employee[];
  pagination: PaginationMeta;
}

interface EmployeeResponse {
  employee: Employee;
}

interface NextEmployeeIdResponse {
  nextEmployeeId: string;
}

export const employeeApi = {
  getEmployees: async (filters?: { status?: string; department?: string }): Promise<Employee[]> => {
    const response = await apiClient.get<EmployeesResponse>('/employees', { params: filters });
    return response.data.employees;
  },

  searchEmployees: async (params: {
    status?: string;
    department?: string;
    search?: string;
    page: number;
    limit: number;
  }): Promise<{ employees: Employee[]; pagination: PaginationMeta }> => {
    const response = await apiClient.get<EmployeesPaginatedResponse>('/employees', { params });
    return { employees: response.data.employees, pagination: response.data.pagination };
  },

  getEmployeeById: async (id: string): Promise<Employee> => {
    const response = await apiClient.get<EmployeeResponse>(`/employees/${id}`);
    return response.data.employee;
  },

  getNextEmployeeId: async (company?: string): Promise<string> => {
    const response = await apiClient.get<NextEmployeeIdResponse>('/employees/next-id', {
      params: company ? { company } : undefined,
    });
    return response.data.nextEmployeeId;
  },

  createEmployee: async (data: CreateEmployeeRequest): Promise<Employee> => {
    const response = await apiClient.post<{ message: string; employee: Employee }>('/employees', data);
    return response.data.employee;
  },

  updateEmployee: async (id: string, data: UpdateEmployeeRequest): Promise<Employee> => {
    const response = await apiClient.put<{ message: string; employee: Employee }>(`/employees/${id}`, data);
    return response.data.employee;
  },

  updateEmployeeStatus: async (id: string, status: 'ACTIVE' | 'INACTIVE'): Promise<Employee> => {
    const response = await apiClient.patch<{ message: string; employee: Employee }>(`/employees/${id}/status`, { status });
    return response.data.employee;
  },

  deactivateEmployee: async (id: string): Promise<Employee> => {
    const response = await apiClient.patch<{ message: string; employee: Employee }>(`/employees/${id}/deactivate`);
    return response.data.employee;
  },
};

