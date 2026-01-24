import React, { useMemo } from 'react';
import { useDashboard } from '../hooks/useDashboard';
import { useAssets } from '../hooks/useAssets';
import { Card } from '../components/ui/Card';
import { ScrollArea } from '../components/ui/ScrollArea';
import { formatDate } from '../utils/helpers';
import {
  Package,
  Users,
  CheckCircle,
  Clock,
  ArrowRight,
  Wrench,
  ShieldCheck,
} from 'lucide-react';
import { cn } from '../utils/cn';

export const Dashboard: React.FC = () => {
  const { data: stats, isLoading, error: dashboardError } = useDashboard();
  const { assets, error: assetsError } = useAssets();

  const alerts = useMemo(() => {
    if (!assets || assets.length === 0 || assetsError) return { warrantyExpiring: [], longInRepair: [] };

    const now = new Date();
    const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

    const warrantyExpiring = assets
      .filter((asset) => {
        if (!asset.warrantyExpiration || asset.status === 'Retired') return false;
        const expiry = new Date(asset.warrantyExpiration);
        return expiry >= now && expiry <= thirtyDaysFromNow;
      })
      .slice(0, 5);

    const longInRepair = assets
      .filter((asset) => {
        if (asset.status !== 'In Repair') return false;
        const updatedAt = new Date(asset.updatedAt);
        return updatedAt <= sixtyDaysAgo;
      })
      .slice(0, 5);

    return { warrantyExpiring, longInRepair };
  }, [assets]);

  if (isLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="animate-pulse text-gray-500">Loading dashboard data...</div>
      </div>
    );
  }

  if (dashboardError || assetsError) {
    const isConnectionError =
      (dashboardError as any)?.code === 'ERR_NETWORK' ||
      (dashboardError as any)?.code === 'ERR_CONNECTION_REFUSED' ||
      (dashboardError as any)?.message?.includes('Connection refused') ||
      (dashboardError as any)?.message?.includes('Network Error') ||
      (assetsError as any)?.code === 'ERR_NETWORK' ||
      (assetsError as any)?.code === 'ERR_CONNECTION_REFUSED' ||
      (assetsError as any)?.message?.includes('Connection refused') ||
      (assetsError as any)?.message?.includes('Network Error');

    return (
      <div className="flex h-[50vh] flex-col items-center justify-center space-y-4 px-4">
        <div className="rounded-lg bg-orange-50 border border-orange-200 p-6 max-w-2xl w-full">
          <h3 className="text-lg font-semibold text-orange-900 mb-3 flex items-center gap-2">
            <ShieldCheck className="h-5 w-5" />
            Backend API Not Available
          </h3>
          <p className="text-sm text-orange-700 mb-4">
            {isConnectionError
              ? 'Unable to connect to the backend API at http://localhost:5001. Please ensure both MongoDB and the backend server are running.'
              : 'Failed to load dashboard data. Please check your API connection.'}
          </p>
          <div className="space-y-3 text-xs text-orange-600 bg-orange-100 rounded p-4 text-left">
            <div>
              <p className="font-medium mb-2">Step 1: Start MongoDB</p>
              <code className="block bg-white px-3 py-2 rounded mt-1 font-mono">
                mongod
              </code>
              <p className="text-orange-500 mt-1 text-xs">Or use MongoDB Atlas connection string in .env</p>
            </div>
            <div>
              <p className="font-medium mb-2">Step 2: Seed Database (first time only)</p>
              <code className="block bg-white px-3 py-2 rounded mt-1 font-mono">
                cd backend && npm run seed
              </code>
            </div>
            <div>
              <p className="font-medium mb-2">Step 3: Start Backend Server</p>
              <code className="block bg-white px-3 py-2 rounded mt-1 font-mono">
                cd backend && npm run dev
              </code>
            </div>
            <p className="text-orange-500 mt-3 text-xs font-medium">
              The backend should start on port 5001. Check the terminal for "✅ MongoDB connected successfully" and "🚀 Server is running on port 5001"
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="flex h-[50vh] items-center justify-center text-gray-500">
        <div className="text-center">
          <p className="mb-2">No dashboard data available</p>
          <p className="text-sm text-gray-400">The dashboard will load once the backend is connected.</p>
        </div>
      </div>
    );
  }

  const statCards = [
    {
      label: 'Total Assets',
      value: stats.totalAssets,
      icon: Package,
      iconBg: 'bg-blue-50',
      iconColor: 'text-blue-600',
      borderColor: 'border-l-blue-500',
      bgTint: 'bg-blue-50/30',
    },
    {
      label: 'Assigned Assets',
      value: stats.assignedAssets,
      icon: Users,
      iconBg: 'bg-indigo-50',
      iconColor: 'text-indigo-600',
      borderColor: 'border-l-indigo-500',
      bgTint: 'bg-indigo-50/30',
    },
    {
      label: 'Available Assets',
      value: stats.availableAssets,
      icon: CheckCircle,
      iconBg: 'bg-green-50',
      iconColor: 'text-green-600',
      borderColor: 'border-l-green-500',
      bgTint: 'bg-green-50/30',
    },
    {
      label: 'Assets in Repair',
      value: stats.assetsInRepair ?? 0,
      icon: Wrench,
      iconBg: 'bg-amber-50',
      iconColor: 'text-amber-600',
      borderColor: 'border-l-amber-500',
      bgTint: 'bg-amber-50/30',
    },
  ];

  const hasAlerts = alerts.warrantyExpiring.length > 0 || alerts.longInRepair.length > 0;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Page Header */}
      <div className="space-y-1">
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Dashboard</h1>
        <p className="text-sm text-gray-500">
          Overview of your asset management system and recent activity
        </p>
      </div>

      {/* KPI Cards Section */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-gray-900">Asset Overview</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {statCards.map((card) => {
            const Icon = card.icon;
            return (
              <Card
                key={card.label}
                className={cn(
                  'relative border-l-4 transition-all hover:shadow-md overflow-hidden',
                  card.borderColor,
                  card.bgTint
                )}
              >
                <div className="relative flex items-center gap-4 p-1">
                  <div className={cn('flex-shrink-0 p-3 rounded-lg', card.iconBg)}>
                    <Icon className={cn('h-6 w-6', card.iconColor)} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-600 truncate">{card.label}</p>
                    <h3 className="text-2xl font-bold text-gray-900 mt-0.5">{card.value}</h3>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </section>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Recent Activity Section */}
        <section className="lg:col-span-2 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
          <Card title="Assignment Timeline" description="Latest asset allocation activities">
            {stats.recentAssignments.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-gray-500">
                <Clock className="h-12 w-12 text-gray-300 mb-4" />
                <p className="text-sm">No recent assignments found</p>
              </div>
            ) : (
              <ScrollArea className="max-h-[400px]">
                <div className="space-y-0 divide-y divide-gray-100">
                  {stats.recentAssignments.slice(0, 8).map((assignment) => (
                    <div
                      key={assignment._id}
                      className="flex items-start gap-4 p-4 hover:bg-gray-50/50 transition-colors"
                    >
                      <div className="flex-shrink-0 mt-0.5">
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 border-2 border-blue-200">
                          <ArrowRight className="h-4 w-4 text-blue-600" />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900">
                              <span className="text-gray-600">Asset assigned:</span>{' '}
                              <span className="font-semibold">{assignment.asset.name}</span>
                            </p>
                            <div className="mt-1 flex items-center gap-2 flex-wrap">
                              <span className="text-xs text-gray-500">
                                To: {assignment.employee.name}
                                {(assignment.employee as any).employeeId ? ` (${(assignment.employee as any).employeeId})` : ''}
                              </span>
                              <span className="text-xs text-gray-400">•</span>
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-700">
                                {assignment.employee.department}
                              </span>
                            </div>
                            <p className="text-xs text-gray-400 mt-1 font-mono">
                              {assignment.asset.assetId}
                            </p>
                          </div>
                          <div className="flex-shrink-0 text-right">
                            <p className="text-xs font-medium text-gray-500">
                              {formatDate(assignment.assignedDate)}
                            </p>
                            <p className="text-xs text-gray-400 mt-0.5">
                              {new Date(assignment.assignedDate).toLocaleTimeString('en-US', {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            )}
          </Card>
        </section>

        {/* Alerts & Quick Stats Section */}
        <section className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">Attention Needed</h2>

          {/* Warranty Expiring Alerts */}
          {alerts.warrantyExpiring.length > 0 && (
            <Card
              title="Warranty Expiring Soon"
              description={`${alerts.warrantyExpiring.length} asset${alerts.warrantyExpiring.length > 1 ? 's' : ''} require attention`}
              className="border-l-4 border-l-amber-500 bg-amber-50/20"
            >
              <ScrollArea className="max-h-[200px]">
                <div className="space-y-3">
                  {alerts.warrantyExpiring.map((asset) => {
                    const expiryDate = asset.warrantyExpiration
                      ? new Date(asset.warrantyExpiration)
                      : null;
                    const daysUntilExpiry = expiryDate
                      ? Math.ceil((expiryDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
                      : 0;

                    return (
                      <div
                        key={asset._id}
                        className="flex items-start gap-3 p-3 rounded-lg bg-white border border-amber-200"
                      >
                        <div className="flex-shrink-0 mt-0.5">
                          <ShieldCheck className="h-5 w-5 text-amber-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {asset.name}
                          </p>
                          <p className="text-xs text-gray-500 mt-0.5 font-mono">{asset.assetId}</p>
                          <p className="text-xs font-medium text-amber-700 mt-1">
                            Expires in {daysUntilExpiry} day{daysUntilExpiry !== 1 ? 's' : ''} •{' '}
                            {formatDate(asset.warrantyExpiration!)}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </ScrollArea>
            </Card>
          )}

          {/* Long in Repair Alerts */}
          {alerts.longInRepair.length > 0 && (
            <Card
              title="Extended Repair Status"
              description={`${alerts.longInRepair.length} asset${alerts.longInRepair.length > 1 ? 's' : ''} in repair for 60+ days`}
              className="border-l-4 border-l-orange-500 bg-orange-50/20"
            >
              <ScrollArea className="max-h-[200px]">
                <div className="space-y-3">
                  {alerts.longInRepair.map((asset) => {
                    const daysInRepair = Math.ceil(
                      (new Date().getTime() - new Date(asset.updatedAt).getTime()) /
                        (1000 * 60 * 60 * 24)
                    );

                    return (
                      <div
                        key={asset._id}
                        className="flex items-start gap-3 p-3 rounded-lg bg-white border border-orange-200"
                      >
                        <div className="flex-shrink-0 mt-0.5">
                          <Wrench className="h-5 w-5 text-orange-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {asset.name}
                          </p>
                          <p className="text-xs text-gray-500 mt-0.5 font-mono">{asset.assetId}</p>
                          <p className="text-xs font-medium text-orange-700 mt-1">
                            In repair for {daysInRepair} day{daysInRepair !== 1 ? 's' : ''}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </ScrollArea>
            </Card>
          )}

          {/* No Alerts State */}
          {!hasAlerts && (
            <Card className="border-l-4 border-l-gray-300 bg-gray-50/30">
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <CheckCircle className="h-10 w-10 text-gray-400 mb-3" />
                <p className="text-sm font-medium text-gray-600">All Clear</p>
                <p className="text-xs text-gray-500 mt-1">
                  No immediate attention required
                </p>
              </div>
            </Card>
          )}

          {/* Quick Stats Card */}
          <Card title="Quick Stats" className="mt-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between py-2 border-b border-gray-100">
                <span className="text-sm text-gray-600">Active Employees</span>
                <span className="text-lg font-semibold text-gray-900">{stats.totalEmployees}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-gray-100">
                <span className="text-sm text-gray-600">Active Assignments</span>
                <span className="text-lg font-semibold text-gray-900">
                  {stats.activeAssignments}
                </span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-sm text-gray-600">Retired Assets</span>
                <span className="text-lg font-semibold text-gray-900">
                  {stats.totalAssets -
                    stats.availableAssets -
                    stats.assignedAssets -
                    (stats.assetsInRepair ?? 0)}
                </span>
              </div>
            </div>
          </Card>
        </section>
      </div>
    </div>
  );
};
