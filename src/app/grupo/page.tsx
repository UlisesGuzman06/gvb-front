'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/store';
import { useMatches } from '@/hooks/useMatches';
import { theme } from '@/styles/theme';
import { cn } from '@/lib/utils';
import { 
  Users, 
  Trophy, 
  Award, 
  Shield, 
  ArrowLeft, 
  Sparkles, 
  ChevronRight, 
  Tv, 
  Zap,
  Target,
  Lock,
  Unlock,
  Calendar
} from 'lucide-react';
import Link from 'next/link';
import API_URL from '@/config/api';

interface ParticipantBonus {
  champion: string;
  subchampion: string;
  topScorer: string;
  goldenBall: string;
  goldenGlove: string;
}

interface GroupParticipant {
  id: string;
  name: string;
  email: string;
  role: string;
  points: number;
  exactMatches: number;
  trends: number;
  bonus: ParticipantBonus;
  isCurrentUser?: boolean;
}

export default function GrupoPage() {
  const router = useRouter();
  const { user } = useAppStore();
  const { data: allMatches = [] } = useMatches();

  // Selected participant for detail view
  const [selectedParticipantId, setSelectedParticipantId] = useState<string>('');

  const focusClasses = "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B8860B]";

  // 1. Auth Guard
  useEffect(() => {
    const storedUser = localStorage.getItem('gvb_user');
    if (!storedUser && !user) {
      router.push('/login');
    }
  }, [user, router]);

  const [participantsList, setParticipantsList] = useState<GroupParticipant[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const token = localStorage.getItem('gvb_token');
    if (!token) return;

    fetch(`${API_URL}/users`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => {
        if (!res.ok) throw new Error('Failed to load standings');
        return res.json();
      })
      .then(data => {
        const mapped = data.map((u: any) => ({
          ...u,
          isCurrentUser: user ? u.id === user.id : false
        }));
        const sorted = mapped.sort((a: any, b: any) => {
          if (b.points !== a.points) return b.points - a.points;
          if (b.exactMatches !== a.exactMatches) return b.exactMatches - a.exactMatches;
          return a.name.localeCompare(b.name);
        });
        setParticipantsList(sorted);
        setIsLoading(false);
      })
      .catch(err => {
        console.error('Error loading standings:', err);
        setIsLoading(false);
      });
  }, [user]);

  // Set initial selected participant
  useEffect(() => {
    if (participantsList.length > 0 && !selectedParticipantId) {
      const current = participantsList.find(p => p.isCurrentUser);
      setSelectedParticipantId(current ? current.id : participantsList[0].id);
    }
  }, [participantsList, selectedParticipantId]);

  // Companion Predictions State
  const [activeRightTab, setActiveRightTab] = useState<'bonus' | 'matches'>('bonus');
  const [activeStage, setActiveStage] = useState<'groups' | 'knockouts'>('groups');
  const [selectedGroup, setSelectedGroup] = useState<string>('A');
  const [matchViewMode, setMatchViewMode] = useState<'finished' | 'by_group'>('finished');
  const [showPendingMatches, setShowPendingMatches] = useState<boolean>(false);
  const [companionPredictions, setCompanionPredictions] = useState<Record<string, { homeScore: number | null; awayScore: number | null; points: number; isLocked: boolean }>>({});
  const [isLoadingPredictions, setIsLoadingPredictions] = useState<boolean>(false);

  // Load companion predictions
  useEffect(() => {
    if (!selectedParticipantId) return;

    const token = localStorage.getItem('gvb_token');
    if (!token) return;

    setIsLoadingPredictions(true);
    fetch(`${API_URL}/predictions/companion/${selectedParticipantId}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => {
        if (!res.ok) throw new Error('Failed to load companion predictions');
        return res.json();
      })
      .then(data => {
        setCompanionPredictions(data);
        setIsLoadingPredictions(false);
      })
      .catch(err => {
        console.error('Error loading companion predictions:', err);
        setIsLoadingPredictions(false);
      });
  }, [selectedParticipantId]);

  const GROUPS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L'];

  // Double Points Match Rule Helper
  const isDoublePointsMatch = (match: any) => {
    const isArgentina = match.home?.name === 'Argentina' || match.away?.name === 'Argentina';
    return isArgentina;
  };

  // Lock logic helper: predictions close exactly at match start
  const getLockLimit = (matchDateStr: string, matchTimeStr: string) => {
    try {
      return new Date(`${matchDateStr}T${matchTimeStr || '12:00:00'}Z`);
    } catch (e) {
      return new Date();
    }
  };

  const isMatchLocked = (match: any) => {
    if (match.status === 'FINISHED') return true;
    const lockLimit = getLockLimit(match.date, match.time);
    const now = new Date();
    return now.getTime() > lockLimit.getTime();
  };

  const formatLockDate = (match: any) => {
    const limit = getLockLimit(match.date, match.time);
    return limit.toLocaleDateString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'America/Argentina/Buenos_Aires'
    }) + ' hs';
  };

  // Group Matches Filtered
  const filteredMatches = useMemo(() => {
    return allMatches.filter(m => {
      const isLocked = isMatchLocked(m);
      
      // If we only show finished/locked matches:
      if (matchViewMode === 'finished') {
        return isLocked;
      }
      
      // If matchViewMode === 'by_group'
      const isKnockout = !(m.round || '').toLowerCase().includes('fecha') && !(m.round || '').toLowerCase().includes('matchday');
      
      let matchesFilters = false;
      if (activeStage === 'groups') {
        if (isKnockout) return false;
        // Check group matching (supports Spanish and English)
        const groupTermEs = `Grupo ${selectedGroup.toUpperCase()}`;
        const groupTermEn = `Group ${selectedGroup.toUpperCase()}`;
        const matchGroup = (m.group || '').toLowerCase();
        const matchRound = (m.round || '').toLowerCase();
        matchesFilters = matchGroup === groupTermEs.toLowerCase() || 
                         matchGroup === groupTermEn.toLowerCase() || 
                         matchRound.includes(groupTermEs.toLowerCase()) || 
                         matchRound.includes(groupTermEn.toLowerCase());
      } else {
        matchesFilters = isKnockout;
      }
      
      if (!matchesFilters) return false;
      
      // If we shouldn't show pending matches, only return locked ones
      if (!showPendingMatches) {
        return isLocked;
      }
      
      return true;
    });
  }, [allMatches, matchViewMode, activeStage, selectedGroup, showPendingMatches]);

  // Group matches by round for clean layout
  const groupedMatchesByRound = useMemo(() => {
    const groups: Record<string, typeof filteredMatches> = {};
    filteredMatches.forEach(m => {
      const roundName = m.round || 'Otros';
      if (!groups[roundName]) {
        groups[roundName] = [];
      }
      groups[roundName].push(m);
    });
    return groups;
  }, [filteredMatches]);

  // Find currently selected participant object
  const selectedParticipant = useMemo(() => {
    return participantsList.find(p => p.id === selectedParticipantId);
  }, [participantsList, selectedParticipantId]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0B2545] flex items-center justify-center text-white">
        <div className="text-center space-y-4">
          <div className="animate-spin h-8 w-8 border-4 border-[#B8860B] border-t-transparent mx-auto"></div>
          <p className="font-bold uppercase tracking-widest text-sm">Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0B2545] text-white py-12">
      <div className={cn("mx-auto space-y-12", theme.layout.container)}>
        
        {/* HEADER & BACK BUTTON */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 border-b border-[#13315C] pb-6">
          <div>
            <Link 
              href="/prode" 
              className={cn(
                "inline-flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-[#B8860B] hover:text-white transition-colors mb-3",
                focusClasses
              )}
              id="back-to-prode-link"
            >
              <ArrowLeft size={16} /> Volver a Mi Prode
            </Link>
            <h1 className={cn("text-5xl sm:text-6xl text-white flex items-center gap-3", theme.typography.heading)} id="main-title">
              Grupo <span className="text-[#B8860B]">los Pibes</span>
            </h1>
            <p className="text-gray-400 mt-2 text-base max-w-2xl font-inter">
              Tabla de clasificación general del grupo y predicciones especiales de cada participante.
            </p>
          </div>
          
          <div className="bg-[#13315C] border-2 border-[#111111] p-4 shadow-[4px_4px_0px_0px_#B8860B] flex items-center gap-3 w-full sm:w-auto justify-center">
            <Users className="text-[#B8860B]" size={24} />
            <div>
              <span className="text-xs block text-gray-400 font-bold uppercase tracking-widest">Miembros Activos</span>
              <span className={cn("text-xl text-white font-bold block", theme.typography.numbers)}>
                {participantsList.length} Participantes
              </span>
            </div>
          </div>
        </div>

        {/* MAIN LAYOUT GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT COLUMN: STANDINGS TABLE */}
          <div className="lg:col-span-7 space-y-4">
            <div className="flex justify-between items-end border-b border-[#13315C] pb-3">
              <h2 className={cn("text-2xl uppercase tracking-wider text-white", theme.typography.heading)}>
                Clasificación del Grupo
              </h2>
              <span className="text-xs font-bold font-mono text-[#B8860B]">RANKING GENERAL</span>
            </div>

            <div className="border border-[#111111] bg-[#13315C] shadow-[6px_6px_0px_0px_rgba(17,17,17,1)] overflow-hidden">
              <table className="w-full text-left border-collapse text-xs md:text-sm">
                <thead>
                  <tr className="bg-[#111111] text-white font-bold uppercase tracking-wider text-[10px] md:text-xs">
                    <th className="py-3 px-3 text-center w-12">Pos</th>
                    <th className="py-3 px-3">Participante</th>
                    <th className="py-3 px-2 text-center w-16">Exactos</th>
                    <th className="py-3 px-2 text-center w-16">Tendencia</th>
                    <th className="py-3 px-3 text-center bg-[#B8860B] text-[#111111] w-20">Pts</th>
                    <th className="py-3 px-2 text-center w-12"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                  {participantsList.map((participant, index) => {
                    const isSelected = selectedParticipantId === participant.id;
                    const rank = index + 1;

                    return (
                      <tr 
                        key={participant.id} 
                        onClick={() => setSelectedParticipantId(participant.id)}
                        className={cn(
                          "cursor-pointer transition-colors",
                          participant.isCurrentUser ? "bg-[#111111]/30 font-bold" : "hover:bg-[#0B2545]/50",
                          isSelected && "bg-[#0B2545] border-l-4 border-l-[#B8860B]"
                        )}
                      >
                        <td className="py-3.5 px-3 text-center font-mono font-bold text-[#B8860B]">
                          {rank}
                        </td>
                        <td className="py-3.5 px-3">
                          <div className="flex items-center gap-2">
                            <span className="uppercase truncate max-w-[150px] sm:max-w-none">
                              {participant.name}
                            </span>
                            {participant.isCurrentUser && (
                              <span className="text-[9px] bg-[#B8860B] text-[#111111] px-1 font-sans font-bold">
                                TÚ
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-3.5 px-2 text-center font-mono text-gray-300">
                          {participant.exactMatches}
                        </td>
                        <td className="py-3.5 px-2 text-center font-mono text-gray-300">
                          {participant.trends}
                        </td>
                        <td className="py-3.5 px-3 text-center font-mono font-bold bg-[#B8860B]/10 text-white border-l border-gray-850">
                          {participant.points}
                        </td>
                        <td className="py-3.5 px-2 text-center text-gray-500">
                          <ChevronRight size={16} className={cn("transition-transform", isSelected && "text-[#B8860B] translate-x-1")} />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Tiebreaker reminder card */}
            <div className="bg-[#111111]/50 border border-gray-800 p-4 text-xs font-inter text-gray-400 flex items-start gap-2.5">
              <Sparkles size={16} className="text-[#B8860B] shrink-0 mt-0.5" />
              <div>
                <strong>Criterio de desempate aplicado:</strong> En caso de igualdad de puntos, el ranking prioriza: 1) Mayor cantidad de aciertos exactos, 2) Acierto al Campeón del Mundo (en predicciones especiales).
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: PARTICIPANT PREDICTIONS */}
          <div className="lg:col-span-5 space-y-4">
            <div className="flex justify-between items-end border-b border-[#13315C] pb-3">
              <h2 className={cn("text-2xl uppercase tracking-wider text-white", theme.typography.heading)}>
                {activeRightTab === 'bonus' ? 'Predicciones Especiales' : 'Pronósticos de Partidos'}
              </h2>
              <span className="text-xs font-bold font-mono text-[#B8860B]">
                {activeRightTab === 'bonus' ? 'VER BONUS' : 'VER PARTIDOS'}
              </span>
            </div>

            {selectedParticipant ? (
              <div className="border border-[#111111] bg-[#13315C] p-6 shadow-[6px_6px_0px_0px_rgba(17,17,17,1)] space-y-6">
                
                {/* Header card */}
                <div className="flex justify-between items-start border-b border-gray-800 pb-4">
                  <div>
                    <h3 className="text-xl font-bold uppercase tracking-wide text-white">
                      {selectedParticipant.name}
                    </h3>
                    <p className="text-xs text-gray-400 font-mono mt-0.5">{selectedParticipant.email}</p>
                  </div>
                  <div className="bg-[#0B2545] border border-[#111111] px-3 py-1 text-center font-mono">
                    <span className="text-[10px] text-gray-400 block uppercase">Puntaje</span>
                    <span className="text-[#B8860B] font-bold text-sm">{selectedParticipant.points} Puntos</span>
                  </div>
                </div>

                {/* Tabs inside sidebar */}
                <div className="flex border-b border-[#111111] mb-4 gap-2">
                  <button
                    onClick={() => setActiveRightTab('bonus')}
                    className={cn(
                      "flex-1 py-2 text-xs font-bold uppercase tracking-wider border-t border-x border-[#111111] -mb-px transition-colors",
                      activeRightTab === 'bonus'
                        ? "bg-[#0B2545] border-b-2 border-b-[#0B2545] text-[#B8860B]"
                        : "bg-[#13315C] border-transparent text-gray-400 hover:text-white"
                    )}
                  >
                    Especiales (Bonus)
                  </button>
                  <button
                    onClick={() => setActiveRightTab('matches')}
                    className={cn(
                      "flex-1 py-2 text-xs font-bold uppercase tracking-wider border-t border-x border-[#111111] -mb-px transition-colors",
                      activeRightTab === 'matches'
                        ? "bg-[#0B2545] border-b-2 border-b-[#0B2545] text-[#B8860B]"
                        : "bg-[#13315C] border-transparent text-gray-400 hover:text-white"
                    )}
                  >
                    Pronósticos de Partidos
                  </button>
                </div>

                {activeRightTab === 'bonus' ? (
                  /* Grid of Bonus predictions */
                  <div className="space-y-4 font-inter">
                    
                    {/* Champion */}
                    <div className="flex items-start gap-3 bg-[#0B2545] p-3 border border-[#111111]">
                      <div className="p-2 bg-[#13315C] border border-[#B8860B] text-[#B8860B] shrink-0">
                        <Trophy size={18} />
                      </div>
                      <div>
                        <span className="text-[10px] text-gray-400 font-mono font-bold block uppercase tracking-wider">
                          Campeón del Mundo (+15 pts)
                        </span>
                        <span className="text-sm font-bold text-white uppercase block mt-0.5">
                          {selectedParticipant.bonus.champion}
                        </span>
                      </div>
                    </div>

                    {/* Subchampion */}
                    <div className="flex items-start gap-3 bg-[#0B2545] p-3 border border-[#111111]">
                      <div className="p-2 bg-[#13315C] border border-gray-600 text-gray-300 shrink-0">
                        <Award size={18} />
                      </div>
                      <div>
                        <span className="text-[10px] text-gray-400 font-mono font-bold block uppercase tracking-wider">
                          Subcampeón del Mundo (+10 pts)
                        </span>
                        <span className="text-sm font-bold text-white uppercase block mt-0.5">
                          {selectedParticipant.bonus.subchampion}
                        </span>
                      </div>
                    </div>

                    {/* Golden Boot */}
                    <div className="flex items-start gap-3 bg-[#0B2545] p-3 border border-[#111111]">
                      <div className="p-2 bg-[#13315C] border border-amber-800 text-amber-500 shrink-0">
                        <Target size={18} />
                      </div>
                      <div>
                        <span className="text-[10px] text-gray-400 font-mono font-bold block uppercase tracking-wider">
                          Bota de Oro / Goleador (+10 pts)
                        </span>
                        <span className="text-sm font-bold text-white uppercase block mt-0.5">
                          {selectedParticipant.bonus.topScorer}
                        </span>
                      </div>
                    </div>

                    {/* Golden Ball */}
                    <div className="flex items-start gap-3 bg-[#0B2545] p-3 border border-[#111111]">
                      <div className="p-2 bg-[#13315C] border border-[#B8860B] text-[#B8860B] shrink-0">
                        <Sparkles size={18} />
                      </div>
                      <div>
                        <span className="text-[10px] text-gray-400 font-mono font-bold block uppercase tracking-wider">
                          Balón de Oro / Mejor Jugador (+10 pts)
                        </span>
                        <span className="text-sm font-bold text-white uppercase block mt-0.5">
                          {selectedParticipant.bonus.goldenBall}
                        </span>
                      </div>
                    </div>

                    {/* Golden Glove */}
                    <div className="flex items-start gap-3 bg-[#0B2545] p-3 border border-[#111111]">
                      <div className="p-2 bg-[#13315C] border border-blue-900 text-blue-400 shrink-0">
                        <Shield size={18} />
                      </div>
                      <div>
                        <span className="text-[10px] text-gray-400 font-mono font-bold block uppercase tracking-wider">
                          Guante de Oro / Mejor Arquero (+10 pts)
                        </span>
                        <span className="text-sm font-bold text-white uppercase block mt-0.5">
                          {selectedParticipant.bonus.goldenGlove}
                        </span>
                      </div>
                    </div>

                    {/* Footer note */}
                    <div className="bg-[#0B2545] p-3 border border-gray-800 text-[10px] text-gray-400 font-inter text-center mt-6">
                      * Las predicciones se bloquearon al iniciar el torneo el 11/06/2026.
                    </div>
                  </div>
                ) : (
                  /* Matches predictions list with Stage and Group selector */
                  <div className="space-y-6">
                    {isLoadingPredictions ? (
                      <div className="text-center py-8">
                        <div className="animate-spin h-6 w-6 border-2 border-[#B8860B] border-t-transparent mx-auto mb-2"></div>
                        <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Cargando Pronósticos...</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {/* VIEW MODE SELECTOR */}
                        <div className="flex gap-2 bg-[#0B2545] p-2 border border-[#111111]">
                          <button
                            onClick={() => setMatchViewMode('finished')}
                            className={cn(
                              "flex-1 py-1.5 text-[10px] font-bold uppercase tracking-wider transition-colors",
                              matchViewMode === 'finished'
                                ? "bg-[#B8860B] text-[#111111]"
                                : "bg-[#13315C] text-gray-300 hover:text-white"
                            )}
                          >
                            Todos los Terminados
                          </button>
                          <button
                            onClick={() => setMatchViewMode('by_group')}
                            className={cn(
                              "flex-1 py-1.5 text-[10px] font-bold uppercase tracking-wider transition-colors",
                              matchViewMode === 'by_group'
                                ? "bg-[#B8860B] text-[#111111]"
                                : "bg-[#13315C] text-gray-300 hover:text-white"
                            )}
                          >
                            Ver por Grupo / Fase
                          </button>
                        </div>

                        {/* STAGE & GROUP SELECTORS (only shown when in 'by_group' mode) */}
                        {matchViewMode === 'by_group' && (
                          <div className="space-y-3 p-2 bg-[#0B2545] border border-[#111111]">
                            {/* STAGE SELECTOR */}
                            <div className="flex gap-2">
                              <button
                                onClick={() => setActiveStage('groups')}
                                className={cn(
                                  "flex-1 py-1 text-[9px] font-bold uppercase tracking-wider transition-colors",
                                  activeStage === 'groups'
                                    ? "bg-[#B8860B] text-[#111111]"
                                    : "bg-[#13315C] text-gray-300 hover:text-white"
                                )}
                              >
                                Fase de Grupos
                              </button>
                              <button
                                onClick={() => setActiveStage('knockouts')}
                                className={cn(
                                  "flex-1 py-1 text-[9px] font-bold uppercase tracking-wider transition-colors",
                                  activeStage === 'knockouts'
                                    ? "bg-[#B8860B] text-[#111111]"
                                    : "bg-[#13315C] text-gray-300 hover:text-white"
                                )}
                              >
                                Fase Eliminatoria
                              </button>
                            </div>

                            {/* GROUP SELECTOR */}
                            {activeStage === 'groups' && (
                              <div className="flex flex-wrap gap-1 max-h-[80px] overflow-y-auto pt-1">
                                {GROUPS.map(g => (
                                  <button
                                    key={g}
                                    onClick={() => setSelectedGroup(g)}
                                    className={cn(
                                      "px-1.5 py-0.5 text-[9px] font-bold uppercase border transition-all",
                                      selectedGroup === g
                                        ? "bg-[#111111] border-[#111111] text-white"
                                        : "bg-[#13315C] border-[#111111] text-gray-400 hover:text-white"
                                    )}
                                  >
                                    G{g}
                                  </button>
                                ))}
                              </div>
                            )}

                            {/* PENDING TOGGLE */}
                            <div className="flex items-center gap-2 pt-1.5 border-t border-[#13315C]">
                              <input
                                type="checkbox"
                                id="show-pending-checkbox"
                                checked={showPendingMatches}
                                onChange={(e) => setShowPendingMatches(e.target.checked)}
                                className="w-3.5 h-3.5 accent-[#B8860B] cursor-pointer"
                              />
                              <label htmlFor="show-pending-checkbox" className="text-[10px] text-gray-400 font-bold uppercase select-none cursor-pointer">
                                Mostrar partidos pendientes (Abiertos)
                              </label>
                            </div>
                          </div>
                        )}

                        {/* KNOCKOUT RULE WARNING */}
                        {matchViewMode === 'by_group' && activeStage === 'knockouts' && (
                          <div className="bg-amber-950/30 border border-[#B8860B] p-3 text-[10px] font-inter text-amber-200">
                            <strong>Regla de 120 Minutos:</strong> Se toma el resultado suplementario (sin penales).
                          </div>
                        )}

                        {/* MATCHES LIST */}
                        <div className="space-y-6 max-h-[500px] overflow-y-auto pr-1">
                          {Object.keys(groupedMatchesByRound).length > 0 ? (
                            Object.keys(groupedMatchesByRound).map(roundName => (
                              <div key={roundName} className="space-y-3">
                                <h4 className="text-xs font-bold text-[#B8860B] uppercase tracking-widest border-b border-gray-700 pb-1 flex justify-between items-center">
                                  <span>{roundName}</span>
                                  {matchViewMode === 'by_group' && activeStage === 'groups' && (
                                    <span className="text-[10px] text-gray-400 font-mono">Grupo {selectedGroup}</span>
                                  )}
                                </h4>

                                <div className="space-y-4">
                                  {groupedMatchesByRound[roundName].map(match => {
                                    const pred = companionPredictions[match.id];
                                    const isSelf = selectedParticipant?.isCurrentUser;
                                    const isLocked = pred ? pred.isLocked : isMatchLocked(match);
                                    const isDouble = isDoublePointsMatch(match);

                                    return (
                                      <div 
                                        key={match.id}
                                        className={cn(
                                          "border-2 bg-[#0B2545] p-4 shadow-[4px_4px_0px_0px_#111111] transition-all relative text-xs",
                                          isDouble ? "border-[#B8860B] shadow-[4px_4px_0px_0px_#B8860B]/20" : "border-[#111111]"
                                        )}
                                      >
                                        {/* Badges bar */}
                                        <div className="flex justify-between items-center mb-2.5 text-[9px] font-bold font-mono text-gray-400">
                                          <span className="uppercase truncate max-w-[150px]">{match.location}</span>
                                          <div className="flex gap-1 items-center">
                                            {isDouble && (
                                              <span className="bg-[#B8860B] text-[#111111] px-1 py-0.5 font-sans tracking-wide">
                                                ★ DOBLE
                                              </span>
                                            )}
                                            {isLocked ? (
                                              <span className="text-red-400 flex items-center gap-0.5 bg-red-950/40 px-1 py-0.5 border border-red-900/50">
                                                <Lock size={8} /> Cerrado
                                              </span>
                                            ) : (
                                              <span className="text-green-400 flex items-center gap-0.5 bg-green-950/20 px-1 py-0.5 border border-green-900/50">
                                                <Unlock size={8} /> Abierto
                                              </span>
                                            )}
                                          </div>
                                        </div>

                                        {/* Main row with teams and predictions */}
                                        <div className="flex items-center justify-between gap-2 py-1">
                                          {/* Home Team */}
                                          <div className="flex-1 flex items-center gap-2 justify-end text-right min-w-0">
                                            <span className="text-[11px] font-bold uppercase tracking-wide truncate">
                                              {match.home.name}
                                            </span>
                                            <div className="h-6 w-6 bg-[#13315C] border border-gray-700 flex items-center justify-center font-mono font-bold text-[10px] text-gray-400 shrink-0">
                                              {match.home.name.substring(0, 3).toUpperCase()}
                                            </div>
                                          </div>

                                          {/* Predicted Score or Locked Badge */}
                                          <div className="flex items-center gap-1 shrink-0">
                                            {pred && (pred.homeScore !== null && pred.awayScore !== null) ? (
                                              <>
                                                <div className="w-8 h-8 flex items-center justify-center border-2 border-[#111111] bg-[#13315C] text-white font-bold text-sm">
                                                  {pred.homeScore}
                                                </div>
                                                <span className="text-gray-400 font-bold">:</span>
                                                <div className="w-8 h-8 flex items-center justify-center border-2 border-[#111111] bg-[#13315C] text-white font-bold text-sm">
                                                  {pred.awayScore}
                                                </div>
                                              </>
                                            ) : (
                                              <>
                                                <div className="w-8 h-8 flex items-center justify-center border border-gray-800 bg-[#13315C] text-gray-500 font-bold text-sm italic">
                                                  -
                                                </div>
                                                <span className="text-gray-500 font-bold">:</span>
                                                <div className="w-8 h-8 flex items-center justify-center border border-gray-800 bg-[#13315C] text-gray-500 font-bold text-sm italic">
                                                  -
                                                </div>
                                              </>
                                            )}
                                          </div>

                                          {/* Away Team */}
                                          <div className="flex-1 flex items-center gap-2 justify-start text-left min-w-0">
                                            <div className="h-6 w-6 bg-[#13315C] border border-gray-700 flex items-center justify-center font-mono font-bold text-[10px] text-gray-400 shrink-0">
                                              {match.away.name.substring(0, 3).toUpperCase()}
                                            </div>
                                            <span className="text-[11px] font-bold uppercase tracking-wide truncate">
                                              {match.away.name}
                                            </span>
                                          </div>
                                        </div>

                                        {/* Subtitle details */}
                                        <div className="mt-2.5 pt-2 border-t border-[#13315C] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-1.5 text-[10px]">
                                          <span className="text-gray-400 font-mono">
                                            {(() => {
                                              try {
                                                const utcDate = new Date(`${match.date}T${match.time.substring(0, 8)}Z`);
                                                return utcDate.toLocaleDateString('es-AR', {
                                                  timeZone: 'America/Argentina/Buenos_Aires',
                                                  day: '2-digit',
                                                  month: '2-digit',
                                                }) + ' ' + utcDate.toLocaleTimeString('es-AR', {
                                                  timeZone: 'America/Argentina/Buenos_Aires',
                                                  hour: '2-digit',
                                                  minute: '2-digit',
                                                  hour12: false
                                                }) + ' hs';
                                              } catch (e) {
                                                return `${match.date} ${match.time.substring(0, 5)} hs`;
                                              }
                                            })()}
                                          </span>

                                          {!isLocked && (
                                            <span className="text-gray-400 text-[9px] font-mono">
                                              Límite: {formatLockDate(match)}
                                            </span>
                                          )}

                                          {/* Official Result & points */}
                                          {match.status === 'FINISHED' && match.homeScore !== null && match.awayScore !== null && (
                                            <div className="flex gap-1.5 items-center bg-[#13315C] px-2 py-0.5 border border-gray-750 font-mono text-[9px] mt-1 sm:mt-0">
                                              <span className="text-gray-400">Real:</span>
                                              <span className="text-[#B8860B] font-bold">{match.homeScore} - {match.awayScore}</span>
                                              <span className={cn(
                                                "font-bold uppercase px-0.5",
                                                pred && pred.points > 0 ? "text-green-400" : "text-red-400"
                                              )}>
                                                {pred && pred.points > 0 ? `+${pred.points} pts` : "0 pts"}
                                              </span>
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            ))
                          ) : (
                            <p className="text-center text-xs text-gray-400 py-6">No hay partidos para mostrar.</p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}

              </div>
            ) : (
              <div className="bg-[#13315C] border border-[#111111] p-8 text-center text-gray-400 shadow-[6px_6px_0px_0px_rgba(17,17,17,1)]">
                Selecciona un participante de la tabla para ver sus predicciones.
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
}
