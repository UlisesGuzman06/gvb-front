import React from 'react';
import { cn } from '@/lib/utils';
import { theme } from '@/styles/theme';

export function MatchCardSkeleton() {
  return (
    <div className={cn(theme.layout.card, "animate-pulse flex flex-col")}>
      <div className="flex justify-between items-center mb-4 border-b border-[#111111] pb-2 opacity-50">
        <div className="h-4 bg-[#E8E2D6] w-16"></div>
        <div className="h-6 bg-[#111111] w-32"></div>
      </div>
      <div className="flex flex-col sm:flex-row justify-between items-center flex-1 gap-4 sm:gap-0">
        <div className="flex items-center gap-3 w-full sm:w-auto justify-start sm:justify-center">
          <div className="w-10 h-10 bg-[#E8E2D6] border border-[#111111]"></div>
          <div className="h-6 bg-[#E8E2D6] w-24"></div>
        </div>
        <div className="h-10 bg-[#111111] w-20 py-2 sm:py-0 opacity-10"></div>
        <div className="flex items-center gap-3 w-full sm:w-auto justify-end sm:justify-center">
          <div className="h-6 bg-[#E8E2D6] w-24"></div>
          <div className="w-10 h-10 bg-[#E8E2D6] border border-[#111111]"></div>
        </div>
      </div>
    </div>
  );
}

export function ParticipantCardSkeleton() {
  return (
    <div className="border border-[#111111] border-l-[8px] border-l-[#E8E2D6] bg-white flex flex-row items-center p-4 sm:px-6 animate-pulse">
      <div className="w-10 sm:w-16 h-8 bg-[#E8E2D6] shrink-0"></div>
      <div className="flex-1 px-3 sm:px-4 min-w-0 flex flex-col gap-2">
        <div className="h-6 bg-[#E8E2D6] w-1/3"></div>
        <div className="h-4 bg-[#E8E2D6] w-1/2 opacity-50"></div>
      </div>
      <div className="text-right shrink-0 flex flex-col items-end gap-1">
        <div className="h-3 bg-[#E8E2D6] w-12 opacity-50"></div>
        <div className="h-8 bg-[#111111] w-16 opacity-10"></div>
      </div>
    </div>
  );
}
