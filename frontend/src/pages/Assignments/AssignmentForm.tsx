import React, { useState } from 'react';
import { useAssignments } from '../../hooks/useAssignments';
import { useToast } from '../../context/ToastContext';
import { Modal } from '../../components/ui/Modal';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Checkbox } from '../../components/ui/Checkbox';
import { AsyncPaginatedSelect, IdLabelOption } from '../../components/ui/AsyncPaginatedSelect';
import { assetApi } from '../../api/asset.api';
import { employeeApi } from '../../api/employee.api';

interface AssignmentFormProps {
  onClose: () => void;
  onSuccess: () => void;
}

export const AssignmentForm: React.FC<AssignmentFormProps> = ({
  onClose,
  onSuccess,
}) => {
  const { showToast } = useToast();

  const { createAssignment, isCreating } = useAssignments({
    onSuccess: (message, type) => {
      showToast(message, type);
      onSuccess();
    },
    onError: (message) => showToast(message, 'error'),
  });

  const [formData, setFormData] = useState({
    asset: null as IdLabelOption | null,
    employee: null as IdLabelOption | null,
    assignedDate: new Date().toISOString().split('T')[0],
    notes: '',
    accessories: [] as string[],
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.asset) {
      showToast('Please select an asset', 'error');
      return;
    }
    if (!formData.employee) {
      showToast('Please select an employee', 'error');
      return;
    }

    const submitData = {
      assetId: formData.asset.id,
      employeeId: formData.employee.id,
      assignedDate: new Date(formData.assignedDate).toISOString(),
      notes: formData.notes,
      accessories: formData.accessories.length
        ? formData.accessories
        : undefined,
    };

    createAssignment(submitData);
  };

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title="Assign Asset"
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <AsyncPaginatedSelect
            label="Asset"
            placeholder="Select an asset"
            searchPlaceholder="Search assets by name, ID, serial…"
            value={formData.asset}
            onChange={(asset) => setFormData({ ...formData, asset })}
            disabled={isCreating}
            pageSize={10}
            debounceMs={300}
            fetchPage={async ({ search, page, limit }) => {
              const res = await assetApi.searchAssets({
                status: 'Available',
                search,
                page,
                limit,
              });
              return {
                items: res.assets.map((a) => ({
                  id: a._id,
                  label: `${a.name} (${a.assetId})`,
                })),
                hasMore: res.pagination.hasMore,
              };
            }}
          />

          <div className="space-y-1">
            <AsyncPaginatedSelect
              label="Employee"
              placeholder="Select an employee"
              searchPlaceholder="Search employees by name, email, dept…"
              value={formData.employee}
              onChange={(employee) => setFormData({ ...formData, employee })}
              disabled={isCreating}
              pageSize={10}
              debounceMs={300}
              fetchPage={async ({ search, page, limit }) => {
                const res = await employeeApi.searchEmployees({
                  status: 'ACTIVE',
                  search,
                  page,
                  limit,
                });
                return {
                  items: res.employees.map((e) => ({
                    id: e._id,
                    label: `${e.name} (${e.employeeId})`,
                  })),
                  hasMore: res.pagination.hasMore,
                };
              }}
            />
            <p className="text-xs text-gray-500">Relieved employees cannot be assigned assets.</p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              Assigned Date
            </label>
            <Input
              type="date"
              value={formData.assignedDate}
              onChange={(e) => setFormData({ ...formData, assignedDate: e.target.value })}
              required
            />
          </div>

          <div className="space-y-3 md:col-span-2">
            <div className="space-y-1">
              <h4 className="text-sm font-semibold text-gray-800">Accessories Issued</h4>
              <p className="text-xs text-gray-500">Select any accessories issued with this asset.</p>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {[
                { label: 'Charger', value: 'Charger' },
                { label: 'Mouse', value: 'Mouse' },
                { label: 'Headphones', value: 'Headphones' },
                { label: 'Monitor', value: 'Monitor' },
              ].map((item) => (
                <label
                  key={item.value}
                  className="flex items-center gap-2 rounded-md border border-gray-100 px-3 py-2 text-sm text-gray-700"
                >
                  <Checkbox
                    checked={formData.accessories.includes(item.value)}
                    onChange={(e) => {
                      const next = e.target.checked
                        ? [...formData.accessories, item.value]
                        : formData.accessories.filter((entry) => entry !== item.value);
                      setFormData({ ...formData, accessories: next });
                    }}
                  />
                  {item.label}
                </label>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              Notes (Optional)
            </label>
            <Input
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Any comments..."
            />
          </div>
        </div>

        <div className="flex justify-end space-x-2 pt-4">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" isLoading={isCreating}>
            Assign
          </Button>
        </div>
      </form>
    </Modal>
  );
};
