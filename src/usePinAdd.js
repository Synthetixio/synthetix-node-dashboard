import { useMutation } from '@tanstack/react-query';
import { useSynthetix } from './useSynthetix';
import { getApiUrl } from './utils';

export function usePinAdd() {
  const [synthetix] = useSynthetix();

  return useMutation({
    mutationFn: async (ipfsCid) => {
      const response = await fetch(
        `${getApiUrl()}api/v0/pin/add?arg=${ipfsCid}&recursive=true&progress=true`,
        {
          method: 'POST',
          headers: { Authorization: `Bearer ${synthetix.token}` },
        }
      );
      if (!response.ok) {
        throw new Error('Failed to publish');
      }
      return response.text();
    },
  });
}
