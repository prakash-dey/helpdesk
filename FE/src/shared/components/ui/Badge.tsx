import type { HTMLAttributes } from 'react';
import { cn } from '@/shared/lib/cn';

type BadgeVariant = 'default' | 'success' | 'warning' | 'danger' | 'info';

type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  variant?: BadgeVariant;
};

const variantClasses: Record<BadgeVariant, string> = {
  default: 'bg-slate-100 text-slate-700',
  success: 'bg-emerald-50 text-emerald-700',
  warning: 'bg-amber-50 text-amber-700',
  danger: 'bg-red-50 text-red-700',
  info: 'bg-blue-50 text-blue-700',
};

export function Badge({
  className,
  variant = 'default',
  ...props
}: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex h-6 items-center rounded-md px-2 text-xs font-medium',
        variantClasses[variant],
        className,
      )}
      {...props}
    />
  );
}