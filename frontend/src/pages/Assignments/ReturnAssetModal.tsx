import React, { useState } from 'react';
import { Modal } from '../../components/ui/Modal';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Checkbox } from '../../components/ui/Checkbox';
import { useAssignments } from '../../hooks/useAssignments';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';
import { Assignment } from '../../types/assignment.types';

interface ReturnAssetModalProps {
  isOpen: boolean;
  onClose: () => void;
  assignment: Assignment;
}

export const ReturnAssetModal: React.FC<ReturnAssetModalProps> = ({
  isOpen,
  onClose,
  assignment,
}) => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const { returnAssignment, isReturning } = useAssignments({
    onSuccess: (message, type) => {
      showToast(message, type);
      onClose();
    },
    onError: (message) => showToast(message, 'error'),
  });

  const [returnDate, setReturnDate] = useState(new Date().toISOString().split('T')[0]);
  const [handoverBy, setHandoverBy] = useState('Employee');
  const [handoverPersonName, setHandoverPersonName] = useState('');
  const [condition, setCondition] = useState<'GOOD' | 'DAMAGED'>('GOOD');
  const [returnedAccessories, setReturnedAccessories] = useState<string[]>([]);
  const [notes, setNotes] = useState('');

  // Get issued accessories from assignment (defensive reading)
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (handoverBy !== 'Employee' && !handoverPersonName.trim()) {
      showToast('Please enter the handover person name', 'error');
      return;
    }

    const remarksParts = [
      `Handover by: ${handoverBy}`,
      handoverBy !== 'Employee' && handoverPersonName.trim()
        ? `Handover person: ${handoverPersonName.trim()}`
        : null,
      `Return date: ${returnDate}`,
      `Accessories returned: ${returnedAccessories.length ? returnedAccessories.join(', ') : 'None'}`,
      user?.email ? `Verified by: ${user.email}` : null,
      notes.trim() ? `Notes: ${notes.trim()}` : null,
    ].filter(Boolean);

    returnAssignment({
      assignmentId: assignment._id,
      condition,
      remarks: remarksParts.join('\n'),
      returnedAccessories: returnedAccessories.length > 0 ? returnedAccessories : undefined,
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Return Asset"
      size="xl"
    >
      <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-x-5 gap-y-4">
        <div className="col-span-2 space-y-2 text-sm text-gray-600">
          <p>
            <span className="font-medium">Asset:</span> {assignment.asset.name} ({assignment.asset.assetId})
          </p>
          <p>
            <span className="font-medium">Employee:</span> {assignment.employee.name}
          </p>
          <p>
            <span className="font-medium">Assigned Date:</span>{' '}
            {new Date(assignment.assignedDate).toLocaleDateString()}
          </p>
        </div>

        <div className="col-span-2 space-y-1 pt-2">
          <h4 className="text-sm font-semibold text-gray-800">Handover Details</h4>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium leading-none">Handover By</label>
          <Select
            value={handoverBy}
            onChange={(e) => setHandoverBy(e.target.value)}
            options={[
              { value: 'Employee', label: 'Employee (Self)' },
              { value: 'Representative', label: 'Representative' },
              { value: 'Courier', label: 'Courier / Other' },
            ]}
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium leading-none">
            Handover Person Name {handoverBy === 'Employee' ? '(Optional)' : '(Required)'}
          </label>
          <Input
            value={handoverPersonName}
            onChange={(e) => setHandoverPersonName(e.target.value)}
            placeholder={handoverBy === 'Employee' ? 'Optional' : 'Enter handover person name'}
            required={handoverBy !== 'Employee'}
          />
        </div>

        <div className="col-span-2 space-y-1 pt-2">
          <h4 className="text-sm font-semibold text-gray-800">Asset Condition</h4>
        </div>
        <div className="col-span-2 space-y-2">
          <label className="text-sm font-medium leading-none">Asset Condition</label>
          <Select
            value={condition}
            onChange={(e) => setCondition(e.target.value as 'GOOD' | 'DAMAGED')}
            options={[
              { value: 'GOOD', label: 'Good' },
              { value: 'DAMAGED', label: 'Damaged' },
            ]}
          />
        </div>

        <div className="col-span-2 space-y-1 pt-2">
          <h4 className="text-sm font-semibold text-gray-800">Accessories Issued</h4>
          {issuedAccessories.length === 0 ? (
            <p className="text-sm text-gray-500">No accessories were issued with this asset.</p>
          ) : (
            <p className="text-xs text-gray-500">Select which accessories are being returned.</p>
          )}
        </div>
        {issuedAccessories.length > 0 && (
          <div className="col-span-2 grid grid-cols-2 gap-3">
            {issuedAccessories.map((item) => {
              const isChecked = returnedAccessories.includes(item);
              return (
                <label
                  key={item}
                  className={`
                    flex items-center gap-3 rounded-lg border-2 px-4 py-3 text-sm font-medium text-gray-700
                    cursor-pointer transition-all duration-200
                    ${isChecked 
                      ? 'border-primary-500 bg-primary-50 text-primary-700 shadow-sm' 
                      : 'border-gray-200 bg-white text-gray-700 hover:border-primary-300 hover:bg-gray-50 hover:shadow-md'
                    }
                  `}
                >
                  <Checkbox
                    checked={isChecked}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setReturnedAccessories([...returnedAccessories, item]);
                      } else {
                        setReturnedAccessories(returnedAccessories.filter((a) => a !== item));
                      }
                    }}
                  />
                  <span className="flex-1 select-none">{item}</span>
                </label>
              );
            })}
          </div>
        )}

        <div className="col-span-2 space-y-1 pt-2">
          <h4 className="text-sm font-semibold text-gray-800">Verification</h4>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium leading-none">Verified By</label>
          <Input value={user?.email || '—'} readOnly className="bg-gray-50 cursor-not-allowed" />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium leading-none">Return Date</label>
          <Input
            type="date"
            value={returnDate}
            onChange={(e) => setReturnDate(e.target.value)}
            required
          />
        </div>

        <div className="col-span-2 space-y-1 pt-2">
          <h4 className="text-sm font-semibold text-gray-800">Notes</h4>
        </div>
        <div className="col-span-2 space-y-2">
          <label className="text-sm font-medium leading-none">Notes (Optional)</label>
          <Input
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Any comments about the return..."
          />
        </div>

        <div className="col-span-2 flex justify-end space-x-2 pt-4">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" isLoading={isReturning}>
            Confirm Return
          </Button>
        </div>
      </form>
    </Modal>
  );
};
