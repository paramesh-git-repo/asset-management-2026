import React, { useEffect, useState } from 'react';
import { useEmployee, useEmployees } from '../../hooks/useEmployees';
import { useToast } from '../../context/ToastContext';
import { Modal } from '../../components/ui/Modal';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { EMPLOYEE_STATUS } from '../../utils/constants';
import { EmployeeStatus, EMPLOYEE_COMPANIES } from '../../types/employee.types';
import { employeeApi } from '../../api/employee.api';

interface EmployeeFormProps {
  employeeId?: string;
  onClose: () => void;
  onSuccess: () => void;
  isModal?: boolean;
}

export const EmployeeForm: React.FC<EmployeeFormProps> = ({
  employeeId,
  onClose,
  onSuccess,
  isModal = false,
}) => {
  const { data: employee } = useEmployee(employeeId || '');
  const { showToast } = useToast();
  const { createEmployee, updateEmployee, isCreating, isUpdating } = useEmployees({
    onSuccess: (message, type) => {
      showToast(message, type);
      onSuccess();
    },
    onError: (message) => showToast(message, 'error'),
  });

  const [formData, setFormData] = useState<{
    company: string;
    employeeId: string;
    name: string;
    email: string;
    phone: string;
    department: string;
    position: string;
    status: string;
    hireDate: string;
    exitDate: string;
  }>({
    company: '',
    employeeId: '',
    name: '',
    email: '',
    phone: '',
    department: '',
    position: '',
    status: EMPLOYEE_STATUS.ACTIVE,
    hireDate: '',
    exitDate: '',
  });

  useEffect(() => {
    if (employee) {
      setFormData({
        company: employee.company || '',
        employeeId: employee.employeeId || '',
        name: employee.name,
        email: employee.email,
        phone: employee.phone,
        department: employee.department,
        position: employee.position,
        status: employee.status === 'Relieved' ? 'Relieved' : employee.status.toUpperCase(),
        hireDate: employee.hireDate.split('T')[0],
        exitDate: employee.exitDate ? employee.exitDate.split('T')[0] : '',
      });
    }
  }, [employee]);

  useEffect(() => {
    if (!employeeId && formData.company) {
      employeeApi
        .getNextEmployeeId(formData.company)
        .then((id) => setFormData((prev) => ({ ...prev, employeeId: id })))
        .catch(() => setFormData((prev) => ({ ...prev, employeeId: '' })));
    }
  }, [employeeId, formData.company]);

  const isRelieved = formData.status === EMPLOYEE_STATUS.RELIEVED;
  const exitDateMissing = isRelieved && !formData.exitDate.trim();
  const employeeIdEmpty = !!employeeId && !formData.employeeId.trim();
  const companyMissing = !employeeId && !formData.company.trim();
  const canSave = !exitDateMissing && !employeeIdEmpty && !companyMissing;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSave) return;

    const submitData: any = {
      ...formData,
      status: formData.status as EmployeeStatus,
      hireDate: new Date(formData.hireDate).toISOString(),
    };
    if (isRelieved) {
      submitData.exitDate = new Date(formData.exitDate).toISOString();
    } else {
      submitData.exitDate = null;
    }
    if (employeeId) {
      submitData.employeeId = formData.employeeId.trim();
      if (formData.company) submitData.company = formData.company as 'V-Accel' | 'Axess Technology';
    } else {
      submitData.company = formData.company as 'V-Accel' | 'Axess Technology';
      submitData.employeeId = formData.employeeId.trim() || undefined;
    }

    if (employeeId) {
      updateEmployee({ id: employeeId, data: submitData });
    } else {
      createEmployee(submitData);
    }
  };

  const formContent = (
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              Company <span className="text-red-500">*</span>
            </label>
            <Select
              options={[
                { value: '', label: 'Select company...' },
                ...EMPLOYEE_COMPANIES.map((c) => ({ value: c, label: c })),
              ]}
              value={formData.company}
              onChange={(e) => setFormData({ ...formData, company: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              Employee ID
            </label>
            {employeeId ? (
              <>
                <Input
                  value={formData.employeeId}
                  onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
                  required
                  placeholder="e.g. VA1000 or AT1000"
                  className="font-mono"
                />
                <p className="text-xs text-gray-500">Employee ID must be unique.</p>
              </>
            ) : (
              <>
                <Input
                  value={formData.employeeId}
                  onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
                  placeholder="Select company to generate"
                  className="font-mono"
                />
                <p className="text-xs text-gray-500">Auto-generated from company; you may override.</p>
              </>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              Name
            </label>
            <Input
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              placeholder="Full Name"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              Email
            </label>
            <Input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
              disabled={!!employeeId}
              placeholder="Email Address"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              Phone
            </label>
            <Input
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              required
              placeholder="Phone Number"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              Department
            </label>
            <Input
              value={formData.department}
              onChange={(e) => setFormData({ ...formData, department: e.target.value })}
              required
              placeholder="Department"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              Position
            </label>
            <Input
              value={formData.position}
              onChange={(e) => setFormData({ ...formData, position: e.target.value })}
              required
              placeholder="Job Title"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              Hire Date
            </label>
            <Input
              type="date"
              value={formData.hireDate}
              onChange={(e) => setFormData({ ...formData, hireDate: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              Status
            </label>
            <Select
              options={[
                { value: EMPLOYEE_STATUS.ACTIVE, label: 'Active' },
                { value: EMPLOYEE_STATUS.INACTIVE, label: 'Inactive' },
                { value: EMPLOYEE_STATUS.RELIEVED, label: 'Relieved' },
              ]}
              value={formData.status}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  status: e.target.value,
                  exitDate: e.target.value === EMPLOYEE_STATUS.RELIEVED ? formData.exitDate : '',
                })
              }
            />
          </div>
          {isRelieved && (
            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                Exit Date <span className="text-red-500">*</span>
              </label>
              <Input
                type="date"
                value={formData.exitDate}
                onChange={(e) => setFormData({ ...formData, exitDate: e.target.value })}
                required={isRelieved}
              />
            </div>
          )}
        </div>

        <div className="flex justify-end space-x-2 pt-4">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" isLoading={isCreating || isUpdating} disabled={!canSave}>
            {employeeId ? 'Update' : 'Create'}
          </Button>
        </div>
      </form>
  );

  if (isModal) {
    return (
      <Modal
        isOpen={true}
        onClose={onClose}
        title={employeeId ? 'Edit Employee' : 'Add Employee'}
        size="lg"
      >
        {formContent}
      </Modal>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-2xl font-bold">{employeeId ? 'Edit Employee' : 'Add Employee'}</div>
      {formContent}
    </div>
  );
};
