import { useMutation } from '@tanstack/react-query';
import { useSynthetix } from './useSynthetix';
import { getApiUrl } from './utils';

export function useDagGet() {
  const [synthetix] = useSynthetix();

  return useMutation({
    mutationFn: async (rootCID) => {
      const response = await fetch(`${getApiUrl()}/api/v0/dag/get?arg=${rootCID}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${synthetix.token}` },
      });
      if (!response.ok) {
        throw new Error('DAG fetch failed');
      }
      return response.json();
    },
  });
}
