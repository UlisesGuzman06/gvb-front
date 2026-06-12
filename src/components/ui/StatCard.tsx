import React from 'react';
import { cn } from '@/lib/utils';
import { theme } from '@/styles/theme';

interface StatCardProps extends React.HTMLAttributes<HTMLDivElement> {
  label: string;
  value: string | number;
  highlight?: boolean;
}

export function StatCard({ label, value, highlight = false, className, ...props }: StatCardProps) {
  return (
    <div 
      className={cn(
        theme.layout.card,
        'flex flex-col items-center justify-center text-center',
        highlight ? theme.colors.background.darker : 'bg-white',
        className
      )}
      {...props}
    >
      <span 
        className={cn(
          'text-sm uppercase tracking-wider mb-2 font-bold',
          highlight ? theme.colors.text.light : theme.colors.text.secondary
        )}
      >
        {label}
      </span>
      <span 
        className={cn(
          'text-5xl md:text-6xl font-bold',
          theme.typography.numbers,
          highlight ? theme.colors.text.gold : theme.colors.text.primary
        )}
      >
        {value}
      </span>
    </div>
  );
}
