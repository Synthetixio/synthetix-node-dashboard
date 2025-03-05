import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useFetch } from './useFetch';

export function useNamePublish() {
  const { fetch, chainId } = useFetch();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ keyName, rootCID }) => {
      const response = await fetch(
        `/api/v0/name/publish?key=${keyName}&arg=/ipfs/${rootCID}&ttl=10s`
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
