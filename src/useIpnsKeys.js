import { useQuery } from '@tanstack/react-query';
import { useSynthetix } from './useSynthetix';
import { getApiUrl } from './utils';

export function useIpnsKeys() {
  const [synthetix] = useSynthetix();
  const { chainId, token } = synthetix;

  return useQuery({
    enabled: Boolean(chainId),
    queryKey: [chainId, 'useIpnsKeys'],
    queryFn: async () => {
      const response = await fetch(`${getApiUrl()}ipns-keys`, {
        method: 'GET',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    },
    placeholderData: { keys: [] },
  });
}
