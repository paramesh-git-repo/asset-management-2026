import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { cn } from '../../utils/cn';
import { LayoutDashboard, Users, Package, Settings, LogOut, ClipboardList, BarChart3 } from 'lucide-react';
import { Avatar } from '../ui/Avatar';
import { getProfileImageUrl } from '../../utils/profileImage';

interface NavItem {
  label: string;
  path: string;
  icon: React.ElementType;
  roles?: string[];
}

const navItems: NavItem[] = [
  { label: 'Dashboard', path: '/', icon: LayoutDashboard, roles: ['Admin', 'Manager', 'Employee'] },
  { label: 'Employees', path: '/employees', icon: Users, roles: ['Admin', 'Manager'] },
  { label: 'Assets', path: '/assets', icon: Package, roles: ['Admin', 'Manager', 'Employee'] },
  { label: 'Assignments', path: '/assignments', icon: ClipboardList, roles: ['Admin', 'Manager'] },
  { label: 'Reports', path: '/reports', icon: BarChart3, roles: ['Admin', 'Manager'] },
  { label: 'Settings', path: '/settings', icon: Settings, roles: ['Admin', 'Manager', 'Employee'] },
];

export const Sidebar: React.FC = () => {
  const location = useLocation();
  const { user, logout } = useAuth();

  const filteredNavItems = navItems.filter((item) => {
    if (!item.roles) return true;
    return user && item.roles.includes(user.role);
  });

  return (
    <aside className="group flex flex-col w-64 border-r border-gray-200 bg-white shadow-sm transition-all duration-300">
      <div className="flex h-16 items-center border-b px-6">
        <div className="flex items-center gap-2 font-bold text-xl text-primary-600">
          <Package className="h-6 w-6" />
          <span>AssetMgr</span>
        </div>
      </div>

      <nav className="flex-1 space-y-1 p-4">
        {filteredNavItems.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                'flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200',
                isActive
                  ? 'bg-primary-50 text-primary-700 shadow-sm ring-1 ring-primary-100'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              )}
            >
              <Icon className={cn("h-5 w-5", isActive ? "text-primary-600" : "text-gray-500 group-hover:text-gray-700")} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {user && (
        <div className="border-t border-gray-100 p-4">
          <div className="flex items-center gap-3 rounded-lg border border-gray-100 bg-gray-50/50 p-3">
            <Avatar
              name={user.name || user.email}
              src={
                user.profileImage
                  ? `${getProfileImageUrl(user.profileImage)}${getProfileImageUrl(user.profileImage).includes('?') ? '&' : '?'}t=${Date.now()}`
                  : ''
              }
              size="sm"
            />
            <div className="flex-1 overflow-hidden">
              <p className="truncate text-sm font-medium text-gray-900">{user.name || user.email}</p>
              <p className="truncate text-xs text-gray-500">{user.role}</p>
            </div>
            <button
              onClick={() => {
                if (window.confirm('Are you sure you want to logout?')) {
                  logout();
                }
              }}
              className="text-gray-400 hover:text-red-600 transition-colors p-1"
              title="Logout"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </aside>
  );
};
