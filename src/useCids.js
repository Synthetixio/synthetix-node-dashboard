import { useQuery } from '@tanstack/react-query';
import { useParams } from './useRoutes';
import { useSynthetix } from './useSynthetix';
import { getApiUrl } from './utils';

export function useCids() {
  const [synthetix] = useSynthetix();
  const { chainId, token } = synthetix;
  const [params] = useParams();

  return useQuery({
    enabled: Boolean(chainId && params.name),
    queryKey: [chainId, 'useCids', params.name],
    queryFn: async () => {
      const response = await fetch(`${getApiUrl()}/api/cids?key=${params.name}`, {
        method: 'GET',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    },
    placeholderData: { cids: [] },
  });
}
