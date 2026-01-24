import React from 'react';
import { cn } from '../../utils/cn';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  description?: string;
}

export const Card: React.FC<CardProps> = ({ children, title, description, className, ...props }) => {
  return (
    <div
      className={cn(
        'rounded-lg border border-gray-200 bg-white text-gray-950 shadow-sm',
        className
      )}
      {...props}
    >
      {(title || description) && (
        <div className="flex flex-col space-y-1.5 p-6 pb-2">
          {title && <h3 className="font-semibold leading-none tracking-tight">{title}</h3>}
          {description && <p className="text-sm text-gray-500">{description}</p>}
        </div>
      )}
      <div className={cn("p-6", (title || description) && "pt-2")}>
        {children}
      </div>
    </div>
  );
};
