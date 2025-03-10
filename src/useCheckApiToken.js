import { useQuery } from '@tanstack/react-query';
import { useAuthorisedFetch } from './useAuthorisedFetch';
import { useSynthetix } from './useSynthetix';

export function useCheckApiToken() {
  const [synthetix] = useSynthetix();
  const authorisedFetch = useAuthorisedFetch();

  return useQuery({
    enabled: Boolean(synthetix.chainId && authorisedFetch),
    queryKey: [synthetix.chainId, 'useCheckApiToken'],
    queryFn: async () => {
      const response = await authorisedFetch('/api/check-api-token', {
        method: 'GET',
      });
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    },
  });
}
