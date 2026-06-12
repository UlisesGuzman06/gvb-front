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
  Target
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
                Predicciones Especiales
              </h2>
              <span className="text-xs font-bold font-mono text-[#B8860B]">VER BONUS</span>
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

                {/* Grid of Bonus predictions */}
                <div className="space-y-4 font-inter">
                  
                  {/* Champion */}
                  <div className="flex items-start gap-3 bg-[#0B2545] p-3 border border-[#111111]">
                    <div className="p-2 bg-[#13315C] border border-[#B8860B] text-[#B8860B] shrink-0">
                      <Trophy size={18} />
                    </div>
                    <div>
                      <span className="text-[10px] text-gray-400 font-mono font-bold block uppercase tracking-wider">
                        Campeón del Mundo (+10 pts)
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
                        Subcampeón del Mundo (+5 pts)
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
                        Bota de Oro / Goleador (+5 pts)
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
                        Balón de Oro / Mejor Jugador (+5 pts)
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
                        Guante de Oro / Mejor Arquero (+5 pts)
                      </span>
                      <span className="text-sm font-bold text-white uppercase block mt-0.5">
                        {selectedParticipant.bonus.goldenGlove}
                      </span>
                    </div>
                  </div>

                </div>

                {/* Footer note */}
                <div className="bg-[#0B2545] p-3 border border-gray-800 text-[10px] text-gray-400 font-inter text-center">
                  * Las predicciones se bloquearon al iniciar el torneo el 11/06/2026.
                </div>

              </div>
            ) : (
              <div className="bg-[#13315C] border border-[#111111] p-8 text-center text-gray-400 shadow-[6px_6px_0px_0px_rgba(17,17,17,1)]">
                Selecciona un participante de la tabla para ver sus predicciones de Bonus.
              </div>
            )}

          </div>

        </div>

      </div>
    </div>
  );
}
