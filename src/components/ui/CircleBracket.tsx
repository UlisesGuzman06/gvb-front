'use client';

/**
 * CircleBracket — Simulador circular de knockout del Mundial 2026
 * Ported & adapted from pauljnoble/fwc2026-knockout (MIT License)
 *
 * Lógica: el usuario hace clic en un equipo para elegirlo ganador de su par.
 * El ganador avanza al siguiente anillo (ronda) con una animación.
 */

import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
  useMemo,
  type CSSProperties,
} from 'react';
import {
  canSelectPair,
  deriveSlotTeams,
  getPairIndex,
  getPairWinner,
  getTeamState,
  isPlayableRing,
  NEXT_RING,
  RING_COUNTS,
  pairKey,
  selectPairWinner,
  slotKey,
  type DrawPosition,
  type PlayableRing,
  type Team,
} from '@/lib/drawTree';
import { TeamFlag } from './TeamFlag';

// ── Geometry constants ──────────────────────────────────────────────────────
const RING_RADII = [50, 40.5, 31, 22, 13.5, 5.5] as const;

function computeRingOffsets(): number[] {
  const offsets: number[] = [];
  for (let i = 0; i < RING_COUNTS.length; i++) {
    const count = RING_COUNTS[i];
    const step = (2 * Math.PI) / count;
    if (i === 0) { offsets.push(step / 2); continue; }
    const prevCount = RING_COUNTS[i - 1];
    const prevOffset = offsets[i - 1];
    const prevStep = (2 * Math.PI) / prevCount;
    offsets.push(count === prevCount ? prevOffset : prevOffset + prevStep / 2);
  }
  return offsets;
}

const RING_OFFSETS = computeRingOffsets();

type Point = { id: string; x: number; y: number };

function getRingRadius(ringIndex: number, expansionOffset = 0): number {
  return (RING_RADII[ringIndex] ?? RING_RADII[RING_RADII.length - 1]) + expansionOffset;
}

function getRingPoints(count: number, ringIndex: number, expansionOffset = 0): Point[] {
  const radius = getRingRadius(ringIndex, expansionOffset);
  const offset = RING_OFFSETS[ringIndex];
  return Array.from({ length: count }, (_, index) => {
    const angle = (2 * Math.PI * index) / count + offset;
    return {
      id: `${ringIndex}-${index}`,
      x: 50 + radius * Math.sin(angle),
      y: 50 - radius * Math.cos(angle),
    };
  });
}

function buildRings(expansionOffset = 0) {
  return RING_COUNTS.map((count, ringIndex) => ({
    count,
    ringIndex,
    points: getRingPoints(count, ringIndex, expansionOffset),
  }));
}

function getPairArcPath(from: Point, to: Point, radius: number): string {
  return `M ${from.x} ${from.y} A ${radius} ${radius} 0 0 1 ${to.x} ${to.y}`;
}

function getPairArcMidpoint(from: Point, to: Point): Point {
  return { id: 'mid', x: (from.x + to.x) / 2, y: (from.y + to.y) / 2 };
}

// ── Types ───────────────────────────────────────────────────────────────────
export type CircleBracketProps = {
  positions: DrawPosition[];
  pairWinners: Record<string, Team>;
  onPairWinnersChange: (pw: Record<string, Team>) => void;
};

// ── Component ────────────────────────────────────────────────────────────────
export function CircleBracket({ positions, pairWinners, onPairWinnersChange }: CircleBracketProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerSize, setContainerSize] = useState(600);
  const [tooltip, setTooltip] = useState<{
    team: Team;
    x: number;
    y: number;
    beatBy: Team | null;
    side: 'left' | 'right';
  } | null>(null);
  const [hoveredKey, setHoveredKey] = useState<string | null>(null);

  // Track container size for responsive scaling
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const obs = new ResizeObserver((entries) => {
      const { width } = entries[0].contentRect;
      setContainerSize(width);
    });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const rings = useMemo(() => buildRings(), []);
  const expandedRings = useMemo(() => buildRings(0.4), []);

  // Scale: SVG is in a 100×100 viewBox → convert to px for tooltips
  const scale = containerSize / 100;

  const handleSlotClick = useCallback(
    (ringIndex: number, slotIndex: number, team: Team) => {
      if (!isPlayableRing(ringIndex)) return;
      const pairIndex = getPairIndex(slotIndex);
      if (!canSelectPair(positions, pairWinners, ringIndex, pairIndex)) return;
      const next = selectPairWinner(pairWinners, ringIndex, pairIndex, team);
      onPairWinnersChange(next);
    },
    [positions, pairWinners, onPairWinnersChange]
  );

  const handleMouseEnter = useCallback(
    (
      e: React.MouseEvent,
      ringIndex: number,
      slotIndex: number,
      team: Team,
      pointX: number
    ) => {
      const pairIndex = getPairIndex(slotIndex);
      const winner = getPairWinner(pairWinners, ringIndex, pairIndex);
      const beatBy = winner && winner.isoCode !== team.isoCode ? winner : null;
      const side: 'left' | 'right' = pointX >= 50 ? 'right' : 'left';
      setTooltip({ team, x: e.clientX, y: e.clientY, beatBy, side });
      setHoveredKey(slotKey(ringIndex, slotIndex));
    },
    [pairWinners]
  );

  const handleMouseLeave = useCallback(() => {
    setTooltip(null);
    setHoveredKey(null);
  }, []);

  // Derive champion (inner ring winner)
  const champion = getPairWinner(pairWinners, 5, 0);

  return (
    <div className="relative w-full select-none" ref={containerRef}>
      {/* SVG bracket */}
      <svg
        viewBox="0 0 100 100"
        className="w-full h-auto"
        style={{ overflow: 'visible' }}
      >
        {/* Connector lines between rings */}
        <g className="bracket-connectors" style={{ pointerEvents: 'none' }}>
          {rings.map(({ ringIndex, count, points }) => {
            if (!isPlayableRing(ringIndex)) return null;
            const nextRingIndex = NEXT_RING[ringIndex as PlayableRing];
            if (nextRingIndex === null) return null;
            const nextPoints = rings[nextRingIndex]?.points ?? [];
            return Array.from({ length: count / 2 }, (_, pairIdx) => {
              const [i1, i2] = [pairIdx * 2, pairIdx * 2 + 1];
              const p1 = points[i1];
              const p2 = points[i2];
              const np = nextPoints[pairIdx];
              if (!p1 || !p2 || !np) return null;
              const radius = getRingRadius(ringIndex);
              return (
                <g key={`connector-${ringIndex}-${pairIdx}`}>
                  <path
                    d={getPairArcPath(p1, p2, radius)}
                    stroke="#B8860B"
                    strokeWidth="0.15"
                    fill="none"
                    strokeOpacity="0.4"
                  />
                  <line
                    x1={getPairArcMidpoint(p1, p2).x}
                    y1={getPairArcMidpoint(p1, p2).y}
                    x2={np.x}
                    y2={np.y}
                    stroke="#B8860B"
                    strokeWidth="0.15"
                    strokeOpacity="0.3"
                  />
                </g>
              );
            });
          })}
        </g>

        {/* Concentric ring circles (decorative) */}
        {RING_RADII.map((r, i) => (
          <circle
            key={`ring-circle-${i}`}
            cx="50"
            cy="50"
            r={r}
            fill="none"
            stroke="#0B2545"
            strokeWidth="0.08"
            strokeOpacity="0.3"
          />
        ))}

        {/* Trophy / champion slot in center */}
        <g>
          <circle cx="50" cy="50" r="3.5" fill="#0B2545" strokeWidth="0.2" stroke="#B8860B" />
          {champion ? (
            <text
              x="50"
              y="50"
              textAnchor="middle"
              dominantBaseline="central"
              fontSize="2"
              fontWeight="bold"
              fill="#B8860B"
              style={{ pointerEvents: 'none', userSelect: 'none' }}
            >
              🏆
            </text>
          ) : (
            <text
              x="50"
              y="50"
              textAnchor="middle"
              dominantBaseline="central"
              fontSize="1.8"
              fill="#B8860B"
              opacity="0.5"
              style={{ pointerEvents: 'none', userSelect: 'none' }}
            >
              ?
            </text>
          )}
        </g>

        {/* Team dots / flags on each ring */}
        {rings.map(({ ringIndex, count, points }) => {
          if (ringIndex === 1) return null; // skip connector ring
          const slotTeams = deriveSlotTeams(positions, pairWinners, ringIndex);

          return points.map((point, slotIndex) => {
            if (slotIndex >= count) return null;
            const team = slotTeams[slotIndex];
            if (!team) {
              // Empty slot — show placeholder dot
              return (
                <circle
                  key={slotKey(ringIndex, slotIndex)}
                  cx={point.x}
                  cy={point.y}
                  r="0.9"
                  fill="#0B2545"
                  stroke="#B8860B"
                  strokeWidth="0.1"
                  opacity="0.25"
                />
              );
            }

            const state = isPlayableRing(ringIndex)
              ? getTeamState(pairWinners, team, ringIndex, slotIndex)
              : 'active';

            const pairIdx = getPairIndex(slotIndex);
            const playable = isPlayableRing(ringIndex) &&
              canSelectPair(positions, pairWinners, ringIndex, pairIdx);

            const isHovered = hoveredKey === slotKey(ringIndex, slotIndex);
            const isWinner = state === 'winner';
            const isEliminated = state === 'eliminated';

            // Size of the flag dot based on ring
            const dotR = ringIndex === 0 ? 2.2 : ringIndex === 2 ? 2.0 : ringIndex === 3 ? 1.9 : ringIndex === 4 ? 1.8 : 1.6;

            return (
              <g
                key={slotKey(ringIndex, slotIndex)}
                style={{ cursor: playable ? 'pointer' : 'default' }}
                onClick={() => handleSlotClick(ringIndex, slotIndex, team)}
                onMouseEnter={(e) => handleMouseEnter(e, ringIndex, slotIndex, team, point.x)}
                onMouseLeave={handleMouseLeave}
              >
                {/* Outer ring glow for hovered/winner */}
                {(isHovered || isWinner) && (
                  <circle
                    cx={point.x}
                    cy={point.y}
                    r={dotR + 0.6}
                    fill="none"
                    stroke="#B8860B"
                    strokeWidth="0.25"
                    opacity={isWinner ? 0.9 : 0.6}
                  />
                )}

                {/* Background circle */}
                <circle
                  cx={point.x}
                  cy={point.y}
                  r={dotR}
                  fill={isEliminated ? '#5A5A5A' : isWinner ? '#B8860B' : '#0B2545'}
                  stroke={isWinner ? '#F4F1EA' : isEliminated ? '#333' : '#B8860B'}
                  strokeWidth="0.15"
                  opacity={isEliminated ? 0.45 : 1}
                />

                {/* Flag image clipped in circle */}
                <defs>
                  <clipPath id={`clip-${ringIndex}-${slotIndex}`}>
                    <circle cx={point.x} cy={point.y} r={dotR - 0.1} />
                  </clipPath>
                </defs>
                <image
                  href={`https://flagcdn.com/w40/${getCountryCode(team.isoCode)}.png`}
                  x={point.x - dotR}
                  y={point.y - dotR}
                  width={dotR * 2}
                  height={dotR * 2}
                  clipPath={`url(#clip-${ringIndex}-${slotIndex})`}
                  preserveAspectRatio="xMidYMid slice"
                  opacity={isEliminated ? 0.35 : 1}
                />

                {/* Round label for outer ring (16avos) */}
                {ringIndex === 0 && !isEliminated && (
                  <text
                    x={point.x}
                    y={point.y + dotR + 1.4}
                    textAnchor="middle"
                    fontSize="1.1"
                    fill={isWinner ? '#B8860B' : '#111'}
                    fontFamily="var(--font-space-grotesk, sans-serif)"
                    fontWeight="600"
                    style={{ pointerEvents: 'none', userSelect: 'none' }}
                  >
                    {shortenName(team.name)}
                  </text>
                )}
              </g>
            );
          });
        })}
      </svg>

      {/* Tooltip portal (absolute, follows mouse via state) */}
      {tooltip && (
        <div
          className="fixed z-50 pointer-events-none"
          style={{
            left: tooltip.x + (tooltip.side === 'right' ? 12 : -12),
            top: tooltip.y - 20,
            transform: tooltip.side === 'left' ? 'translateX(-100%)' : undefined,
          }}
        >
          <div className="bg-[#0B2545] border border-[#B8860B] text-white px-3 py-1.5 text-xs font-bold whitespace-nowrap shadow-lg"
            style={{ borderRadius: 0 }}
          >
            {tooltip.beatBy ? (
              <>
                <span className="opacity-60">{tooltip.team.name}</span>
                <span className="text-red-400 ml-1">— perdió vs {tooltip.beatBy.name}</span>
              </>
            ) : (
              tooltip.team.name
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Helpers ──────────────────────────────────────────────────────────────────

const ISO_TO_COUNTRY: Record<string, string> = {
  BRA: 'br', JPN: 'jp', CIV: 'ci', NOR: 'no',
  MEX: 'mx', ECU: 'ec', ENG: 'gb-eng', COD: 'cd',
  ARG: 'ar', CPV: 'cv', AUS: 'au', EGY: 'eg',
  CHE: 'ch', DZA: 'dz', COL: 'co', GHA: 'gh',
  SEN: 'sn', BEL: 'be', USA: 'us', BIH: 'ba',
  ESP: 'es', AUT: 'at', PRT: 'pt', HRV: 'hr',
  NLD: 'nl', MAR: 'ma', CAN: 'ca', ZAF: 'za',
  FRA: 'fr', SWE: 'se', DEU: 'de', PRY: 'py',
};

function getCountryCode(iso: string): string {
  return ISO_TO_COUNTRY[iso.toUpperCase()] ?? iso.toLowerCase();
}

const SHORT_NAMES: Record<string, string> = {
  'Países Bajos': 'Países Bajos',
  'Estados Unidos': 'USA',
  'Costa de Marfil': 'Marfil',
  'Bosnia y Herzegovina': 'Bosnia',
  'RD Congo': 'RD Congo',
  'Cabo Verde': 'Cabo V.',
  'Sudáfrica': 'S. África',
  'Marruecos': 'Marruecos',
  'Alemania': 'Alemania',
  'Paraguay': 'Paraguay',
  'Argentina': 'Argentina',
  'Colombia': 'Colombia',
  'Australia': 'Australia',
};

function shortenName(name: string): string {
  if (SHORT_NAMES[name]) return SHORT_NAMES[name];
  return name.length > 9 ? name.slice(0, 8) + '.' : name;
}
