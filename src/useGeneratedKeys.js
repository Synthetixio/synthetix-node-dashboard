import { useQuery } from '@tanstack/react-query';
import { useAuthorisedFetch } from './useAuthorisedFetch';
import { useSynthetix } from './useSynthetix';

export function useGeneratedKeys() {
  const [synthetix] = useSynthetix();
  const authorisedFetch = useAuthorisedFetch();

  return useQuery({
    enabled: Boolean(synthetix.chainId && authorisedFetch),
    queryKey: [synthetix.chainId, 'useGeneratedKeys'],
    queryFn: async () => {
      const response = await authorisedFetch('/api/generated-keys', {
        method: 'GET',
      });
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    },
    placeholderData: { keys: [] },
  });
}
