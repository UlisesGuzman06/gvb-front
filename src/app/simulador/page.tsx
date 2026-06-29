'use client';

import React, { useState, useCallback } from 'react';
import { CirclePoints } from '@/components/ui/CirclePoints';
import { type DrawPosition, type Team } from '@/lib/drawTree';
import { RotateCcw } from 'lucide-react';

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

  const handleReset = useCallback(() => {
    setPairWinners({});
    setDrawKey((current) => current + 1);
  }, []);

  return (
    <div className="min-h-screen bg-[#F4F1EA] pt-28 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="font-bebas text-5xl sm:text-6xl tracking-widest text-[#0B2545]">
              SIMULADOR DE KNOCKOUT
            </h1>
            <p className="text-[#5A5A5A] text-sm font-medium mt-1">
              Hacé clic sobre las banderas de cada par para seleccionar el ganador y avanzar en la llave.
            </p>
          </div>
          <button
            onClick={handleReset}
            className="flex items-center gap-2 border border-[#0B2545] text-[#0B2545] px-6 py-2.5 text-xs font-bold uppercase tracking-widest hover:bg-[#0B2545] hover:text-white transition-colors"
          >
            <RotateCcw size={14} />
            Reiniciar
          </button>
        </div>

        <div className="bg-white border border-[#E8E2D6] p-6 md:p-12 shadow-[4px_4px_0px_0px_rgba(11,37,69,0.15)] flex justify-center items-center overflow-x-auto">
          <div className="min-w-[650px] w-full max-w-[900px] aspect-square flex justify-center items-center">
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
