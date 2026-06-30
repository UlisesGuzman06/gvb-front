'use client';

import React, { useState, useCallback, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import { useMatches } from '@/hooks/useMatches';

const CirclePoints = dynamic(
  () => import('@/components/ui/CirclePoints').then((mod) => mod.CirclePoints),
  { ssr: false }
);
import { 
  type DrawPosition, 
  type Team, 
  deriveSlotTeams, 
  pairKey, 
  selectPairWinner, 
  getPairCount,
  getPairIndices,
  slotKey,
  type PlayableRing
} from '@/lib/drawTree';
import { RotateCcw, RefreshCw, Sparkles } from 'lucide-react';

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

export default function SimuladorPage() {
  const [pairWinners, setPairWinners] = useState<Record<string, Team>>({});
  const [drawKey, setDrawKey] = useState(0);
  const [hasLoadedReales, setHasLoadedReales] = useState(false);

  // Referencia para cancelar la secuencia aleatoria activa si se vuelve a clickear o se reinicia
  const randomTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Hook de React-Query para obtener la base de datos de partidos reales
  const { data: allMatches = [], isLoading: isLoadingMatches } = useMatches();

  const cancelRandomSequence = useCallback(() => {
    if (randomTimeoutRef.current) {
      clearTimeout(randomTimeoutRef.current);
      randomTimeoutRef.current = null;
    }
  }, []);

  // Limpiar timer al desmontar el componente
  useEffect(() => {
    return () => cancelRandomSequence();
  }, [cancelRandomSequence]);

  const handleReset = useCallback(() => {
    cancelRandomSequence();
    setPairWinners({});
    setDrawKey((current) => current + 1);
  }, [cancelRandomSequence]);

  // Lógica inteligente para cargar los resultados oficiales/reales
  const cargarResultadosReales = useCallback((fixtures: any[]) => {
    let newWinners: Record<string, Team> = {};
    const playableRings: PlayableRing[] = [0, 2, 3, 4, 5];

    for (const ringIndex of playableRings) {
      const currentSlotTeams = deriveSlotTeams(DRAW_POSITIONS, newWinners);
      const pairCount = getPairCount(ringIndex);

      for (let pairIndex = 0; pairIndex < pairCount; pairIndex++) {
        const [slotA, slotB] = getPairIndices(ringIndex, pairIndex);
        const teamA = currentSlotTeams[slotKey(ringIndex, slotA)];
        const teamB = currentSlotTeams[slotKey(ringIndex, slotB)];

        if (!teamA || !teamB) continue;

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
          const homeScore = realMatch.homeScore ?? 0;
          const awayScore = realMatch.awayScore ?? 0;
          let winnerTeam: Team | null = null;
          
          if (homeScore !== awayScore) {
            winnerTeam = homeScore > awayScore
              ? (realMatch.home?.name === teamA.name ? teamA : teamB)
              : (realMatch.away?.name === teamA.name ? teamA : teamB);
          } else {
            const matchNum = (realMatch as any).num !== undefined && (realMatch as any).num !== null 
              ? Number((realMatch as any).num) 
              : Number(realMatch.id);
              
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

  // Lógica para completar aleatoriamente el bracket de forma progresiva con animaciones
  const handleRandom = useCallback(() => {
    cancelRandomSequence();

    // Empezamos con un bracket completamente vacío para una simulación 100% aleatoria
    let baseWinners: Record<string, Team> = {};

    // Limpiamos los ganadores manuales/viejos en el estado para poder correr las animaciones desde la base limpia
    setPairWinners(baseWinners);
    setDrawKey((current) => current + 1);

    // 2. Iniciamos la cascada de simulación ronda por ronda
    let currentWinners = { ...baseWinners };
    const ringQueue: PlayableRing[] = [0, 2, 3, 4, 5];

    const resolveNextRing = (queueIndex: number) => {
      if (queueIndex >= ringQueue.length) return;

      const ringIndex = ringQueue[queueIndex];
      const currentSlotTeams = deriveSlotTeams(DRAW_POSITIONS, currentWinners);
      const pairCount = getPairCount(ringIndex);
      let changed = false;

      for (let pairIndex = 0; pairIndex < pairCount; pairIndex++) {
        const key = pairKey(ringIndex, pairIndex);

        if (!currentWinners[key]) {
          const [slotA, slotB] = getPairIndices(ringIndex, pairIndex);
          const teamA = currentSlotTeams[slotKey(ringIndex, slotA)];
          const teamB = currentSlotTeams[slotKey(ringIndex, slotB)];

          if (teamA && teamB) {
            const chosenTeam = Math.random() < 0.5 ? teamA : teamB;
            currentWinners[key] = chosenTeam;
            changed = true;
          }
        }
      }

      if (changed) {
        setPairWinners({ ...currentWinners });
      }

      // Esperamos 1050ms (duración de la transición animada + un pequeño margen para confort visual)
      // para resolver la siguiente ronda concéntrica.
      randomTimeoutRef.current = setTimeout(() => {
        resolveNextRing(queueIndex + 1);
      }, 1050);
    };

    // Iniciamos la secuencia tras un brevísimo timeout para que el render del reset impacte
    randomTimeoutRef.current = setTimeout(() => {
      resolveNextRing(0);
    }, 50);
  }, [cancelRandomSequence]);

  // Auto-cargar resultados oficiales del fixture real al iniciar
  useEffect(() => {
    if (allMatches.length > 0 && !hasLoadedReales) {
      cargarResultadosReales(allMatches);
      setHasLoadedReales(true);
    }
  }, [allMatches, hasLoadedReales, cargarResultadosReales]);

  const handleCargarRealesClick = () => {
    cancelRandomSequence();
    cargarResultadosReales(allMatches);
  };

  return (
    <div className="min-h-screen bg-[#F4F1EA] pt-28 pb-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Encabezado minimalista */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="font-bebas text-5xl sm:text-6xl tracking-widest text-[#0B2545]">
              SIMULADOR DE KNOCKOUT
            </h1>
            <p className="text-[#5A5A5A] text-sm font-medium mt-1">
              Hacé clic sobre las banderas de cada par para seleccionar el ganador y avanzar en la llave.
            </p>
          </div>
        </div>

        {/* Botonera de control */}
        <div className="flex flex-wrap gap-3 mb-6 justify-center md:justify-start">
          <button
            onClick={handleCargarRealesClick}
            disabled={isLoadingMatches || allMatches.length === 0}
            className="flex items-center gap-2 border-2 border-[#B8860B] bg-transparent text-[#B8860B] px-5 py-2.5 text-xs font-bold uppercase tracking-widest hover:bg-[#B8860B] hover:text-white transition-all active:scale-95 duration-100 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RefreshCw size={14} className={isLoadingMatches ? 'animate-spin' : ''} />
            Cargar Reales
          </button>

          <button
            onClick={handleRandom}
            className="flex items-center gap-2 border-2 border-[#0B2545] bg-[#0B2545] text-white px-5 py-2.5 text-xs font-bold uppercase tracking-widest hover:bg-transparent hover:text-[#0B2545] transition-all active:scale-95 duration-100"
          >
            <Sparkles size={14} />
            Aleatorio
          </button>

          <button
            onClick={handleReset}
            className="flex items-center gap-2 border-2 border-[#0B2545] bg-transparent text-[#0B2545] px-5 py-2.5 text-xs font-bold uppercase tracking-widest hover:bg-[#0B2545] hover:text-white transition-all active:scale-95 duration-100"
          >
            <RotateCcw size={14} />
            Reiniciar
          </button>
        </div>

        {/* Simulador Circular Limpio y Centrado */}
        <div className="bg-white border border-[#E8E2D6] p-6 md:p-10 shadow-[4px_4px_0px_0px_rgba(11,37,69,0.15)] flex justify-center items-center overflow-x-auto min-h-[550px]">
          <div className="min-w-[500px] w-full max-w-[700px] aspect-square flex justify-center items-center">
            <CirclePoints
              key={drawKey}
              positions={DRAW_POSITIONS}
              pairWinners={pairWinners}
              onPairWinnersChange={setPairWinners}
            />
          </div>
        </div>

      </div>
    </div>
  );
}
