import { useQuery } from '@tanstack/react-query';
import { useAuthorisedFetch } from './useAuthorisedFetch';
import { useParams } from './useRoutes';
import { useSynthetix } from './useSynthetix';

export function useCids() {
  const [synthetix] = useSynthetix();
  const authorisedFetch = useAuthorisedFetch();
  const [params] = useParams();

  return useQuery({
    enabled: Boolean(synthetix.chainId && authorisedFetch && params.name),
    queryKey: [synthetix.chainId, 'useCids', params.name],
    queryFn: async () => {
      const response = await authorisedFetch(`/api/cids?key=${params.name}`, {
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
