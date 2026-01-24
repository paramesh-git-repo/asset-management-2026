import React, { useState, useEffect } from 'react';
import { Modal } from '../../components/ui/Modal';
import { Button } from '../../components/ui/Button';
import { Checkbox } from '../../components/ui/Checkbox';
import { useAssignments } from '../../hooks/useAssignments';
import { useToast } from '../../context/ToastContext';
import { Assignment } from '../../types/assignment.types';

interface UpdateReturnedAccessoriesModalProps {
  isOpen: boolean;
  onClose: () => void;
  assignment: Assignment;
}

export const UpdateReturnedAccessoriesModal: React.FC<UpdateReturnedAccessoriesModalProps> = ({
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

  // Get issued and returned accessories (defensive reading)
  // Priority: issuedAccessories > accessories > accessoriesIssued (legacy)
  const issuedAccessories = (() => {
    if (assignment.issuedAccessories && assignment.issuedAccessories.length > 0) {
      return assignment.issuedAccessories;
    }
    if (assignment.accessories && assignment.accessories.length > 0) {
      return assignment.accessories;
    }
    if (assignment.accessoriesIssued && assignment.accessoriesIssued.length > 0) {
      const labelMap: Record<string, string> = {
        'CHARGER': 'Charger',
        'MOUSE': 'Mouse',
        'HEADPHONES': 'Headphones',
        'MONITOR': 'Monitor',
      };
      return assignment.accessoriesIssued.map((item) => labelMap[item] || item);
    }
    return [];
  })();
  const returnedAccessories = assignment.returnedAccessories || [];
  const pendingAccessories = issuedAccessories.filter((item) => !returnedAccessories.includes(item));

  const [selectedAccessories, setSelectedAccessories] = useState<string[]>([]);

  useEffect(() => {
    if (isOpen) {
      // Reset selection when modal opens
      setSelectedAccessories([]);
    }
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (selectedAccessories.length === 0) {
      showToast('Please select at least one accessory to mark as returned', 'error');
      return;
    }

    // Merge with existing returnedAccessories
    const updatedReturned = Array.from(new Set([...returnedAccessories, ...selectedAccessories]));

    updateAssignment({
      assignmentId: assignment._id,
      returnedAccessories: updatedReturned,
    });
  };

  if (pendingAccessories.length === 0) {
    return null;
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Mark Accessories as Returned" size="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2 text-sm text-gray-600">
          <p>
            <span className="font-medium">Asset:</span> {assignment.asset.name} ({assignment.asset.assetId})
          </p>
          <p>
            <span className="font-medium">Employee:</span> {assignment.employee.name}
          </p>
        </div>

        <div className="space-y-3">
          <div className="space-y-1">
            <h4 className="text-sm font-semibold text-gray-800">Pending Accessories</h4>
            <p className="text-xs text-gray-500">Select accessories that are being returned now.</p>
          </div>
          <div className="grid grid-cols-1 gap-3">
            {pendingAccessories.map((item) => (
              <label
                key={item}
                className="flex items-center gap-2 rounded-md border border-gray-100 px-3 py-2 text-sm text-gray-700"
              >
                <Checkbox
                  checked={selectedAccessories.includes(item)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedAccessories([...selectedAccessories, item]);
                    } else {
                      setSelectedAccessories(selectedAccessories.filter((a) => a !== item));
                    }
                  }}
                />
                {item}
              </label>
            ))}
          </div>
        </div>

        <div className="flex justify-end space-x-2 pt-4">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" isLoading={isUpdating} disabled={selectedAccessories.length === 0}>
            Mark as Returned
          </Button>
        </div>
      </form>
    </Modal>
  );
};
