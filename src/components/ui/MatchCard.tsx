import React from 'react';
import { Fixture, LiveScore } from '@/types/worldcup';
import { cn } from '@/lib/utils';
import { theme } from '@/styles/theme';

interface MatchCardProps extends React.HTMLAttributes<HTMLDivElement> {
  fixture: Fixture;
  liveData?: LiveScore;
}

export function MatchCard({ fixture, liveData, className, ...props }: MatchCardProps) {
  // Use live data score if available, otherwise check if fixture has score info
  const isLive = !!liveData && ['IN PLAY', 'HT', '1H', '2H', 'ET', 'PEN'].includes(liveData.status);
  const isFinished = liveData?.status === 'FINISHED' || (fixture as any).status === 'FINISHED';
  
  const score = liveData?.scores?.score 
    || (fixture as any).scores?.score 
    || null;

  // Team Details
  const homeTeamName = fixture.home.name || 'Información no disponible';
  const awayTeamName = fixture.away.name || 'Información no disponible';
  const homeLogo = fixture.home.logo;
  const awayLogo = fixture.away.logo;

  // Format time to Argentina timezone (UTC-3 / America/Argentina/Buenos_Aires)
  let formattedTime = 'TBD';
  if (fixture.date && fixture.time) {
    try {
      const utcDate = new Date(`${fixture.date}T${fixture.time.substring(0, 8)}Z`);
      formattedTime = utcDate.toLocaleTimeString('es-AR', {
        timeZone: 'America/Argentina/Buenos_Aires',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      }) + ' hs';
    } catch (e) {
      formattedTime = fixture.time.substring(0, 5) + ' hs';
    }
  }
  
  // Status string
  let statusText = formattedTime;
  if (isLive && liveData) {
    statusText = `EN VIVO ${liveData.time}'`;
  } else if (isFinished) {
    statusText = 'FINAL';
  }

  const teamAbbrev = (name: string) => {
    return name.substring(0, 3).toUpperCase();
  };

  return (
    <div 
      className={cn(
        "border border-[#111111] bg-[#1A1A1A] text-white p-4 shadow-[4px_4px_0px_0px_rgba(17,17,17,1)] transition-all hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[2px_2px_0px_0px_rgba(17,17,17,1)]",
        "flex flex-col gap-2",
        isLive && "border-[#B8860B]",
        className
      )}
      {...props}
    >
      {/* Main Row */}
      <div className="flex items-center justify-between gap-4">
        {/* Home Team */}
        <div className="flex-1 flex items-center gap-3 justify-start min-w-0">
          <div className="w-8 h-8 bg-[#111111] border border-[#333333] flex items-center justify-center text-xs font-bold text-[#F4F1EA] shadow-[1px_1px_0px_0px_#B8860B] overflow-hidden shrink-0">
            {homeLogo ? (
              <img src={homeLogo} alt={homeTeamName} className="w-full h-full object-contain p-0.5" />
            ) : (
              teamAbbrev(homeTeamName)
            )}
          </div>
          <span className="text-sm md:text-base font-bold uppercase tracking-wide truncate text-white">
            {homeTeamName}
          </span>
        </div>

        {/* Center Score / VS Column */}
        <div className="w-24 flex flex-col items-center justify-center text-center shrink-0">
          {score ? (
            <span className={cn("text-lg md:text-xl font-bold tracking-wider text-[#F4F1EA]", theme.typography.numbers)}>
              {score}
            </span>
          ) : (
            <span className="text-xs font-bold bg-[#B8860B] text-[#111111] px-2 py-0.5 uppercase tracking-widest">
              VS
            </span>
          )}
          
          <span className={cn(
            "text-[10px] font-bold uppercase tracking-wider mt-1",
            isLive ? "text-red-500 animate-pulse" : "text-[#B8860B]"
          )}>
            {statusText}
          </span>
        </div>

        {/* Away Team */}
        <div className="flex-1 flex items-center gap-3 justify-end text-right min-w-0">
          <span className="text-sm md:text-base font-bold uppercase tracking-wide truncate text-white">
            {awayTeamName}
          </span>
          <div className="w-8 h-8 bg-[#111111] border border-[#333333] flex items-center justify-center text-xs font-bold text-[#F4F1EA] shadow-[1px_1px_0px_0px_#B8860B] overflow-hidden shrink-0">
            {awayLogo ? (
              <img src={awayLogo} alt={awayTeamName} className="w-full h-full object-contain p-0.5" />
            ) : (
              teamAbbrev(awayTeamName)
            )}
          </div>
        </div>
      </div>

      {/* Sub Info Row */}
      <div className="text-[10px] opacity-60 flex justify-between mt-1 pt-2 border-t border-[#2A2A2A] text-gray-400">
        <span className="truncate max-w-[60%]">
          {fixture.location || 'Información no disponible'}
        </span>
        <span className="font-semibold uppercase tracking-wider text-[#B8860B] shrink-0">
          {fixture.round ? `Ronda ${fixture.round}` : 'Mundial 2026'}
        </span>
      </div>
    </div>
  );
}
