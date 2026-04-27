import { ReactNode } from 'react';
import { cn } from './utils';

interface PageShellProps {
  children: ReactNode;
  className?: string;
  maxWidth?: 'default' | 'narrow';
}

/** Consistent page-level wrapper: padding + max-width + centering */
export function PageShell({ children, className, maxWidth = 'default' }: PageShellProps) {
  return (
    <div
      className={cn(
        'p-4 sm:p-6 mx-auto',
        maxWidth === 'narrow' ? 'max-w-[1200px]' : 'max-w-[1400px]',
        className,
      )}
    >
      {children}
    </div>
  );
}

interface PageHeaderProps {
  title: string;
  description?: string;
  children?: ReactNode;
}

/** Consistent page header row: title + description + right-side actions */
export function PageHeader({ title, description, children }: PageHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
      <div>
        <h1 className="text-foreground">{title}</h1>
        {description && (
          <p className="text-muted-foreground text-sm mt-0.5">{description}</p>
        )}
      </div>
      {children && (
        <div className="flex items-center gap-2 flex-wrap self-start sm:self-auto">
          {children}
        </div>
      )}
    </div>
  );
}

/** Consistent filter/toolbar bar inside a Card */
export function FilterBar({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        'bg-card rounded-xl border elevation-1 p-4 mb-4 flex flex-col sm:flex-row gap-3 items-start sm:items-center flex-wrap',
        className,
      )}
    >
      {children}
    </div>
  );
}
