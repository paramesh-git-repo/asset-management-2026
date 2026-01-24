import React from 'react';
import { clsx } from 'clsx';

interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ label, error, className, ...props }, ref) => {
    return (
      <div className="w-full">
        <div className="flex items-center space-x-2">
          <input
            ref={ref}
            type="checkbox"
            className={clsx(
              'h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500',
              error && 'border-red-500',
              className
            )}
            {...props}
          />
          {label && (
            <label className="text-sm font-medium text-gray-700">
              {label}
            </label>
          )}
        </div>
        {error && (
          <p className="mt-1 text-sm text-red-600">{error}</p>
        )}
      </div>
    );
  }
);

Checkbox.displayName = 'Checkbox';

