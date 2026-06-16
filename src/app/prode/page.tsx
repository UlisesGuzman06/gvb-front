'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/store';
import { useMatches } from '@/hooks/useMatches';
import { theme } from '@/styles/theme';
import { cn } from '@/lib/utils';
import { 
  User, 
  Trophy, 
  Calendar, 
  Lock, 
  Unlock, 
  CheckCircle, 
  AlertCircle, 
  Save, 
  LogOut, 
  Award,
  HelpCircle
} from 'lucide-react';
import API_URL from '@/config/api';


interface PredictionItem {
  homeScore: number | '';
  awayScore: number | '';
}

interface BonusPredictions {
  champion: string;
  subchampion: string;
  topScorer: string;
  goldenBall?: string;
  goldenGlove?: string;
}

export default function ProdePage() {
  const router = useRouter();
  const { user, logout } = useAppStore();
  const { data: allMatches = [], isLoading: isLoadingMatches } = useMatches();

  // Navigation Tabs
  const [activeMainTab, setActiveMainTab] = useState<'fixtures' | 'bonus' | 'dashboard'>('fixtures');
  const [activeStage, setActiveStage] = useState<'groups' | 'knockouts'>('groups');
  const [selectedGroup, setSelectedGroup] = useState<string>('A');

  // Predictions State
  const [predictions, setPredictions] = useState<Record<string, PredictionItem>>({});
  const [bonus, setBonus] = useState<BonusPredictions>({ 
    champion: '', 
    subchampion: '', 
    topScorer: '',
    goldenBall: '',
    goldenGlove: '' 
  });
  
  // Notification States
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  // Focus and styles
  const focusClasses = "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B8860B]";

  // 1. Auth Guard
  useEffect(() => {
    const storedUser = localStorage.getItem('gvb_user');
    if (!storedUser && !user) {
      router.push('/login');
    }
  }, [user, router]);

  // Load Saved Predictions and Bonuses from backend on mount
  useEffect(() => {
    if (!user) return;
    
    const token = localStorage.getItem('gvb_token');
    if (!token) return;

    const headers = { 'Authorization': `Bearer ${token}` };

    // Load predictions from API
    fetch(`${API_URL}/predictions/my`, { headers })
      .then(res => {
        if (!res.ok) throw new Error('Failed to load predictions');
        return res.json();
      })
      .then(data => {
        setPredictions(data);
      })
      .catch(err => console.error('Error loading predictions:', err));

    // Load bonuses from API
    fetch(`${API_URL}/predictions/bonus/my`, { headers })
      .then(res => {
        if (!res.ok) throw new Error('Failed to load bonus');
        return res.json();
      })
      .then(data => {
        setBonus({
          champion: data.champion || '',
          subchampion: data.subchampion || '',
          topScorer: data.topScorer || '',
          goldenBall: data.goldenBall || '',
          goldenGlove: data.goldenGlove || '',
        });
      })
      .catch(err => console.error('Error loading bonus:', err));

  }, [user]);

  // Toast auto-clear
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // Get list of unique teams from fixtures for Champion/Subchampion dropdowns
  const teamsList = useMemo(() => {
    const teams = new Set<string>();
    allMatches.forEach(m => {
      if (m.home?.name && !m.home.name.startsWith('W') && !m.home.name.startsWith('L')) {
        teams.add(m.home.name);
      }
      if (m.away?.name && !m.away.name.startsWith('W') && !m.away.name.startsWith('L')) {
        teams.add(m.away.name);
      }
    });
    return Array.from(teams).sort();
  }, [allMatches]);

  // Lock logic helper: predictions close 10 minutes before match start
  const getLockLimit = (matchDateStr: string, matchTimeStr: string) => {
    try {
      const matchStart = new Date(`${matchDateStr}T${matchTimeStr || '12:00:00'}Z`);
      return new Date(matchStart.getTime() - 10 * 60 * 1000);
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

  // Format lock date for display
  const formatLockDate = (match: any) => {
    const limit = getLockLimit(match.date, match.time);
    return limit.toLocaleDateString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    }) + ' hs';
  };

  // Prediction input handlers
  const handleScoreChange = (matchId: string | number, side: 'homeScore' | 'awayScore', value: string) => {
    // Only accept empty or positive numbers
    if (value !== '' && !/^\d+$/.test(value)) return;
    
    const numValue = value === '' ? '' : parseInt(value, 10);
    
    setPredictions(prev => ({
      ...prev,
      [matchId]: {
        ...(prev[matchId] || { homeScore: '', awayScore: '' }),
        [side]: numValue
      }
    }));
  };

  // Save predictions to API
  const savePredictions = async () => {
    if (!user) return;
    
    try {
      const token = localStorage.getItem('gvb_token');
      const response = await fetch(`${API_URL}/predictions/save`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(predictions),
      });

      if (!response.ok) {
        throw new Error('Error al guardar predicciones');
      }

      setToast({
        message: '¡Tus pronósticos de partidos fueron guardados con éxito!',
        type: 'success'
      });
    } catch (err) {
      setToast({
        message: 'Error de conexión con el servidor al guardar.',
        type: 'error'
      });
    }
  };

  // Handle Log Out
  const handleLogout = () => {
    localStorage.removeItem('gvb_user');
    logout();
    router.push('/login');
  };

  // Double Points Match Rule Helper
  const isDoublePointsMatch = (match: any) => {
    const isArgentina = match.home?.name === 'Argentina' || match.away?.name === 'Argentina';
    
    // Group stage rivalries (e.g. Mexico vs South Africa, Czech Republic vs South Korea, Germany vs England if they exist in fixture)
    // We check if it's group stage and if there is a rivalry
    const isGroupStage = match.round?.toLowerCase().includes('matchday') || match.round?.toLowerCase().includes('group');
    
    return isArgentina; // For now, Argentina matches in group stage are double points
  };

  // Group Matches Filtered
  const filteredMatches = useMemo(() => {
    return allMatches.filter(m => {
      const isKnockout = !m.round?.toLowerCase().includes('matchday') && !m.round?.toLowerCase().includes('group');
      
      if (activeStage === 'groups') {
        if (isKnockout) return false;
        // Check group matching
        const groupTerm = `Group ${selectedGroup.toUpperCase()}`;
        return m.group?.toLowerCase() === groupTerm.toLowerCase() || m.round?.toLowerCase().includes(groupTerm.toLowerCase());
      } else {
        return isKnockout;
      }
    });
  }, [allMatches, activeStage, selectedGroup]);

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

  // Points Calculation for Profile Dashboard
  const pointsSummary = useMemo(() => {
    let totalPoints = 0;
    let exactHits = 0;
    let trendHits = 0;
    let errors = 0;
    let matchesEvaluated = 0;

    allMatches.forEach(m => {
      const pred = predictions[m.id];
      const hasPred = pred && pred.homeScore !== '' && pred.awayScore !== '';
      const realResult = (m.status === 'FINISHED' && m.homeScore !== null && m.awayScore !== null ? { home: m.homeScore as number, away: m.awayScore as number } : null);
      
      if (hasPred && realResult) {
        matchesEvaluated++;
        const pHome = Number(pred.homeScore);
        const pAway = Number(pred.awayScore);
        const rHome = realResult!.home;
        const rAway = realResult!.away;

        const isDouble = isDoublePointsMatch(m);
        const multiplier = isDouble ? 2 : 1;

        // Check exact
        if (pHome === rHome && pAway === rAway) {
          exactHits++;
          totalPoints += 3 * multiplier;
        } 
        // Check trend (winner/draw)
        else if (
          (pHome > pAway && rHome > rAway) || // Home win trend
          (pHome < pAway && rHome < rAway) || // Away win trend
          (pHome === pAway && rHome === rAway) // Draw trend
        ) {
          trendHits++;
          totalPoints += 1 * multiplier;
        } 
        // Error
        else {
          errors++;
        }
      }
    });

    return {
      totalPoints,
      exactHits,
      trendHits,
      errors,
      bonusPts: 0,
      matchesEvaluated
    };
  }, [allMatches, predictions]);



  if (!user) {
    return (
      <div className="min-h-screen bg-[#0B2545] flex items-center justify-center text-white">
        <div className="text-center space-y-4">
          <div className="animate-spin h-8 w-8 border-4 border-[#B8860B] border-t-transparent mx-auto"></div>
          <p className="font-bold uppercase tracking-widest text-sm">Redirigiendo a inicio de sesión...</p>
        </div>
      </div>
    );
  }

  const GROUPS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L'];

  return (
    <div className="min-h-screen bg-[#0B2545] text-white py-10">
      <div className={cn("mx-auto space-y-8", theme.layout.container)}>
        
        {/* TOAST SYSTEM */}
        {toast && (
          <div className={cn(
            "fixed bottom-5 right-5 z-50 p-4 border-2 border-[#111111] shadow-[4px_4px_0px_0px_rgba(17,17,17,1)] flex items-start gap-3 text-sm max-w-md animate-bounce",
            toast.type === 'success' ? 'bg-[#13315C] text-[#F4F1EA] border-green-500' : 
            toast.type === 'error' ? 'bg-red-950/90 text-[#F4F1EA] border-red-500' :
            'bg-[#111111] text-[#F4F1EA] border-[#B8860B]'
          )}>
            {toast.type === 'success' && <CheckCircle size={18} className="text-green-400 shrink-0 mt-0.5" />}
            {toast.type === 'error' && <AlertCircle size={18} className="text-red-400 shrink-0 mt-0.5" />}
            {toast.type === 'info' && <AlertCircle size={18} className="text-[#B8860B] shrink-0 mt-0.5" />}
            <div>{toast.message}</div>
          </div>
        )}

        {/* HEADER PROFILE BAR */}
        <div className="bg-[#13315C] border-2 border-[#111111] p-6 shadow-[6px_6px_0px_0px_#111111] flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="flex items-center gap-4">
            <div className="p-3.5 bg-[#0B2545] border-2 border-[#B8860B] text-[#B8860B]">
              <User size={28} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-2xl font-bold uppercase tracking-wide text-white">{user.name}</h2>
                <span className={cn(
                  "text-[10px] font-bold tracking-widest px-2 py-0.5 uppercase border",
                  user.role === 'ADMIN' ? 'bg-[#B8860B] text-[#111111] border-[#B8860B]' : 'bg-[#0B2545] text-gray-400 border-gray-700'
                )}>
                  {user.role}
                </span>
              </div>
              <p className="text-xs text-gray-400 font-mono mt-0.5">{user.email}</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4 w-full md:w-auto justify-between md:justify-end">
            
            {/* Realtime stats badge */}
            <div className="flex items-center gap-6">
              <div className="text-center">
                <span className="text-xs block text-gray-400 font-bold uppercase tracking-wider">PUNTOS</span>
                <span className={cn("text-2xl text-[#B8860B] font-bold", theme.typography.numbers)}>
                  {pointsSummary.totalPoints}
                </span>
              </div>
              <div className="border-l border-gray-700 h-8"></div>
              <div className="text-center">
                <span className="text-xs block text-gray-400 font-bold uppercase tracking-wider">EXACTOS</span>
                <span className={cn("text-2xl text-white font-bold", theme.typography.numbers)}>
                  {pointsSummary.exactHits}
                </span>
              </div>
              <div className="border-l border-gray-700 h-8"></div>
              <div className="text-center">
                <span className="text-xs block text-gray-400 font-bold uppercase tracking-wider">TENDENCIAS</span>
                <span className={cn("text-2xl text-white font-bold", theme.typography.numbers)}>
                  {pointsSummary.trendHits}
                </span>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className={cn(
                "bg-red-950/40 border border-[#B00020] text-[#F4F1EA] hover:bg-[#B00020] hover:text-[#111111] px-4 py-2 text-xs font-bold uppercase tracking-widest transition-colors flex items-center gap-2",
                focusClasses
              )}
            >
              <LogOut size={14} /> Salir
            </button>
          </div>
        </div>


        {/* MAIN NAVIGATION TABS */}
        <div className="flex border-b-2 border-[#13315C] gap-2">
          <button
            onClick={() => setActiveMainTab('fixtures')}
            className={cn(
              "px-6 py-3.5 text-sm font-bold uppercase tracking-widest border-t-2 border-x-2 border-[#111111] -mb-0.5 transition-colors flex items-center gap-2",
              activeMainTab === 'fixtures'
                ? "bg-[#13315C] border-b-2 border-b-[#13315C] text-[#B8860B]"
                : "bg-[#0B2545] border-transparent text-gray-400 hover:text-white"
            )}
          >
            <Calendar size={16} /> Pronósticos de Partidos
          </button>
          
          <button
            onClick={() => setActiveMainTab('bonus')}
            className={cn(
              "px-6 py-3.5 text-sm font-bold uppercase tracking-widest border-t-2 border-x-2 border-[#111111] -mb-0.5 transition-colors flex items-center gap-2",
              activeMainTab === 'bonus'
                ? "bg-[#13315C] border-b-2 border-b-[#13315C] text-[#B8860B]"
                : "bg-[#0B2545] border-transparent text-gray-400 hover:text-white"
            )}
          >
            <Trophy size={16} /> Especiales (Bonus)
          </button>

          <button
            onClick={() => setActiveMainTab('dashboard')}
            className={cn(
              "px-6 py-3.5 text-sm font-bold uppercase tracking-widest border-t-2 border-x-2 border-[#111111] -mb-0.5 transition-colors flex items-center gap-2",
              activeMainTab === 'dashboard'
                ? "bg-[#13315C] border-b-2 border-b-[#13315C] text-[#B8860B]"
                : "bg-[#0B2545] border-transparent text-gray-400 hover:text-white"
            )}
          >
            <Award size={16} /> Mi Rendimiento
          </button>
        </div>

        {/* TAB 1: FIXTURES (MATCH PREDICTIONS) */}
        {activeMainTab === 'fixtures' && (
          <div className="space-y-6">
            
            {/* SUB-TABS: STAGES */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-[#13315C] p-4 border border-[#111111]">
              <div className="flex gap-2">
                <button
                  onClick={() => setActiveStage('groups')}
                  className={cn(
                    "px-4 py-2 text-xs font-bold uppercase tracking-wider transition-colors",
                    activeStage === 'groups'
                      ? "bg-[#B8860B] text-[#111111]"
                      : "bg-[#0B2545] text-gray-300 hover:text-white"
                  )}
                >
                  Fase de Grupos
                </button>
                <button
                  onClick={() => setActiveStage('knockouts')}
                  className={cn(
                    "px-4 py-2 text-xs font-bold uppercase tracking-wider transition-colors",
                    activeStage === 'knockouts'
                      ? "bg-[#B8860B] text-[#111111]"
                      : "bg-[#0B2545] text-gray-300 hover:text-white"
                  )}
                >
                  Fase Eliminatoria
                </button>
              </div>

              {/* SAVE BUTTON */}
              <button
                onClick={savePredictions}
                className={cn(
                  "w-full sm:w-auto bg-[#B8860B] text-[#111111] px-6 py-2.5 text-xs font-bold uppercase tracking-widest border border-[#111111] shadow-[3px_3px_0px_0px_#111111] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[1px_1px_0px_0px_#111111] transition-all flex items-center justify-center gap-2",
                  focusClasses
                )}
              >
                <Save size={14} /> Guardar Pronósticos
              </button>
            </div>

            {/* IF STAGE === GROUPS, SHOW GROUP SELECTOR */}
            {activeStage === 'groups' && (
              <div className="flex flex-wrap gap-1.5 bg-[#13315C]/40 p-3 border border-[#13315C]">
                {GROUPS.map(g => (
                  <button
                    key={g}
                    onClick={() => setSelectedGroup(g)}
                    className={cn(
                      "px-3 py-1.5 text-xs font-bold uppercase tracking-wider border transition-all",
                      selectedGroup === g
                        ? "bg-[#111111] border-[#111111] text-white"
                        : "bg-[#0B2545] border-[#13315C] text-gray-400 hover:text-white"
                    )}
                  >
                    Grupo {g}
                  </button>
                ))}
              </div>
            )}

            {/* KNOCKOUT RULE WARNING */}
            {activeStage === 'knockouts' && (
              <div className="bg-amber-950/30 border border-[#B8860B] p-4 text-xs font-inter text-amber-200 flex items-start gap-2.5">
                <AlertCircle size={18} className="text-[#B8860B] shrink-0 mt-0.5" />
                <div>
                  <strong>Regla de los 120 Minutos activa:</strong> Para la Fase Eliminatoria, se tomará en cuenta el resultado al finalizar el tiempo suplementario (120 minutos de juego). Las definiciones por penales <strong>no se consideran</strong>.
                </div>
              </div>
            )}

            {/* MATCHES LIST */}
            {isLoadingMatches ? (
              <div className="text-center py-12">
                <div className="animate-spin h-8 w-8 border-4 border-[#B8860B] border-t-transparent mx-auto mb-2"></div>
                <p className="text-sm text-gray-400 font-bold uppercase tracking-widest">Cargando Fixture Oficial...</p>
              </div>
            ) : Object.keys(groupedMatchesByRound).length > 0 ? (
              <div className="space-y-8">
                {Object.keys(groupedMatchesByRound).map(roundName => (
                  <div key={roundName} className="space-y-4">
                    <h3 className="text-sm font-bold text-[#B8860B] uppercase tracking-widest border-b border-gray-700 pb-1 flex justify-between items-center">
                      <span>{roundName}</span>
                      {activeStage === 'groups' && <span className="text-xs text-gray-400 font-mono">Grupo {selectedGroup}</span>}
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {groupedMatchesByRound[roundName].map(match => {
                        const pred = predictions[match.id] || { homeScore: '', awayScore: '' };
                        const isLocked = isMatchLocked(match);
                        const isDouble = isDoublePointsMatch(match);
                        const realResult = (match.status === 'FINISHED' && match.homeScore !== null && match.awayScore !== null ? { home: match.homeScore as number, away: match.awayScore as number } : null);

                        return (
                          <div 
                            key={match.id}
                            className={cn(
                              "border-2 bg-[#13315C] p-5 shadow-[4px_4px_0px_0px_#111111] transition-all relative",
                              isDouble ? "border-[#B8860B] shadow-[4px_4px_0px_0px_#B8860B]/30" : "border-[#111111]"
                            )}
                          >
                            {/* Badges bar */}
                            <div className="flex justify-between items-center mb-3 text-[10px] font-bold font-mono text-gray-400">
                              <span className="uppercase">{match.location}</span>
                              <div className="flex gap-1.5 items-center">
                                {isDouble && (
                                  <span className="bg-[#B8860B] text-[#111111] px-1.5 py-0.5 font-sans tracking-wide">
                                    ★ PUNTAJE DOBLE
                                  </span>
                                )}
                                {isLocked ? (
                                  <span className="text-red-400 flex items-center gap-0.5 bg-red-950/40 px-1.5 py-0.5 border border-red-900/50">
                                    <Lock size={10} /> Cerrado
                                  </span>
                                ) : (
                                  <span className="text-green-400 flex items-center gap-0.5 bg-green-950/20 px-1.5 py-0.5 border border-green-900/50">
                                    <Unlock size={10} /> Abierto
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* Main row with teams and inputs */}
                            <div className="flex items-center justify-between gap-4 py-2">
                              {/* Home Team */}
                              <div className="flex-1 flex items-center gap-3 justify-end text-right">
                                <span className="text-sm font-bold uppercase tracking-wide truncate max-w-[120px] sm:max-w-none">
                                  {match.home.name}
                                </span>
                                <div className="h-8 w-8 bg-[#0B2545] border border-gray-700 flex items-center justify-center font-mono font-bold text-xs text-gray-400 shrink-0">
                                  {match.home.name.substring(0, 3).toUpperCase()}
                                </div>
                              </div>

                              {/* Prediction Inputs */}
                              <div className="flex items-center gap-1.5 shrink-0">
                                <input
                                  type="text"
                                  value={pred.homeScore}
                                  disabled={isLocked}
                                  onChange={(e) => handleScoreChange(match.id, 'homeScore', e.target.value)}
                                  className={cn(
                                    "w-10 h-10 text-center border-2 border-[#111111] bg-[#0B2545] text-white font-bold text-lg focus-visible:border-[#B8860B]",
                                    isLocked && "opacity-75 cursor-not-allowed bg-gray-900 text-gray-400 border-gray-800"
                                  )}
                                  aria-label={`Pronóstico goles local ${match.home.name}`}
                                />
                                <span className="text-gray-400 font-bold">:</span>
                                <input
                                  type="text"
                                  value={pred.awayScore}
                                  disabled={isLocked}
                                  onChange={(e) => handleScoreChange(match.id, 'awayScore', e.target.value)}
                                  className={cn(
                                    "w-10 h-10 text-center border-2 border-[#111111] bg-[#0B2545] text-white font-bold text-lg focus-visible:border-[#B8860B]",
                                    isLocked && "opacity-75 cursor-not-allowed bg-gray-900 text-gray-400 border-gray-800"
                                  )}
                                  aria-label={`Pronóstico goles visitante ${match.away.name}`}
                                />
                              </div>

                              {/* Away Team */}
                              <div className="flex-1 flex items-center gap-3 justify-start text-left">
                                <div className="h-8 w-8 bg-[#0B2545] border border-gray-700 flex items-center justify-center font-mono font-bold text-xs text-gray-400 shrink-0">
                                  {match.away.name.substring(0, 3).toUpperCase()}
                                </div>
                                <span className="text-sm font-bold uppercase tracking-wide truncate max-w-[120px] sm:max-w-none">
                                  {match.away.name}
                                </span>
                              </div>
                            </div>

                            {/* Subtitle details (Date, Time, lock warning) */}
                            <div className="mt-3 pt-3 border-t border-[#0B2545] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 text-xs">
                              <span className="text-gray-400 font-mono">
                                {(() => {
                                  try {
                                    const utcDate = new Date(`${match.date}T${match.time.substring(0, 8)}Z`);
                                    return utcDate.toLocaleDateString('es-AR', {
                                      timeZone: 'America/Argentina/Buenos_Aires',
                                      day: '2-digit',
                                      month: '2-digit',
                                      year: 'numeric'
                                    }) + ' a las ' + utcDate.toLocaleTimeString('es-AR', {
                                      timeZone: 'America/Argentina/Buenos_Aires',
                                      hour: '2-digit',
                                      minute: '2-digit',
                                      hour12: false
                                    }) + ' hs';
                                  } catch (e) {
                                    return `${match.date} a las ${match.time.substring(0, 5)} hs`;
                                  }
                                })()}
                              </span>
                              
                              {!isLocked && (
                                <span className="text-gray-400 text-[10px] font-mono">
                                  Límite: {formatLockDate(match)}
                                </span>
                              )}

                              {/* Official / Simulated Result display */}
                              {realResult && (
                                <div className="flex gap-2 items-center bg-[#0B2545] px-2.5 py-1 border border-gray-700 font-mono text-[10px]">
                                  <span className="text-gray-400">
                                    Resultado Oficial:
                                  </span>
                                  <span className="text-[#B8860B] font-bold">{realResult.home} - {realResult.away}</span>
                                  
                                  {/* Point tag */}
                                  {pred.homeScore !== '' && pred.awayScore !== '' && (
                                    <span className={cn(
                                      "font-bold uppercase px-1",
                                      pred.homeScore === realResult.home && pred.awayScore === realResult.away 
                                        ? "text-green-400" 
                                        : (
                                          (pred.homeScore > pred.awayScore && realResult.home > realResult.away) ||
                                          (pred.homeScore < pred.awayScore && realResult.home < realResult.away) ||
                                          (pred.homeScore === pred.awayScore && realResult.home === realResult.away)
                                        ) ? "text-blue-400" : "text-red-400"
                                    )}>
                                      {pred.homeScore === realResult.home && pred.awayScore === realResult.away 
                                        ? `+${3 * (isDouble ? 2 : 1)} pts` 
                                        : (
                                          (pred.homeScore > pred.awayScore && realResult.home > realResult.away) ||
                                          (pred.homeScore < pred.awayScore && realResult.home < realResult.away) ||
                                          (pred.homeScore === pred.awayScore && realResult.home === realResult.away)
                                        ) ? `+${1 * (isDouble ? 2 : 1)} pt` : "0 pts"
                                      }
                                    </span>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-[#13315C] border border-[#111111] p-8 text-center text-gray-400">
                No hay partidos disponibles para la fase y grupo seleccionado.
              </div>
            )}
          </div>
        )}

        {/* TAB 2: SPECIAL BONUS PREDICTIONS */}
        {activeMainTab === 'bonus' && (
          <div className="max-w-2xl mx-auto bg-[#13315C] border-2 border-[#111111] p-6 sm:p-8 shadow-[6px_6px_0px_0px_#111111]">
            <div className="border-b border-[#111111] pb-4 mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h3 className="text-2xl font-bold uppercase tracking-wider text-white">Pronósticos Especiales</h3>
                <p className="text-xs text-gray-400 mt-1 font-inter">
                  Estos pronósticos se definieron al momento de registrarse y están bloqueados.
                </p>
              </div>
              <div className="bg-[#0B2545] border border-gray-700 px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest text-gray-400 flex items-center gap-1.5 shrink-0">
                <Lock size={12} className="text-red-400" /> Bloqueados
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {[
                { label: 'Campeón del Mundo', value: bonus.champion, icon: '🏆', pts: '+10 PTS' },
                { label: 'Subcampeón del Mundo', value: bonus.subchampion, icon: '🥈', pts: '+5 PTS' },
                { label: 'Máximo Goleador (Bota de Oro)', value: bonus.topScorer, icon: '⚽', pts: '+5 PTS' },
                { label: 'Balón de Oro (Mejor Jugador)', value: bonus.goldenBall, icon: '✨', pts: '+5 PTS' },
                { label: 'Guante de Oro (Mejor Arquero)', value: bonus.goldenGlove, icon: '🧤', pts: '+5 PTS' },
              ].map(({ label, value, icon, pts }) => (
                <div
                  key={label}
                  className={cn(
                    "p-5 border-2 flex items-center gap-4 bg-[#0B2545] border-[#111111] shadow-[4px_4px_0px_0px_#111111]",
                    value ? "border-green-800 bg-[#1b4332]/10" : "border-gray-800 opacity-60"
                  )}
                >
                  <div className="text-3xl shrink-0 p-3 bg-[#13315C] border border-gray-800 rounded-none">
                    {icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block mb-0.5 font-inter">
                      {label}
                    </span>
                    <span className="text-sm font-bold text-white block truncate font-inter">
                      {value || 'Sin completar'}
                    </span>
                    <span className="inline-block text-[9px] font-mono text-[#B8860B] font-semibold mt-1">
                      {pts}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}


        {/* TAB 3: PERFORMANCE / STATISTICS */}
        {activeMainTab === 'dashboard' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Card Exact hits */}
              <div className="bg-[#13315C] border-2 border-[#111111] p-6 shadow-[4px_4px_0px_0px_#111111] space-y-2 text-center">
                <span className="text-xs text-gray-400 uppercase tracking-widest font-bold">Aciertos Exactos</span>
                <span className={cn("text-5xl block text-[#B8860B] font-bold", theme.typography.numbers)}>
                  {pointsSummary.exactHits}
                </span>
                <p className="text-xs text-gray-400 font-inter">Partidos adivinados con marcador idéntico (3 pts c/u)</p>
              </div>

              {/* Card Trend hits */}
              <div className="bg-[#13315C] border-2 border-[#111111] p-6 shadow-[4px_4px_0px_0px_#111111] space-y-2 text-center">
                <span className="text-xs text-gray-400 uppercase tracking-widest font-bold">Aciertos de Tendencia</span>
                <span className={cn("text-5xl block text-white font-bold", theme.typography.numbers)}>
                  {pointsSummary.trendHits}
                </span>
                <p className="text-xs text-gray-400 font-inter">Partidos adivinados con ganador/empate (1 pt c/u)</p>
              </div>

              {/* Card Evaluated */}
              <div className="bg-[#13315C] border-2 border-[#111111] p-6 shadow-[4px_4px_0px_0px_#111111] space-y-2 text-center">
                <span className="text-xs text-gray-400 uppercase tracking-widest font-bold">Partidos Evaluados</span>
                <span className={cn("text-5xl block text-white font-bold", theme.typography.numbers)}>
                  {pointsSummary.matchesEvaluated}
                </span>
                <p className="text-xs text-gray-400 font-inter">Total de tus pronósticos contrastados con el resultado real</p>
              </div>

            </div>

            {/* Simulated standings card */}
            <div className="bg-[#13315C] border-2 border-[#111111] p-6 shadow-[4px_4px_0px_0px_#111111] space-y-4">
              <h3 className="text-lg font-bold uppercase tracking-wider text-white">Mi Posición en la Comunidad</h3>
              <p className="text-xs text-gray-300 font-inter">
                Esta tabla simula tu posición en el ranking general con base en los puntos acumulados en la sesión de pruebas.
              </p>
              
              <div className="overflow-hidden border border-[#111111] bg-[#0B2545]">
                <table className="w-full text-left border-collapse text-xs md:text-sm font-mono">
                  <thead>
                    <tr className="bg-[#111111] text-white font-bold uppercase text-[10px] md:text-xs">
                      <th className="py-2.5 px-3 w-12 text-center">Pos</th>
                      <th className="py-2.5 px-3">Participante</th>
                      <th className="py-2.5 px-3 text-center">Exactos</th>
                      <th className="py-2.5 px-3 text-center">Tendencia</th>
                      <th className="py-2.5 px-3 text-center bg-[#B8860B] text-[#111111] w-20">Puntos</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800">
                    {/* User is ranked depending on score! */}
                    <tr className="bg-[#13315C] text-[#B8860B] font-bold">
                      <td className="py-3 px-3 text-center">1</td>
                      <td className="py-3 px-3 uppercase">{user.name} (Tú)</td>
                      <td className="py-3 px-3 text-center">{pointsSummary.exactHits}</td>
                      <td className="py-3 px-3 text-center">{pointsSummary.trendHits}</td>
                      <td className="py-3 px-3 text-center bg-[#B8860B] text-[#111111]">{pointsSummary.totalPoints} pts</td>
                    </tr>
                    <tr className="text-gray-400">
                      <td className="py-3 px-3 text-center">2</td>
                      <td className="py-3 px-3">Invitado GVB 1</td>
                      <td className="py-3 px-3 text-center">2</td>
                      <td className="py-3 px-3 text-center">4</td>
                      <td className="py-3 px-3 text-center">10 pts</td>
                    </tr>
                    <tr className="text-gray-400">
                      <td className="py-3 px-3 text-center">3</td>
                      <td className="py-3 px-3">Invitado GVB 2</td>
                      <td className="py-3 px-3 text-center">1</td>
                      <td className="py-3 px-3 text-center">3</td>
                      <td className="py-3 px-3 text-center">6 pts</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
