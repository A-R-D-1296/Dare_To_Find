import React from 'react';
import { cn } from '../../utils/cn';

export const EmptyState = ({ icon: Icon, title, subtitle, action, className }) => {
  return (
    <div className={cn("flex flex-col items-center justify-center p-8 text-center text-[var(--text-muted)]", className)}>
      {Icon && (
        <div className="w-16 h-16 rounded-full bg-[var(--border-color)] flex items-center justify-center mb-6">
          <Icon className="w-8 h-8 text-[var(--color-brand-accent)]" />
        </div>
      )}
      <h3 className="text-xl font-bold font-serif mb-2 text-[var(--text-base)]">{title}</h3>
      {subtitle && <p className="max-w-md mx-auto mb-6 opacity-80">{subtitle}</p>}
      {action && <div>{action}</div>}
    </div>
  );
};
