import apiClient from './client';
import { Assignment, CreateAssignmentRequest, ReturnAssignmentRequest, UpdateAssignmentRequest } from '../types/assignment.types';

interface AssignmentsResponse {
  assignments: Assignment[];
}

interface AssignmentResponse {
  assignment: Assignment;
}

interface AssignmentHistoryResponse {
  history: Assignment[];
}

export const assignmentApi = {
  getAssignments: async (filters?: { employeeId?: string; assetId?: string; status?: string }): Promise<Assignment[]> => {
    const response = await apiClient.get<AssignmentsResponse>('/assignments', { params: filters });
    return response.data.assignments;
  },

  getAssignmentById: async (id: string): Promise<Assignment> => {
    const response = await apiClient.get<AssignmentResponse>(`/assignments/${id}`);
    return response.data.assignment;
  },

  createAssignment: async (data: CreateAssignmentRequest): Promise<Assignment> => {
    const response = await apiClient.post<{ message: string; assignment: Assignment }>('/assignments', data);
    return response.data.assignment;
  },

  returnAssignment: async (data: ReturnAssignmentRequest): Promise<Assignment> => {
    const { assignmentId, ...payload } = data;
    const response = await apiClient.post<{ message: string; assignment: Assignment }>(
      `/assignments/${assignmentId}/return`,
      payload
    );
    return response.data.assignment;
  },

  updateAssignment: async (data: UpdateAssignmentRequest): Promise<Assignment> => {
    const { assignmentId, ...payload } = data;
    const response = await apiClient.patch<{ message: string; assignment: Assignment }>(
      `/assignments/${assignmentId}`,
      payload
    );
    return response.data.assignment;
  },

  getAssignmentHistory: async (assetId?: string, employeeId?: string): Promise<Assignment[]> => {
    const response = await apiClient.get<AssignmentHistoryResponse>('/assignments/history', {
      params: { assetId, employeeId },
    });
    return response.data.history;
  },
};

