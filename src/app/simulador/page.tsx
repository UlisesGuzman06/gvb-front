'use client';

import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { CirclePoints } from '@/components/ui/CirclePoints';
import { useMatches } from '@/hooks/useMatches';
import { 
  type DrawPosition, 
  type Team, 
  deriveSlotTeams, 
  getPairWinner, 
  slotKey, 
  pairKey, 
  getPairIndex, 
  selectPairWinner, 
  canSelectPair,
  isPlayableRing,
  type PlayableRing,
  getPairCount,
  getPairIndices
} from '@/lib/drawTree';
import { TeamFlag } from '@/components/ui/TeamFlag';
import { RotateCcw, Trophy, RefreshCw } from 'lucide-react';

const TEAMS_2026 = [
  { isoCode: "BRA", name: "Brasil" },
  { isoCode: "JPN", name: "Japón" },
  { isoCode: "CIV", name: "Costa de Marfil" },
  { isoCode: "NOR", name: "Noruega" },
  { isoCode: "MEX", name: "México" },
  { isoCode: "ECU", name: "Ecuador" },
  { isoCode: "ENG", name: "Inglaterra" },
  { isoCode: "COD", name: "RD Congo" },
  { isoCode: "ARG", name: "Argentina" },
  { isoCode: "CPV", name: "Cabo Verde" },
  { isoCode: "AUS", name: "Australia" },
  { isoCode: "EGY", name: "Egipto" },
  { isoCode: "CHE", name: "Suiza" },
  { isoCode: "DZA", name: "Argelia" },
  { isoCode: "COL", name: "Colombia" },
  { isoCode: "GHA", name: "Ghana" },
  { isoCode: "SEN", name: "Senegal" },
  { isoCode: "BEL", name: "Bélgica" },
  { isoCode: "USA", name: "Estados Unidos" },
  { isoCode: "BIH", name: "Bosnia y Herzegovina" },
  { isoCode: "ESP", name: "España" },
  { isoCode: "AUT", name: "Austria" },
  { isoCode: "PRT", name: "Portugal" },
  { isoCode: "HRV", name: "Croacia" },
  { isoCode: "NLD", name: "Países Bajos" },
  { isoCode: "MAR", name: "Marruecos" },
  { isoCode: "CAN", name: "Canadá" },
  { isoCode: "ZAF", name: "Sudáfrica" },
  { isoCode: "FRA", name: "Francia" },
  { isoCode: "SWE", name: "Suecia" },
  { isoCode: "DEU", name: "Alemania" },
  { isoCode: "PRY", name: "Paraguay" },
] as const;

const DRAW_POSITIONS: DrawPosition[] = TEAMS_2026.map((team, index) => {
  const position = index + 1;

  return {
    position,
    pair: Math.ceil(position / 2),
    isoCode: team.isoCode,
    team: team.name,
  };
});

// Definición de las rondas de la fase de knockout
type RoundDef = {
  name: string;
  ringIndex: PlayableRing;
  matchCount: number;
};

const ROUNDS: RoundDef[] = [
  { name: '16avos de Final', ringIndex: 0, matchCount: 16 },
  { name: 'Octavos de Final', ringIndex: 2, matchCount: 8 },
  { name: 'Cuartos de Final', ringIndex: 3, matchCount: 4 },
  { name: 'Semifinal', ringIndex: 4, matchCount: 2 },
  { name: 'Final', ringIndex: 5, matchCount: 1 },
];

export default function SimuladorPage() {
  const [pairWinners, setPairWinners] = useState<Record<string, Team>>({});
  const [drawKey, setDrawKey] = useState(0);
  const [activeTab, setActiveTab] = useState<PlayableRing>(0);
  const [hasLoadedReales, setHasLoadedReales] = useState(false);

  // Hook de React-Query para obtener la base de datos de partidos reales
  const { data: allMatches = [], isLoading: isLoadingMatches } = useMatches();

  const handleReset = useCallback(() => {
    setPairWinners({});
    setDrawKey((current) => current + 1);
  }, []);

  // Obtener todos los equipos en sus respectivas posiciones de forma reactiva
  const slotTeams = useMemo(() => {
    return deriveSlotTeams(DRAW_POSITIONS, pairWinners);
  }, [pairWinners]);

  // Manejar el click sobre un equipo en la tabla de la derecha para avanzar
  const handleTeamClick = useCallback((ringIndex: PlayableRing, slotIndex: number, team: Team) => {
    const pairIndex = getPairIndex(slotIndex);
    const blockedSlots = new Set<string>(); // en este panel lateral no bloqueamos por animación para que sea inmediato
    
    if (canSelectPair(ringIndex, pairIndex, slotTeams, blockedSlots)) {
      setPairWinners((current) =>
        selectPairWinner(DRAW_POSITIONS, current, ringIndex, pairIndex, team)
      );
    }
  }, [slotTeams]);

  // Campeón del torneo
  const champion = useMemo(() => {
    return getPairWinner(5, 0, pairWinners);
  }, [pairWinners]);

  // Lógica inteligente para cargar los resultados oficiales/reales
  const cargarResultadosReales = useCallback((fixtures: any[]) => {
    let newWinners: Record<string, Team> = {};
    const playableRings: PlayableRing[] = [0, 2, 3, 4, 5];

    for (const ringIndex of playableRings) {
      // Obtenemos los equipos proyectados en base a lo que ya decidimos
      const currentSlotTeams = deriveSlotTeams(DRAW_POSITIONS, newWinners);
      const pairCount = getPairCount(ringIndex);

      for (let pairIndex = 0; pairIndex < pairCount; pairIndex++) {
        const [slotA, slotB] = getPairIndices(ringIndex, pairIndex);
        const teamA = currentSlotTeams[slotKey(ringIndex, slotA)];
        const teamB = currentSlotTeams[slotKey(ringIndex, slotB)];

        if (!teamA || !teamB) continue;

        // Buscamos si existe un partido real terminado entre estos dos equipos
        const realMatch = fixtures.find((f: any) => 
          f.status === 'FINISHED' && 
          f.homeScore !== null && 
          f.awayScore !== null && 
          (
            (f.home?.name === teamA.name && f.away?.name === teamB.name) ||
            (f.home?.name === teamB.name && f.away?.name === teamA.name)
          )
        );

        if (realMatch) {
          let winnerTeam: Team | null = null;
          
          if (realMatch.homeScore !== realMatch.awayScore) {
            // Ganador por diferencia de goles
            winnerTeam = realMatch.homeScore > realMatch.awayScore
              ? (realMatch.home?.name === teamA.name ? teamA : teamB)
              : (realMatch.away?.name === teamA.name ? teamA : teamB);
          } else {
            // Empate en tiempo regular/extra. Deducimos el clasificado por penales
            // viendo quién de los dos equipos figura en algún otro partido futuro/posterior
            // de la copa del mundo (número de partido superior al realMatch.num/id)
            const matchNum = realMatch.num !== undefined && realMatch.num !== null ? Number(realMatch.num) : Number(realMatch.id);
            
            const teamAAdvanced = fixtures.some((f: any) => {
              const fNum = f.num !== undefined && f.num !== null ? Number(f.num) : Number(f.id);
              return fNum > matchNum && (f.home?.name === teamA.name || f.away?.name === teamA.name);
            });

            winnerTeam = teamAAdvanced ? teamA : teamB;
          }

          if (winnerTeam) {
            newWinners[pairKey(ringIndex, pairIndex)] = winnerTeam;
          }
        }
      }
    }

    setPairWinners(newWinners);
    setDrawKey((current) => current + 1);
  }, []);

  // Auto-cargar resultados oficiales del fixture real al iniciar
  useEffect(() => {
    if (allMatches.length > 0 && !hasLoadedReales) {
      cargarResultadosReales(allMatches);
      setHasLoadedReales(true);
    }
  }, [allMatches, hasLoadedReales, cargarResultadosReales]);

  const handleCargarRealesClick = () => {
    cargarResultadosReales(allMatches);
  };

  return (
    <div className="min-h-screen bg-[#F4F1EA] pt-28 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Encabezado */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="font-bebas text-5xl sm:text-6xl tracking-widest text-[#0B2545]">
              SIMULADOR DE KNOCKOUT
            </h1>
            <p className="text-[#5A5A5A] text-sm font-medium mt-1">
              Selecciona los ganadores en el círculo o en la tabla de la derecha para armar tu fixture del Mundial 2026.
            </p>
          </div>
          
          <div className="flex gap-3">
            <button
              onClick={handleCargarRealesClick}
              disabled={isLoadingMatches || allMatches.length === 0}
              className="flex items-center gap-2 border-2 border-[#B8860B] bg-transparent text-[#B8860B] px-5 py-2.5 text-xs font-bold uppercase tracking-widest hover:bg-[#B8860B] hover:text-white transition-all active:scale-95 duration-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <RefreshCw size={14} className={isLoadingMatches ? 'animate-spin' : ''} />
              Cargar Reales
            </button>

            <button
              onClick={handleReset}
              className="flex items-center gap-2 border-2 border-[#0B2545] text-[#0B2545] px-5 py-2.5 text-xs font-bold uppercase tracking-widest hover:bg-[#0B2545] hover:text-white transition-all active:scale-95 duration-100"
            >
              <RotateCcw size={14} />
              Reiniciar
            </button>
          </div>
        </div>

        {/* Layout de dos columnas */}
        <div className="flex flex-col xl:flex-row gap-8 items-start">
          
          {/* Columna Izquierda: Simulador Circular */}
          <div className="w-full xl:w-2/3 bg-white border border-[#E8E2D6] p-6 md:p-10 shadow-[4px_4px_0px_0px_rgba(11,37,69,0.15)] flex justify-center items-center overflow-x-auto min-h-[550px]">
            <div className="min-w-[550px] w-full max-w-[750px] aspect-square flex justify-center items-center">
              <CirclePoints
                key={drawKey}
                positions={DRAW_POSITIONS}
                pairWinners={pairWinners}
                onPairWinnersChange={setPairWinners}
              />
            </div>
          </div>

          {/* Columna Derecha: Tablas de Rondas */}
          <div className="w-full xl:w-1/3 flex flex-col gap-6 self-stretch">
            
            {/* Tarjeta del Campeón */}
            <div className="bg-[#0B2545] border-b-4 border-[#B8860B] p-5 shadow-[4px_4px_0px_0px_#111] text-white">
              <div className="flex items-center gap-2 mb-2 text-[#B8860B]">
                <Trophy size={18} />
                <span className="text-xs font-bold uppercase tracking-widest">
                  Campeón del Mundo 2026
                </span>
              </div>
              {champion ? (
                <div className="flex items-center gap-3 mt-1">
                  <TeamFlag team={champion} className="w-12 h-12 object-cover border-2 border-[#B8860B] rounded-full" />
                  <div>
                    <h2 className="font-bebas text-3xl tracking-widest text-white uppercase">{champion.name}</h2>
                    <p className="text-[10px] text-[#B8860B] font-bold uppercase tracking-widest">¡Tu selección para el título!</p>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-3 mt-1 opacity-50">
                  <div className="w-12 h-12 rounded-full border-2 border-dashed border-white/50 flex items-center justify-center font-bold text-xl">?</div>
                  <div>
                    <h2 className="font-bebas text-3xl tracking-widest text-white/50 uppercase">SIN DEFINIR</h2>
                    <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest">Completa los cruces para elegir al campeón</p>
                  </div>
                </div>
              )}
            </div>

            {/* Panel de Control de Rondas (Tabs) */}
            <div className="bg-white border border-[#E8E2D6] p-4 shadow-[4px_4px_0px_0px_rgba(11,37,69,0.05)] flex-1 flex flex-col min-h-[500px]">
              
              {/* Barra de pestañas */}
              <div className="flex border-b border-[#E8E2D6] overflow-x-auto pb-1 no-scrollbar gap-1 mb-4">
                {ROUNDS.map((r) => (
                  <button
                    key={r.ringIndex}
                    onClick={() => setActiveTab(r.ringIndex)}
                    className={`flex-1 text-[10px] sm:text-xs font-bold uppercase tracking-wider py-2 text-center border-b-2 transition-all whitespace-nowrap px-2 ${
                      activeTab === r.ringIndex
                        ? 'border-[#B8860B] text-[#0B2545]'
                        : 'border-transparent text-[#5A5A5A] hover:text-[#0B2545]'
                    }`}
                  >
                    {r.name.split(' ')[0]}
                  </button>
                ))}
              </div>

              {/* Lista de partidos de la ronda activa */}
              <div className="flex-1 overflow-y-auto max-h-[500px] pr-1 space-y-3">
                {ROUNDS.map((round) => {
                  if (activeTab !== round.ringIndex) return null;

                  return Array.from({ length: round.matchCount }, (_, matchIdx) => {
                    const slotA = matchIdx * 2;
                    const slotB = matchIdx * 2 + 1;

                    const teamA = slotTeams[slotKey(round.ringIndex, slotA)];
                    const teamB = slotTeams[round.ringIndex === 5 ? slotKey(5, 1) : slotKey(round.ringIndex, slotB)]; 
                    // Nota: para la gran final (ring 5), el contrincante es slot 5-1

                    const winner = getPairWinner(round.ringIndex, matchIdx, pairWinners);

                    const canVote = teamA && teamB;

                    return (
                      <div 
                        key={`${round.ringIndex}-${matchIdx}`}
                        className={`border p-3 transition-all ${
                          canVote 
                            ? 'border-[#E8E2D6] bg-[#FDFDFD]' 
                            : 'border-[#F0EDE6] bg-[#FAF8F5] opacity-60'
                        }`}
                      >
                        <div className="flex justify-between items-center mb-1.5 text-[9px] text-[#5A5A5A] font-bold uppercase tracking-wider">
                          <span>Partido {matchIdx + 1}</span>
                          {!canVote && <span className="text-[#B8860B]">Esperando clasificados</span>}
                        </div>

                        <div className="flex flex-col gap-2">
                          
                          {/* Equipo Local / Superior */}
                          <button
                            disabled={!canVote}
                            onClick={() => teamA && handleTeamClick(round.ringIndex, slotA, teamA)}
                            className={`flex items-center justify-between p-2 text-left border transition-all text-xs ${
                              teamA && winner && winner.isoCode === teamA.isoCode
                                ? 'bg-[#0B2545] border-[#0B2545] text-white font-bold'
                                : 'bg-white border-[#E8E2D6] text-[#111] hover:border-[#B8860B]'
                            } ${!canVote ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
                          >
                            <div className="flex items-center gap-2 truncate">
                              {teamA ? (
                                <>
                                  <TeamFlag team={teamA} className="w-5 h-5 object-cover rounded-full" />
                                  <span className="truncate">{teamA.name}</span>
                                </>
                              ) : (
                                <>
                                  <div className="w-5 h-5 rounded-full border border-dashed border-[#AAA] bg-[#F0EDE6] flex items-center justify-center text-[10px] text-[#888] font-bold">?</div>
                                  <span className="text-[#888] italic">Por definir</span>
                                </>
                              )}
                            </div>
                            {teamA && winner && winner.isoCode === teamA.isoCode && (
                              <span className="text-[10px] bg-[#B8860B] text-[#111] px-1.5 font-bold rounded-sm">W</span>
                            )}
                          </button>

                          {/* Equipo Visitante / Inferior */}
                          <button
                            disabled={!canVote}
                            onClick={() => teamB && handleTeamClick(round.ringIndex, slotB, teamB)}
                            className={`flex items-center justify-between p-2 text-left border transition-all text-xs ${
                              teamB && winner && winner.isoCode === teamB.isoCode
                                ? 'bg-[#0B2545] border-[#0B2545] text-white font-bold'
                                : 'bg-white border-[#E8E2D6] text-[#111] hover:border-[#B8860B]'
                            } ${!canVote ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
                          >
                            <div className="flex items-center gap-2 truncate">
                              {teamB ? (
                                <>
                                  <TeamFlag team={teamB} className="w-5 h-5 object-cover rounded-full" />
                                  <span className="truncate">{teamB.name}</span>
                                </>
                              ) : (
                                <>
                                  <div className="w-5 h-5 rounded-full border border-dashed border-[#AAA] bg-[#F0EDE6] flex items-center justify-center text-[10px] text-[#888] font-bold">?</div>
                                  <span className="text-[#888] italic">Por definir</span>
                                </>
                              )}
                            </div>
                            {teamB && winner && winner.isoCode === teamB.isoCode && (
                              <span className="text-[10px] bg-[#B8860B] text-[#111] px-1.5 font-bold rounded-sm">W</span>
                            )}
                          </button>

                        </div>
                      </div>
                    );
                  });
                })}
              </div>

            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
