import { useQuery } from '@tanstack/react-query';
import { useFootball } from '@/providers/FootballProvider';
import { GoalScorer } from '@/types/worldcup';

export function useGoalScorers() {
  const { worldCupApi } = useFootball();

  const query = useQuery<GoalScorer[], Error>({
    queryKey: ['goalscorers'],
    queryFn: () => worldCupApi.getGoalScorers(),
  });

  return query;
}
