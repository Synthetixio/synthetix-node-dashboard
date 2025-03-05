import { useQuery } from '@tanstack/react-query';
import { useSynthetix } from './useSynthetix';
import { getApiUrl } from './utils';

export function useCheckApiToken() {
  const [synthetix] = useSynthetix();
  const { chainId, token } = synthetix;

  return useQuery({
    enabled: Boolean(chainId),
    queryKey: [chainId, 'useCheckApiToken'],
    queryFn: async () => {
      const response = await fetch(`${getApiUrl()}/api/check-api-token`, {
        method: 'GET',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    },
  });
}
