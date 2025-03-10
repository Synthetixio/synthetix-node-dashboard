import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthorisedFetch } from './useAuthorisedFetch';
import { useSynthetix } from './useSynthetix';

export function useKeyRemove() {
  const [synthetix] = useSynthetix();
  const authorisedFetch = useAuthorisedFetch();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (ipnsKey) => {
      const response = await authorisedFetch(`/api/v0/key/rm?arg=${ipnsKey}`);
      if (!response.ok) {
        throw new Error('Network response was not ok');
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
