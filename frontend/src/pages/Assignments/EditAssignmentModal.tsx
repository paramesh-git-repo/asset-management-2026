import React, { useState } from 'react';
import { Modal } from '../../components/ui/Modal';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Checkbox } from '../../components/ui/Checkbox';
import { useAssignments } from '../../hooks/useAssignments';
import { useToast } from '../../context/ToastContext';
import { Assignment } from '../../types/assignment.types';

interface EditAssignmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  assignment: Assignment;
}

const accessoryOptions = [
  { label: 'Charger', value: 'Charger' },
  { label: 'Mouse', value: 'Mouse' },
  { label: 'Headphones', value: 'Headphones' },
  { label: 'Monitor', value: 'Monitor' },
];

export const EditAssignmentModal: React.FC<EditAssignmentModalProps> = ({
  isOpen,
  onClose,
  assignment,
}) => {
  const { showToast } = useToast();
  const { updateAssignment, isUpdating } = useAssignments({
    onSuccess: (message, type) => {
      showToast(message, type);
      onClose();
    },
    onError: (message) => showToast(message, 'error'),
  });

  const [dueDate, setDueDate] = useState(
    assignment.dueDate ? assignment.dueDate.split('T')[0] : ''
  );
  const [notes, setNotes] = useState(assignment.notes || '');
  const [condition, setCondition] = useState<'GOOD' | 'DAMAGED' | ''>(
    assignment.condition || ''
  );
  const [accessories, setAccessories] = useState<string[]>(
    assignment.accessories || assignment.accessoriesIssued || []
  );

  const assignedAtDisplay = new Date(assignment.assignedAt || assignment.assignedDate).toLocaleString();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    updateAssignment({
      assignmentId: assignment._id,
      dueDate: dueDate ? new Date(dueDate).toISOString() : undefined,
      notes,
      accessories,
      condition: condition || undefined,
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit Assignment" size="lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm font-medium leading-none">Asset</label>
            <Input
              value={`${assignment.asset.name} (${assignment.asset.assetId})`}
              readOnly
              className="bg-gray-50 cursor-not-allowed"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium leading-none">Assigned To</label>
            <Input
              value={assignment.employee.name}
              readOnly
              className="bg-gray-50 cursor-not-allowed"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium leading-none">Assigned Date</label>
            <Input value={assignedAtDisplay} readOnly className="bg-gray-50 cursor-not-allowed" />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium leading-none">Due Date</label>
            <Input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
            />
          </div>

          <div className="space-y-2 md:col-span-2">
            <label className="text-sm font-medium leading-none">Accessories Issued</label>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {accessoryOptions.map((item) => (
                <label
                  key={item.value}
                  className="flex items-center gap-2 rounded-md border border-gray-100 px-3 py-2 text-sm text-gray-700"
                >
                  <Checkbox
                    checked={accessories.includes(item.value)}
                    onChange={(e) => {
                      const next = e.target.checked
                        ? [...accessories, item.value]
                        : accessories.filter((entry) => entry !== item.value);
                      setAccessories(next);
                    }}
                  />
                  {item.label}
                </label>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium leading-none">Asset Condition</label>
            <Select
              value={condition}
              onChange={(e) => setCondition(e.target.value as 'GOOD' | 'DAMAGED' | '')}
              options={[
                { value: '', label: 'Select condition (optional)' },
                { value: 'GOOD', label: 'Good' },
                { value: 'DAMAGED', label: 'Damaged' },
              ]}
            />
          </div>

          <div className="space-y-2 md:col-span-2">
            <label className="text-sm font-medium leading-none">Notes (Optional)</label>
            <Input
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add notes"
            />
          </div>
        </div>

        <div className="flex justify-end space-x-2 pt-4">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" isLoading={isUpdating} disabled={isUpdating}>
            Save Changes
          </Button>
        </div>
      </form>
    </Modal>
  );
};
