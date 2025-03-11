import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthorisedFetch } from './useAuthorisedFetch';
import { useSynthetix } from './useSynthetix';

export function useNamePublish() {
  const [synthetix] = useSynthetix();
  const { isLoading, isError, data: authorisedFetch } = useAuthorisedFetch();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ keyName, rootCID }) => {
      if (!synthetix.chainId || isLoading || isError || !authorisedFetch) {
        throw 'Failed';
      }
      const response = await authorisedFetch(
        `/api/v0/name/publish?key=${keyName}&arg=/ipfs/${rootCID}&ttl=10s`
      );
      if (!response.ok) {
        throw new Error('Failed to publish');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [synthetix.chainId, 'useGeneratedKeys'],
      });
    },
  });
}
