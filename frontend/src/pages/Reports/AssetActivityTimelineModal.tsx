import React, { useMemo, useState } from 'react';
import { Modal } from '../../components/ui/Modal';
import { ScrollArea } from '../../components/ui/ScrollArea';
import { Assignment } from '../../types/assignment.types';
import { Package, RotateCcw, Clock, User, FileText, CheckCircle, XCircle, ChevronDown, ChevronUp } from 'lucide-react';

export interface AssetActivityTimelineModalProps {
  isOpen: boolean;
  onClose: () => void;
  assetName: string;
  assetId: string;
  category: string;
  assignments: Assignment[];
}

interface TimelineEvent {
  id: string;
  type: 'assigned' | 'returned';
  date: Date;
  assignment: Assignment;
}

export const AssetActivityTimelineModal: React.FC<AssetActivityTimelineModalProps> = ({
  isOpen,
  onClose,
  assetName,
  assetId,
  category,
  assignments,
}) => {
  const [expandedEvents, setExpandedEvents] = useState<Set<string>>(new Set());

  const formatDateTimeWithSeconds = (date: Date): { date: string; time: string } => {
    const dateStr = date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
    const timeStr = date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    });
    return { date: dateStr, time: timeStr };
  };

  const timelineEvents = useMemo(() => {
    const events: TimelineEvent[] = [];
    assignments.forEach((assignment) => {
      const assignedAt = new Date(assignment.assignedAt || assignment.assignedDate || assignment.createdAt);
      events.push({
        id: `${assignment._id}-assigned`,
        type: 'assigned',
        date: assignedAt,
        assignment,
      });
      if (assignment.returnedAt) {
        events.push({
          id: `${assignment._id}-returned`,
          type: 'returned',
          date: new Date(assignment.returnedAt),
          assignment,
        });
      }
    });
    return events.sort((a, b) => b.date.getTime() - a.date.getTime());
  }, [assignments]);

  const groupedEvents = useMemo(() => {
    const groups = new Map<string, TimelineEvent[]>();
    timelineEvents.forEach((event) => {
      const dateKey = event.date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
      if (!groups.has(dateKey)) groups.set(dateKey, []);
      groups.get(dateKey)!.push(event);
    });
    return Array.from(groups.entries()).sort((a, b) => {
      const aDate = new Date(a[0]);
      const bDate = new Date(b[0]);
      return bDate.getTime() - aDate.getTime();
    });
  }, [timelineEvents]);

  const summary = useMemo(() => {
    const totalAssignments = assignments.length;
    const activeAssignments = assignments.filter((a) => a.status === 'Active' && !a.returnedAt).length;
    const returnedAssignments = assignments.filter((a) => a.returnedAt || a.status === 'Returned').length;
    const overdueAssignments = assignments.filter((a) => {
      if (a.status !== 'Active' || a.returnedAt) return false;
      if (!a.dueDate) return false;
      return new Date(a.dueDate) < new Date();
    }).length;
    return {
      totalAssignments,
      activeAssignments,
      returnedAssignments,
      overdueAssignments,
    };
  }, [assignments]);

  const toggleExpand = (eventId: string) => {
    setExpandedEvents((prev) => {
      const next = new Set(prev);
      if (next.has(eventId)) next.delete(eventId);
      else next.add(eventId);
      return next;
    });
  };

  const getActivitySummary = (event: TimelineEvent): string => {
    const emp = event.assignment.employee;
    const empName = typeof emp === 'object' && emp ? (emp as { name?: string }).name : '';
    const empId = typeof emp === 'object' && emp && (emp as { employeeId?: string }).employeeId ? (emp as { employeeId?: string }).employeeId : '';
    const label = empId ? `${empName} (${empId})` : empName;
    if (event.type === 'assigned') return `Assigned to ${label}`;
    return `Returned by ${label}`;
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Activity Timeline – ${assetName}`} size="xl">
      <div className="space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-blue-50 rounded-lg p-3 text-center">
            <p className="text-xs font-medium text-gray-600">Total Assignments</p>
            <p className="text-2xl font-bold text-blue-700">{summary.totalAssignments}</p>
          </div>
          <div className="bg-green-50 rounded-lg p-3 text-center">
            <p className="text-xs font-medium text-gray-600">Currently Assigned</p>
            <p className="text-2xl font-bold text-green-700">{summary.activeAssignments}</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-3 text-center">
            <p className="text-xs font-medium text-gray-600">Returned</p>
            <p className="text-2xl font-bold text-gray-700">{summary.returnedAssignments}</p>
          </div>
          <div className="bg-red-50 rounded-lg p-3 text-center">
            <p className="text-xs font-medium text-gray-600">Overdue</p>
            <p className="text-2xl font-bold text-red-700">{summary.overdueAssignments}</p>
          </div>
        </div>

        {timelineEvents.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-gray-500">
            <Package className="h-10 w-10 text-gray-300 mb-3" />
            <p>No activity history found</p>
          </div>
        ) : (
          <ScrollArea className="max-h-[600px]">
            <div className="space-y-6">
              {groupedEvents.map(([dateKey, events]) => (
                <div key={dateKey} className="space-y-3">
                  <div className="sticky top-0 bg-white z-10 pb-2 border-b border-gray-200">
                    <h3 className="text-sm font-semibold text-gray-700">{dateKey}</h3>
                  </div>
                  <div className="space-y-3 pl-4 border-l-2 border-gray-200">
                    {events.map((event) => {
                      const { date, time } = formatDateTimeWithSeconds(event.date);
                      const isExpanded = expandedEvents.has(event.id);
                      const isAssigned = event.type === 'assigned';
                      const isReturned = event.type === 'returned';
                      const issuedAccessories =
                        event.assignment?.issuedAccessories || event.assignment?.accessories || [];
                      const returnedAccessories = event.assignment?.returnedAccessories || [];
                      const pendingAccessories = issuedAccessories.filter(
                        (item) => !returnedAccessories.includes(item)
                      );
                      const emp = event.assignment.employee;
                      const empName = typeof emp === 'object' && emp ? (emp as { name?: string }).name : '';
                      const empId = typeof emp === 'object' && emp && (emp as { employeeId?: string }).employeeId ? (emp as { employeeId?: string }).employeeId : '';
                      const dept = typeof emp === 'object' && emp && (emp as { department?: string }).department ? (emp as { department?: string }).department : '';

                      return (
                        <div key={event.id} className="relative">
                          <div className="absolute -left-[18px] top-1.5">
                            <div
                              className={`h-4 w-4 rounded-full border-2 flex items-center justify-center ${
                                isAssigned ? 'bg-blue-100 border-blue-500' : 'bg-gray-100 border-gray-500'
                              }`}
                            >
                              {isAssigned ? (
                                <Package className="h-2.5 w-2.5 text-blue-600" />
                              ) : (
                                <RotateCcw className="h-2.5 w-2.5 text-gray-600" />
                              )}
                            </div>
                          </div>
                          <div className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                            <div className="p-4">
                              <div className="flex items-start justify-between gap-4">
                                <div className="flex-1 space-y-2">
                                  <div className="flex items-center gap-2">
                                    <span
                                      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${
                                        isAssigned ? 'bg-blue-50 text-blue-700' : 'bg-gray-50 text-gray-700'
                                      }`}
                                    >
                                      {isAssigned ? (
                                        <>
                                          <Package className="h-3 w-3" />
                                          Assigned
                                        </>
                                      ) : (
                                        <>
                                          <RotateCcw className="h-3 w-3" />
                                          Returned
                                        </>
                                      )}
                                    </span>
                                    <span className="text-xs text-gray-500 font-mono">{time}</span>
                                  </div>
                                  <p className="text-sm font-medium text-gray-900">{getActivitySummary(event)}</p>
                                  <div className="flex items-center gap-2 text-xs text-gray-600">
                                    <span className="font-medium">{assetName}</span>
                                    <span className="text-gray-400">•</span>
                                    <span className="font-mono">{assetId}</span>
                                    {category && (
                                      <>
                                        <span className="text-gray-400">•</span>
                                        <span>{category}</span>
                                      </>
                                    )}
                                  </div>
                                  <div className="flex items-center gap-2 text-xs text-gray-600">
                                    <User className="h-3 w-3" />
                                    <span>{empName}</span>
                                    {empId && (
                                      <>
                                        <span className="text-gray-400">•</span>
                                        <span className="font-mono">{empId}</span>
                                      </>
                                    )}
                                    {dept && (
                                      <>
                                        <span className="text-gray-400">•</span>
                                        <span>{dept}</span>
                                      </>
                                    )}
                                  </div>
                                </div>
                                <button
                                  onClick={() => toggleExpand(event.id)}
                                  className="flex-shrink-0 p-1 rounded-md hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
                                  title={isExpanded ? 'Collapse details' : 'Expand details'}
                                >
                                  {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                                </button>
                              </div>
                            </div>
                            {isExpanded && event.assignment && (
                              <div className="border-t border-gray-200 bg-gray-50 p-4 space-y-4">
                                <div className="flex items-start gap-2">
                                  <Clock className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                                  <div>
                                    <p className="text-xs font-medium text-gray-700">System Timestamp</p>
                                    <p className="text-xs text-gray-500 font-mono">{event.date.toISOString()} (UTC)</p>
                                    <p className="text-xs text-gray-500 mt-1">Local: {date} at {time}</p>
                                  </div>
                                </div>
                                {isAssigned && event.assignment.assignedBy && (
                                  <div className="flex items-start gap-2">
                                    <User className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                                    <div>
                                      <p className="text-xs font-medium text-gray-700">Assigned By</p>
                                      <p className="text-xs text-gray-500">
                                        {event.assignment.assignedBy.name || event.assignment.assignedBy.email}
                                      </p>
                                    </div>
                                  </div>
                                )}
                                {isReturned && event.assignment.condition && (
                                  <div className="flex items-start gap-2">
                                    <CheckCircle className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                                    <div>
                                      <p className="text-xs font-medium text-gray-700">Condition</p>
                                      <p className={`text-xs font-medium ${event.assignment.condition === 'GOOD' ? 'text-green-600' : 'text-red-600'}`}>
                                        {event.assignment.condition === 'GOOD' ? 'Good' : 'Damaged'}
                                      </p>
                                    </div>
                                  </div>
                                )}
                                {issuedAccessories.length > 0 && (
                                  <div className="space-y-2">
                                    <p className="text-xs font-medium text-gray-700">Accessories Issued</p>
                                    <div className="flex flex-wrap gap-1">
                                      {issuedAccessories.map((item) => (
                                        <span key={item} className="inline-flex items-center gap-1 rounded bg-blue-50 px-2 py-0.5 text-xs text-blue-700">
                                          <Package className="h-3 w-3" />{item}
                                        </span>
                                      ))}
                                    </div>
                                  </div>
                                )}
                                {isReturned && returnedAccessories.length > 0 && (
                                  <div className="space-y-2">
                                    <p className="text-xs font-medium text-gray-700">Accessories Returned</p>
                                    <div className="flex flex-wrap gap-1">
                                      {returnedAccessories.map((item) => (
                                        <span key={item} className="inline-flex items-center gap-1 rounded bg-green-50 px-2 py-0.5 text-xs text-green-700">
                                          <CheckCircle className="h-3 w-3" />{item}
                                        </span>
                                      ))}
                                    </div>
                                  </div>
                                )}
                                {pendingAccessories.length > 0 && (
                                  <div className="space-y-2">
                                    <p className="text-xs font-medium text-gray-700">Pending Accessories</p>
                                    <div className="flex flex-wrap gap-1">
                                      {pendingAccessories.map((item) => (
                                        <span key={item} className="inline-flex items-center gap-1 rounded bg-red-50 px-2 py-0.5 text-xs text-red-700">
                                          <XCircle className="h-3 w-3" />{item}
                                        </span>
                                      ))}
                                    </div>
                                  </div>
                                )}
                                {event.assignment.notes && (
                                  <div className="flex items-start gap-2">
                                    <FileText className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                                    <div className="flex-1">
                                      <p className="text-xs font-medium text-gray-700 mb-1">Notes</p>
                                      <p className="text-xs text-gray-600 whitespace-pre-wrap">{event.assignment.notes}</p>
                                    </div>
                                  </div>
                                )}
                                {isReturned && event.assignment.remarks && (
                                  <div className="flex items-start gap-2">
                                    <FileText className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                                    <div className="flex-1">
                                      <p className="text-xs font-medium text-gray-700 mb-1">Return Remarks</p>
                                      <p className="text-xs text-gray-600 whitespace-pre-wrap">{event.assignment.remarks}</p>
                                    </div>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </div>
    </Modal>
  );
};
