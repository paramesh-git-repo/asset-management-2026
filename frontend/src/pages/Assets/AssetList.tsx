import React, { useState, useEffect } from 'react';
import { useAssets } from '../../hooks/useAssets';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/Table';
import { formatDate, getStatusColor } from '../../utils/helpers';
import { AssetForm } from './AssetForm';
import { ASSET_STATUS } from '../../utils/constants';
import { Plus, Search, Trash2, Edit, Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '../../utils/cn';

export const AssetList: React.FC = () => {
  const [showForm, setShowForm] = useState(false);
  const [editingAsset, setEditingAsset] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const { user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const handleEditAsset = (e: CustomEvent) => {
      setEditingAsset(e.detail);
      setShowForm(true);
    };
    window.addEventListener('editAsset' as any, handleEditAsset);
    return () => window.removeEventListener('editAsset' as any, handleEditAsset);
  }, []);

  const isAdmin = user?.role === 'Admin';
  const isManager = user?.role === 'Manager';

  const { assets, isLoading, deleteAsset, isDeleting } = useAssets({
    status: statusFilter || undefined,
    onSuccess: (message, type) => showToast(message, type),
    onError: (message) => showToast(message, 'error'),
  });

  const filteredAssets = assets.filter(
    (asset) =>
      asset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      asset.assetId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      asset.serialNumber.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEdit = (id: string) => {
    setEditingAsset(id);
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this asset?')) {
      deleteAsset(id);
    }
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingAsset(null);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Assets</h1>
          <p className="text-sm text-gray-500">Inventory and tracking</p>
        </div>
        {(isAdmin || isManager) && (
          <Button onClick={() => setShowForm(true)} className="w-full sm:w-auto">
            <Plus className="mr-2 h-4 w-4" />
            Add Asset
          </Button>
        )}
      </div>

      {showForm && (
        <AssetForm
          assetId={editingAsset || undefined}
          onClose={handleCloseForm}
          onSuccess={handleCloseForm}
          isModal={true}
        />
      )}

      <Card className="border-none shadow-md ring-1 ring-gray-200">
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by name, ID, or serial..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="w-full sm:w-48">
              <Select
                options={[
                  { value: '', label: 'All Statuses' },
                  { value: ASSET_STATUS.AVAILABLE, label: ASSET_STATUS.AVAILABLE },
                  { value: ASSET_STATUS.ASSIGNED, label: ASSET_STATUS.ASSIGNED },
                  { value: ASSET_STATUS.IN_REPAIR, label: ASSET_STATUS.IN_REPAIR },
                  { value: ASSET_STATUS.RETIRED, label: ASSET_STATUS.RETIRED },
                ]}
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              />
            </div>
          </div>

          {isLoading ? (
            <div className="flex h-64 items-center justify-center text-gray-500">
              <div className="animate-pulse">Loading assets...</div>
            </div>
          ) : filteredAssets.length === 0 ? (
            <div className="flex bg-gray-50 rounded-lg h-64 flex-col items-center justify-center text-gray-500 border border-dashed border-gray-300">
              <p>No assets found matching your criteria.</p>
            </div>
          ) : (
            <div className="rounded-md border border-gray-200 overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50 hover:bg-gray-50">
                    <TableHead>Asset Info</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Serial No.</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Purchased</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAssets.map((asset) => (
                    <TableRow key={asset._id}>
                      <TableCell className="font-medium text-gray-900">
                        <div className="flex flex-col">
                          <span className="text-sm font-semibold">{asset.name}</span>
                          <span className="text-xs text-gray-500 font-mono">{asset.assetId}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-gray-600">{asset.category}</TableCell>
                      <TableCell className="text-gray-600 font-mono text-xs">{asset.serialNumber}</TableCell>
                      <TableCell>
                        <span
                          className={cn(
                            "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
                            getStatusColor(asset.status)
                          )}
                        >
                          {asset.status}
                        </span>
                      </TableCell>
                      <TableCell className="text-gray-500 text-sm">{formatDate(asset.purchaseDate)}</TableCell>
                      <TableCell>
                        <div className="flex items-center justify-center gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => navigate(`/assets/${asset._id}`)}
                            title="View Details"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          {(isAdmin || isManager) && (
                            <>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleEdit(asset._id)}
                                title="Edit"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              {isAdmin && (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleDelete(asset._id)}
                                  isLoading={isDeleting}
                                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                  title="Delete"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              )}
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};
