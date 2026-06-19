'use client';

export const dynamic = 'force-dynamic';

import React, { useState, useMemo, useEffect } from 'react';
import { SectionTitle } from '@/components/ui/SectionTitle';
import { MatchCard } from '@/components/ui/MatchCard';
import { EmptyState } from '@/components/ui/EmptyState';
import { MatchCardSkeleton } from '@/components/ui/Skeletons';
import { ChevronLeft, ChevronRight } from 'lucide-react';

import { useMatches } from '@/hooks/useMatches';

import { theme } from '@/styles/theme';
import { cn } from '@/lib/utils';
import { Fixture } from '@/types/worldcup';

export default function FixturePage() {
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedStage, setSelectedStage] = useState<string>('todos');
  const [selectedDay, setSelectedDay] = useState<string>('todos');

  // Auto-scroll to top on page change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentPage]);

  // Fetch real data from hooks
  const { 
    data: allMatches = [], 
    isLoading: isLoadingAllMatches,
    isError: isErrorAllMatches,
    error: errorAllMatches
  } = useMatches();

  // Helper to get Argentina date string
  const getArgentinaDateString = (dateStr: string, timeStr: string) => {
    if (!dateStr || !timeStr) return dateStr || 'Fecha no disponible';
    try {
      const utcDate = new Date(`${dateStr}T${timeStr.substring(0, 8)}Z`);
      const formatter = new Intl.DateTimeFormat('en-US', {
        timeZone: 'America/Argentina/Buenos_Aires',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      });
      const parts = formatter.formatToParts(utcDate);
      const year = parts.find(p => p.type === 'year')?.value;
      const month = parts.find(p => p.type === 'month')?.value;
      const day = parts.find(p => p.type === 'day')?.value;
      return `${year}-${month}-${day}`;
    } catch (e) {
      return dateStr;
    }
  };

  // Filter matches based on search query, stage/round and day
  const filteredMatches = useMemo(() => {
    return allMatches.filter((match: Fixture) => {
      // 1. Search Query Filter (Home Team or Away Team)
      if (searchQuery.trim() !== '') {
        const query = searchQuery.toLowerCase().trim();
        const homeName = (match.home?.name || '').toLowerCase();
        const awayName = (match.away?.name || '').toLowerCase();
        if (!homeName.includes(query) && !awayName.includes(query)) {
          return false;
        }
      }

      // 2. Stage/Round Filter
      if (selectedStage !== 'todos') {
        const round = (match.round || '').toLowerCase();
        if (selectedStage === 'grupos') {
          if (!round.includes('fecha')) return false;
        } else if (selectedStage === 'eliminatoria') {
          if (round.includes('fecha')) return false;
        } else {
          if (round !== selectedStage.toLowerCase()) return false;
        }
      }

      // 3. Day/Date Filter
      if (selectedDay !== 'todos') {
        const argDate = getArgentinaDateString(match.date, match.time);
        if (argDate !== selectedDay) return false;
      }

      return true;
    });
  }, [allMatches, searchQuery, selectedStage, selectedDay]);

  // Sort filtered matches by date and time
  const sortedMatches = useMemo(() => {
    return [...filteredMatches].sort((a, b) => {
      const timeA = new Date(`${a.date}T${a.time}Z`).getTime();
      const timeB = new Date(`${b.date}T${b.time}Z`).getTime();
      return timeA - timeB;
    });
  }, [filteredMatches]);

  const matchesPerPage = 12;
  const totalPages = Math.ceil(sortedMatches.length / matchesPerPage);

  // Paginated visible matches
  const visibleMatches = useMemo(() => {
    const start = (currentPage - 1) * matchesPerPage;
    return sortedMatches.slice(start, start + matchesPerPage);
  }, [sortedMatches, currentPage]);

  // Get unique days for day filter based on current stage selection
  const uniqueDays = useMemo(() => {
    const days = new Set<string>();
    allMatches.forEach((match: Fixture) => {
      if (selectedStage !== 'todos') {
        const round = (match.round || '').toLowerCase();
        if (selectedStage === 'grupos' && !round.includes('fecha')) return;
        if (selectedStage === 'eliminatoria' && round.includes('fecha')) return;
        if (selectedStage !== 'grupos' && selectedStage !== 'eliminatoria' && round !== selectedStage.toLowerCase()) return;
      }
      
      const argDate = getArgentinaDateString(match.date, match.time);
      if (argDate && argDate !== 'Fecha no disponible') {
        days.add(argDate);
      }
    });
    return Array.from(days).sort();
  }, [allMatches, selectedStage]);

  // Helper to format date headers (e.g. "11 JUN 2026")
  const formatDateHeader = (dateStr: string) => {
    try {
      const date = new Date(`${dateStr}T12:00:00Z`);
      const day = date.getUTCDate();
      const month = date.toLocaleDateString('es-AR', { month: 'short', timeZone: 'UTC' }).toUpperCase();
      const year = date.getUTCFullYear();
      return `${day} ${month} ${year}`;
    } catch (e) {
      return dateStr;
    }
  };

  // Group visible matches by Argentina local date string
  const groupedMatches: Record<string, Fixture[]> = {};
  visibleMatches.forEach((match: Fixture) => {
    const dateKey = getArgentinaDateString(match.date, match.time);
    if (!groupedMatches[dateKey]) {
      groupedMatches[dateKey] = [];
    }
    groupedMatches[dateKey].push(match);
  });

  const uniqueDateKeys = Object.keys(groupedMatches);
  const focusClasses = "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B8860B]";

  return (
    <div className="flex flex-col min-h-screen bg-[#0B2545] pt-28">
      {/* FIXTURE DE LA COMPETICIÓN */}
      <section className={cn(theme.layout.section, "pb-24")}>
        <div className={theme.layout.container}>
          <div className="flex justify-between items-end mb-10 border-b border-[#13315C] pb-4">
            <SectionTitle className="mb-0" subtitle="Encuentros oficiales y actualizados" dark>
              Fixture del Mundial
            </SectionTitle>
            <span className="text-xs font-bold text-gray-400">
              Total: {allMatches.length} partidos
            </span>
          </div>
          
          {/* FILTROS DE BÚSQUEDA Y SELECCIÓN */}
          <div className="bg-[#13315C] border-2 border-[#111111] p-4 shadow-[4px_4px_0px_0px_rgba(17,17,17,1)] mb-8 flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
            {/* Buscador de país */}
            <div className="flex-1 min-w-[200px]">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Buscar selección..."
                className="w-full bg-[#0B2545] border border-[#CCCCCC]/20 text-white text-xs font-bold p-3 outline-none focus:border-[#B8860B] placeholder-gray-400"
              />
            </div>

            {/* Filtrar por fase */}
            <div className="w-full md:w-auto">
              <select
                value={selectedStage}
                onChange={(e) => {
                  setSelectedStage(e.target.value);
                  setSelectedDay('todos'); // Resetear día al cambiar de fase
                  setCurrentPage(1);
                }}
                className="w-full md:w-auto bg-[#0B2545] border border-[#CCCCCC]/20 text-white text-xs font-bold uppercase tracking-wider p-3 outline-none focus:border-[#B8860B] cursor-pointer"
              >
                <option value="todos">Todas las Fases</option>
                <option value="grupos">Fase de Grupos (Todo)</option>
                <option value="fecha 1">Fase de Grupos - Fecha 1</option>
                <option value="fecha 2">Fase de Grupos - Fecha 2</option>
                <option value="fecha 3">Fase de Grupos - Fecha 3</option>
                <option value="16avos de Final">16avos de Final</option>
                <option value="Octavos de Final">Octavos de Final</option>
                <option value="Cuartos de Final">Cuartos de Final</option>
                <option value="Semifinal">Semifinales</option>
                <option value="Tercer Puesto">Tercer Puesto</option>
                <option value="Final">Final</option>
              </select>
            </div>

            {/* Filtrar por día */}
            <div className="w-full md:w-auto">
              <select
                value={selectedDay}
                onChange={(e) => {
                  setSelectedDay(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full md:w-auto bg-[#0B2545] border border-[#CCCCCC]/20 text-white text-xs font-bold uppercase tracking-wider p-3 outline-none focus:border-[#B8860B] cursor-pointer"
              >
                <option value="todos">Todos los Días</option>
                {uniqueDays.map((day: string) => (
                  <option key={day} value={day}>
                    {new Date(`${day}T12:00:00Z`).toLocaleDateString('es-AR', {
                      day: '2-digit',
                      month: 'short',
                      timeZone: 'America/Argentina/Buenos_Aires'
                    })}
                  </option>
                ))}
              </select>
            </div>
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

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-[#13315C] border-2 border-[#111111] p-4 shadow-[4px_4px_0px_0px_rgba(17,17,17,1)] mt-8">
                  <div className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                    Mostrando partidos {Math.min(sortedMatches.length, (currentPage - 1) * matchesPerPage + 1)}-{Math.min(sortedMatches.length, currentPage * matchesPerPage)} de {sortedMatches.length}
                  </div>
                  <div className="flex items-center gap-2">
                    {/* Previous Button */}
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                      className={cn(
                        "bg-[#B8860B] text-[#111111] p-2.5 font-bold uppercase tracking-widest border-2 border-[#111111] shadow-[2px_2px_0px_0px_rgba(17,17,17,1)] transition-all flex items-center justify-center shrink-0 cursor-pointer disabled:bg-gray-800 disabled:text-gray-500 disabled:cursor-not-allowed disabled:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[1px_1px_0px_0px_rgba(17,17,17,1)]",
                        focusClasses
                      )}
                      aria-label="Página anterior"
                    >
                      <ChevronLeft size={16} />
                    </button>

                    {/* Page Numbers */}
                    <div className="flex flex-wrap items-center justify-center gap-1.5">
                      {Array.from({ length: totalPages }).map((_, index) => {
                        const pageNum = index + 1;
                        const isCurrent = currentPage === pageNum;
                        return (
                          <button
                            key={pageNum}
                            onClick={() => setCurrentPage(pageNum)}
                            className={cn(
                              "w-10 h-10 flex items-center justify-center border-2 text-xs font-bold uppercase tracking-widest transition-all cursor-pointer",
                              isCurrent
                                ? "bg-[#B8860B] border-[#111111] text-[#111111] shadow-[2px_2px_0px_0px_rgba(17,17,17,1)]"
                                : "bg-transparent border-[#CCCCCC]/20 text-white hover:border-[#B8860B] hover:text-[#B8860B]",
                              focusClasses
                            )}
                          >
                            {pageNum}
                          </button>
                        );
                      })}
                    </div>

                    {/* Next Button */}
                    <button
                      onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                      disabled={currentPage === totalPages}
                      className={cn(
                        "bg-[#B8860B] text-[#111111] p-2.5 font-bold uppercase tracking-widest border-2 border-[#111111] shadow-[2px_2px_0px_0px_rgba(17,17,17,1)] transition-all flex items-center justify-center shrink-0 cursor-pointer disabled:bg-gray-800 disabled:text-gray-500 disabled:cursor-not-allowed disabled:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[1px_1px_0px_0px_rgba(17,17,17,1)]",
                        focusClasses
                      )}
                      aria-label="Página siguiente"
                    >
                      <ChevronRight size={16} />
                    </button>
                  </div>
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
    </div>
  );
}
