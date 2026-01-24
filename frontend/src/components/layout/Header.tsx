import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from '../ui/Button';
import { Bell } from 'lucide-react';
import { Avatar } from '../ui/Avatar';
import { DropdownMenu } from '../ui/DropdownMenu';
import { useAuth } from '../../context/AuthContext';
import { getProfileImageUrl } from '../../utils/profileImage';

export const Header: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const getPageTitle = () => {
    if (location.pathname.startsWith('/assets/') && location.pathname !== '/assets') {
      return 'Asset Details';
    }
    if (location.pathname.startsWith('/employees/') && location.pathname !== '/employees') {
      return 'Employee Profile';
    }
    switch (location.pathname) {
      case '/': return 'Dashboard';
      case '/employees': return 'Employees';
      case '/assets': return 'Asset Inventory';
      case '/assignments': return 'Assignments';
      case '/reports': return 'Reports';
      case '/settings': return 'Settings';
      default: return 'Asset Management';
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-gray-200 bg-white/80 backdrop-blur-md">
      <div className="flex h-16 items-center justify-between px-6">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-semibold text-gray-900">{getPageTitle()}</h1>
        </div>

        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" className="relative text-gray-500">
            <Bell className="h-5 w-5" />
            <span className="absolute top-2.5 right-2.5 h-2 w-2 rounded-full bg-red-500 border-2 border-white"></span>
          </Button>

          {user && (
            <DropdownMenu
              align="right"
              trigger={
                <button className="flex items-center gap-2 rounded-full px-2 py-1 hover:bg-gray-50 transition-colors">
                  <Avatar
                    name={user.name || user.email}
                    src={
                      user.profileImage
                        ? `${getProfileImageUrl(user.profileImage)}${getProfileImageUrl(user.profileImage).includes('?') ? '&' : '?'}t=${Date.now()}`
                        : ''
                    }
                    size="sm"
                  />
                  <span className="hidden sm:inline text-sm font-medium text-gray-700">
                    {user.name || user.email}
                  </span>
                </button>
              }
              items={[
                { label: 'Settings', onClick: () => navigate('/settings') },
                { label: 'Logout', onClick: () => logout(), variant: 'danger' },
              ]}
            />
          )}
        </div>
      </div>
    </header>
  );
};
