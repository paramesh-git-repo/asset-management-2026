import React, { useEffect, useMemo, useState } from 'react';
import { useAssignments } from '../../hooks/useAssignments';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { ScrollArea } from '../../components/ui/ScrollArea';
import { formatDateTime } from '../../utils/helpers';
import { AssignmentForm } from './AssignmentForm';
import { ReturnAssetModal } from './ReturnAssetModal';
import { EditAssignmentModal } from './EditAssignmentModal';
import { UpdateReturnedAccessoriesModal } from './UpdateReturnedAccessoriesModal';
import { Plus, Search, RotateCcw, Pencil } from 'lucide-react';
import { Assignment } from '../../types/assignment.types';

export const AssignmentList: React.FC = () => {
  const [showForm, setShowForm] = useState(false);
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedEditAssignment, setSelectedEditAssignment] = useState<Assignment | null>(null);
  const [showUpdateAccessoriesModal, setShowUpdateAccessoriesModal] = useState(false);
  const [selectedUpdateAccessoriesAssignment, setSelectedUpdateAccessoriesAssignment] = useState<Assignment | null>(null);
  const [activeTab, setActiveTab] = useState<'active' | 'returned'>('active');
  const [searchTerm, setSearchTerm] = useState('');
  const [scrollPositions, setScrollPositions] = useState({ active: 0, returned: 0 });

  const { assignments, isLoading } = useAssignments();

  const filteredAssignments = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return assignments;

    return assignments.filter((assignment) => {
      const haystack = [
        assignment.asset.name,
        assignment.asset.assetId,
        assignment.employee.name,
        (assignment.employee as any).employeeId,
        assignment.employee.email,
        assignment.employee.department,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      return haystack.includes(term);
    });
  }, [assignments, searchTerm]);

  const activeAssignments = useMemo(
    () =>
      filteredAssignments.filter(
        (assignment) =>
          !assignment.returnedAt &&
          !assignment.returnDate &&
          assignment.status !== 'Returned'
      ),
    [filteredAssignments]
  );

  const returnedAssignments = useMemo(() => {
    const returned = filteredAssignments.filter(
      (assignment) =>
        assignment.returnedAt ||
        assignment.returnDate ||
        assignment.status === 'Returned'
    );
    const byAsset = new Map<string, Assignment>();
    returned.forEach((assignment) => {
      const key = assignment.asset.assetId;
      const existing = byAsset.get(key);
      const currentReturnedAt = new Date(assignment.returnedAt || assignment.returnDate || 0).getTime();
      const existingReturnedAt = existing
        ? new Date(existing.returnedAt || existing.returnDate || 0).getTime()
        : 0;
      if (!existing || currentReturnedAt > existingReturnedAt) {
        byAsset.set(key, assignment);
      }
    });
    return Array.from(byAsset.values());
  }, [filteredAssignments]);

  useEffect(() => {
    const targetId =
      activeTab === 'active'
        ? 'assignments-active-scroll'
        : 'assignments-returned-scroll';
    const target = document.getElementById(targetId);
    if (target) {
      target.scrollTop =
        activeTab === 'active' ? scrollPositions.active : scrollPositions.returned;
    }
  }, [activeTab, scrollPositions]);

  const handleReturn = (assignment: Assignment) => {
    setSelectedAssignment(assignment);
    setShowReturnModal(true);
  };

  const handleEdit = (assignment: Assignment) => {
    setSelectedEditAssignment(assignment);
    setShowEditModal(true);
  };

  const handleCloseReturnModal = () => {
    setShowReturnModal(false);
    setSelectedAssignment(null);
  };

  const handleCloseEditModal = () => {
    setShowEditModal(false);
    setSelectedEditAssignment(null);
  };

  const handleUpdateAccessories = (assignment: Assignment) => {
    setSelectedUpdateAccessoriesAssignment(assignment);
    setShowUpdateAccessoriesModal(true);
  };

  const getIssuedAccessories = (assignment: Assignment): string[] => {
    // Priority: issuedAccessories > accessories > accessoriesIssued (legacy)
    if (assignment.issuedAccessories && assignment.issuedAccessories.length > 0) {
      return assignment.issuedAccessories;
    }
    if (assignment.accessories && assignment.accessories.length > 0) {
      return assignment.accessories;
    }
    if (assignment.accessoriesIssued && assignment.accessoriesIssued.length > 0) {
      const labelMap: Record<string, string> = {
        CHARGER: 'Charger',
        MOUSE: 'Mouse',
        HEADPHONES: 'Headphones',
        MONITOR: 'Monitor',
      };
      return assignment.accessoriesIssued.map((item) => labelMap[item] || item);
    }
    return [];
  };

  const getReturnedAccessories = (assignment: Assignment): string[] => {
    return assignment.returnedAccessories || [];
  };

  const getAccessoryBadgeClass = (item: string) => {
    const key = item.toLowerCase();
    if (key.includes('charger')) return 'bg-blue-50 text-blue-700';
    if (key.includes('mouse')) return 'bg-orange-50 text-orange-700';
    if (key.includes('headphones')) return 'bg-purple-50 text-purple-700';
    if (key.includes('monitor')) return 'bg-amber-50 text-amber-700';
    return 'bg-gray-100 text-gray-700';
  };

  const getDateTimeParts = (value?: string) => {
    if (!value) return { date: '-', time: '' };
    const dateObj = new Date(value);
    if (Number.isNaN(dateObj.getTime())) return { date: '-', time: '' };
    return {
      date: dateObj.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }),
      time: dateObj.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
    };
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Assignments</h1>
            <p className="text-sm text-gray-500">Manage and track asset allocations</p>
          </div>
          <Button onClick={() => setShowForm(true)} className="w-full sm:w-auto">
            <Plus className="mr-2 h-4 w-4" />
            Assign Asset
          </Button>
        </div>
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
          <input
            className="flex h-11 w-full rounded-md border border-gray-300 bg-white px-3 pl-9 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
            placeholder="Search by asset or employee..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {showForm && (
        <AssignmentForm
          onClose={() => setShowForm(false)}
          onSuccess={() => setShowForm(false)}
        />
      )}

      {showReturnModal && selectedAssignment && (
        <ReturnAssetModal
          isOpen={showReturnModal}
          onClose={handleCloseReturnModal}
          assignment={selectedAssignment}
        />
      )}

      {showEditModal && selectedEditAssignment && (
        <EditAssignmentModal
          isOpen={showEditModal}
          onClose={handleCloseEditModal}
          assignment={selectedEditAssignment}
        />
      )}

      {showUpdateAccessoriesModal && selectedUpdateAccessoriesAssignment && (
        <UpdateReturnedAccessoriesModal
          isOpen={showUpdateAccessoriesModal}
          onClose={() => {
            setShowUpdateAccessoriesModal(false);
            setSelectedUpdateAccessoriesAssignment(null);
          }}
          assignment={selectedUpdateAccessoriesAssignment}
        />
      )}

      <Card className="border-none shadow-md ring-1 ring-gray-200">
        <div className="space-y-4">
          <div className="inline-flex rounded-full bg-gray-100 p-1">
            <button
              type="button"
              onClick={() => setActiveTab('active')}
              className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                activeTab === 'active'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Active Assignments
              <span className="inline-flex min-w-[24px] items-center justify-center rounded-full bg-gray-200 px-2 py-0.5 text-xs font-semibold text-gray-700">
                {activeAssignments.length}
              </span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('returned')}
              className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                activeTab === 'returned'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Returned Assets
              <span className="inline-flex min-w-[24px] items-center justify-center rounded-full bg-gray-200 px-2 py-0.5 text-xs font-semibold text-gray-700">
                {returnedAssignments.length}
              </span>
            </button>
          </div>

          {isLoading ? (
            <div className="flex h-64 items-center justify-center text-gray-500">
              <div className="animate-pulse">Loading assignments...</div>
            </div>
          ) : activeTab === 'active' ? (
            <div className="rounded-md border border-gray-200">
              <div className="grid grid-cols-[2.0fr_1.2fr_2fr_1.3fr_1.2fr_1.2fr_1.8fr_0.9fr_1.1fr] gap-4 border-b border-gray-200 bg-gray-50 px-2 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500 text-center">
                <div>Asset</div>
                <div>Category</div>
                <div>Assigned To</div>
                <div>Department</div>
                <div>Assigned Date</div>
                <div>Due Date</div>
                <div>Accessories</div>
                <div>Status</div>
                <div>Actions</div>
              </div>
              {activeAssignments.length === 0 ? (
                <div className="flex h-48 items-center justify-center text-sm text-gray-500">
                  No active assignments found.
                </div>
              ) : (
                <ScrollArea
                  id="assignments-active-scroll"
                  className="max-h-[520px]"
                  onScroll={(e) =>
                    setScrollPositions((prev) => ({
                      ...prev,
                      active: (e.currentTarget as HTMLDivElement).scrollTop,
                    }))
                  }
                >
                  <div className="min-w-[1000px] divide-y divide-gray-100">
                    {activeAssignments.map((assignment) => (
                      <div
                        key={assignment._id}
                        className="grid items-center grid-cols-[2.0fr_1.2fr_2fr_1.3fr_1.2fr_1.2fr_1.4fr_0.9fr_1.1fr] gap-4 px-2 py-4 text-sm text-gray-700 text-center"
                      >
                        <div className="flex h-full flex-col items-center justify-center gap-1 text-center">
                          <span className="max-w-[200px] truncate font-medium text-gray-900">
                            {assignment.asset.name}
                          </span>
                          <span className="max-w-[200px] truncate text-xs text-gray-500">
                            {assignment.asset.assetId}
                          </span>
                        </div>
                        <div className="flex h-full items-center justify-center text-center">
                          <span className="text-gray-600">
                            {assignment.asset.category ? assignment.asset.category : '—'}
                          </span>
                        </div>
                        <div className="flex h-full flex-col items-center justify-center gap-1 text-center">
                          <span className="max-w-[200px] truncate font-medium text-gray-900">
                            {assignment.employee.name}
                          </span>
                          <span className="max-w-[220px] truncate text-xs text-gray-500">
                            {((assignment.employee as any).employeeId ? `${(assignment.employee as any).employeeId} • ` : '') + assignment.employee.email}
                          </span>
                        </div>
                        <div className="flex h-full flex-col items-center justify-center gap-1 text-center">
                          <span className="text-gray-600">{assignment.employee.department}</span>
                        </div>
                        <div className="flex h-full flex-col items-center justify-center gap-1 text-center">
                          {(() => {
                            const { date, time } = getDateTimeParts(assignment.assignedAt || assignment.assignedDate);
                            return (
                              <>
                                <span className="text-sm font-medium text-gray-900">{date}</span>
                                <span className="text-xs text-gray-500">{time}</span>
                              </>
                            );
                          })()}
                        </div>
                        <div className="flex h-full flex-col items-center justify-center gap-1 text-center">
                          <span className="text-gray-600">
                            {assignment.dueDate ? formatDateTime(assignment.dueDate) : '-'}
                          </span>
                        </div>
                        <div className="flex h-full flex-col items-center justify-center gap-1 text-center">
                          {(() => {
                            // Active Assignments: Show ONLY issued accessories
                            const issued = getIssuedAccessories(assignment);
                            
                            if (issued.length === 0) {
                              return <span className="text-gray-400">—</span>;
                            }
                            
                            return (
                              <div className="flex flex-col items-center gap-1">
                                {issued.map((item) => (
                                  <span
                                    key={item}
                                    className={`min-w-[72px] rounded px-2 py-0.5 text-xs ${getAccessoryBadgeClass(
                                      item
                                    )}`}
                                  >
                                    {item}
                                  </span>
                                ))}
                              </div>
                            );
                          })()}
                        </div>
                        <div className="flex h-full flex-col items-center justify-center gap-1 text-center">
                          <div className="flex justify-center">
                            <span className="inline-flex items-center rounded-full bg-green-50 px-2.5 py-1 text-xs font-medium text-green-700">
                              Active
                            </span>
                          </div>
                        </div>
                        <div className="flex h-full flex-col items-center justify-center gap-1 text-center">
                          {assignment.status === 'Active' && (
                            <div className="flex items-center justify-center gap-3">
                              <button
                                type="button"
                                onClick={() => handleEdit(assignment)}
                                title="Edit assignment"
                                className="rounded-md border border-gray-300 p-2 text-gray-600 hover:bg-gray-100 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                              >
                                <Pencil size={16} />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleReturn(assignment)}
                                title="Return asset"
                                className="rounded-md border border-gray-300 p-2 text-gray-600 hover:bg-gray-100 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                              >
                                <RotateCcw size={16} />
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </div>
          ) : (
            <div className="rounded-md border border-gray-200">
              <div className="grid grid-cols-[2.0fr_1.2fr_2fr_1.3fr_1.2fr_1.2fr_1.8fr_0.9fr_1.1fr_1.1fr] gap-4 border-b border-gray-200 bg-gray-50 px-2 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500 text-center">
                <div>Asset</div>
                <div>Category</div>
                <div>Assigned To</div>
                <div>Department</div>
                <div>Assigned Date</div>
                <div>Returned Date</div>
                <div>Accessories</div>
                <div>Condition</div>
                <div>Status</div>
                <div>Actions</div>
              </div>
              {returnedAssignments.length === 0 ? (
                <div className="flex h-48 items-center justify-center text-sm text-gray-500">
                  No returned assets found.
                </div>
              ) : (
                <ScrollArea
                  id="assignments-returned-scroll"
                  className="max-h-[520px]"
                  onScroll={(e) =>
                    setScrollPositions((prev) => ({
                      ...prev,
                      returned: (e.currentTarget as HTMLDivElement).scrollTop,
                    }))
                  }
                >
                  <div className="min-w-[1000px] divide-y divide-gray-100">
                    {returnedAssignments.map((assignment) => {
                      const returnedDate = assignment.returnedAt ?? assignment.returnDate;
                      const conditionLabel =
                        assignment.condition === 'GOOD'
                          ? 'Good'
                          : assignment.condition === 'DAMAGED'
                          ? 'Damaged'
                          : '-';

                      return (
                        <div
                          key={assignment._id}
                          className="grid items-center grid-cols-[2.0fr_1.2fr_2fr_1.3fr_1.2fr_1.2fr_1.8fr_0.9fr_1.1fr_1.1fr] gap-4 px-2 py-4 text-sm text-gray-700 text-center"
                        >
                          <div className="flex h-full flex-col items-center justify-center gap-1 text-center">
                            <span className="max-w-[200px] truncate font-medium text-gray-900">
                              {assignment.asset.name}
                            </span>
                            <span className="max-w-[200px] truncate text-xs text-gray-500">
                              {assignment.asset.assetId}
                            </span>
                          </div>
                          <div className="flex h-full items-center justify-center text-center">
                            <span className="text-gray-600">
                              {assignment.asset.category ? assignment.asset.category : '—'}
                            </span>
                          </div>
                          <div className="flex h-full flex-col items-center justify-center gap-1 text-center">
                            <span className="max-w-[200px] truncate font-medium text-gray-900">
                              {assignment.employee.name}
                            </span>
                            <span className="max-w-[200px] truncate text-xs text-gray-500">
                              {((assignment.employee as any).employeeId ? `${(assignment.employee as any).employeeId} • ` : '') + assignment.employee.email}
                            </span>
                          </div>
                          <div className="flex h-full flex-col items-center justify-center gap-1 text-center">
                            <span className="text-gray-600">{assignment.employee.department}</span>
                          </div>
                          <div className="flex h-full flex-col items-center justify-center gap-1 text-center">
                            {(() => {
                              const { date, time } = getDateTimeParts(assignment.assignedAt || assignment.assignedDate);
                              return (
                                <>
                                  <span className="text-sm font-medium text-gray-900">{date}</span>
                                  <span className="text-xs text-gray-500">{time}</span>
                                </>
                              );
                            })()}
                          </div>
                          <div className="flex h-full flex-col items-center justify-center gap-1 text-center">
                            {(() => {
                              const { date, time } = getDateTimeParts(returnedDate || undefined);
                              return (
                                <>
                                  <span className="text-sm font-medium text-gray-900">{date}</span>
                                  <span className="text-xs text-gray-500">{time}</span>
                                </>
                              );
                            })()}
                          </div>
                          <div className="flex h-full flex-col items-center justify-center gap-1 text-center">
                            {(() => {
                              // Returned Assets: Show returned accessories + compute pending
                              const issued = getIssuedAccessories(assignment);
                              const returned = getReturnedAccessories(assignment);
                              const pending = issued.filter((item) => !returned.includes(item));
                              
                              if (returned.length === 0 && pending.length === 0) {
                                return <span className="text-gray-400">—</span>;
                              }
                              
                              return (
                                <div className="flex flex-col items-center gap-1">
                                  {returned.map((item) => (
                                    <span
                                      key={item}
                                      className={`min-w-[72px] rounded px-2 py-0.5 text-xs ${getAccessoryBadgeClass(
                                        item
                                      )}`}
                                    >
                                      {item}
                                    </span>
                                  ))}
                                  {pending.length > 0 && (
                                    <div className="mt-1 flex flex-col items-center gap-1">
                                      {pending.map((item) => (
                                        <span
                                          key={item}
                                          className="min-w-[72px] rounded bg-red-50 px-2 py-0.5 text-xs text-red-700"
                                        >
                                          Pending: {item}
                                        </span>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              );
                            })()}
                          </div>
                          <div className="flex h-full flex-col items-center justify-center gap-1 text-center">
                            <span className="text-gray-600">{conditionLabel}</span>
                          </div>
                          <div className="flex h-full flex-col items-center justify-center gap-1 text-center">
                            <div className="flex justify-center">
                              <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-700">
                                Returned
                              </span>
                            </div>
                          </div>
                          <div className="flex h-full flex-col items-center justify-center gap-1 text-center">
                            {(() => {
                              const issued = getIssuedAccessories(assignment);
                              const returned = getReturnedAccessories(assignment);
                              const hasPending = issued.length > returned.length;
                              
                              if (hasPending) {
                                return (
                                  <button
                                    type="button"
                                    onClick={() => handleUpdateAccessories(assignment)}
                                    title="Update returned accessories"
                                    className="rounded-md border border-gray-300 p-2 text-gray-600 hover:bg-gray-100 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                                  >
                                    <Pencil size={16} />
                                  </button>
                                );
                              }
                              return null;
                            })()}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </ScrollArea>
              )}
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};
