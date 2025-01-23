import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useSynthetix } from './useSynthetix';
import { getApiUrl } from './utils';

export function useNamePublish() {
  const [synthetix] = useSynthetix();
  const { token, chainId } = synthetix;
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ Name, rootCID }) => {
      const response = await fetch(`${getApiUrl()}api/v0/name/publish?arg=${rootCID}&key=${Name}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) {
        throw new Error('Failed to publish');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [chainId, 'useDeployments'],
      });
      queryClient.invalidateQueries({
        queryKey: [chainId, 'useUnpublishedNamespaces'],
      });
    },
  });
}
