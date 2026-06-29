'use client';

import React, { useState, useCallback } from 'react';
import { CircleBracket } from '@/components/ui/CircleBracket';
import { TeamFlag } from '@/components/ui/TeamFlag';
import { type DrawPosition, type Team, getPairWinner } from '@/lib/drawTree';
import { RotateCcw, Trophy, Info } from 'lucide-react';

// ── Equipos del Mundial 2026 — 16avos de final ─────────────────────────────
// Orden basado en KNOCKOUT_INITIAL_MAP del backend (partidos 73-88)
// Cada par es un partido de 16avos. Posiciones 1-32 en el anillo exterior.
const TEAMS_2026: { isoCode: string; name: string }[] = [
  // Partido 73: Sudáfrica vs Canadá
  { isoCode: 'ZAF', name: 'Sudáfrica' },
  { isoCode: 'CAN', name: 'Canadá' },
  // Partido 74: Alemania vs Paraguay
  { isoCode: 'DEU', name: 'Alemania' },
  { isoCode: 'PRY', name: 'Paraguay' },
  // Partido 75: Países Bajos vs Marruecos
  { isoCode: 'NLD', name: 'Países Bajos' },
  { isoCode: 'MAR', name: 'Marruecos' },
  // Partido 76: Brasil vs Japón
  { isoCode: 'BRA', name: 'Brasil' },
  { isoCode: 'JPN', name: 'Japón' },
  // Partido 77: Francia vs Suecia
  { isoCode: 'FRA', name: 'Francia' },
  { isoCode: 'SWE', name: 'Suecia' },
  // Partido 78: Costa de Marfil vs Noruega
  { isoCode: 'CIV', name: 'Costa de Marfil' },
  { isoCode: 'NOR', name: 'Noruega' },
  // Partido 79: México vs Senegal
  { isoCode: 'MEX', name: 'México' },
  { isoCode: 'SEN', name: 'Senegal' },
  // Partido 80: Inglaterra vs RD Congo
  { isoCode: 'ENG', name: 'Inglaterra' },
  { isoCode: 'COD', name: 'RD Congo' },
  // Partido 81: Estados Unidos vs Bosnia y Herzegovina
  { isoCode: 'USA', name: 'Estados Unidos' },
  { isoCode: 'BIH', name: 'Bosnia y Herzegovina' },
  // Partido 82: Bélgica vs Argelia
  { isoCode: 'BEL', name: 'Bélgica' },
  { isoCode: 'DZA', name: 'Argelia' },
  // Partido 83: Portugal vs Croacia
  { isoCode: 'PRT', name: 'Portugal' },
  { isoCode: 'HRV', name: 'Croacia' },
  // Partido 84: España vs Austria
  { isoCode: 'ESP', name: 'España' },
  { isoCode: 'AUT', name: 'Austria' },
  // Partido 85: Suiza vs Ecuador
  { isoCode: 'CHE', name: 'Suiza' },
  { isoCode: 'ECU', name: 'Ecuador' },
  // Partido 86: Argentina vs Cabo Verde
  { isoCode: 'ARG', name: 'Argentina' },
  { isoCode: 'CPV', name: 'Cabo Verde' },
  // Partido 87: Colombia vs Ghana
  { isoCode: 'COL', name: 'Colombia' },
  { isoCode: 'GHA', name: 'Ghana' },
  // Partido 88: Australia vs Egipto
  { isoCode: 'AUS', name: 'Australia' },
  { isoCode: 'EGY', name: 'Egipto' },
];

const DRAW_POSITIONS: DrawPosition[] = TEAMS_2026.map((team, index) => ({
  position: index + 1,
  pair: Math.ceil((index + 1) / 2),
  isoCode: team.isoCode,
  team: team.name,
}));

// Round names for display
const ROUND_NAMES = [
  '16avos de Final',  // ring 0
  '',                 // ring 1 (connector, unused)
  'Octavos de Final', // ring 2
  'Cuartos de Final', // ring 3
  'Semifinal',        // ring 4
  'Final',            // ring 5
];

export default function SimuladorPage() {
  const [pairWinners, setPairWinners] = useState<Record<string, Team>>({});
  const [showInfo, setShowInfo] = useState(false);

  const handleReset = useCallback(() => {
    setPairWinners({});
  }, []);

  // Derive champion from the innermost ring winner
  const champion = getPairWinner(pairWinners, 5, 0);

  // Count how many rounds have been filled
  const totalDecisions = Object.keys(pairWinners).length;
  const maxDecisions = 31; // 16 + 8 + 4 + 2 + 1

  return (
    <div className="min-h-screen bg-[#F4F1EA]">
      {/* Header */}
      <div className="bg-[#0B2545] border-b-4 border-[#B8860B] pt-28 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4">
            <div>
              <p className="text-[#B8860B] text-xs font-bold uppercase tracking-[0.3em] mb-1">
                GVB World Cup 2026
              </p>
              <h1 className="font-bebas text-5xl sm:text-7xl tracking-widest text-white">
                SIMULADOR
              </h1>
              <p className="text-[#F4F1EA] opacity-60 text-sm mt-2 max-w-md">
                Hacé clic en un equipo para elegirlo ganador. Avanzá por cada ronda hasta coronar al campeón.
              </p>
            </div>

            <div className="flex items-center gap-3">
              {/* Info toggle */}
              <button
                onClick={() => setShowInfo((v) => !v)}
                className="p-2 text-[#B8860B] hover:text-white transition-colors"
                aria-label="Información"
              >
                <Info size={20} />
              </button>

              {/* Reset */}
              <button
                onClick={handleReset}
                disabled={totalDecisions === 0}
                className="flex items-center gap-2 bg-transparent border-2 border-[#B8860B] text-[#B8860B] px-5 py-2 text-sm font-bold uppercase tracking-widest hover:bg-[#B8860B] hover:text-[#111111] transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <RotateCcw size={14} />
                Reiniciar
              </button>
            </div>
          </div>

          {/* Info panel */}
          {showInfo && (
            <div className="mt-4 bg-[#13315C] border border-[#B8860B] p-4 text-sm text-[#F4F1EA] max-w-xl">
              <p className="font-bold text-[#B8860B] mb-1">¿Cómo jugar?</p>
              <ul className="space-y-1 opacity-80 list-disc list-inside">
                <li>Los 32 equipos están en el anillo exterior (16avos)</li>
                <li>Hacé clic en el equipo que creés que gana cada partido</li>
                <li>El ganador avanza al anillo siguiente</li>
                <li>El campeón queda en el centro 🏆</li>
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col xl:flex-row gap-8 items-start">

          {/* Left panel — progress & champion */}
          <div className="w-full xl:w-64 flex-shrink-0 order-2 xl:order-1">
            {/* Champion card */}
            <div className="bg-white border-2 border-[#B8860B] shadow-[4px_4px_0px_0px_rgba(184,134,11,1)] p-5 mb-6">
              <div className="flex items-center gap-2 mb-3">
                <Trophy size={16} className="text-[#B8860B]" />
                <span className="text-xs font-bold uppercase tracking-widest text-[#B8860B]">
                  Campeón
                </span>
              </div>
              {champion ? (
                <div className="flex items-center gap-3">
                  <TeamFlag isoCode={champion.isoCode} size={40} />
                  <div>
                    <p className="font-bebas text-2xl tracking-wide text-[#0B2545]">
                      {champion.name}
                    </p>
                    <p className="text-xs text-[#5A5A5A] uppercase tracking-wider">
                      ¡Tu campeón!
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-3 opacity-40">
                  <div className="w-10 h-7 bg-[#E8E2D6] border border-[#CCC]" />
                  <p className="text-sm font-bold text-[#5A5A5A] uppercase tracking-wider">
                    Sin definir
                  </p>
                </div>
              )}
            </div>

            {/* Progress */}
            <div className="bg-white border border-[#E8E2D6] p-5 mb-6">
              <p className="text-xs font-bold uppercase tracking-widest text-[#5A5A5A] mb-3">
                Progreso
              </p>
              <div className="flex justify-between text-sm font-bold mb-2">
                <span className="text-[#0B2545]">{totalDecisions} de {maxDecisions}</span>
                <span className="text-[#B8860B]">
                  {Math.round((totalDecisions / maxDecisions) * 100)}%
                </span>
              </div>
              <div className="h-2 bg-[#E8E2D6] w-full">
                <div
                  className="h-2 bg-[#B8860B] transition-all duration-300"
                  style={{ width: `${(totalDecisions / maxDecisions) * 100}%` }}
                />
              </div>
            </div>

            {/* 16avos teams list */}
            <div className="bg-white border border-[#E8E2D6] p-5">
              <p className="text-xs font-bold uppercase tracking-widest text-[#5A5A5A] mb-3">
                16avos de Final
              </p>
              <div className="space-y-2">
                {Array.from({ length: 16 }, (_, i) => {
                  const t1 = TEAMS_2026[i * 2];
                  const t2 = TEAMS_2026[i * 2 + 1];
                  return (
                    <div key={i} className="flex items-center justify-between text-xs border-b border-[#F0EDE6] pb-1 last:border-0">
                      <div className="flex items-center gap-1.5">
                        <TeamFlag isoCode={t1.isoCode} size={16} />
                        <span className="font-medium text-[#111] truncate max-w-[80px]">{t1.name}</span>
                      </div>
                      <span className="text-[#B8860B] font-bold text-[10px] mx-1">VS</span>
                      <div className="flex items-center gap-1.5 text-right">
                        <span className="font-medium text-[#111] truncate max-w-[80px]">{t2.name}</span>
                        <TeamFlag isoCode={t2.isoCode} size={16} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Center — bracket */}
          <div className="flex-1 order-1 xl:order-2">
            <div className="bg-white border border-[#E8E2D6] p-4 sm:p-8 shadow-[4px_4px_0px_0px_rgba(11,37,69,0.15)]">
              {/* Round indicators */}
              <div className="flex justify-center gap-3 mb-6 flex-wrap">
                {ROUND_NAMES.filter(Boolean).map((name) => (
                  <span
                    key={name}
                    className="text-[10px] font-bold uppercase tracking-widest text-[#5A5A5A] border border-[#E8E2D6] px-2 py-1"
                  >
                    {name}
                  </span>
                ))}
              </div>

              <CircleBracket
                positions={DRAW_POSITIONS}
                pairWinners={pairWinners}
                onPairWinnersChange={setPairWinners}
              />

              {/* Legend */}
              <div className="flex items-center justify-center gap-6 mt-6 flex-wrap">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-[#0B2545] border-2 border-[#B8860B]" />
                  <span className="text-xs text-[#5A5A5A] uppercase tracking-wider">En juego</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-[#B8860B]" />
                  <span className="text-xs text-[#5A5A5A] uppercase tracking-wider">Ganador</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-[#5A5A5A] opacity-50" />
                  <span className="text-xs text-[#5A5A5A] uppercase tracking-wider">Eliminado</span>
                </div>
              </div>
            </div>

            {/* Note */}
            <p className="text-center text-xs text-[#5A5A5A] mt-3 opacity-60">
              El simulador es personal y no afecta tu prode real.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
