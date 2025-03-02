import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useSynthetix } from './useSynthetix';
import { getApiUrl } from './utils';

export function useNamePublish() {
  const [synthetix] = useSynthetix();
  const { token, chainId } = synthetix;
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ keyName, rootCID }) => {
      const response = await fetch(
        `${getApiUrl()}/api/v0/name/publish?key=${keyName}&arg=/ipfs/${rootCID}&ttl=10s`,
        {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (!response.ok) {
        throw new Error('Failed to publish');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [chainId, 'useGeneratedKeys'],
      });
    },
  });
}
