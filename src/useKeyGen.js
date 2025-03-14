import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthorisedFetch } from './useAuthorisedFetch';
import { useSynthetix } from './useSynthetix';

export function useKeyGen() {
  const [synthetix] = useSynthetix();
  const { chainId } = synthetix;
  const { isLoading, isError, data: authorisedFetch } = useAuthorisedFetch();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (keyName) => {
      if (!synthetix.chainId || isLoading || isError || !authorisedFetch) {
        throw 'Failed';
      }
      const response = await authorisedFetch(`/api/v0/key/gen?arg=${keyName}&type=rsa`);
      if (!response.ok) {
        throw new Error('Failed to generate a new keypair');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [chainId, 'useGeneratedKeys'] });
    },
  });
}
