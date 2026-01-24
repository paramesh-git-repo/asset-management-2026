import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { assignmentApi } from '../api/assignment.api';
import { CreateAssignmentRequest, ReturnAssignmentRequest, UpdateAssignmentRequest } from '../types/assignment.types';
import { ToastType } from '../components/ui/Toast';

interface UseAssignmentsOptions {
  employeeId?: string;
  assetId?: string;
  status?: string;
  onSuccess?: (message: string, type: ToastType) => void;
  onError?: (message: string) => void;
}

export const useAssignments = (options?: UseAssignmentsOptions) => {
  const queryClient = useQueryClient();

  const assignmentsQuery = useQuery({
    queryKey: ['assignments', options?.employeeId, options?.assetId, options?.status],
    queryFn: () =>
      assignmentApi.getAssignments({
        employeeId: options?.employeeId,
        assetId: options?.assetId,
        status: options?.status,
      }),
  });

  const createMutation = useMutation({
    mutationFn: (data: CreateAssignmentRequest) => assignmentApi.createAssignment(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assignments'] });
      queryClient.invalidateQueries({ queryKey: ['assets'] });
      options?.onSuccess?.('Asset assigned successfully', 'success');
    },
    onError: (error: any) => {
      options?.onError?.(error.response?.data?.message || 'Failed to assign asset');
    },
  });

  const returnMutation = useMutation({
    mutationFn: (data: ReturnAssignmentRequest) => assignmentApi.returnAssignment(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assignments'] });
      queryClient.invalidateQueries({ queryKey: ['assets'] });
      options?.onSuccess?.('Asset returned successfully', 'success');
    },
    onError: (error: any) => {
      options?.onError?.(error.response?.data?.message || 'Failed to return asset');
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: UpdateAssignmentRequest) => assignmentApi.updateAssignment(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assignments'] });
      options?.onSuccess?.('Assignment updated successfully', 'success');
    },
    onError: (error: any) => {
      options?.onError?.(error.response?.data?.message || 'Failed to update assignment');
    },
  });

  return {
    assignments: assignmentsQuery.data || [],
    isLoading: assignmentsQuery.isLoading,
    error: assignmentsQuery.error,
    createAssignment: createMutation.mutate,
    returnAssignment: returnMutation.mutate,
    updateAssignment: updateMutation.mutate,
    isCreating: createMutation.isPending,
    isReturning: returnMutation.isPending,
    isUpdating: updateMutation.isPending,
  };
};

export const useAssignmentHistory = (assetId?: string, employeeId?: string) => {
  return useQuery({
    queryKey: ['assignment-history', assetId, employeeId],
    queryFn: () => assignmentApi.getAssignmentHistory(assetId, employeeId),
  });
};

