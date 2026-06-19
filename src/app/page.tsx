'use client';

export const dynamic = 'force-dynamic';

import React, { useState, useEffect } from 'react';
import { SectionTitle } from '@/components/ui/SectionTitle';
import { Countdown } from '@/components/ui/Countdown';
import { EmptyState } from '@/components/ui/EmptyState';
import { ParticipantCardSkeleton } from '@/components/ui/Skeletons';

import { useStandings } from '@/hooks/useStandings';
import { useFootball } from '@/providers/FootballProvider';

import { theme } from '@/styles/theme';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { Trophy, Shield, X, ChevronRight, Loader2, Users } from 'lucide-react';

export default function Home() {
  const [selectedGroup, setSelectedGroup] = useState<string>('A');
  const [lastUpdated, setLastUpdated] = useState<string>('');

  const [selectedTeamData, setSelectedTeamData] = useState<{
    id: number;
    name: string;
    logo: string;
    rank: number;
    points: number;
    matches: number;
    won: number;
    drawn: number;
    lost: number;
    goal_diff: number;
    goals_scored: number;
    goals_conceded: number;
    group: string;
  } | null>(null);
  
  const [squad, setSquad] = useState<any[]>([]);
  const [isLoadingSquad, setIsLoadingSquad] = useState<boolean>(false);
  const [squadError, setSquadError] = useState<string>('');

  const { worldCupApi } = useFootball();

  const handleTeamClick = async (row: any) => {
    setSelectedTeamData({
      id: row.team.id,
      name: row.team.name,
      logo: row.team.logo,
      rank: row.rank,
      points: row.points,
      matches: row.matches,
      won: row.won,
      drawn: row.drawn,
      lost: row.lost,
      goal_diff: row.goal_diff,
      goals_scored: row.goals_scored,
      goals_conceded: row.goals_conceded,
      group: selectedGroup,
    });
    
    setIsLoadingSquad(true);
    setSquad([]);
    setSquadError('');
    
    try {
      const players = await worldCupApi.getSquads(row.team.id);
      setSquad(players);
    } catch (err: any) {
      console.error("Error fetching squad:", err);
      setSquadError('No se pudo cargar el plantel oficial.');
    } finally {
      setIsLoadingSquad(false);
    }
  };

  const { 
    data: standings = [], 
    isLoading: isLoadingStandings,
    isError: isErrorStandings,
    error: errorStandings
  } = useStandings(selectedGroup);

  const isLoading = isLoadingStandings;
  const isError = isErrorStandings;

  useEffect(() => {
    if (!isLoading) {
      setLastUpdated(new Date().toLocaleTimeString('es-AR') + ' ' + new Date().toLocaleDateString('es-AR'));
    }
  }, [isLoading]);

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

      {/* CLASIFICACIÓN (TABLA DE GRUPOS REAL) */}
      <section id="posiciones" className={cn(theme.layout.section, "bg-[#E8E2D6] text-[#111111]")}>
        <div className={theme.layout.container}>
          <div className="max-w-4xl mx-auto">
            
            {/* STANDINGS TABLE */}
            <div className="w-full">
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
                        <tr 
                          key={row.team.id} 
                          onClick={() => handleTeamClick(row)}
                          className="hover:bg-[#F4F1EA]/85 transition-colors cursor-pointer group"
                        >
                          <td className="py-3 px-3 text-center font-bold text-[#555555]">
                            {row.rank}
                          </td>
                          <td className="py-3 px-3 font-bold flex items-center justify-between gap-2 min-w-[155px]">
                            <div className="flex items-center gap-2 min-w-0">
                              <div className="w-6 h-6 bg-[#F4F1EA] border border-[#CCCCCC] flex items-center justify-center overflow-hidden shrink-0">
                                {row.team.logo ? (
                                  <img src={row.team.logo} alt={row.team.name} className="w-full h-full object-contain p-0.5" />
                                ) : (
                                  <span className="text-[8px] font-bold">{row.team.name.substring(0, 3).toUpperCase()}</span>
                                )}
                              </div>
                              <span className="truncate">{row.team.name}</span>
                            </div>
                            <span className="opacity-0 group-hover:opacity-100 text-[10px] text-[#B8860B] font-bold tracking-wider uppercase transition-opacity duration-200 flex items-center gap-0.5 border-none bg-transparent py-0.5 px-1.5 focus:opacity-100 outline-none shrink-0">
                              Detalle <ChevronRight className="w-3 h-3" />
                            </span>
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
                    <p className="text-[#F4F1EA] opacity-80 mt-1">Acertar el campeón suma <strong className="text-white opacity-100">15 puntos</strong>. Subcampeón, goleador y demás categorías especiales suman <strong className="text-white opacity-100">10 puntos</strong> cada uno.</p>
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
                <span className={cn("text-5xl sm:text-6xl block text-[#B8860B] mb-4", theme.typography.numbers)}>A DEFINIR</span>
                <p className="text-[#F4F1EA] uppercase tracking-widest font-bold">Pozo Recaudado</p>
                <div className="mt-8 border-t border-[#333333] pt-8 space-y-2">
                  <p className="text-sm text-[#F4F1EA] font-mono">1° Puesto: 60% | 2° Puesto: 25% | 3° Puesto: 15%</p>
                  <p className="text-xs text-[#F4F1EA] opacity-60">El pozo final de dinero acumulado se distribuirá entre las mejores tres posiciones al terminar la Copa.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* MODAL DE DETALLE DE EQUIPO Y PLANTEL COMPLETO */}
      {selectedTeamData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-3xl bg-[#0B2545] border-4 border-[#B8860B] shadow-[8px_8px_0px_0px_rgba(17,17,17,1)] flex flex-col max-h-[90vh] text-white">
            
            {/* Modal Header */}
            <div className="flex items-start justify-between p-6 border-b border-[#13315C] bg-[#13315C]">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-[#F4F1EA] border-2 border-[#B8860B] flex items-center justify-center overflow-hidden shrink-0">
                  {selectedTeamData.logo ? (
                    <img 
                      src={selectedTeamData.logo} 
                      alt={selectedTeamData.name} 
                      className="w-full h-full object-contain p-1" 
                    />
                  ) : (
                    <span className="text-[#111111] font-bold text-lg">
                      {selectedTeamData.name.substring(0, 3).toUpperCase()}
                    </span>
                  )}
                </div>
                <div>
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-white uppercase tracking-wider">
                    {selectedTeamData.name}
                  </h2>
                  <p className="text-xs sm:text-sm font-bold text-[#B8860B] uppercase tracking-widest mt-1">
                    Grupo {selectedTeamData.group} • Puesto {selectedTeamData.rank}
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setSelectedTeamData(null)}
                className="text-gray-400 hover:text-white transition-colors p-1"
                aria-label="Cerrar modal"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Modal Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-8">
              
              {/* Statistics Grid */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-widest text-[#B8860B] border-b border-[#13315C] pb-2 mb-4">
                  Estadísticas en el Grupo {selectedTeamData.group}
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
                  <div className="bg-[#13315C] border border-[#CCCCCC]/10 p-3 text-center">
                    <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">PJ</p>
                    <p className="text-2xl font-black text-white mt-1">{selectedTeamData.matches}</p>
                  </div>
                  <div className="bg-[#13315C] border border-[#CCCCCC]/10 p-3 text-center">
                    <p className="text-xs text-green-400 font-bold uppercase tracking-wider">PG</p>
                    <p className="text-2xl font-black text-green-400 mt-1">{selectedTeamData.won}</p>
                  </div>
                  <div className="bg-[#13315C] border border-[#CCCCCC]/10 p-3 text-center">
                    <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">PE</p>
                    <p className="text-2xl font-black text-gray-300 mt-1">{selectedTeamData.drawn}</p>
                  </div>
                  <div className="bg-[#13315C] border border-[#CCCCCC]/10 p-3 text-center">
                    <p className="text-xs text-red-400 font-bold uppercase tracking-wider">PP</p>
                    <p className="text-2xl font-black text-red-400 mt-1">{selectedTeamData.lost}</p>
                  </div>
                  <div className="bg-[#13315C] border border-[#CCCCCC]/10 p-3 text-center">
                    <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">GF</p>
                    <p className="text-2xl font-black text-white mt-1">{selectedTeamData.goals_scored}</p>
                  </div>
                  <div className="bg-[#13315C] border border-[#CCCCCC]/10 p-3 text-center">
                    <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">GC</p>
                    <p className="text-2xl font-black text-white mt-1">{selectedTeamData.goals_conceded}</p>
                  </div>
                  <div className="bg-[#13315C] border border-[#CCCCCC]/10 p-3 text-center">
                    <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">DG</p>
                    <p className="text-2xl font-black text-white mt-1">
                      {selectedTeamData.goal_diff > 0 ? `+${selectedTeamData.goal_diff}` : selectedTeamData.goal_diff}
                    </p>
                  </div>
                  <div className="bg-[#B8860B] text-[#111111] p-3 text-center border border-[#111111]">
                    <p className="text-xs font-black uppercase tracking-wider">PTS</p>
                    <p className="text-2xl font-black mt-1">{selectedTeamData.points}</p>
                  </div>
                </div>
              </div>

              {/* Plantel completo (Squad) */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-widest text-[#B8860B] border-b border-[#13315C] pb-2 mb-4">
                  Plantel Oficial de Jugadores
                </h4>
                
                {isLoadingSquad ? (
                  <div className="flex flex-col items-center justify-center py-12 space-y-4">
                    <Loader2 className="w-8 h-8 text-[#B8860B] animate-spin" />
                    <p className="text-xs text-gray-400 uppercase tracking-widest font-bold animate-pulse">
                      Cargando plantel oficial...
                    </p>
                  </div>
                ) : squadError ? (
                  <div className="bg-[#13315C] border border-red-500/50 p-4 text-center text-sm text-red-300">
                    {squadError}
                  </div>
                ) : squad && squad.length > 0 ? (
                  <div className="space-y-6">
                    {/* Render positions: Cuerpo Técnico, Arqueros, Defensores, Mediocampistas, Delanteros */}
                    {['Coach', 'Goalkeeper', 'Defender', 'Midfielder', 'Attacker'].map(pos => {
                      const playersInPos = squad.filter(p => p.position === pos);
                      if (playersInPos.length === 0) return null;
                      
                      const posNameEs = 
                        pos === 'Coach' ? 'Cuerpo Técnico' :
                        pos === 'Goalkeeper' ? 'Arqueros' :
                        pos === 'Defender' ? 'Defensores' :
                        pos === 'Midfielder' ? 'Mediocampistas' : 'Delanteros';

                      return (
                        <div key={pos} className="space-y-3">
                          <h5 className="text-xs font-bold uppercase tracking-widest text-white/80 bg-[#13315C]/60 px-3 py-1.5 border-l-4 border-[#B8860B]">
                            {posNameEs} ({playersInPos.length})
                          </h5>
                          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                            {playersInPos.map(player => (
                              <div 
                                key={player.id} 
                                className="bg-[#13315C] border border-[#CCCCCC]/10 p-3 flex items-center gap-3 hover:border-[#B8860B]/50 transition-colors"
                              >
                                <div className="w-10 h-10 bg-[#0B2545] border border-[#CCCCCC]/20 flex items-center justify-center overflow-hidden shrink-0">
                                  {player.photo ? (
                                    <img 
                                      src={player.photo} 
                                      alt={player.name} 
                                      className="w-full h-full object-cover"
                                      loading="lazy" 
                                    />
                                  ) : (
                                    <div className="w-full h-full bg-[#0B2545] flex items-center justify-center">
                                      <Users className="w-5 h-5 text-gray-500" />
                                    </div>
                                  )}
                                </div>
                                <div className="min-w-0">
                                  <p className="text-xs font-bold text-white truncate">
                                    {player.name}
                                  </p>
                                  <p className="text-[10px] text-gray-400 font-semibold mt-0.5">
                                    {player.position === 'Coach' ? 'Director Técnico' : `#${player.number || 'N/A'}`} {player.age ? `• ${player.age} años` : ''}
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="bg-[#13315C] border border-[#B8860B]/30 p-8 text-center text-xs text-gray-400 uppercase tracking-widest font-bold">
                    El plantel oficial no se encuentra disponible.
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-[#13315C] bg-[#0A1D37] text-right">
              <button 
                onClick={() => setSelectedTeamData(null)}
                className="bg-transparent hover:bg-white/10 text-white font-bold uppercase tracking-wider text-xs px-6 py-2 border-2 border-white/20 hover:border-white transition-all cursor-pointer"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
