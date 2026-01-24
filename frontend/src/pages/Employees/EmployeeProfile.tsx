import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useEmployee } from '../../hooks/useEmployees';
import { useAssignments } from '../../hooks/useAssignments';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/Table';
import { formatDate, getStatusColor } from '../../utils/helpers';
import { User, Mail, Phone, Building2, Briefcase, Calendar, ArrowLeft, Package, Hash } from 'lucide-react';
import { cn } from '../../utils/cn';
import { useAuth } from '../../context/AuthContext';

export const EmployeeProfile: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const { data: employee, isLoading, error } = useEmployee(id || '');
  const { assignments, isLoading: assignmentsLoading } = useAssignments({ employeeId: id });

  const activeAssignments = assignments.filter((a) => a.status === 'Active');
  const isAdmin = currentUser?.role === 'Admin';
  const isManager = currentUser?.role === 'Manager';

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center text-gray-500">
        <div className="animate-pulse">Loading employee profile...</div>
      </div>
    );
  }

  if (error || !employee) {
    return (
      <div className="flex h-64 flex-col items-center justify-center text-gray-500">
        <p>Employee not found or failed to load.</p>
        <Button variant="outline" onClick={() => navigate('/employees')} className="mt-4">
          Back to Employees
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-white rounded-xl shadow-sm border border-gray-100">
            <User className="h-8 w-8 text-primary-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">{employee.name}</h1>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs text-gray-500 font-mono">{employee.employeeId}</span>
              <span className="text-xs text-gray-400">•</span>
              <span className="text-sm text-gray-500">{employee.email}</span>
              <span className={cn(
                "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
                getStatusColor(employee.status)
              )}>
                {employee.status}
              </span>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate('/employees')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to List
          </Button>
          {(isAdmin || isManager) && (
            <Button onClick={() => {
              navigate('/employees');
              setTimeout(() => {
                const event = new CustomEvent('editEmployee', { detail: employee._id });
                window.dispatchEvent(event);
              }, 100);
            }}>
              Edit Employee
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-2" title="Employee Information">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-6 gap-x-12">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Hash className="h-4 w-4" />
                Employee ID
              </div>
              <p className="font-medium text-gray-900 font-mono">{employee.employeeId}</p>
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Mail className="h-4 w-4" />
                Email
              </div>
              <p className="font-medium text-gray-900">{employee.email}</p>
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Phone className="h-4 w-4" />
                Phone
              </div>
              <p className="font-medium text-gray-900">{employee.phone}</p>
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Building2 className="h-4 w-4" />
                Department
              </div>
              <p className="font-medium text-gray-900">{employee.department}</p>
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Briefcase className="h-4 w-4" />
                Position
              </div>
              <p className="font-medium text-gray-900">{employee.position}</p>
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Calendar className="h-4 w-4" />
                Hire Date
              </div>
              <p className="font-medium text-gray-900">{formatDate(employee.hireDate)}</p>
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Package className="h-4 w-4" />
                Assigned Assets
              </div>
              <p className="font-medium text-gray-900">{activeAssignments.length}</p>
            </div>
          </div>
        </Card>

        <Card title="Quick Stats" className="h-fit">
          <div className="space-y-4">
            <div className="flex flex-col gap-1">
              <span className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Status</span>
              <span className={cn(
                "w-fit px-3 py-1 rounded-full text-sm font-bold",
                getStatusColor(employee.status)
              )}>
                {employee.status}
              </span>
            </div>
            <div className="flex flex-col gap-1 border-t border-gray-100 pt-4">
              <span className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Active Assignments</span>
              <span className="text-2xl font-bold text-gray-900">{activeAssignments.length}</span>
            </div>
            <div className="flex flex-col gap-1 border-t border-gray-100 pt-4">
              <span className="text-xs text-gray-500">Joined</span>
              <span className="text-sm font-medium">{formatDate(employee.hireDate)}</span>
            </div>
          </div>
        </Card>
      </div>

      <Card title="Assigned Assets" description={`Assets currently assigned to ${employee.name}`}>
        {assignmentsLoading ? (
          <div className="flex h-32 items-center justify-center text-gray-500">
            <div className="animate-pulse">Loading assignments...</div>
          </div>
        ) : activeAssignments.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-gray-500">
            <Package className="h-10 w-10 text-gray-300 mb-3" />
            <p>No assets currently assigned to this employee.</p>
          </div>
        ) : (
          <div className="rounded-md border border-gray-200 overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50 hover:bg-gray-50">
                  <TableHead>Asset</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Asset ID</TableHead>
                  <TableHead>Assigned Date</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {activeAssignments.map((assignment) => (
                  <TableRow key={assignment._id}>
                    <TableCell className="font-medium">
                      <button
                        onClick={() => navigate(`/assets/${assignment.asset._id}`)}
                        className="text-primary-600 hover:text-primary-700 hover:underline"
                      >
                        {assignment.asset.name}
                      </button>
                    </TableCell>
                    <TableCell>{assignment.asset.category}</TableCell>
                    <TableCell className="font-mono text-xs">{assignment.asset.assetId}</TableCell>
                    <TableCell>{formatDate(assignment.assignedDate)}</TableCell>
                    <TableCell>
                      <span className={cn(
                        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
                        getStatusColor(assignment.asset.status)
                      )}>
                        {assignment.asset.status}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </Card>
    </div>
  );
};
