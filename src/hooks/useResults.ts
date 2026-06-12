import { useQuery } from '@tanstack/react-query';
import { useFootball } from '@/providers/FootballProvider';
import { Fixture } from '@/types/worldcup';

export function useResults() {
  const { worldCupApi } = useFootball();

  const query = useQuery<Fixture[], Error>({
    queryKey: ['results'],
    queryFn: async () => {
      const fixtures = await worldCupApi.getFixtures();
      const now = Date.now();
      // Filter fixtures that are in the past
      return fixtures.filter((f) => {
        const matchTime = new Date(`${f.date}T${f.time}Z`).getTime();
        return matchTime <= now;
      });
    },
  });

  console.log('[useResults] state:', {
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    error: query.error?.message || null,
    dataCount: query.data?.length || 0,
  });

  return query;
}
