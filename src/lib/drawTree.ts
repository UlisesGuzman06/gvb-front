// Ported and adapted from pauljnoble/fwc2026-knockout
// Core data structures and pure functions for the circular bracket

export type DrawPosition = {
  position: number;
  pair: number;
  isoCode: string;
  team: string | null;
};

// Ring counts: [R16=32, connector=32, QF=16, R8=8, SF=4, F=2]
export const RING_COUNTS = [32, 32, 16, 8, 4, 2] as const;

export const PLAYABLE_RINGS = [0, 2, 3, 4, 5] as const;

export type PlayableRing = (typeof PLAYABLE_RINGS)[number];

export const NEXT_RING: Record<PlayableRing, number | null> = {
  0: 2,
  2: 3,
  3: 4,
  4: 5,
  5: null,
};

export type Team = {
  isoCode: string;
  name: string;
};

export function slotKey(ringIndex: number, slotIndex: number): string {
  return `${ringIndex}-${slotIndex}`;
}

export function pairKey(ringIndex: number, pairIndex: number): string {
  return `${ringIndex}-pair-${pairIndex}`;
}

export function getPairIndices(
  _ringIndex: number,
  pairIndex: number
): [number, number] {
  return [pairIndex * 2, pairIndex * 2 + 1];
}

export function getPairCount(ringIndex: number): number {
  return RING_COUNTS[ringIndex] / 2;
}

export function getPairIndex(slotIndex: number): number {
  return Math.floor(slotIndex / 2);
}

export function isPlayableRing(ringIndex: number): ringIndex is PlayableRing {
  return (PLAYABLE_RINGS as readonly number[]).includes(ringIndex);
}

function teamKey(team: Team): string {
  return team.isoCode;
}

export function getPairWinner(
  pairWinners: Record<string, Team>,
  ringIndex: number,
  pairIndex: number
): Team | null {
  return pairWinners[pairKey(ringIndex, pairIndex)] ?? null;
}

export function getTeamState(
  pairWinners: Record<string, Team>,
  team: Team,
  ringIndex: number,
  slotIndex: number
): 'active' | 'winner' | 'eliminated' {
  const thisPairIndex = getPairIndex(slotIndex);
  const winner = getPairWinner(pairWinners, ringIndex, thisPairIndex);

  if (!winner) return 'active';
  if (teamKey(winner) === teamKey(team)) return 'winner';
  return 'eliminated';
}

export function deriveSlotTeams(
  positions: DrawPosition[],
  pairWinners: Record<string, Team>,
  ringIndex: number
): (Team | null)[] {
  const count = RING_COUNTS[ringIndex];
  const slots: (Team | null)[] = Array(count).fill(null);

  if (ringIndex === 0) {
    // Outer ring — initial teams
    for (const pos of positions) {
      const slotIndex = pos.position - 1;
      if (slotIndex >= 0 && slotIndex < count && pos.team) {
        slots[slotIndex] = { isoCode: pos.isoCode, name: pos.team };
      }
    }
    return slots;
  }

  if (ringIndex === 1) {
    // Second ring — mirrors the outer ring (same teams, decorative)
    return deriveSlotTeams(positions, pairWinners, 0);
  }

  // Inner playable rings — derived from winners of previous playable ring
  const prevPlayableRing = (
    Object.entries(NEXT_RING) as [string, number | null][]
  ).find(([, next]) => next === ringIndex);

  if (!prevPlayableRing) return slots;

  const prevRingIndex = parseInt(prevPlayableRing[0]);
  const prevCount = RING_COUNTS[prevRingIndex];
  const prevPairCount = prevCount / 2;

  for (let pairIdx = 0; pairIdx < prevPairCount; pairIdx++) {
    const winner = getPairWinner(pairWinners, prevRingIndex, pairIdx);
    if (winner) {
      slots[pairIdx] = winner;
    }
  }

  return slots;
}

export function canSelectPair(
  positions: DrawPosition[],
  pairWinners: Record<string, Team>,
  ringIndex: number,
  pairIndex: number
): boolean {
  const slotTeams = deriveSlotTeams(positions, pairWinners, ringIndex);
  const [i1, i2] = getPairIndices(ringIndex, pairIndex);
  return slotTeams[i1] !== null && slotTeams[i2] !== null;
}

export function selectPairWinner(
  pairWinners: Record<string, Team>,
  ringIndex: number,
  pairIndex: number,
  winner: Team
): Record<string, Team> {
  const key = pairKey(ringIndex, pairIndex);
  const existing = pairWinners[key];

  // If clicking the same team, deselect
  if (existing && teamKey(existing) === teamKey(winner)) {
    const next = { ...pairWinners };
    delete next[key];
    // Also clear downstream winners that depended on this
    return clearDownstream(next, ringIndex, pairIndex);
  }

  const next = { ...pairWinners, [key]: winner };
  return clearDownstream(next, ringIndex, pairIndex);
}

function clearDownstream(
  pairWinners: Record<string, Team>,
  ringIndex: number,
  pairIndex: number
): Record<string, Team> {
  const nextRing = NEXT_RING[ringIndex as PlayableRing];
  if (nextRing === null) return pairWinners;

  const nextPairIndex = Math.floor(pairIndex / 2);
  const nextKey = pairKey(nextRing, nextPairIndex);

  if (!pairWinners[nextKey]) return pairWinners;

  const next = { ...pairWinners };
  delete next[nextKey];
  return clearDownstream(next, nextRing as PlayableRing, nextPairIndex);
}
