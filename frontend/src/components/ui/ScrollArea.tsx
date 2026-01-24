import React from 'react';
import { clsx } from 'clsx';

interface ScrollAreaProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export const ScrollArea: React.FC<ScrollAreaProps> = ({
  children,
  className,
  ...props
}) => {
  return (
    <div
      className={clsx('overflow-auto', className)}
      {...props}
    >
      {children}
    </div>
  );
};

