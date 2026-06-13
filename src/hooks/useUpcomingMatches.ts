import { useQuery } from '@tanstack/react-query';
import { useFootball } from '@/providers/FootballProvider';
import { Fixture } from '@/types/worldcup';

export function useUpcomingMatches() {
  const { worldCupApi } = useFootball();

  const query = useQuery<Fixture[], Error>({
    queryKey: ['upcomingMatches'],
    queryFn: async () => {
      const fixtures = await worldCupApi.getFixtures();
      const now = Date.now();
      // Filter fixtures that are scheduled in the future
      return fixtures.filter((f) => {
        const matchTime = new Date(`${f.date}T${f.time}Z`).getTime();
        return matchTime > now;
      });
    },
  });

  return query;
}
