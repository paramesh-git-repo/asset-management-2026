import React, { useMemo, useState } from 'react';
import { useAssets } from '../hooks/useAssets';
import { useEmployees } from '../hooks/useEmployees';
import { useAssignments } from '../hooks/useAssignments';
import { Card } from '../components/ui/Card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/Table';
import { Button } from '../components/ui/Button';
import { ASSET_STATUS } from '../utils/constants';
import { Download, Package, Users } from 'lucide-react';
import { AssetTimelineModal } from './Reports/AssetTimelineModal';
import { AssetActivityTimelineModal } from './Reports/AssetActivityTimelineModal';
import { Assignment } from '../types/assignment.types';
import { cn } from '../utils/cn';

type ReportTab = 'employee' | 'asset';

export const Reports: React.FC = () => {
  const { assets, isLoading: assetsLoading } = useAssets();
  const { employees, isLoading: employeesLoading } = useEmployees();
  const { assignments, isLoading: assignmentsLoading } = useAssignments();

  const [reportTab, setReportTab] = useState<ReportTab>('employee');
  const [selectedEmployee, setSelectedEmployee] = useState<{
    label: string;
    assignments: Assignment[];
    status?: string;
    exitDate?: string | null;
  } | null>(null);
  const [showTimelineModal, setShowTimelineModal] = useState(false);
  const [selectedAssetTimeline, setSelectedAssetTimeline] = useState<{
    assetName: string;
    assetId: string;
    category: string;
    assignments: Assignment[];
  } | null>(null);

  const isLoading = assetsLoading || employeesLoading || assignmentsLoading;

  // Top KPIs computed from assignments
  const topKPIs = useMemo(() => {
    const now = new Date();
    const todayStart = new Date(now);
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date(now);
    todayEnd.setHours(23, 59, 59, 999);

    const totalAssets = assets.length;
    const availableAssets = assets.filter((a) => a.status === ASSET_STATUS.AVAILABLE).length;
    const assignedAssets = assignments.filter((a) => a.status === 'Active' && !a.returnedAt).length;
    
    const returnedToday = assignments.filter((a) => {
      if (!a.returnedAt) return false;
      const returnedDate = new Date(a.returnedAt);
      return returnedDate >= todayStart && returnedDate <= todayEnd;
    }).length;

    const overdueAssignments = assignments.filter((a) => {
      if (a.status !== 'Active' || a.returnedAt) return false;
      if (!a.dueDate) return false;
      return new Date(a.dueDate) < new Date();
    }).length;

    return {
      totalAssets,
      availableAssets,
      assignedAssets,
      returnedToday,
      overdueAssignments,
    };
  }, [assets, assignments]);

  // Asset Status Breakdown
  const assetStatusBreakdown = useMemo(() => {
    return {
      available: assets.filter((a) => a.status === ASSET_STATUS.AVAILABLE).length,
      assigned: assets.filter((a) => a.status === ASSET_STATUS.ASSIGNED).length,
      inRepair: assets.filter((a) => a.status === ASSET_STATUS.IN_REPAIR).length,
      retired: assets.filter((a) => a.status === ASSET_STATUS.RETIRED).length,
    };
  }, [assets]);

  // Category Report with Assigned/Available
  const categoryReport = useMemo(() => {
    const categoryMap = new Map<
      string,
      { total: number; assigned: number; available: number }
    >();

    assets.forEach((asset) => {
      const existing = categoryMap.get(asset.category) || { total: 0, assigned: 0, available: 0 };
      existing.total += 1;
      if (asset.status === ASSET_STATUS.ASSIGNED) {
        existing.assigned += 1;
      } else if (asset.status === ASSET_STATUS.AVAILABLE) {
        existing.available += 1;
      }
      categoryMap.set(asset.category, existing);
    });

    return Array.from(categoryMap.entries())
      .map(([category, data]) => ({ category, ...data }))
      .sort((a, b) => b.total - a.total);
  }, [assets]);

  // Department Report with Active Assignments and Returned (lifetime)
  const departmentReport = useMemo(() => {
    const deptMap = new Map<
      string,
      { totalAssets: number; activeAssignments: number; returnedLifetime: number }
    >();

    // Count assets by department
    assets.forEach((asset) => {
      if (asset.department) {
        const existing = deptMap.get(asset.department) || {
          totalAssets: 0,
          activeAssignments: 0,
          returnedLifetime: 0,
        };
        existing.totalAssets += 1;
        deptMap.set(asset.department, existing);
      }
    });

    // Count assignments by employee department
    assignments.forEach((assignment) => {
      const dept = assignment.employee.department;
      if (dept) {
        const existing = deptMap.get(dept) || {
          totalAssets: 0,
          activeAssignments: 0,
          returnedLifetime: 0,
        };
        if (assignment.status === 'Active' && !assignment.returnedAt) {
          existing.activeAssignments += 1;
        }
        if (assignment.returnedAt || assignment.status === 'Returned') {
          existing.returnedLifetime += 1;
        }
        deptMap.set(dept, existing);
      }
    });

    return Array.from(deptMap.entries())
      .map(([department, data]) => ({ department, ...data }))
      .sort((a, b) => b.totalAssets - a.totalAssets);
  }, [assets, assignments]);

  // Employee Summary with Active Assets and Total Assets Issued (lifetime)
  const employeeSummary = useMemo(() => {
    const employeeMap = new Map<
      string,
      {
        employee: typeof employees[0];
        activeAssets: Assignment[];
        allAssignments: Assignment[];
      }
    >();

    employees.forEach((emp) => {
      employeeMap.set(emp._id, {
        employee: emp,
        activeAssets: [],
        allAssignments: [],
      });
    });

    assignments.forEach((assignment) => {
      const empId = assignment.employee._id;
      if (employeeMap.has(empId)) {
        const entry = employeeMap.get(empId)!;
        entry.allAssignments.push(assignment);
        if (assignment.status === 'Active' && !assignment.returnedAt) {
          entry.activeAssets.push(assignment);
        }
      }
    });

    return Array.from(employeeMap.values())
      .map(({ employee, activeAssets, allAssignments }) => ({
        employeeId: employee._id,
        employeeName: employee.name,
        employeeCode: (employee as any).employeeId,
        department: employee.department,
        activeAssets: activeAssets.length,
        totalAssetsIssued: allAssignments.length,
        allAssignments,
        employee,
      }))
      .filter((summary) => summary.totalAssetsIssued > 0)
      .sort((a, b) => b.totalAssetsIssued - a.totalAssetsIssued);
  }, [employees, assignments]);

  // Asset Summary: Total Times Issued (all assignments), Currently Assigned, Current Holder
  const assetSummary = useMemo(() => {
    const byAssetId = new Map<
      string,
      { totalTimesIssued: number; activeAssignment: Assignment | null }
    >();
    assets.forEach((asset) => {
      byAssetId.set(asset._id, { totalTimesIssued: 0, activeAssignment: null });
    });
    assignments.forEach((a) => {
      const assetId = typeof a.asset === 'object' && a.asset && '_id' in a.asset ? a.asset._id : (a as any).asset;
      const entry = byAssetId.get(assetId);
      if (entry) {
        entry.totalTimesIssued += 1;
        if (a.status === 'Active' && !a.returnedAt && !entry.activeAssignment) {
          entry.activeAssignment = a;
        }
      }
    });
    return assets.map((asset) => {
      const entry = byAssetId.get(asset._id) ?? { totalTimesIssued: 0, activeAssignment: null };
      const activeAssignment = entry.activeAssignment;
      const currentHolder =
        activeAssignment && typeof activeAssignment.employee === 'object' && activeAssignment.employee
          ? (activeAssignment.employee as { name?: string }).name ?? ''
          : '';
      return {
        assetId: asset._id,
        assetDisplayId: asset.assetId,
        assetName: asset.name,
        category: asset.category,
        totalTimesIssued: entry.totalTimesIssued,
        currentlyAssigned: !!activeAssignment,
        currentHolder,
      };
    });
  }, [assets, assignments]);

  const handleEmployeeClick = (employeeId: string) => {
    const summary = employeeSummary.find((e) => e.employeeId === employeeId);
    if (summary) {
      const emp = summary.employee;
      setSelectedEmployee({
        label: summary.employeeCode ? `${summary.employeeName} (${summary.employeeCode})` : summary.employeeName,
        assignments: summary.allAssignments,
        status: emp?.status,
        exitDate: emp?.exitDate,
      });
      setShowTimelineModal(true);
    }
  };

  const handleExport = () => {
    const data = {
      topKPIs,
      assetStatusBreakdown,
      categoryReport,
      departmentReport,
      employeeSummary: employeeSummary.map((e) => ({
        ...e,
        allAssignments: undefined, // Exclude assignments from export
      })),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `asset-report-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center text-gray-500">
        <div className="animate-pulse">Loading reports...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Reports</h1>
          <p className="text-sm text-gray-500">Asset management analytics and summaries</p>
        </div>
        <Button onClick={handleExport} variant="outline">
          <Download className="mr-2 h-4 w-4" />
          Export Data
        </Button>
      </div>

      {/* Tab switcher */}
      <div className="inline-flex rounded-full bg-gray-100 p-1">
        <button
          type="button"
          onClick={() => setReportTab('employee')}
          className={cn(
            'flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors',
            reportTab === 'employee'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          )}
        >
          Employee Summary
          <span className="inline-flex min-w-[24px] items-center justify-center rounded-full bg-gray-200 px-2 py-0.5 text-xs font-semibold text-gray-700">
            {employeeSummary.length}
          </span>
        </button>
        <button
          type="button"
          onClick={() => setReportTab('asset')}
          className={cn(
            'flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors',
            reportTab === 'asset'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          )}
        >
          Asset Summary
          <span className="inline-flex min-w-[24px] items-center justify-center rounded-full bg-gray-200 px-2 py-0.5 text-xs font-semibold text-gray-700">
            {assetSummary.length}
          </span>
        </button>
      </div>

      {/* Asset Status Breakdown */}
      <Card title="Asset Status Breakdown" description="Distribution of assets by status">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <p className="text-sm font-medium text-gray-600">Available</p>
            <p className="text-2xl font-bold text-green-700">{assetStatusBreakdown.available}</p>
          </div>
          <div className="text-center p-4 bg-amber-50 rounded-lg">
            <p className="text-sm font-medium text-gray-600">Assigned</p>
            <p className="text-2xl font-bold text-amber-700">{assetStatusBreakdown.assigned}</p>
          </div>
          <div className="text-center p-4 bg-yellow-50 rounded-lg">
            <p className="text-sm font-medium text-gray-600">In Repair</p>
            <p className="text-2xl font-bold text-yellow-700">{assetStatusBreakdown.inRepair}</p>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <p className="text-sm font-medium text-gray-600">Retired</p>
            <p className="text-2xl font-bold text-gray-700">{assetStatusBreakdown.retired}</p>
          </div>
        </div>
      </Card>

      {/* Employee Summary tab */}
      {reportTab === 'employee' && (
        <Card title="Employee Summary" description="Assets assigned to each employee (click to view timeline)">
          {employeeSummary.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-gray-500">
              <Users className="h-10 w-10 text-gray-300 mb-3" />
              <p>No assigned assets found</p>
            </div>
          ) : (
            <div className="rounded-md border border-gray-200 overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50 hover:bg-gray-50">
                    <TableHead>Employee Name</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Active Assets</TableHead>
                    <TableHead>Total Assets Issued (Lifetime)</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {employeeSummary.map((summary) => (
                    <TableRow
                      key={summary.employeeId}
                      className="cursor-pointer hover:bg-gray-50"
                      onClick={() => handleEmployeeClick(summary.employeeId)}
                    >
                      <TableCell className="font-medium">
                        <div className="flex flex-col">
                          <span>{summary.employeeName}</span>
                          {summary.employeeCode && (
                            <span className="text-xs text-gray-500 font-mono">{summary.employeeCode}</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="inline-flex items-center rounded-md bg-gray-50 px-2 py-1 text-xs font-medium text-gray-600">
                          {summary.department}
                        </span>
                      </TableCell>
                      <TableCell className="font-semibold">{summary.activeAssets}</TableCell>
                      <TableCell>{summary.totalAssetsIssued}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </Card>
      )}

      {/* Asset Summary tab */}
      {reportTab === 'asset' && (
        <Card title="Asset Summary" description="Assignment history and current holder per asset">
          {assetSummary.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-gray-500">
              <Package className="h-10 w-10 text-gray-300 mb-3" />
              <p>No assets found</p>
            </div>
          ) : (
            <div className="rounded-md border border-gray-200 overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50 hover:bg-gray-50">
                    <TableHead>Asset Name</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Total Times Issued</TableHead>
                    <TableHead>Currently Assigned</TableHead>
                    <TableHead>Current Holder</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {assetSummary.map((row) => {
                    const assetAssignments = assignments.filter((a) => {
                      const aid = typeof a.asset === 'object' && a.asset && '_id' in a.asset ? (a.asset as { _id: string })._id : null;
                      return aid === row.assetId;
                    });
                    return (
                      <TableRow
                        key={row.assetId}
                        className="cursor-pointer hover:bg-gray-50"
                        onClick={() =>
                          setSelectedAssetTimeline({
                            assetName: row.assetName,
                            assetId: row.assetDisplayId ?? row.assetId,
                            category: row.category,
                            assignments: assetAssignments,
                          })
                        }
                      >
                        <TableCell className="font-medium">{row.assetName}</TableCell>
                        <TableCell>{row.category}</TableCell>
                        <TableCell>{row.totalTimesIssued}</TableCell>
                        <TableCell>{row.currentlyAssigned ? 'Yes' : 'No'}</TableCell>
                        <TableCell>{row.currentHolder || '—'}</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </Card>
      )}

      {/* Employee Activity Timeline Modal */}
      {selectedEmployee && (
        <AssetTimelineModal
          isOpen={showTimelineModal}
          onClose={() => {
            setShowTimelineModal(false);
            setSelectedEmployee(null);
          }}
          employeeName={selectedEmployee.label}
          assignments={selectedEmployee.assignments}
          employee={selectedEmployee.status || selectedEmployee.exitDate ? { status: selectedEmployee.status, exitDate: selectedEmployee.exitDate } : undefined}
        />
      )}

      {/* Asset Activity Timeline Modal */}
      {selectedAssetTimeline && (
        <AssetActivityTimelineModal
          isOpen={!!selectedAssetTimeline}
          onClose={() => setSelectedAssetTimeline(null)}
          assetName={selectedAssetTimeline.assetName}
          assetId={selectedAssetTimeline.assetId}
          category={selectedAssetTimeline.category}
          assignments={selectedAssetTimeline.assignments}
        />
      )}
    </div>
  );
};
