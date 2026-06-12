import React from 'react';
import { Standing } from '@/types';
import { cn } from '@/lib/utils';
import { theme } from '@/styles/theme';

interface ParticipantCardProps extends React.HTMLAttributes<HTMLDivElement> {
  standing: Standing;
}

export function ParticipantCard({ standing, className, ...props }: ParticipantCardProps) {
  const isTop3 = standing.rankPosition <= 3;
  
  return (
    <div 
      className={cn(
        'border border-[#111111] bg-white flex flex-row items-center p-4 sm:px-6 transition-colors hover:bg-[#E8E2D6]',
        isTop3 ? 'border-l-[8px] border-l-[#B8860B]' : 'border-l-[8px] border-l-[#111111]',
        className
      )}
      {...props}
    >
      <div className={cn(
        "w-10 sm:w-16 text-center text-2xl sm:text-3xl font-bold shrink-0", 
        theme.typography.numbers,
        isTop3 ? theme.colors.text.gold : theme.colors.text.primary
      )}>
        #{standing.rankPosition}
      </div>
      
      <div className="flex-1 px-3 sm:px-4 min-w-0">
        <h4 className="text-base sm:text-lg font-bold uppercase tracking-wide truncate text-[#111111]">
          {standing.user?.displayName || `User ${standing.userId}`}
        </h4>
        <div className="flex flex-col sm:flex-row sm:gap-4 text-xs font-bold text-[#111111] opacity-75 uppercase tracking-wider mt-1">
          <span>Exactos: {standing.exactResults}</span>
          <span className="hidden sm:inline">•</span>
          <span>Tendencias: {standing.tendencies}</span>
        </div>
      </div>

      <div className="text-right shrink-0">
        <span className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-[#111111] opacity-75 block">
          Puntos
        </span>
        <span className={cn("text-2xl sm:text-4xl font-bold text-[#111111]", theme.typography.numbers)}>
          {standing.totalPoints}
        </span>
      </div>
    </div>
  );
}
