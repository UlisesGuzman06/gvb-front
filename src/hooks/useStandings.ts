import { useQuery } from '@tanstack/react-query';
import { useFootball } from '@/providers/FootballProvider';
import { Standing } from '@/types/worldcup';

export function useStandings(group: string = 'A') {
  const { worldCupApi } = useFootball();

  const query = useQuery<Standing[], Error>({
    queryKey: ['standings', group],
    queryFn: () => worldCupApi.getStandings(group),
    staleTime: 0,
    refetchInterval: 30_000, // Auto-refresh every 30s to reflect official results
  });

  return query;
}
