import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useEmployees } from '../../hooks/useEmployees';
import { useToast } from '../../context/ToastContext';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/Table';
import { formatDate, getStatusColor } from '../../utils/helpers';
import { EmployeeForm } from './EmployeeForm';
import { EMPLOYEE_STATUS } from '../../utils/constants';
import { Plus, Search, Eye } from 'lucide-react';
import { cn } from '../../utils/cn';
import { Modal } from '../../components/ui/Modal';

type EmployeeTab = 'active' | 'relieved';

export const EmployeeList: React.FC = () => {
  const [showForm, setShowForm] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<string | null>(null);
  const [showDeactivateModal, setShowDeactivateModal] = useState(false);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<EmployeeTab>('active');
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

  const { employees, isLoading, updateEmployeeStatus, deactivateEmployee, isUpdatingStatus, isDeactivating } = useEmployees({
    onSuccess: (message, type) => {
      showToast(message, type);
      setShowDeactivateModal(false);
      setSelectedEmployeeId(null);
    },
    onError: (message) => showToast(message, 'error'),
  });

  const activeEmployees = useMemo(
    () => employees.filter((e) => e.status === EMPLOYEE_STATUS.ACTIVE),
    [employees]
  );
  const relievedEmployees = useMemo(
    () =>
      employees.filter(
        (e) => e.status === EMPLOYEE_STATUS.RELIEVED || e.status === EMPLOYEE_STATUS.INACTIVE
      ),
    [employees]
  );

  const tabEmployees = activeTab === 'active' ? activeEmployees : relievedEmployees;
  const filteredEmployees = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return tabEmployees;
    return tabEmployees.filter(
      (employee) =>
        employee.name.toLowerCase().includes(term) ||
        employee.email.toLowerCase().includes(term) ||
        (employee.employeeId || '').toLowerCase().includes(term)
    );
  }, [tabEmployees, searchTerm]);

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
    deactivateEmployee(selectedEmployeeId);
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
                  isLoading={isDeactivating}
                  disabled={isDeactivating}
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
          <div className="inline-flex rounded-full bg-gray-100 p-1">
            <button
              type="button"
              onClick={() => setActiveTab('active')}
              className={cn(
                'flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors',
                activeTab === 'active'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              )}
            >
              Active Employees
              <span className="inline-flex min-w-[24px] items-center justify-center rounded-full bg-gray-200 px-2 py-0.5 text-xs font-semibold text-gray-700">
                {activeEmployees.length}
              </span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('relieved')}
              className={cn(
                'flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors',
                activeTab === 'relieved'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              )}
            >
              Relieved Employees
              <span className="inline-flex min-w-[24px] items-center justify-center rounded-full bg-gray-200 px-2 py-0.5 text-xs font-semibold text-gray-700">
                {relievedEmployees.length}
              </span>
            </button>
          </div>

          <div className="relative max-w-md">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search employees..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>

          {isLoading ? (
            <div className="flex h-64 items-center justify-center text-gray-500">
              <div className="animate-pulse">Loading employees...</div>
            </div>
          ) : filteredEmployees.length === 0 ? (
            <div className="flex bg-gray-50 rounded-lg h-64 flex-col items-center justify-center text-gray-500 border border-dashed border-gray-300">
              <p>
                {activeTab === 'active'
                  ? 'No active employees found'
                  : 'No relieved employees found'}
              </p>
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
                          {employee.employeeId && (
                            <span className="text-xs text-gray-500">{employee.employeeId}</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="text-gray-900">{employee.email}</span>
                          {employee.phone && (
                            <span className="text-xs text-gray-500">{employee.phone}</span>
                          )}
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
                            'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
                            getStatusColor(employee.status)
                          )}
                        >
                          {employee.status === EMPLOYEE_STATUS.ACTIVE
                            ? 'Active'
                            : employee.status === EMPLOYEE_STATUS.RELIEVED
                              ? 'Relieved'
                              : 'Inactive'}
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
                          {activeTab === 'active' ? (
                            <>
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
                                  isLoading={isDeactivating}
                                  disabled={isDeactivating || (employee.activeAssetCount ?? 0) > 0}
                                  title={(employee.activeAssetCount ?? 0) > 0 ? 'Cannot deactivate employee with active assets' : undefined}
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
                            </>
                          ) : (
                            <Button variant="ghost" size="sm" disabled title="Edit not available for relieved employees">
                              Edit
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
