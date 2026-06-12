import React from 'react';
import { cn } from '@/lib/utils';
import { theme } from '@/styles/theme';

interface EmptyStateProps {
  title: string;
  description: string;
  className?: string;
}

export function EmptyState({ title, description, className }: EmptyStateProps) {
  return (
    <div className={cn(
      "w-full bg-[#E8E2D6] border-2 border-dashed border-[#111111] p-12 text-center flex flex-col items-center justify-center",
      className
    )}>
      <h3 className={cn("text-2xl uppercase font-bold tracking-widest mb-2", theme.typography.heading)}>
        {title}
      </h3>
      <p className="opacity-80 font-medium max-w-md">
        {description}
      </p>
    </div>
  );
}
