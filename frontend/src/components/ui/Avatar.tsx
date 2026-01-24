import React from 'react';
import { clsx } from 'clsx';

interface AvatarProps {
  name: string;
  src?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const getInitials = (name: string): string => {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

const getSizeClasses = (size: 'sm' | 'md' | 'lg') => {
  switch (size) {
    case 'sm':
      return 'h-8 w-8 text-xs';
    case 'md':
      return 'h-10 w-10 text-sm';
    case 'lg':
      return 'h-12 w-12 text-base';
    default:
      return 'h-10 w-10 text-sm';
  }
};

export const Avatar: React.FC<AvatarProps> = ({
  name,
  src,
  size = 'md',
  className,
}) => {
  return (
    <div
      className={clsx(
        'flex items-center justify-center rounded-full bg-blue-600 text-white font-medium',
        getSizeClasses(size),
        className
      )}
    >
      {src ? (
        <img src={src} alt={name} className="h-full w-full rounded-full object-cover" />
      ) : (
        getInitials(name)
      )}
    </div>
  );
};

