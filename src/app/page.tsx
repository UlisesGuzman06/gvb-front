'use client';

export const dynamic = 'force-dynamic';

import React, { useState, useEffect } from 'react';
import { SectionTitle } from '@/components/ui/SectionTitle';
import { Countdown } from '@/components/ui/Countdown';
import { MatchCard } from '@/components/ui/MatchCard';
import { EmptyState } from '@/components/ui/EmptyState';
import { MatchCardSkeleton, ParticipantCardSkeleton } from '@/components/ui/Skeletons';

import { useMatches } from '@/hooks/useMatches';
import { useUpcomingMatches } from '@/hooks/useUpcomingMatches';
import { useStandings } from '@/hooks/useStandings';
import { useGoalScorers } from '@/hooks/useGoalScorers';
import { useFootball } from '@/providers/FootballProvider';

import { theme } from '@/styles/theme';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { Fixture } from '@/types/worldcup';

export default function Home() {
  const [selectedGroup, setSelectedGroup] = useState<string>('A');
  const [visibleMatchesCount, setVisibleMatchesCount] = useState<number>(10);
  const [lastUpdated, setLastUpdated] = useState<string>('');

  // Fetch real data from hooks
  const { 
    data: allMatches = [], 
    isLoading: isLoadingAllMatches,
    isError: isErrorAllMatches,
    error: errorAllMatches
  } = useMatches();

  const { 
    data: upcomingMatches = [], 
    isLoading: isLoadingUpcomingMatches,
  } = useUpcomingMatches();

  const { 
    data: standings = [], 
    isLoading: isLoadingStandings,
    isError: isErrorStandings,
    error: errorStandings
  } = useStandings(selectedGroup);

  const {
    data: goalscorers = [],
    isLoading: isLoadingScorers,
    isError: isErrorScorers,
  } = useGoalScorers();

  const { worldCupApi } = useFootball();

  const isLoading = isLoadingAllMatches || isLoadingStandings || isLoadingScorers;
  const isError = isErrorAllMatches || isErrorStandings || isErrorScorers;

  useEffect(() => {
    if (!isLoading) {
      setLastUpdated(new Date().toLocaleTimeString('es-AR') + ' ' + new Date().toLocaleDateString('es-AR'));
    }
  }, [isLoading]);

  // Sort fixtures by date and time
  const sortedMatches = [...allMatches].sort((a, b) => {
    const timeA = new Date(`${a.date}T${a.time}Z`).getTime();
    const timeB = new Date(`${b.date}T${b.time}Z`).getTime();
    return timeA - timeB;
  });

  // Paginated visible matches
  const visibleMatches = sortedMatches.slice(0, visibleMatchesCount);
  const hasMoreMatches = sortedMatches.length > visibleMatchesCount;

  // Helper to format date headers (e.g. "11 JUN 2026")
  const formatDateHeader = (dateStr: string) => {
    try {
      const date = new Date(`${dateStr}T00:00:00Z`);
      const day = date.getUTCDate();
      const month = date.toLocaleDateString('es-AR', { month: 'short', timeZone: 'UTC' }).toUpperCase();
      const year = date.getUTCFullYear();
      return `${day} ${month} ${year}`;
    } catch (e) {
      return dateStr;
    }
  };

  // Group visible matches by date string
  const groupedMatches: Record<string, Fixture[]> = {};
  visibleMatches.forEach(match => {
    const dateKey = match.date || 'Fecha no disponible';
    if (!groupedMatches[dateKey]) {
      groupedMatches[dateKey] = [];
    }
    groupedMatches[dateKey].push(match);
  });

  const uniqueDateKeys = Object.keys(groupedMatches);

  const GROUPS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L'];
  const focusClasses = "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B8860B]";

  return (
    <div className="flex flex-col">
      {/* HERO SECTION */}
      <section className="relative min-h-[70vh] bg-[#0B2545] flex items-center justify-center overflow-hidden border-b-8 border-[#B8860B]">
        <div className="absolute inset-0 opacity-5 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white to-transparent pointer-events-none"></div>
        
        <div className="relative z-10 flex flex-col items-center text-center px-4 w-full max-w-5xl mx-auto py-12">
          <span className={cn("text-[#B8860B] font-bold tracking-[0.2em] sm:tracking-[0.3em] uppercase mb-4", theme.typography.body)}>
            La Plataforma Definitiva de Datos Reales
          </span>
          <h1 className={cn("text-5xl sm:text-7xl md:text-8xl lg:text-9xl text-white mb-12", theme.typography.heading)}>
            GVB WORLD CUP <br />
            <span className="text-[#B8860B]">
              2026
            </span>
          </h1>
          
          <div className="bg-[#13315C] border-2 border-[#111111] p-6 sm:p-8 shadow-[4px_4px_0px_0px_rgba(17,17,17,1)] sm:shadow-[8px_8px_0px_0px_rgba(17,17,17,1)] w-full max-w-4xl mx-auto">
            <h3 className="text-white text-center font-bold uppercase tracking-widest mb-6 text-sm sm:text-base">El Mundial Comienza En</h3>
            <Countdown targetDate="2026-06-11T19:00:00Z" />
          </div>
        </div>
      </section>

      {/* PARTIDOS DE LA COMPETICIÓN */}
      <section id="partidos" className={cn(theme.layout.section, "bg-[#0B2545] border-b-4 border-[#13315C]")}>
        <div className={theme.layout.container}>
          <div className="flex justify-between items-end mb-10 border-b border-[#13315C] pb-4">
            <SectionTitle className="mb-0" subtitle="Encuentros oficiales y actualizados" dark>
              Fixture del Mundial
            </SectionTitle>
            <span className="text-xs font-bold text-gray-400">
              Total: {allMatches.length} partidos
            </span>
          </div>
          
          {isLoadingAllMatches ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <MatchCardSkeleton />
              <MatchCardSkeleton />
            </div>
          ) : isErrorAllMatches ? (
            <EmptyState 
              title="Error al cargar partidos" 
              description={errorAllMatches?.message || "No se pudieron obtener los partidos desde World Cup API."}
              className="bg-[#13315C] border-red-500 text-white"
            />
          ) : uniqueDateKeys.length > 0 ? (
            <div className="space-y-10">
              {uniqueDateKeys.map(dateKey => (
                <div key={dateKey} className="space-y-4">
                  {/* Date Header */}
                  <h3 className="text-sm font-bold text-[#B8860B] uppercase tracking-widest border-b border-[#2A2A2A] pb-1">
                    {formatDateHeader(dateKey)}
                  </h3>
                  
                  {/* Matches List for this Date */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {groupedMatches[dateKey].map(match => (
                      <MatchCard key={match.id} fixture={match} />
                    ))}
                  </div>
                </div>
              ))}

              {/* Load More Button */}
              {hasMoreMatches && (
                <div className="text-center pt-8">
                  <button
                    onClick={() => setVisibleMatchesCount(prev => prev + 10)}
                    className={cn(
                      "bg-[#B8860B] text-[#111111] px-8 py-3 text-sm font-bold uppercase tracking-widest border-2 border-[#111111] shadow-[4px_4px_0px_0px_rgba(17,17,17,1)] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[2px_2px_0px_0px_rgba(17,17,17,1)] transition-all",
                      focusClasses
                    )}
                  >
                    Ver más partidos
                  </button>
                </div>
              )}
            </div>
          ) : (
            <EmptyState 
              title="Sin partidos disponibles" 
              description="No se encontraron partidos cargados en la API en este momento."
              className="bg-[#13315C] border-[#B8860B] text-white"
            />
          )}
        </div>
      </section>

      {/* CLASIFICACIÓN (TABLA DE GRUPOS REAL) & GOLEADORES */}
      <section id="posiciones" className={cn(theme.layout.section, "bg-[#E8E2D6] text-[#111111]")}>
        <div className={theme.layout.container}>
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-12">
            
            {/* STANDINGS TABLE */}
            <div className="xl:col-span-7">
              <SectionTitle subtitle="Tabla de posiciones oficial del torneo">Clasificación</SectionTitle>
              
              {/* Group Selector Tabs */}
              <div className="flex flex-wrap gap-1.5 mb-6">
                {GROUPS.map(g => (
                  <button
                    key={g}
                    onClick={() => setSelectedGroup(g)}
                    className={cn(
                      "px-3 py-1.5 text-xs font-bold uppercase tracking-wider border transition-colors",
                      selectedGroup === g 
                        ? "bg-[#111111] border-[#111111] text-white" 
                        : "bg-[#F4F1EA] border-[#CCCCCC] text-[#111111] hover:border-[#111111]"
                    )}
                  >
                    Grupo {g}
                  </button>
                ))}
              </div>

              {isLoadingStandings ? (
                <div className="flex flex-col gap-3">
                  <ParticipantCardSkeleton />
                  <ParticipantCardSkeleton />
                </div>
              ) : isErrorStandings ? (
                <EmptyState 
                  title="Error al cargar clasificación" 
                  description={errorStandings?.message || "No se pudo obtener la tabla de posiciones."}
                  className="bg-red-50 border-red-500 text-red-900"
                />
              ) : standings.length > 0 ? (
                <div className="border border-[#111111] bg-white overflow-hidden shadow-[4px_4px_0px_0px_rgba(17,17,17,1)]">
                  <table className="w-full text-left border-collapse text-xs md:text-sm">
                    <thead>
                      <tr className="bg-[#111111] text-white font-bold uppercase tracking-wider text-[10px] md:text-xs">
                        <th className="py-3 px-3 text-center w-10">Pos</th>
                        <th className="py-3 px-3">Equipo</th>
                        <th className="py-3 px-2 text-center">PJ</th>
                        <th className="py-3 px-2 text-center">G</th>
                        <th className="py-3 px-2 text-center">E</th>
                        <th className="py-3 px-2 text-center">P</th>
                        <th className="py-3 px-2 text-center">DG</th>
                        <th className="py-3 px-3 text-center bg-[#B8860B] text-[#111111]">Pts</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E0DBCF]">
                      {standings.map((row) => (
                        <tr key={row.team.id} className="hover:bg-[#F4F1EA] transition-colors">
                          <td className="py-3 px-3 text-center font-bold text-[#555555]">
                            {row.rank}
                          </td>
                          <td className="py-3 px-3 font-bold flex items-center gap-2 min-w-[150px]">
                            <div className="w-6 h-6 bg-[#F4F1EA] border border-[#CCCCCC] flex items-center justify-center overflow-hidden shrink-0">
                              {row.team.logo ? (
                                <img src={row.team.logo} alt={row.team.name} className="w-full h-full object-contain p-0.5" />
                              ) : (
                                <span className="text-[8px] font-bold">{row.team.name.substring(0, 3).toUpperCase()}</span>
                              )}
                            </div>
                            <span className="truncate">{row.team.name}</span>
                          </td>
                          <td className="py-3 px-2 text-center text-[#555555] font-semibold">{row.matches}</td>
                          <td className="py-3 px-2 text-center text-green-700">{row.won}</td>
                          <td className="py-3 px-2 text-center text-gray-600">{row.drawn}</td>
                          <td className="py-3 px-2 text-center text-red-700">{row.lost}</td>
                          <td className="py-3 px-2 text-center font-mono text-[#555555]">
                            {row.goal_diff > 0 ? `+${row.goal_diff}` : row.goal_diff}
                          </td>
                          <td className="py-3 px-3 text-center font-bold bg-[#F9F7F2] border-l border-[#B8860B]/30 text-lg">
                            {row.points}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <EmptyState 
                  title="Posiciones no disponibles" 
                  description="No se encontraron tablas de clasificación para este grupo."
                />
              )}
            </div>

            {/* TOP GOALSCORERS */}
            <div id="goleadores" className="xl:col-span-5">
              <SectionTitle subtitle="Máximos anotadores en tiempo real">Goleadores</SectionTitle>
              
              {isLoadingScorers ? (
                <div className="flex flex-col gap-3">
                  <ParticipantCardSkeleton />
                  <ParticipantCardSkeleton />
                </div>
              ) : goalscorers.length > 0 ? (
                <div className="border border-[#111111] bg-white divide-y divide-[#E0DBCF] shadow-[4px_4px_0px_0px_rgba(17,17,17,1)]">
                  {goalscorers.slice(0, 5).map((row, idx) => (
                    <div key={row.player.id} className="flex items-center justify-between p-4 hover:bg-[#F4F1EA] transition-colors">
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="text-sm font-bold text-gray-500 w-4">
                          {idx + 1}
                        </span>
                        
                        <div className="w-10 h-10 bg-[#F4F1EA] border border-[#CCCCCC] overflow-hidden shrink-0">
                          {row.player.photo ? (
                            <img src={row.player.photo} alt={row.player.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center font-bold text-[#111111] text-xs">
                              {row.player.name.substring(0, 2).toUpperCase()}
                            </div>
                          )}
                        </div>

                        <div className="min-w-0">
                          <h4 className="font-bold text-sm truncate">{row.player.name}</h4>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <div className="w-4 h-4 bg-gray-100 border border-[#CCCCCC] flex items-center justify-center overflow-hidden shrink-0">
                              {row.team.logo && (
                                <img src={row.team.logo} alt={row.team.name} className="w-full h-full object-contain" />
                              )}
                            </div>
                            <span className="text-[10px] text-gray-500 uppercase font-semibold">{row.team.name}</span>
                          </div>
                        </div>
                      </div>

                      <div className="text-right shrink-0 pl-3">
                        <div className="text-lg font-bold text-[#B8860B]">{row.goals} Goles</div>
                        <div className="text-[10px] text-gray-500">{row.assists} Asistencias</div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState 
                  title="Estadísticas no disponibles" 
                  description="Información de goleadores no disponible en este momento."
                />
              )}
            </div>

          </div>
        </div>
      </section>

      {/* REGLAMENTO / PREMIOS */}
      <section id="reglamento" className={cn(theme.layout.section, "bg-[#111111] text-white")}>
        <div className={theme.layout.container}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
            <div>
              <h2 className={cn("text-4xl sm:text-5xl mb-6 text-[#B8860B]", theme.typography.heading)}>El Reglamento</h2>
              <ul className="space-y-6">
                <li className="flex items-start gap-4">
                  <span className={cn("text-2xl text-[#B8860B] shrink-0", theme.typography.numbers)}>01</span>
                  <div>
                    <h4 className="text-lg font-bold uppercase tracking-wide">Acierto Exacto</h4>
                    <p className="text-[#F4F1EA] opacity-80 mt-1">Sumás <strong className="text-white opacity-100">3 puntos</strong> si acertás la cantidad exacta de goles de ambos equipos.</p>
                  </div>
                </li>
                <li className="flex items-start gap-4">
                  <span className={cn("text-2xl text-[#B8860B] shrink-0", theme.typography.numbers)}>02</span>
                  <div>
                    <h4 className="text-lg font-bold uppercase tracking-wide">Tendencia Correcta</h4>
                    <p className="text-[#F4F1EA] opacity-80 mt-1">Sumás <strong className="text-white opacity-100">1 punto</strong> si acertás quién gana o si hay empate, sin acertar los goles exactos.</p>
                  </div>
                </li>
                <li className="flex items-start gap-4">
                  <span className={cn("text-2xl text-[#B8860B] shrink-0", theme.typography.numbers)}>03</span>
                  <div>
                    <h4 className="text-lg font-bold uppercase tracking-wide">Bonus Especiales</h4>
                    <p className="text-[#F4F1EA] opacity-80 mt-1">Acertar el campeón suma <strong className="text-white opacity-100">10 puntos</strong>. Subcampeón y goleador suman <strong className="text-white opacity-100">5 puntos</strong> cada uno.</p>
                  </div>
                </li>
              </ul>
              
              <div className="mt-8">
                <Link
                  href="/reglamento"
                  className={cn(
                    "inline-block bg-[#B8860B] text-[#111111] px-6 py-3 text-sm font-bold uppercase tracking-widest border-2 border-[#111111] shadow-[4px_4px_0px_0px_#FFFFFF] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[2px_2px_0px_0px_#FFFFFF] transition-all",
                    focusClasses
                  )}
                >
                  Ver Reglamento Completo
                </Link>
              </div>
            </div>

            <div className="bg-[#1A1A1A] p-8 sm:p-10 border border-[#333333] shadow-[4px_4px_0px_0px_#B8860B] sm:shadow-[8px_8px_0px_0px_#B8860B]">
              <h2 className={cn("text-4xl sm:text-5xl mb-6 text-white text-center", theme.typography.heading)}>El Gran Premio</h2>
              <div className="text-center">
                <span className={cn("text-6xl sm:text-7xl block text-[#B8860B] mb-4", theme.typography.numbers)}>$1000</span>
                <p className="text-[#F4F1EA] uppercase tracking-widest font-bold">Para el Primer Puesto</p>
                <div className="mt-8 border-t border-[#333333] pt-8">
                  <p className="text-sm text-[#F4F1EA] opacity-80">El honor, la gloria y el prestigio de ser el campeón indiscutido de GVB WORLD CUP 2026.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>    </div>
  );
}
