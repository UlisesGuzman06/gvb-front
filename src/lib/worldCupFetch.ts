import path from 'path';
import fs from 'fs';
import { Fixture, Standing } from '@/types/worldcup';

interface RawMatch {
  round: string;
  date: string;
  time: string;
  team1: string;
  team2: string;
  group?: string;
  ground: string;
  num?: number;
}

function getTeamId(name: string): number {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash % 10000);
}

export function getFixtures(): Fixture[] {
  const filePath = path.join(process.cwd(), '../partidos.json');
  
  if (!fs.existsSync(filePath)) {
    console.error(`[worldCupFetch] ERROR: partidos.json not found at path ${filePath}`);
    throw new Error('partidos.json no encontrado en la raíz del proyecto');
  }

  const fileContent = fs.readFileSync(filePath, 'utf8');
  const data = JSON.parse(fileContent);

  const rawMatches: RawMatch[] = data.matches || [];

  return rawMatches.map((match, idx) => {
    // Extract HH:MM from "13:00 UTC-6"
    let timeStr = '12:00:00';
    if (match.time) {
      const parts = match.time.split(' ');
      if (parts[0]) {
        timeStr = parts[0];
        // Ensure HH:MM:SS format
        if (timeStr.length === 5) {
          timeStr = `${timeStr}:00`;
        }
      }
    }

    const homeTeam = match.team1 || 'Por definir';
    const awayTeam = match.team2 || 'Por definir';

    return {
      id: match.num || (idx + 1),
      date: match.date || '2026-06-11',
      time: timeStr,
      location: match.ground || 'Estadio por definir',
      round: match.round || 'Grupo',
      group_id: match.group ? getTeamId(match.group) : 0,
      group: match.group || '',
      home: {
        id: getTeamId(homeTeam),
        name: homeTeam,
        logo: '',
      },
      away: {
        id: getTeamId(awayTeam),
        name: awayTeam,
        logo: '',
      },
    };
  });
}

export function getStandings(groupLetter: string): Standing[] {
  const fixtures = getFixtures();
  const groupName = `Group ${groupLetter.toUpperCase()}`;
  
  // Find all matches for this group
  const groupMatches = fixtures.filter(f => f.group_id === getTeamId(groupName) || f.round.toLowerCase().includes(groupName.toLowerCase()));

  // If no fixtures found, scan partidos.json raw matches matching the group field
  const uniqueTeams = new Set<string>();
  
  if (groupMatches.length > 0) {
    groupMatches.forEach(f => {
      uniqueTeams.add(f.home.name);
      uniqueTeams.add(f.away.name);
    });
  } else {
    // Fallback: parse partidos.json directly
    const filePath = path.join(process.cwd(), '../partidos.json');
    if (fs.existsSync(filePath)) {
      const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      const rawMatches: RawMatch[] = data.matches || [];
      rawMatches.forEach(m => {
        if (m.group && m.group.toUpperCase() === groupName.toUpperCase()) {
          uniqueTeams.add(m.team1);
          uniqueTeams.add(m.team2);
        }
      });
    }
  }

  const teamsArray = Array.from(uniqueTeams).sort();

  return teamsArray.map((teamName, idx) => ({
    rank: idx + 1,
    points: 0,
    matches: 0,
    goal_diff: 0,
    goals_scored: 0,
    goals_conceded: 0,
    lost: 0,
    drawn: 0,
    won: 0,
    team: {
      id: getTeamId(teamName),
      name: teamName,
      logo: '',
    },
  }));
}
