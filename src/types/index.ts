export interface User {
  id: string;
  username: string;
  displayName: string;
  avatar?: string;
  createdAt: string;
}

export interface Match {
  id: string;
  homeTeam: string;
  awayTeam: string;
  homeGoals: number | null;
  awayGoals: number | null;
  group: string;
  matchDate: string;
  date: string;
  isSpecialMatch: boolean;
  status: 'SCHEDULED' | 'IN_PROGRESS' | 'FINISHED';
  homeLogo?: string;
  awayLogo?: string;
  competition?: string;
}

export interface Prediction {
  id: string;
  userId: string;
  matchId: string;
  predictedHomeGoals: number;
  predictedAwayGoals: number;
  pointsAwarded: number;
}

export interface Bonus {
  id: string;
  userId: string;
  champion: string;
  runnerUp: string;
  topScorer: string;
}

export interface Standing {
  id: string;
  userId: string;
  totalPoints: number;
  exactResults: number;
  tendencies: number;
  rankPosition: number;
  user?: User;
}

export interface Statistics {
  id: string;
  userId: string;
  exactPercentage: number;
  tendencyPercentage: number;
  averagePointsPerRound: number;
}

export interface Team {
  id: string;
  name: string;
  code?: string;
  logo?: string;
  country?: string;
}

export interface Group {
  name: string;
  teams: Team[];
}

export interface Competition {
  id: string;
  name: string;
  country: string;
  logo?: string;
  season: number;
  startDate: string;
  endDate: string;
}

