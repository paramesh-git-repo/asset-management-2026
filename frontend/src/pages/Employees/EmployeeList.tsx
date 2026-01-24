import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useEmployees } from '../../hooks/useEmployees';
import { useToast } from '../../context/ToastContext';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/Table';
import { formatDate, getStatusColor } from '../../utils/helpers';
import { EmployeeForm } from './EmployeeForm';
import { EMPLOYEE_STATUS } from '../../utils/constants';
import { Plus, Search, Eye } from 'lucide-react';
import { cn } from '../../utils/cn';
import { Modal } from '../../components/ui/Modal';

export const EmployeeList: React.FC = () => {
  const [showForm, setShowForm] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<string | null>(null);
  const [showDeactivateModal, setShowDeactivateModal] = useState(false);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const { showToast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const handleEditEmployee = (e: CustomEvent) => {
      setEditingEmployee(e.detail);
      setShowForm(true);
    };
    window.addEventListener('editEmployee' as any, handleEditEmployee);
    return () => window.removeEventListener('editEmployee' as any, handleEditEmployee);
  }, []);

  const { employees, isLoading, updateEmployeeStatus, isUpdatingStatus } = useEmployees({
    status: statusFilter || undefined,
    onSuccess: (message, type) => {
      showToast(message, type);
      setShowDeactivateModal(false);
      setSelectedEmployeeId(null);
    },
    onError: (message) => showToast(message, 'error'),
  });

  const filteredEmployees = employees.filter((employee) =>
    employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (employee.employeeId || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEdit = (id: string) => {
    setEditingEmployee(id);
    setShowForm(true);
  };

  const handleDeactivate = (id: string) => {
    setSelectedEmployeeId(id);
    setShowDeactivateModal(true);
  };

  const handleConfirmDeactivate = () => {
    if (!selectedEmployeeId) return;
    updateEmployeeStatus({ id: selectedEmployeeId, status: EMPLOYEE_STATUS.INACTIVE });
  };

  const handleActivate = (id: string) => {
    updateEmployeeStatus({ id, status: EMPLOYEE_STATUS.ACTIVE });
  };

  const handleCloseDeactivate = () => {
    setShowDeactivateModal(false);
    setSelectedEmployeeId(null);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingEmployee(null);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Employees</h1>
          <p className="text-sm text-gray-500">Manage your workforce access and details</p>
        </div>
        <Button onClick={() => setShowForm(true)} className="w-full sm:w-auto">
          <Plus className="mr-2 h-4 w-4" />
          Add Employee
        </Button>
      </div>

      {showForm && (
        <EmployeeForm
          employeeId={editingEmployee || undefined}
          onClose={handleCloseForm}
          onSuccess={handleCloseForm}
          isModal={true}
        />
      )}

      {showDeactivateModal && (
        <Modal
          isOpen={showDeactivateModal}
          onClose={handleCloseDeactivate}
          title="Deactivate Employee"
          size="md"
        >
          <Card className="border-none shadow-none">
            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                Are you sure you want to deactivate this employee?
                This action will prevent the employee from accessing the system.
              </p>
              <div className="flex justify-end gap-2">
                <Button variant="outline" type="button" onClick={handleCloseDeactivate}>
                  Cancel
                </Button>
                <Button
                  variant="danger"
                  type="button"
                  onClick={handleConfirmDeactivate}
                  isLoading={isUpdatingStatus}
                  disabled={isUpdatingStatus}
                >
                  Deactivate
                </Button>
              </div>
            </div>
          </Card>
        </Modal>
      )}

      <Card className="border-none shadow-md ring-1 ring-gray-200">
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search employees..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="w-full sm:w-48">
              <Select
                options={[
                  { value: '', label: 'All Statuses' },
                  { value: EMPLOYEE_STATUS.ACTIVE, label: EMPLOYEE_STATUS.ACTIVE },
                  { value: EMPLOYEE_STATUS.INACTIVE, label: EMPLOYEE_STATUS.INACTIVE },
                ]}
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              />
            </div>
          </div>

          {isLoading ? (
            <div className="flex h-64 items-center justify-center text-gray-500">
              <div className="animate-pulse">Loading employees...</div>
            </div>
          ) : filteredEmployees.length === 0 ? (
            <div className="flex bg-gray-50 rounded-lg h-64 flex-col items-center justify-center text-gray-500 border border-dashed border-gray-300">
              <p>No employees found matching your criteria.</p>
            </div>
          ) : (
            <div className="rounded-md border border-gray-200 overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50 hover:bg-gray-50">
                    <TableHead>Name</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Joined</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredEmployees.map((employee) => (
                    <TableRow key={employee._id}>
                      <TableCell className="font-medium text-gray-900">
                        <div className="flex flex-col">
                          <span className="text-gray-900">{employee.name}</span>
                          <span className="text-xs text-gray-500 font-mono">{employee.employeeId}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="text-gray-900">{employee.email}</span>
                          <span className="text-xs text-gray-500">{employee.phone}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="text-gray-900">{employee.position}</span>
                          <span className="text-xs text-gray-500">{employee.department}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span
                          className={cn(
                            "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
                            getStatusColor(employee.status)
                          )}
                        >
                          {employee.status === EMPLOYEE_STATUS.ACTIVE ? 'Active' : 'Inactive'}
                        </span>
                      </TableCell>
                      <TableCell className="text-gray-500">{formatDate(employee.hireDate)}</TableCell>
                      <TableCell>
                        <div className="flex items-center justify-center gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => navigate(`/employees/${employee._id}`)}
                            title="View Profile"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(employee._id)}
                          >
                            Edit
                          </Button>
                          {employee.status === EMPLOYEE_STATUS.ACTIVE && (
                            <Button
                              variant="danger"
                              size="sm"
                              onClick={() => handleDeactivate(employee._id)}
                              isLoading={isUpdatingStatus}
                              disabled={isUpdatingStatus}
                            >
                              Deactivate
                            </Button>
                          )}
                          {employee.status === EMPLOYEE_STATUS.INACTIVE && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleActivate(employee._id)}
                              isLoading={isUpdatingStatus}
                              disabled={isUpdatingStatus}
                            >
                              Activate
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};
