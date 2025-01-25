import { useQuery } from '@tanstack/react-query';
import { useSynthetix } from './useSynthetix';
import { getApiUrl } from './utils';

export function useGeneratedIpnsKeys() {
  const [synthetix] = useSynthetix();
  const { chainId, token } = synthetix;

  return useQuery({
    enabled: Boolean(chainId),
    queryKey: [chainId, 'useGeneratedIpnsKeys'],
    queryFn: async () => {
      const response = await fetch(`${getApiUrl()}generated-ipns-keys`, {
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
