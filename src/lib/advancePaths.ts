// Ported and adapted from pauljnoble/fwc2026-knockout
// Builds SVG path strings for team advance animations

import { NEXT_RING, getPairIndex, type PlayableRing } from './drawTree';

export type PathPoint = {
  x: number;
  y: number;
};

type BuildAdvancePathArgs = {
  ringIndex: PlayableRing;
  winnerSlotIndex: number;
  ringPoints: PathPoint[][];
  getRingRadius: (ringIndex: number) => number;
  getPairArcMidpoint: (pairIndex: number, ringIndex: number) => PathPoint;
};

export function buildAdvancePath({
  ringIndex,
  winnerSlotIndex,
  ringPoints,
  getRingRadius,
  getPairArcMidpoint,
}: BuildAdvancePathArgs): string | null {
  const pairIndex = getPairIndex(winnerSlotIndex);
  const nextRing = NEXT_RING[ringIndex];

  if (nextRing === null) {
    return null;
  }

  const startPoints = ringPoints[ringIndex];
  const start = startPoints?.[winnerSlotIndex];

  if (!start) return null;

  const arcMid = getPairArcMidpoint(pairIndex, ringIndex);
  const nextPairIndex = Math.floor(pairIndex / 2);
  const nextSlotIndex = nextPairIndex * 2;
  const nextPoints = ringPoints[nextRing];
  const end = nextPoints?.[nextSlotIndex];

  if (!end) return null;

  const midRadius = getRingRadius(ringIndex) - 2;

  return [
    `M ${start.x} ${start.y}`,
    `A ${midRadius} ${midRadius} 0 0 ${winnerSlotIndex % 2 === 0 ? 1 : 0} ${arcMid.x} ${arcMid.y}`,
    `L ${end.x} ${end.y}`,
  ].join(' ');
}
