'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/store';
import { useMatches } from '@/hooks/useMatches';
import { useQueryClient } from '@tanstack/react-query';
import { theme } from '@/styles/theme';
import { cn } from '@/lib/utils';
import { 
  Shield, 
  Trophy, 
  Calendar, 
  User, 
  CheckCircle, 
  AlertCircle, 
  Save, 
  ArrowLeft,
  ChevronRight,
  UserCheck
} from 'lucide-react';
import Link from 'next/link';
import API_URL from '@/config/api';

interface UserItem {
  id: string;
  name: string;
  email: string;
  role: string;
  points: number;
}

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

export default function AdminPage() {
  const router = useRouter();
  const { user } = useAppStore();
  const queryClient = useQueryClient();
  const { data: allMatches = [], isLoading: isLoadingMatches, refetch: refetchMatches } = useMatches();

  const [activeTab, setActiveTab] = useState<'matches' | 'predictions' | 'tournament'>('matches');
  const [users, setUsers] = useState<UserItem[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string>('');

  // Loaded user predictions for modification
  const [userPredictions, setUserPredictions] = useState<Record<string, PredictionItem>>({});
  const [userBonus, setUserBonus] = useState<BonusPredictions>({
    champion: '',
    subchampion: '',
    topScorer: '',
    goldenBall: '',
    goldenGlove: ''
  });

  // Selected Group/Stage filters for Admin Matches List
  const [activeStage, setActiveStage] = useState<'groups' | 'knockouts'>('groups');
  const [selectedGroup, setSelectedGroup] = useState<string>('A');

  // Input state for match results loading
  const [matchInputs, setMatchInputs] = useState<Record<string, { home: string; away: string }>>({});

  // Tournament config inputs
  const [tournamentResults, setTournamentResults] = useState<BonusPredictions>({
    champion: '',
    subchampion: '',
    topScorer: '',
    goldenBall: '',
    goldenGlove: ''
  });

  // Feedback States
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [isLoadingAction, setIsLoadingAction] = useState<boolean>(false);

  // Selected Group/Stage filters for User Predictions list
  const [predFilter, setPredFilter] = useState<'all' | 'groups' | 'knockouts'>('all');

  const focusClasses = "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B8860B]";

  // Auth Guard
  useEffect(() => {
    const storedUser = localStorage.getItem('gvb_user');
    if (!storedUser) {
      router.push('/login');
      return;
    }
    const parsed = JSON.parse(storedUser);
    if (parsed.role !== 'ADMIN') {
      router.push('/prode');
    }
  }, [user, router]);

  // Load Users List
  const loadUsers = () => {
    const token = localStorage.getItem('gvb_token');
    if (!token) return;

    fetch(`${API_URL}/users`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        setUsers(data);
      })
      .catch(err => console.error('Error loading users:', err));
  };

  useEffect(() => {
    loadUsers();
  }, []);

  // Toast Auto-dismissal
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // Load selected user predictions
  useEffect(() => {
    if (!selectedUserId) return;

    const token = localStorage.getItem('gvb_token');
    const headers = { 'Authorization': `Bearer ${token}` };

    // Load matches predictions
    fetch(`${API_URL}/predictions/user/${selectedUserId}`, { headers })
      .then(res => res.json())
      .then(data => {
        setUserPredictions(data);
      })
      .catch(err => console.error('Error loading user predictions:', err));

    // Load special bonus predictions
    fetch(`${API_URL}/predictions/bonus/user/${selectedUserId}`, { headers })
      .then(res => res.json())
      .then(data => {
        setUserBonus({
          champion: data.champion || '',
          subchampion: data.subchampion || '',
          topScorer: data.topScorer || '',
          goldenBall: data.goldenBall || '',
          goldenGlove: data.goldenGlove || ''
        });
      })
      .catch(err => console.error('Error loading user bonus:', err));
  }, [selectedUserId]);

  // Load official tournament results
  useEffect(() => {
    const token = localStorage.getItem('gvb_token');
    fetch(`${API_URL}/matches/tournament/config`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        setTournamentResults({
          champion: data.champion || '',
          subchampion: data.subchampion || '',
          topScorer: data.topScorer || '',
          goldenBall: data.goldenBall || '',
          goldenGlove: data.goldenGlove || ''
        });
      })
      .catch(err => console.error('Error loading tournament config:', err));
  }, []);

  // Teams list for Champion/Runner-up dropdowns
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

  // Group Matches Filtered
  const filteredMatches = useMemo(() => {
    return allMatches.filter(m => {
      const isKnockout = !(m.round || '').toLowerCase().includes('fecha') && !(m.round || '').toLowerCase().includes('matchday');
      
      if (activeStage === 'groups') {
        if (isKnockout) return false;
        // Check group matching (supports Spanish and English)
        const groupTermEs = `Grupo ${selectedGroup.toUpperCase()}`;
        const groupTermEn = `Group ${selectedGroup.toUpperCase()}`;
        const matchGroup = (m.group || '').toLowerCase();
        const matchRound = (m.round || '').toLowerCase();
        return matchGroup === groupTermEs.toLowerCase() || 
               matchGroup === groupTermEn.toLowerCase() || 
               matchRound.includes(groupTermEs.toLowerCase()) || 
               matchRound.includes(groupTermEn.toLowerCase());
      } else {
        return isKnockout;
      }
    });
  }, [allMatches, activeStage, selectedGroup]);

  // User Predictions Filtered Matches
  const filteredPredMatches = useMemo(() => {
    return allMatches.filter(m => {
      const isKnockout = !(m.round || '').toLowerCase().includes('fecha') && !(m.round || '').toLowerCase().includes('matchday');
      if (predFilter === 'groups') return !isKnockout;
      if (predFilter === 'knockouts') return isKnockout;
      return true; // 'all'
    });
  }, [allMatches, predFilter]);

  // Handle Match Score Input Change
  const handleMatchInputChange = (matchId: string | number, side: 'home' | 'away', value: string) => {
    if (value !== '' && !/^\d+$/.test(value)) return;
    setMatchInputs(prev => ({
      ...prev,
      [matchId]: {
        ...(prev[matchId] || { home: '', away: '' }),
        [side]: value
      }
    }));
  };

  // Submit Match Result
  const handleSaveMatchResult = async (matchId: string | number) => {
    const input = matchInputs[matchId];
    if (!input || input.home === '' || input.away === '') {
      setToast({ message: 'Por favor ingresa ambos goles para guardar.', type: 'error' });
      return;
    }

    setIsLoadingAction(true);
    try {
      const token = localStorage.getItem('gvb_token');
      const response = await fetch(`${API_URL}/matches/${matchId}/result`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          homeScore: parseInt(input.home, 10),
          awayScore: parseInt(input.away, 10)
        })
      });

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem('gvb_user');
          localStorage.removeItem('gvb_token');
          router.push('/login');
          throw new Error('Sesión expirada. Por favor, inicia sesión nuevamente.');
        }
        throw new Error('Error al cargar resultado del partido.');
      }

      setToast({ message: '¡Resultado oficial guardado y puntos recalculados!', type: 'success' });
      // Invalidate cached data so home page standings + match list refresh immediately
      await queryClient.invalidateQueries({ queryKey: ['fixtures'] });
      await queryClient.invalidateQueries({ queryKey: ['standings'] });
      refetchMatches();
      loadUsers(); // Refresh participants standings

    } catch (err: any) {
      setToast({ message: err.message || 'Error de conexión.', type: 'error' });
    } finally {
      setIsLoadingAction(false);
    }
  };

  // Submit Bulk Match Results
  const handleSaveAllResults = async () => {
    // Find all matches in the current view that have both home and away scores entered
    const matchesToUpdate = filteredMatches
      .map(match => {
        // Look up input, falling back to original values if not edited but already finished
        const input = matchInputs[match.id];
        if (input && input.home !== '' && input.away !== '') {
          const homeScore = parseInt(input.home, 10);
          const awayScore = parseInt(input.away, 10);
          // Check if it's different from the original score to avoid redundant updates
          const isDifferent = match.homeScore !== homeScore || match.awayScore !== awayScore || match.status !== 'FINISHED';
          if (isDifferent) {
            return {
              id: String(match.id),
              homeScore,
              awayScore
            };
          }
        }
        return null;
      })
      .filter(Boolean) as { id: string; homeScore: number; awayScore: number }[];

    if (matchesToUpdate.length === 0) {
      setToast({ message: 'No hay cambios en los resultados para guardar.', type: 'error' });
      return;
    }

    setIsLoadingAction(true);
    try {
      const token = localStorage.getItem('gvb_token');
      const response = await fetch(`${API_URL}/matches/bulk-results`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ results: matchesToUpdate })
      });

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem('gvb_user');
          localStorage.removeItem('gvb_token');
          router.push('/login');
          throw new Error('Sesión expirada. Por favor, inicia sesión nuevamente.');
        }
        throw new Error('Error al guardar resultados en masa.');
      }

      setToast({ message: `¡Se guardaron ${matchesToUpdate.length} resultados oficiales y se recalcularon los puntos!`, type: 'success' });
      await queryClient.invalidateQueries({ queryKey: ['fixtures'] });
      await queryClient.invalidateQueries({ queryKey: ['standings'] });
      refetchMatches();
      loadUsers(); // Refresh participants standings

    } catch (err: any) {
      setToast({ message: err.message || 'Error de conexión.', type: 'error' });
    } finally {
      setIsLoadingAction(false);
    }
  };

  // Save selected user predictions
  const handleSaveUserPredictions = async () => {
    if (!selectedUserId) return;
    
    setIsLoadingAction(true);
    try {
      const token = localStorage.getItem('gvb_token');
      const response = await fetch(`${API_URL}/predictions/admin/${selectedUserId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(userPredictions)
      });

      if (!response.ok) {
        throw new Error('Error al guardar predicciones del usuario.');
      }

      setToast({ message: '¡Pronósticos del participante actualizados con éxito!', type: 'success' });
      loadUsers();
    } catch (err: any) {
      setToast({ message: err.message || 'Error al guardar.', type: 'error' });
    } finally {
      setIsLoadingAction(false);
    }
  };

  // Save selected user bonus predictions
  const handleSaveUserBonus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserId) return;

    setIsLoadingAction(true);
    try {
      const token = localStorage.getItem('gvb_token');
      const response = await fetch(`${API_URL}/predictions/bonus/admin/${selectedUserId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(userBonus)
      });

      if (!response.ok) {
        throw new Error('Error al guardar bonus del usuario.');
      }

      setToast({ message: '¡Bonus especiales del participante actualizados!', type: 'success' });
      loadUsers();
    } catch (err: any) {
      setToast({ message: err.message || 'Error al guardar.', type: 'error' });
    } finally {
      setIsLoadingAction(false);
    }
  };

  // Submit Official Tournament Results
  const handleSaveTournamentResults = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoadingAction(true);
    try {
      const token = localStorage.getItem('gvb_token');
      const response = await fetch(`${API_URL}/matches/tournament/results`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(tournamentResults)
      });

      if (!response.ok) {
        throw new Error('Error al guardar resultados del torneo.');
      }

      setToast({ message: '¡Resultados del torneo oficiales guardados y bonus recalculados!', type: 'success' });
      loadUsers();
    } catch (err: any) {
      setToast({ message: err.message || 'Error al guardar.', type: 'error' });
    } finally {
      setIsLoadingAction(false);
    }
  };

  // User predictions input handler
  const handleUserScoreChange = (matchId: string | number, side: 'homeScore' | 'awayScore', value: string) => {
    if (value !== '' && !/^\d+$/.test(value)) return;
    const numValue = value === '' ? '' : parseInt(value, 10);
    setUserPredictions(prev => ({
      ...prev,
      [matchId]: {
        ...(prev[matchId] || { homeScore: '', awayScore: '' }),
        [side]: numValue
      }
    }));
  };

  const GROUPS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L'];

  return (
    <div className="min-h-screen bg-[#0B2545] text-white py-12">
      <div className={cn("mx-auto space-y-12", theme.layout.container)}>
        
        {/* TOAST SYSTEM */}
        {toast && (
          <div className={cn(
            "fixed bottom-3 left-3 right-3 sm:left-auto sm:right-5 sm:bottom-5 z-50 p-4 border-2 border-[#111111] shadow-[4px_4px_0px_0px_rgba(17,17,17,1)] flex items-start gap-3 text-sm sm:max-w-md animate-bounce",
            toast.type === 'success' ? 'bg-[#13315C] text-[#F4F1EA] border-green-500' : 'bg-red-950/90 text-[#F4F1EA] border-red-500'
          )}>
            {toast.type === 'success' ? <CheckCircle size={18} className="text-green-400 shrink-0 mt-0.5" /> : <AlertCircle size={18} className="text-red-400 shrink-0 mt-0.5" />}
            <div>{toast.message}</div>
          </div>
        )}

        {/* HEADER & BACK LINK */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 border-b border-[#13315C] pb-6">
          <div>
            <Link 
              href="/prode" 
              className={cn(
                "inline-flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-[#B8860B] hover:text-white transition-colors mb-3",
                focusClasses
              )}
            >
              <ArrowLeft size={16} /> Volver a Mi Prode
            </Link>
            <h1 className={cn("text-5xl sm:text-6xl text-white flex items-center gap-3", theme.typography.heading)}>
              Panel <span className="text-[#B8860B]">Administrador</span>
            </h1>
            <p className="text-gray-400 mt-2 text-base max-w-2xl font-inter">
              Control general del fixture oficial, edición de pronósticos manuales y cálculo de bonus del torneo.
            </p>
          </div>
          
          <div className="bg-[#13315C] border-2 border-[#111111] p-4 shadow-[4px_4px_0px_0px_#B8860B] flex items-center gap-3 w-full sm:w-auto justify-center">
            <Shield className="text-[#B8860B]" size={24} />
            <div>
              <span className="text-xs block text-gray-400 font-bold uppercase tracking-widest">Modo Consola</span>
              <span className="text-sm text-white font-bold block font-mono">
                Super Admin GVB
              </span>
            </div>
          </div>
        </div>

        {/* NAVIGATION TABS */}
        <div className="flex border-b-2 border-[#13315C] gap-1 sm:gap-2 overflow-x-auto">
          <button
            onClick={() => setActiveTab('matches')}
            className={cn(
              "flex-1 sm:flex-none px-3 sm:px-6 py-3.5 text-xs sm:text-sm font-bold uppercase tracking-widest border-t-2 border-x-2 border-[#111111] -mb-0.5 transition-colors flex items-center justify-center gap-1 sm:gap-2 whitespace-nowrap",
              activeTab === 'matches'
                ? "bg-[#13315C] border-b-2 border-b-[#13315C] text-[#B8860B]"
                : "bg-[#0B2545] border-transparent text-gray-400 hover:text-white"
            )}
          >
            <Calendar size={16} /> <span className="hidden sm:inline">Cargar </span>Resultados
          </button>
          
          <button
            onClick={() => setActiveTab('predictions')}
            className={cn(
              "flex-1 sm:flex-none px-3 sm:px-6 py-3.5 text-xs sm:text-sm font-bold uppercase tracking-widest border-t-2 border-x-2 border-[#111111] -mb-0.5 transition-colors flex items-center justify-center gap-1 sm:gap-2 whitespace-nowrap",
              activeTab === 'predictions'
                ? "bg-[#13315C] border-b-2 border-b-[#13315C] text-[#B8860B]"
                : "bg-[#0B2545] border-transparent text-gray-400 hover:text-white"
            )}
          >
            <UserCheck size={16} /> <span className="hidden sm:inline">Pronósticos</span><span className="sm:hidden">Pronóst.</span>
          </button>

          <button
            onClick={() => setActiveTab('tournament')}
            className={cn(
              "flex-1 sm:flex-none px-3 sm:px-6 py-3.5 text-xs sm:text-sm font-bold uppercase tracking-widest border-t-2 border-x-2 border-[#111111] -mb-0.5 transition-colors flex items-center justify-center gap-1 sm:gap-2 whitespace-nowrap",
              activeTab === 'tournament'
                ? "bg-[#13315C] border-b-2 border-b-[#13315C] text-[#B8860B]"
                : "bg-[#0B2545] border-transparent text-gray-400 hover:text-white"
            )}
          >
            <Trophy size={16} /> Torneo
          </button>
        </div>

        {/* TAB 1: LOAD MATCH RESULTS */}
        {activeTab === 'matches' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-[#13315C] p-4 border border-[#111111]">
              <div className="flex gap-2">
                <button
                  onClick={() => setActiveStage('groups')}
                  className={cn(
                    "px-4 py-2 text-xs font-bold uppercase tracking-wider transition-colors",
                    activeStage === 'groups' ? "bg-[#B8860B] text-[#111111]" : "bg-[#0B2545] text-gray-300 hover:text-white"
                  )}
                >
                  Fase de Grupos
                </button>
                <button
                  onClick={() => setActiveStage('knockouts')}
                  className={cn(
                    "px-4 py-2 text-xs font-bold uppercase tracking-wider transition-colors",
                    activeStage === 'knockouts' ? "bg-[#B8860B] text-[#111111]" : "bg-[#0B2545] text-gray-300 hover:text-white"
                  )}
                >
                  Fase Eliminatoria
                </button>
              </div>

              {/* BIG BULK SAVE BUTTON */}
              <button
                onClick={handleSaveAllResults}
                disabled={isLoadingAction}
                className="w-full sm:w-auto bg-[#B8860B] text-[#111111] px-6 py-2.5 text-xs font-bold uppercase tracking-widest border border-[#111111] shadow-[3px_3px_0px_0px_#111111] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[1px_1px_0px_0px_#111111] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <Save size={14} /> Guardar Todos los Resultados de esta Vista
              </button>
            </div>

            {activeStage === 'groups' && (
              <div className="overflow-x-auto">
                <div className="flex gap-1.5 bg-[#13315C]/40 p-3 border border-[#13315C] min-w-max">
                  {GROUPS.map(g => (
                    <button
                      key={g}
                      onClick={() => setSelectedGroup(g)}
                      className={cn(
                        "px-3 py-1.5 text-xs font-bold uppercase tracking-wider border transition-all whitespace-nowrap",
                        selectedGroup === g ? "bg-[#111111] border-[#111111] text-white" : "bg-[#0B2545] border-[#13315C] text-gray-400 hover:text-white"
                      )}
                    >
                      Grupo {g}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {isLoadingMatches ? (
              <div className="text-center py-12">
                <div className="animate-spin h-8 w-8 border-4 border-[#B8860B] border-t-transparent mx-auto mb-2"></div>
                <p className="text-sm text-gray-400 font-bold uppercase tracking-widest">Cargando partidos...</p>
              </div>
            ) : filteredMatches.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredMatches.map(match => {
                  const input = matchInputs[match.id] || { home: match.homeScore?.toString() || '', away: match.awayScore?.toString() || '' };
                  const isFinished = match.status === 'FINISHED';

                  return (
                    <div 
                      key={match.id}
                      className={cn(
                        "border-2 bg-[#13315C] p-5 shadow-[4px_4px_0px_0px_#111111] transition-all relative border-[#111111]",
                        isFinished && "border-green-800 bg-[#13315C]/80"
                      )}
                    >
                      <div className="flex justify-between items-center mb-3 text-[10px] font-bold font-mono text-gray-400">
                        <span className="uppercase">{match.location} | {match.round}</span>
                        {isFinished ? (
                          <span className="text-green-400 bg-green-950/40 px-1.5 py-0.5 border border-green-900/50">Finalizado</span>
                        ) : (
                          <span className="text-amber-400 bg-amber-950/40 px-1.5 py-0.5 border border-amber-900/50">Pendiente</span>
                        )}
                      </div>

                      <div className="flex items-center justify-between gap-4 py-2">
                        {/* Home Team */}
                        <div className="flex-1 flex items-center gap-3 justify-end text-right">
                          <span className="text-sm font-bold uppercase tracking-wide truncate max-w-[120px] sm:max-w-none">
                            {match.home.name}
                          </span>
                          <div className="h-8 w-8 bg-[#0B2545] border border-gray-700 flex items-center justify-center font-mono font-bold text-xs text-gray-400 shrink-0 overflow-hidden">
                            {match.home.logo ? (
                              <img src={match.home.logo} alt={match.home.name} className="w-full h-full object-contain p-0.5" />
                            ) : (
                              match.home.name.substring(0, 3).toUpperCase()
                            )}
                          </div>
                        </div>

                        {/* Result Inputs */}
                        <div className="flex items-center gap-1.5 shrink-0">
                          <input
                            type="text"
                            value={input.home}
                            onChange={(e) => handleMatchInputChange(match.id, 'home', e.target.value)}
                            className="w-10 h-10 text-center border-2 border-[#111111] bg-[#0B2545] text-white font-bold text-lg focus-visible:border-[#B8860B]"
                            aria-label={`Goles local ${match.home.name}`}
                          />
                          <span className="text-gray-400 font-bold">:</span>
                          <input
                            type="text"
                            value={input.away}
                            onChange={(e) => handleMatchInputChange(match.id, 'away', e.target.value)}
                            className="w-10 h-10 text-center border-2 border-[#111111] bg-[#0B2545] text-white font-bold text-lg focus-visible:border-[#B8860B]"
                            aria-label={`Goles visitante ${match.away.name}`}
                          />
                        </div>

                        {/* Away Team */}
                        <div className="flex-1 flex items-center gap-3 justify-start text-left">
                          <div className="h-8 w-8 bg-[#0B2545] border border-gray-700 flex items-center justify-center font-mono font-bold text-xs text-gray-400 shrink-0 overflow-hidden">
                            {match.away.logo ? (
                              <img src={match.away.logo} alt={match.away.name} className="w-full h-full object-contain p-0.5" />
                            ) : (
                              match.away.name.substring(0, 3).toUpperCase()
                            )}
                          </div>
                          <span className="text-sm font-bold uppercase tracking-wide truncate max-w-[120px] sm:max-w-none">
                            {match.away.name}
                          </span>
                        </div>
                      </div>

                      <div className="mt-4 pt-3 border-t border-[#0B2545] flex justify-between items-center text-xs">
                        <span className="text-gray-400 font-mono">{match.date} | {match.time.substring(0, 5)}</span>
                        <button
                          onClick={() => handleSaveMatchResult(match.id)}
                          disabled={isLoadingAction}
                          className="bg-[#B8860B] text-[#111111] px-4 py-1.5 text-xs font-bold uppercase tracking-widest border border-[#111111] hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
                        >
                          Cargar
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="bg-[#13315C] border border-[#111111] p-8 text-center text-gray-400">
                No hay partidos pendientes.
              </div>
            )}
          </div>
        )}

        {/* TAB 2: EDIT USER PREDICTIONS */}
        {activeTab === 'predictions' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* User Selector Side */}
            <div className="lg:col-span-4 space-y-4">
              <div className="bg-[#13315C] border-2 border-[#111111] p-6 shadow-[6px_6px_0px_0px_#111111] space-y-4">
                <label className="block text-xs font-bold uppercase tracking-widest text-[#B8860B]">
                  Seleccionar Participante
                </label>
                <select
                  value={selectedUserId}
                  onChange={(e) => setSelectedUserId(e.target.value)}
                  className={cn(
                    "block w-full px-3 py-3 border-2 border-[#111111] bg-[#0B2545] text-white font-inter text-sm",
                    focusClasses
                  )}
                >
                  <option value="">-- Elige un usuario --</option>
                  {users.map(u => (
                    <option key={u.id} value={u.id}>{u.name} ({u.email})</option>
                  ))}
                </select>
                <p className="text-xs text-gray-400 font-inter">
                  Una vez elegido, podrás modificar cualquiera de sus pronósticos cargados o guardarle nuevos si el participante no llegó a enviarlos antes del cierre del partido.
                </p>
              </div>
            </div>

            {/* Predictions List Side */}
            <div className="lg:col-span-8 space-y-6">
              {selectedUserId ? (
                <div className="space-y-6">
                  
                  {/* Matches Predictions Form */}
                  <div className="bg-[#13315C] border-2 border-[#111111] p-6 sm:p-8 shadow-[6px_6px_0px_0px_#111111] space-y-6">
                    <div className="flex justify-between items-center border-b border-gray-800 pb-3">
                      <h3 className="text-xl font-bold uppercase tracking-wider text-white">Pronósticos de Partidos</h3>
                      <button
                        onClick={handleSaveUserPredictions}
                        disabled={isLoadingAction}
                        className="bg-[#B8860B] text-[#111111] px-5 py-2 text-xs font-bold uppercase tracking-widest border border-[#111111] hover:scale-105 active:scale-95 transition-all disabled:opacity-50 flex items-center gap-1.5"
                      >
                        <Save size={14} /> Guardar Pronósticos
                      </button>
                    </div>

                    {/* Filter buttons for user predictions */}
                    <div className="flex flex-wrap gap-2 border-b border-gray-800 pb-3">
                      <button
                        onClick={() => setPredFilter('all')}
                        className={cn(
                          "px-3 py-1.5 text-xs font-bold uppercase tracking-wider transition-colors border",
                          predFilter === 'all' ? "bg-[#B8860B] text-[#111111] border-[#B8860B]" : "bg-[#0B2545] text-gray-400 border-gray-700 hover:text-white"
                        )}
                      >
                        Todos
                      </button>
                      <button
                        onClick={() => setPredFilter('groups')}
                        className={cn(
                          "px-3 py-1.5 text-xs font-bold uppercase tracking-wider transition-colors border",
                          predFilter === 'groups' ? "bg-[#B8860B] text-[#111111] border-[#B8860B]" : "bg-[#0B2545] text-gray-400 border-gray-700 hover:text-white"
                        )}
                      >
                        Fase de Grupos
                      </button>
                      <button
                        onClick={() => setPredFilter('knockouts')}
                        className={cn(
                          "px-3 py-1.5 text-xs font-bold uppercase tracking-wider transition-colors border",
                          predFilter === 'knockouts' ? "bg-[#B8860B] text-[#111111] border-[#B8860B]" : "bg-[#0B2545] text-gray-400 border-gray-700 hover:text-white"
                        )}
                      >
                        Fase Eliminatoria
                      </button>
                    </div>

                    <div className="max-h-[500px] overflow-y-auto pr-2 space-y-4 divide-y divide-gray-800">
                      {filteredPredMatches.map((match, idx) => {
                        const pred = userPredictions[match.id] || { homeScore: '', awayScore: '' };
                        return (
                          <div key={match.id} className={cn("pt-4 flex items-center justify-between gap-4", idx === 0 && "pt-0 border-t-0")}>
                            <div className="flex-1 text-sm font-bold uppercase font-mono tracking-wide truncate max-w-[150px] sm:max-w-none">
                              {match.home.name} vs {match.away.name}
                              <span className="block text-[10px] text-gray-400 font-normal mt-0.5">{match.round} | {match.date}</span>
                            </div>
                            <div className="flex items-center gap-1.5 shrink-0">
                              <input
                                type="text"
                                value={pred.homeScore}
                                onChange={(e) => handleUserScoreChange(match.id, 'homeScore', e.target.value)}
                                className="w-10 h-10 text-center border-2 border-[#111111] bg-[#0B2545] text-white font-bold text-sm focus-visible:border-[#B8860B]"
                                aria-label={`Pronóstico goles local admin ${match.home.name}`}
                              />
                              <span className="text-gray-400 font-bold">:</span>
                              <input
                                type="text"
                                value={pred.awayScore}
                                onChange={(e) => handleUserScoreChange(match.id, 'awayScore', e.target.value)}
                                className="w-10 h-10 text-center border-2 border-[#111111] bg-[#0B2545] text-white font-bold text-sm focus-visible:border-[#B8860B]"
                                aria-label={`Pronóstico goles visitante admin ${match.away.name}`}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Bonus Predictions — READ ONLY */}
                  <div className="bg-[#13315C] border-2 border-[#111111] p-6 sm:p-8 shadow-[6px_6px_0px_0px_#111111] space-y-5">
                    <div className="border-b border-gray-800 pb-4 flex items-center justify-between">
                      <div>
                        <h3 className="text-xl font-bold uppercase tracking-wider text-white flex items-center gap-2">
                          <Trophy size={20} className="text-[#B8860B]" /> Pronósticos Especiales
                        </h3>
                        <p className="text-xs text-gray-400 font-inter mt-1">
                          Estos pronósticos son definitivos — se guardan al registrarse y no se pueden modificar.
                        </p>
                      </div>
                      <div className="bg-[#0B2545] border border-gray-700 px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest text-gray-400 flex items-center gap-1.5 shrink-0">
                        <Shield size={12} className="text-gray-500" /> Solo lectura
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
                      {[
                        { label: 'Campeón', value: userBonus.champion, icon: '🏆' },
                        { label: 'Subcampeón', value: userBonus.subchampion, icon: '🥈' },
                        { label: 'Goleador', value: userBonus.topScorer, icon: '⚽' },
                        { label: 'Balón de Oro', value: userBonus.goldenBall, icon: '✨' },
                        { label: 'Guante de Oro', value: userBonus.goldenGlove, icon: '🧤' },
                      ].map(({ label, value, icon }) => (
                        <div
                          key={label}
                          className={cn(
                            "p-3 border-2 text-center",
                            value
                              ? "border-[#2D6A4F] bg-green-950/20"
                              : "border-gray-700 bg-[#0B2545]"
                          )}
                        >
                          <div className="text-lg mb-1">{icon}</div>
                          <div className="text-gray-400 font-bold uppercase tracking-wider text-[9px] mb-1">{label}</div>
                          <div className={cn(
                            "font-bold text-xs break-words",
                            value ? "text-white" : "text-gray-600 italic"
                          )}>
                            {value || 'Sin completar'}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>
              ) : (
                <div className="bg-[#13315C] border border-[#111111] p-12 text-center text-gray-400 shadow-[6px_6px_0px_0px_rgba(17,17,17,1)]">
                  Elige un participante de la izquierda para comenzar a gestionar sus pronósticos.
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 3: TOURNAMENT FINAL RESULTS */}
        {activeTab === 'tournament' && (
          <div className="max-w-2xl mx-auto bg-[#13315C] border-2 border-[#111111] p-6 sm:p-8 shadow-[6px_6px_0px_0px_#111111] space-y-6">
            <div className="border-b border-[#111111] pb-4">
              <h3 className="text-2xl font-bold uppercase tracking-wider text-white">Resultados Oficiales del Torneo</h3>
              <p className="text-xs text-gray-400 mt-1 font-inter">
                Ingresa aquí los ganadores oficiales del mundial al finalizar el torneo. Esto calculará los puntos de la sección Especiales de todos los participantes.
              </p>
            </div>

            <form onSubmit={handleSaveTournamentResults} className="space-y-6 font-inter">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-[#B8860B] mb-2">
                    Campeón Oficial
                  </label>
                  <select
                    value={tournamentResults.champion}
                    onChange={(e) => setTournamentResults(prev => ({ ...prev, champion: e.target.value }))}
                    className={cn(
                      "block w-full px-3 py-2.5 border-2 border-[#111111] bg-[#0B2545] text-white text-sm",
                      focusClasses
                    )}
                  >
                    <option value="">-- Elige Campeón --</option>
                    {teamsList.map(team => (
                      <option key={team} value={team}>{team}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-[#B8860B] mb-2">
                    Subcampeón Oficial
                  </label>
                  <select
                    value={tournamentResults.subchampion}
                    onChange={(e) => setTournamentResults(prev => ({ ...prev, subchampion: e.target.value }))}
                    className={cn(
                      "block w-full px-3 py-2.5 border-2 border-[#111111] bg-[#0B2545] text-white text-sm",
                      focusClasses
                    )}
                  >
                    <option value="">-- Elige Subcampeón --</option>
                    {teamsList.map(team => (
                      <option key={team} value={team}>{team}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-[#B8860B] mb-2">
                  Máximo Goleador Oficial (Bota de Oro)
                </label>
                <input
                  type="text"
                  value={tournamentResults.topScorer}
                  onChange={(e) => setTournamentResults(prev => ({ ...prev, topScorer: e.target.value }))}
                  placeholder="Ej: Kylian Mbappé"
                  className={cn(
                    "block w-full px-4 py-2.5 border-2 border-[#111111] bg-[#0B2545] text-white text-sm",
                    focusClasses
                  )}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-[#B8860B] mb-2">
                    Mejor Jugador Oficial (Balón de Oro)
                  </label>
                  <input
                    type="text"
                    value={tournamentResults.goldenBall}
                    onChange={(e) => setTournamentResults(prev => ({ ...prev, goldenBall: e.target.value }))}
                    placeholder="Ej: Lionel Messi"
                    className={cn(
                      "block w-full px-4 py-2.5 border-2 border-[#111111] bg-[#0B2545] text-white text-sm",
                      focusClasses
                    )}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-[#B8860B] mb-2">
                    Mejor Arquero Oficial (Guante de Oro)
                  </label>
                  <input
                    type="text"
                    value={tournamentResults.goldenGlove}
                    onChange={(e) => setTournamentResults(prev => ({ ...prev, goldenGlove: e.target.value }))}
                    placeholder="Ej: Emiliano Martínez"
                    className={cn(
                      "block w-full px-4 py-2.5 border-2 border-[#111111] bg-[#0B2545] text-white text-sm",
                      focusClasses
                    )}
                  />
                </div>
              </div>

              <div className="flex justify-end pt-4 border-t border-gray-800">
                <button
                  type="submit"
                  disabled={isLoadingAction}
                  className="bg-[#B8860B] text-[#111111] px-6 py-3 text-xs font-bold uppercase tracking-widest border border-[#111111] hover:scale-105 active:scale-95 transition-all disabled:opacity-50 flex items-center gap-1.5"
                >
                  <Save size={14} /> Guardar y Recalcular Bonus
                </button>
              </div>
            </form>
          </div>
        )}

      </div>
    </div>
  );
}
