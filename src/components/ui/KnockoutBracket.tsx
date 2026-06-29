'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

interface BracketNode {
  matchNum: number;
  child1?: BracketNode;
  child2?: BracketNode;
}

// Complete 16-match single World Cup binary tree structure
const bracketTree: BracketNode = {
  matchNum: 104, // Final
  child1: {
    matchNum: 101, // Semifinal 1
    child1: {
      matchNum: 97, // Cuartos 1
      child1: {
        matchNum: 89, // Octavos 1
        child1: { matchNum: 74 }, // 16avos
        child2: { matchNum: 77 }  // 16avos
      },
      child2: {
        matchNum: 90, // Octavos 2
        child1: { matchNum: 73 }, // 16avos
        child2: { matchNum: 75 }  // 16avos
      }
    },
    child2: {
      matchNum: 98, // Cuartos 2
      child1: {
        matchNum: 93, // Octavos 5
        child1: { matchNum: 83 }, // 16avos
        child2: { matchNum: 84 }  // 16avos
      },
      child2: {
        matchNum: 94, // Octavos 6
        child1: { matchNum: 81 }, // 16avos
        child2: { matchNum: 82 }  // 16avos
      }
    }
  },
  child2: {
    matchNum: 102, // Semifinal 2
    child1: {
      matchNum: 99, // Cuartos 3
      child1: {
        matchNum: 91, // Octavos 3
        child1: { matchNum: 76 }, // 16avos
        child2: { matchNum: 78 }  // 16avos
      },
      child2: {
        matchNum: 92, // Octavos 4
        child1: { matchNum: 79 }, // 16avos
        child2: { matchNum: 80 }  // 16avos
      }
    },
    child2: {
      matchNum: 100, // Cuartos 4
      child1: {
        matchNum: 95, // Octavos 7
        child1: { matchNum: 86 }, // 16avos
        child2: { matchNum: 88 }  // 16avos
      },
      child2: {
        matchNum: 96, // Octavos 8
        child1: { matchNum: 85 }, // 16avos
        child2: { matchNum: 87 }  // 16avos
      }
    }
  }
};

interface KnockoutBracketProps {
  matchesMap: Map<number, any>;
  isLoading: boolean;
}

export function KnockoutBracket({ matchesMap, isLoading }: KnockoutBracketProps) {
  if (isLoading) {
    return (
      <div className="text-center py-12 bg-white border border-[#111111] shadow-[4px_4px_0px_0px_rgba(17,17,17,1)]">
        <Loader2 className="animate-spin h-6 w-6 text-[#B8860B] mx-auto mb-2" />
        <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">Cargando cuadro...</p>
      </div>
    );
  }

  return (
    <div className="w-full bg-white border border-[#111111] p-5 shadow-[4px_4px_0px_0px_rgba(17,17,17,1)] select-none overflow-x-auto scrollbar-thin">
      {/* Column Headers */}
      <div className="flex gap-10 mb-6 min-w-[1060px] font-mono text-[10px] font-bold text-white">
        <div className="w-[180px] bg-[#111111] text-center py-1.5 border border-[#111111]">16avos de Final</div>
        <div className="w-[180px] bg-[#111111] text-center py-1.5 border border-[#111111]">Octavos de Final</div>
        <div className="w-[180px] bg-[#111111] text-center py-1.5 border border-[#111111]">Cuartos de Final</div>
        <div className="w-[180px] bg-[#111111] text-center py-1.5 border border-[#111111]">Semifinales</div>
        <div className="w-[180px] bg-[#B8860B] text-[#111111] text-center py-1.5 border border-[#111111]">Final / Tercer Puesto</div>
      </div>

      {/* Bracket Tree Container (Unified Single Tree, 750px height) */}
      <div className="min-w-[1060px] flex items-center py-2 min-h-[750px]">
        <BracketBranch node={bracketTree} matchesMap={matchesMap} depth={0} />
      </div>
    </div>
  );
}

interface BracketBranchProps {
  node: BracketNode;
  matchesMap: Map<number, any>;
  depth: number;
}

function BracketBranch({ node, matchesMap, depth }: BracketBranchProps) {
  const hasChildren = node.child1 && node.child2;

  // Leaf node (16avos)
  if (!hasChildren) {
    return (
      <div className="my-1.5 py-0.5 shrink-0">
        <BracketMatchCard matchNum={node.matchNum} matchesMap={matchesMap} />
      </div>
    );
  }

  // Root node (Final & Tercer Puesto)
  if (depth === 0) {
    return (
      <div className="flex items-center h-full relative shrink-0">
        {/* Left children (Semifinal 1 & 2) */}
        <div className="flex flex-col justify-center relative pr-10 h-full min-h-[720px]">
          {node.child1 && <BracketBranch node={node.child1} matchesMap={matchesMap} depth={depth + 1} />}
          {node.child2 && <BracketBranch node={node.child2} matchesMap={matchesMap} depth={depth + 1} />}

          {/* Connectors for Final (Gray, straight corners) */}
          <div className="absolute right-0 top-0 bottom-0 w-10 flex items-center pointer-events-none">
            <div className="absolute right-0 w-5 h-0 border-t border-gray-300"></div>
            <div className="absolute right-5 top-[25%] bottom-[25%] w-0 border-r border-gray-300"></div>
            <div className="absolute right-5 top-[25%] w-5 h-0 border-t border-gray-300"></div>
            <div className="absolute right-5 bottom-[25%] w-5 h-0 border-t border-gray-300"></div>
          </div>
        </div>

        {/* Right side: Final (centered) and Tercer Puesto (bottom) */}
        <div className="relative h-full flex flex-col justify-center min-h-[720px] w-[180px]">
          {/* Final Match Card */}
          <div className="my-auto">
            <BracketMatchCard matchNum={node.matchNum} matchesMap={matchesMap} />
          </div>

          {/* Tercer Puesto Match Card */}
          <div className="absolute bottom-4 left-0 right-0 border-t border-[#E0DBCF] pt-4">
            <span className="block text-center text-[9px] font-bold text-[#555555] uppercase tracking-wider mb-2 font-mono">Tercer Puesto</span>
            <BracketMatchCard matchNum={103} matchesMap={matchesMap} />
          </div>
        </div>
      </div>
    );
  }

  // Intermediate node (Octavos, Cuartos, Semifinales)
  return (
    <div className="flex items-center h-full relative shrink-0">
      {/* Left children */}
      <div className="flex flex-col justify-center relative pr-10 h-full">
        {node.child1 && <BracketBranch node={node.child1} matchesMap={matchesMap} depth={depth + 1} />}
        {node.child2 && <BracketBranch node={node.child2} matchesMap={matchesMap} depth={depth + 1} />}

        {/* Connectors (Gray, straight corners) */}
        <div className="absolute right-0 top-0 bottom-0 w-10 flex items-center pointer-events-none">
          {/* Horizontal line to parent */}
          <div className="absolute right-0 w-5 h-0 border-t border-gray-300"></div>
          {/* Vertical line connecting the two children */}
          <div className="absolute right-5 top-[25%] bottom-[25%] w-0 border-r border-gray-300"></div>
          {/* Horizontal line from top child */}
          <div className="absolute right-5 top-[25%] w-5 h-0 border-t border-gray-300"></div>
          {/* Horizontal line from bottom child */}
          <div className="absolute right-5 bottom-[25%] w-5 h-0 border-t border-gray-300"></div>
        </div>
      </div>

      {/* Right parent card */}
      <div className="relative">
        <BracketMatchCard matchNum={node.matchNum} matchesMap={matchesMap} />
      </div>
    </div>
  );
}

// Sub-component for rendering a match card in the knockout bracket
function BracketMatchCard({ matchNum, matchesMap }: { matchNum: number; matchesMap: Map<number, any> }) {
  // Support both number and string keys in matchesMap lookup for robustness
  const match = matchesMap.get(matchNum) || (matchesMap as Map<any, any>).get(String(matchNum));
  const cardWidth = "w-[180px]";

  // Placeholder card when match is not in DB or map yet
  if (!match) {
    return (
      <div className={cn(cardWidth, "bg-white border border-[#111111] shadow-[2px_2px_0px_0px_rgba(17,17,17,1)] overflow-hidden shrink-0 flex flex-col font-inter")}>
        <div className="flex items-center gap-2 px-2.5 py-2 text-[10px] font-bold text-gray-500 border-b border-[#E0DBCF]">
          <div className="w-5 h-5 bg-[#F4F1EA] border border-[#CCCCCC] flex items-center justify-center text-[9px] text-gray-400 shrink-0 rounded-full">⚽</div>
          <span className="truncate">Equipo</span>
        </div>
        <div className="flex items-center gap-2 px-2.5 py-2 text-[10px] font-bold text-gray-500">
          <div className="w-5 h-5 bg-[#F4F1EA] border border-[#CCCCCC] flex items-center justify-center text-[9px] text-gray-400 shrink-0 rounded-full">⚽</div>
          <span className="truncate">Equipo</span>
        </div>
      </div>
    );
  }

  const isFinished = match.status === 'FINISHED';

  const formatName = (name: string, isHome: boolean) => {
    if (!name) return `Ganador P.${matchNum}`;
    if (/^[WL]\d+$/.test(name)) {
      const type = name.startsWith('W') ? 'Ganador' : 'Perdedor';
      const num = name.substring(1);
      return `${type} P.${num}`;
    }
    return name;
  };

  const homeName = formatName(match.home?.name || match.homeTeam, true);
  const awayName = formatName(match.away?.name || match.awayTeam, false);

  const isPlaceholderHome = !match.home?.name || /^[WL]\d+$/.test(match.home?.name);
  const isPlaceholderAway = !match.away?.name || /^[WL]\d+$/.test(match.away?.name);

  const homeLogo = isPlaceholderHome ? null : match.home?.logo;
  const awayLogo = isPlaceholderAway ? null : match.away?.logo;

  const isHomeWinner = isFinished && match.homeScore !== null && match.awayScore !== null && match.homeScore > match.awayScore;
  const isAwayWinner = isFinished && match.homeScore !== null && match.awayScore !== null && match.awayScore > match.homeScore;

  return (
    <div className={cn(cardWidth, "bg-white border border-[#111111] shadow-[2px_2px_0px_0px_rgba(17,17,17,1)] overflow-hidden shrink-0 flex flex-col font-inter")}>
      {/* Home row */}
      <div className={cn(
        "flex items-center justify-between px-2.5 py-2 text-[10px] sm:text-[11px] font-bold transition-all border-b border-[#E0DBCF]",
        isHomeWinner ? "bg-[#B8860B]/10 text-[#8B6508]" : "text-[#111111]"
      )}>
        <div className="flex items-center gap-2 min-w-0">
          {isPlaceholderHome ? (
            <div className="w-5 h-5 bg-[#F4F1EA] border border-[#CCCCCC] flex items-center justify-center text-[9px] text-gray-500 shrink-0 rounded-full">
              ⚽
            </div>
          ) : (
            <div className="w-5 h-5 bg-[#F4F1EA] border border-[#CCCCCC] flex items-center justify-center overflow-hidden shrink-0">
              {homeLogo ? (
                <img src={homeLogo} alt={homeName} className="w-full h-full object-contain p-0.5" />
              ) : (
                <span className="text-[#111111] font-black text-[8px]">{homeName.substring(0, 3).toUpperCase()}</span>
              )}
            </div>
          )}
          <span className="truncate max-w-[110px] font-black">{homeName}</span>
        </div>
        {match.homeScore !== null && (
          <span className={cn("font-mono text-xs shrink-0", isHomeWinner ? "text-[#8B6508] font-black" : "text-[#555555] font-black")}>
            {match.homeScore}
          </span>
        )}
      </div>

      {/* Away row */}
      <div className={cn(
        "flex items-center justify-between px-2.5 py-2 text-[10px] sm:text-[11px] font-bold transition-all",
        isAwayWinner ? "bg-[#B8860B]/10 text-[#8B6508]" : "text-[#111111]"
      )}>
        <div className="flex items-center gap-2 min-w-0">
          {isPlaceholderAway ? (
            <div className="w-5 h-5 bg-[#F4F1EA] border border-[#CCCCCC] flex items-center justify-center text-[9px] text-gray-500 shrink-0 rounded-full">
              ⚽
            </div>
          ) : (
            <div className="w-5 h-5 bg-[#F4F1EA] border border-[#CCCCCC] flex items-center justify-center overflow-hidden shrink-0">
              {awayLogo ? (
                <img src={awayLogo} alt={awayName} className="w-full h-full object-contain p-0.5" />
              ) : (
                <span className="text-[#111111] font-black text-[8px]">{awayName.substring(0, 3).toUpperCase()}</span>
              )}
            </div>
          )}
          <span className="truncate max-w-[110px] font-black">{awayName}</span>
        </div>
        {match.awayScore !== null && (
          <span className={cn("font-mono text-xs shrink-0", isAwayWinner ? "text-[#8B6508] font-black" : "text-[#555555] font-black")}>
            {match.awayScore}
          </span>
        )}
      </div>
    </div>
  );
}
