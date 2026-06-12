import React from 'react';
import { cn } from '@/lib/utils';
import { theme } from '@/styles/theme';

interface SectionTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {
  children: React.ReactNode;
  subtitle?: string;
  dark?: boolean;
}

export function SectionTitle({ children, subtitle, dark = false, className, ...props }: SectionTitleProps) {
  return (
    <div className={cn('mb-10 flex flex-col', className)}>
      <h2 
        className={cn(
          'text-4xl md:text-5xl uppercase text-balance',
          theme.typography.heading,
          dark ? 'text-white' : theme.colors.text.primary
        )}
        {...props}
      >
        {children}
      </h2>
      {subtitle && (
        <p className={cn('mt-2 text-lg uppercase font-medium tracking-wide', dark ? 'text-[#B8860B]' : theme.colors.text.secondary)}>
          {subtitle}
        </p>
      )}
    </div>
  );
}
