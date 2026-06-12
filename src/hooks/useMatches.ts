import { useQuery } from '@tanstack/react-query';
import { useFootball } from '@/providers/FootballProvider';
import { Fixture } from '@/types/worldcup';

export function useMatches() {
  const { worldCupApi } = useFootball();

  const query = useQuery<Fixture[], Error>({
    queryKey: ['fixtures'],
    queryFn: () => worldCupApi.getFixtures(),
    staleTime: 0,
    refetchInterval: 30_000, // Refresh every 30s to pick up official scores
  });

  return query;
}
