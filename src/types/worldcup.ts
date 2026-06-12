export interface Team {
  id: number;
  name: string;
  logo: string;
}

export interface PreOdds {
  "1": number | null;
  "2": number | null;
  "X": number | null;
}

export interface LiveOdds {
  "1": number | null;
  "2": number | null;
  "X": number | null;
}

export interface Odds {
  pre?: PreOdds;
  live?: LiveOdds;
}

export interface Scores {
  score: string;
  ht_score: string;
  ft_score: string;
  et_score: string;
  ps_score: string;
}

export interface Outcomes {
  half_time: string | null;
  full_time: string | null;
  extra_time: string | null;
  penalty_shootout: string | null;
}

export interface Fixture {
  id: string | number;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM:SS
  location: string;
  round: string;
  group_id: number;
  group?: string; // e.g. "Group A"
  home: Team;
  away: Team;
  odds?: Odds;
  homeScore?: number | null;
  awayScore?: number | null;
  status?: 'SCHEDULED' | 'IN_PROGRESS' | 'FINISHED';
}

export interface LiveScore {
  id: number;
  fixture_id: number;
  status: string; // "IN PLAY", "FINISHED", etc.
  time: string; // minutes elapsed
  scheduled: string; // scheduled time
  location: string;
  last_changed: string;
  home: Team;
  away: Team;
  scores: Scores;
  outcomes: Outcomes;
  odds?: Odds;
}

export interface Standing {
  rank: number;
  points: number;
  matches: number;
  goal_diff: number;
  goals_scored: number;
  goals_conceded: number;
  lost: number;
  drawn: number;
  won: number;
  team: Team;
}

export interface GoalScorer {
  goals: number;
  assists: number;
  played: number;
  team: Team;
  player: {
    id: number;
    name: string;
    photo: string;
  };
}

export interface Squad {
  id: string;
  name: string;
  shirt_number: string;
  position: string;
}
