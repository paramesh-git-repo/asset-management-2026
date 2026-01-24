import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAsset } from '../../hooks/useAssets';
import { useAssignmentHistory } from '../../hooks/useAssignments';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/Table';
import { formatDate, getStatusColor } from '../../utils/helpers';
import { Package, Calendar, Tag, Hash, ShieldCheck, History, Settings, User, AlertTriangle } from 'lucide-react';
import { cn } from '../../utils/cn';

export const AssetDetails: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { data: asset, isLoading, error } = useAsset(id || '');
    const { data: assignmentHistory = [], isLoading: historyLoading } = useAssignmentHistory(id, undefined);
    const [activeTab, setActiveTab] = useState<'info' | 'history'>('info');
    
    const isWarrantyExpired = asset?.warrantyExpiration 
      ? new Date(asset.warrantyExpiration) < new Date()
      : false;

    if (isLoading) {
        return (
            <div className="flex h-64 items-center justify-center text-gray-500">
                <div className="animate-pulse">Loading asset details...</div>
            </div>
        );
    }

    if (error || !asset) {
        return (
            <div className="flex h-64 flex-col items-center justify-center text-gray-500">
                <p>Asset not found or failed to load.</p>
                <Button variant="outline" onClick={() => navigate('/assets')}>Back to Assets</Button>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-white rounded-xl shadow-sm border border-gray-100">
                        <Package className="h-8 w-8 text-primary-600" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">{asset.name}</h1>
                        <div className="flex items-center gap-2 mt-1">
                            <span className="text-sm text-gray-500 font-mono">{asset.assetId}</span>
                            <span className={cn(
                                "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
                                getStatusColor(asset.status)
                            )}>
                                {asset.status}
                            </span>
                        </div>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={() => navigate('/assets')}>
                        Back to List
                    </Button>
                    <Button onClick={() => {
                        navigate('/assets');
                        setTimeout(() => {
                            const event = new CustomEvent('editAsset', { detail: asset._id });
                            window.dispatchEvent(event);
                        }, 100);
                    }}>
                        <Settings className="mr-2 h-4 w-4" />
                        Edit Asset
                    </Button>
                </div>
            </div>

            <div className="flex border-b border-gray-200">
                <button
                    onClick={() => setActiveTab('info')}
                    className={cn(
                        "px-6 py-3 text-sm font-medium border-b-2 transition-colors",
                        activeTab === 'info' ? "border-primary-600 text-primary-600" : "border-transparent text-gray-500 hover:text-gray-700"
                    )}
                >
                    General Information
                </button>
                <button
                    onClick={() => setActiveTab('history')}
                    className={cn(
                        "px-6 py-3 text-sm font-medium border-b-2 transition-colors",
                        activeTab === 'history' ? "border-primary-600 text-primary-600" : "border-transparent text-gray-500 hover:text-gray-700"
                    )}
                >
                    Assignment History
                </button>
            </div>

            {activeTab === 'info' && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card className="md:col-span-2" title="Asset Details">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-6 gap-x-12">
                            <div className="space-y-1">
                                <div className="flex items-center gap-2 text-sm text-gray-500">
                                    <Tag className="h-4 w-4" />
                                    Category
                                </div>
                                <p className="font-medium text-gray-900">{asset.category}</p>
                            </div>
                            <div className="space-y-1">
                                <div className="flex items-center gap-2 text-sm text-gray-500">
                                    <Hash className="h-4 w-4" />
                                    Serial Number
                                </div>
                                <p className="font-medium text-gray-900 font-mono">{asset.serialNumber}</p>
                            </div>
                            <div className="space-y-1">
                                <div className="flex items-center gap-2 text-sm text-gray-500">
                                    <Calendar className="h-4 w-4" />
                                    Purchase Date
                                </div>
                                <p className="font-medium text-gray-900">{formatDate(asset.purchaseDate)}</p>
                            </div>
                            <div className="space-y-1">
                                <div className="flex items-center gap-2 text-sm text-gray-500">
                                    <ShieldCheck className="h-4 w-4" />
                                    Warranty Expiration
                                </div>
                                <div className="flex items-center gap-2">
                                  <p className={cn(
                                    "font-medium",
                                    isWarrantyExpired ? "text-red-600" : "text-gray-900"
                                  )}>
                                    {asset.warrantyExpiration ? formatDate(asset.warrantyExpiration) : 'N/A'}
                                  </p>
                                  {isWarrantyExpired && (
                                    <div className="flex items-center" title="Warranty Expired">
                                      <AlertTriangle className="h-4 w-4 text-red-600" aria-label="Warranty Expired" />
                                    </div>
                                  )}
                                </div>
                            </div>
                            <div className="space-y-1">
                                <div className="flex items-center gap-2 text-sm text-gray-500">
                                    <User className="h-4 w-4" />
                                    Current Holder
                                </div>
                                <p className="font-medium text-gray-900">
                                    {asset.currentHolder?.name || 'Not assigned'}
                                </p>
                            </div>
                        </div>
                    </Card>

                    <Card title="Quick Stats" className="h-fit">
                        <div className="space-y-4">
                            <div className="flex flex-col gap-1">
                                <span className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Status</span>
                                <span className={cn(
                                    "w-fit px-3 py-1 rounded-full text-sm font-bold",
                                    getStatusColor(asset.status)
                                )}>
                                    {asset.status}
                                </span>
                            </div>
                            <div className="flex flex-col gap-1 border-t border-gray-100 pt-4">
                                <span className="text-xs text-gray-500 lg:inline-block">Last Updated</span>
                                <span className="text-sm font-medium">{formatDate(asset.updatedAt)}</span>
                            </div>
                        </div>
                    </Card>
                </div>
            )}

            {activeTab === 'history' && (
                <Card title="Assignment History">
                    {historyLoading ? (
                        <div className="flex h-32 items-center justify-center text-gray-500">
                            <div className="animate-pulse">Loading assignment history...</div>
                        </div>
                    ) : assignmentHistory.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 text-gray-500">
                            <History className="h-10 w-10 text-gray-300 mb-3" />
                            <p>No assignment history found for this asset.</p>
                        </div>
                    ) : (
                        <div className="rounded-md border border-gray-200 overflow-hidden">
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-gray-50 hover:bg-gray-50">
                                        <TableHead>Employee</TableHead>
                                        <TableHead>Department</TableHead>
                                        <TableHead>Assigned Date</TableHead>
                                        <TableHead>Return Date</TableHead>
                                        <TableHead>Status</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {assignmentHistory.map((assignment) => (
                                        <TableRow key={assignment._id}>
                                            <TableCell className="font-medium">{assignment.employee.name}</TableCell>
                                            <TableCell>
                                                <span className="inline-flex items-center rounded-md bg-gray-50 px-2 py-1 text-xs font-medium text-gray-600">
                                                    {assignment.employee.department}
                                                </span>
                                            </TableCell>
                                            <TableCell>{formatDate(assignment.assignedDate)}</TableCell>
                                            <TableCell>
                                                {assignment.returnDate ? formatDate(assignment.returnDate) : '-'}
                                            </TableCell>
                                            <TableCell>
                                                <span className={cn(
                                                    "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
                                                    getStatusColor(assignment.status)
                                                )}>
                                                    {assignment.status}
                                                </span>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </Card>
            )}

        </div>
    );
};
