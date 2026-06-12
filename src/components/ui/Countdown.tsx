'use client';

import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { theme } from '@/styles/theme';

interface CountdownProps extends React.HTMLAttributes<HTMLDivElement> {
  targetDate: string;
}

export function Countdown({ targetDate, className, ...props }: CountdownProps) {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const target = new Date(targetDate).getTime();

    const interval = setInterval(() => {
      const now = new Date().getTime();
      const difference = target - now;

      if (difference <= 0) {
        clearInterval(interval);
        return;
      }

      setTimeLeft({
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((difference % (1000 * 60)) / 1000),
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [targetDate]);

  const displayDays = isMounted ? timeLeft.days : 0;
  const displayHours = isMounted ? timeLeft.hours : 0;
  const displayMinutes = isMounted ? timeLeft.minutes : 0;
  const displaySeconds = isMounted ? timeLeft.seconds : 0;

  const TimeBlock = ({ label, value }: { label: string, value: number }) => (
    <div className="flex flex-col items-center">
      <div className={cn(
        "bg-[#111111] text-[#F4F1EA] p-3 sm:p-4 w-16 sm:w-24 md:w-32 text-center shadow-[2px_2px_0px_0px_#B8860B] sm:shadow-[4px_4px_0px_0px_#B8860B]",
      )}>
        <span className={cn("text-3xl sm:text-5xl md:text-7xl font-bold", theme.typography.numbers)}>
          {value.toString().padStart(2, '0')}
        </span>
      </div>
      <span className="mt-3 text-[10px] sm:text-sm uppercase font-bold tracking-widest text-[#F4F1EA] opacity-80 sm:text-[#111111] sm:opacity-100">
        {label}
      </span>
    </div>
  );

  return (
    <div className={cn('flex justify-center gap-3 sm:gap-6 md:gap-8', className)} {...props}>
      <TimeBlock label="Días" value={displayDays} />
      <TimeBlock label="Horas" value={displayHours} />
      <TimeBlock label="Min" value={displayMinutes} />
      <TimeBlock label="Seg" value={displaySeconds} />
    </div>
  );
}
