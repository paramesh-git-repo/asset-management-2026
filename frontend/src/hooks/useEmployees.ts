import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { employeeApi } from '../api/employee.api';
import { CreateEmployeeRequest, UpdateEmployeeRequest } from '../types/employee.types';
import { ToastType } from '../components/ui/Toast';

interface UseEmployeesOptions {
  status?: string;
  department?: string;
  onSuccess?: (message: string, type: ToastType) => void;
  onError?: (message: string) => void;
}

export const useEmployees = (options?: UseEmployeesOptions) => {
  const queryClient = useQueryClient();

  const employeesQuery = useQuery({
    queryKey: ['employees', options?.status, options?.department],
    queryFn: () => employeeApi.getEmployees({ status: options?.status, department: options?.department }),
  });

  const createMutation = useMutation({
    mutationFn: (data: CreateEmployeeRequest) => employeeApi.createEmployee(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      options?.onSuccess?.('Employee created successfully', 'success');
    },
    onError: (error: any) => {
      options?.onError?.(error.response?.data?.message || 'Failed to create employee');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateEmployeeRequest }) => {
      const payload = Object.fromEntries(
        Object.entries(data).filter(([_, v]) => v !== undefined)
      ) as UpdateEmployeeRequest;
      return employeeApi.updateEmployee(id, payload);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      queryClient.invalidateQueries({ queryKey: ['employee', variables.id] });
      options?.onSuccess?.('Employee updated successfully', 'success');
    },
    onError: (error: any) => {
      options?.onError?.(error.response?.data?.message || 'Failed to update employee');
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: 'ACTIVE' | 'INACTIVE' }) =>
      employeeApi.updateEmployeeStatus(id, status),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      queryClient.invalidateQueries({ queryKey: ['employee', variables.id] });
      options?.onSuccess?.('Employee status updated successfully', 'success');
    },
    onError: (error: any) => {
      options?.onError?.(error.response?.data?.message || 'Failed to update employee status');
    },
  });

  const deactivateMutation = useMutation({
    mutationFn: (id: string) => employeeApi.deactivateEmployee(id),
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      queryClient.invalidateQueries({ queryKey: ['employee', id] });
      options?.onSuccess?.('Employee deactivated successfully', 'success');
    },
    onError: (error: any) => {
      options?.onError?.(error.response?.data?.message || 'Failed to deactivate employee');
    },
  });

  return {
    employees: employeesQuery.data || [],
    isLoading: employeesQuery.isLoading,
    error: employeesQuery.error,
    createEmployee: createMutation.mutate,
    updateEmployee: updateMutation.mutate,
    updateEmployeeStatus: updateStatusMutation.mutate,
    deactivateEmployee: deactivateMutation.mutate,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isUpdatingStatus: updateStatusMutation.isPending,
    isDeactivating: deactivateMutation.isPending,
  };
};

export const useEmployee = (id: string) => {
  return useQuery({
    queryKey: ['employee', id],
    queryFn: () => employeeApi.getEmployeeById(id),
    enabled: !!id,
  });
};

