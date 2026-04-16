import React from 'react';
import { cn } from '../../utils/cn';

export const Spinner = ({ className, size = 'md' }) => {
  const sizeClasses = {
    sm: 'w-4 h-4 border-2',
    md: 'w-8 h-8 border-3',
    lg: 'w-12 h-12 border-4',
  };

  return (
    <div
      className={cn(
        "rounded-full border-[var(--border-color)] border-t-[var(--color-brand-accent)] animate-spin",
        sizeClasses[size],
        className
      )}
    />
  );
};
