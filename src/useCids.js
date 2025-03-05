import { useQuery } from '@tanstack/react-query';
import { useFetch } from './useFetch';
import { useParams } from './useRoutes';

export function useCids() {
  const { fetch, chainId } = useFetch();
  const [params] = useParams();

  return useQuery({
    enabled: Boolean(fetch && params.name),
    queryKey: [chainId, 'useCids', params.name],
    queryFn: async () => {
      const response = await fetch(`/api/cids?key=${params.name}`, {
        method: 'GET',
      });
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    },
    placeholderData: { cids: [] },
  });
}
