import { Fixture, LiveScore, Standing, GoalScorer, Squad } from '@/types/worldcup';
import API_URL from '@/config/api';

export class WorldCupApiProvider {
  private baseUrl: string;

  constructor() {
    // Relative to the same host
    this.baseUrl = '';
  }

  private async fetchHelper<T>(endpoint: string): Promise<T> {
    const startTime = Date.now();
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`);
      const duration = Date.now() - startTime;
      
      console.log(`[WorldCupApiProvider] Client Fetch: endpoint=${endpoint} | Status: ${response.status} | Time: ${duration}ms`);
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status} ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error(`[WorldCupApiProvider ERROR] Fetch failed for ${endpoint}:`, error);
      throw error;
    }
  }

  async getFixtures(): Promise<Fixture[]> {
    const token = typeof window !== 'undefined' ? localStorage.getItem('gvb_token') : null;
    const headers: Record<string, string> = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    const response = await fetch(`${API_URL}/matches`, { headers });
    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }
    return response.json();
  }

  async getLiveScores(): Promise<LiveScore[]> {
    return this.fetchHelper<LiveScore[]>('/api/worldcup/livescores');
  }

  async getStandings(group: string): Promise<Standing[]> {
    const fixtures = await this.getFixtures();
    const groupName = `Group ${group.toUpperCase()}`;
    const groupMatches = fixtures.filter(m => 
      m.group && m.group.toUpperCase() === groupName.toUpperCase()
    );

    const getTeamId = (name: string): number => {
      let hash = 0;
      for (let i = 0; i < name.length; i++) {
        hash = name.charCodeAt(i) + ((hash << 5) - hash);
      }
      return Math.abs(hash % 10000);
    };

    const teamsMap: Record<string, Standing> = {};
    
    // Initialize teams map from the group matches
    groupMatches.forEach(m => {
      const homeName = m.home.name;
      const awayName = m.away.name;
      
      if (homeName && !teamsMap[homeName]) {
        teamsMap[homeName] = {
          rank: 0,
          points: 0,
          matches: 0,
          goal_diff: 0,
          goals_scored: 0,
          goals_conceded: 0,
          lost: 0,
          drawn: 0,
          won: 0,
          team: {
            id: m.home.id || getTeamId(homeName),
            name: homeName,
            logo: '',
          }
        };
      }
      
      if (awayName && !teamsMap[awayName]) {
        teamsMap[awayName] = {
          rank: 0,
          points: 0,
          matches: 0,
          goal_diff: 0,
          goals_scored: 0,
          goals_conceded: 0,
          lost: 0,
          drawn: 0,
          won: 0,
          team: {
            id: m.away.id || getTeamId(awayName),
            name: awayName,
            logo: '',
          }
        };
      }
    });

    // Populate stats from played matches
    groupMatches.forEach(m => {
      const isFinished = m.status === 'FINISHED';
      if (!isFinished || m.homeScore === null || m.awayScore === null) return;
      
      const homeName = m.home.name;
      const awayName = m.away.name;
      
      const homeScore = Number(m.homeScore);
      const awayScore = Number(m.awayScore);
      
      const homeTeam = teamsMap[homeName];
      const awayTeam = teamsMap[awayName];
      
      if (homeTeam && awayTeam) {
        homeTeam.matches += 1;
        awayTeam.matches += 1;
        
        homeTeam.goals_scored += homeScore;
        homeTeam.goals_conceded += awayScore;
        homeTeam.goal_diff = homeTeam.goals_scored - homeTeam.goals_conceded;
        
        awayTeam.goals_scored += awayScore;
        awayTeam.goals_conceded += homeScore;
        awayTeam.goal_diff = awayTeam.goals_scored - awayTeam.goals_conceded;
        
        if (homeScore > awayScore) {
          homeTeam.won += 1;
          homeTeam.points += 3;
          awayTeam.lost += 1;
        } else if (homeScore < awayScore) {
          awayTeam.won += 1;
          awayTeam.points += 3;
          homeTeam.lost += 1;
        } else {
          homeTeam.drawn += 1;
          homeTeam.points += 1;
          awayTeam.drawn += 1;
          awayTeam.points += 1;
        }
      }
    });

    const standings = Object.values(teamsMap).sort((a, b) => {
      if (b.points !== a.points) {
        return b.points - a.points;
      }
      if (b.goal_diff !== a.goal_diff) {
        return b.goal_diff - a.goal_diff;
      }
      if (b.goals_scored !== a.goals_scored) {
        return b.goals_scored - a.goals_scored;
      }
      return a.team.name.localeCompare(b.team.name);
    });
    
    // Assign ranks
    standings.forEach((s, idx) => {
      s.rank = idx + 1;
    });
    
    return standings;
  }

  async getGoalScorers(): Promise<GoalScorer[]> {
    return this.fetchHelper<GoalScorer[]>('/api/worldcup/goalscorers');
  }

  async getSquads(teamId: number): Promise<Squad[]> {
    return this.fetchHelper<Squad[]>(`/api/worldcup/squads?team_id=${teamId}`);
  }
}
