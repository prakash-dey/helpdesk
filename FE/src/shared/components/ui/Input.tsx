import type { InputHTMLAttributes } from 'react';
import { cn } from '@/shared/lib/cn';

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  error?: string;
};

export function Input({ label, error, id, className, ...props }: InputProps) {
  return (
    <div className="space-y-1.5">
      {label ? (
        <label htmlFor={id} className="block text-sm font-medium text-slate-700">
          {label}
        </label>
      ) : null}

      <input
        id={id}
        className={cn(
          'h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-900',
          'placeholder:text-slate-400',
          'focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-100',
          'disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500',
          error && 'border-red-500 focus:border-red-500 focus:ring-red-100',
          className,
        )}
        {...props}
      />

      {error ? <p className="text-sm text-red-600">{error}</p> : null}
    </div>
  );
}