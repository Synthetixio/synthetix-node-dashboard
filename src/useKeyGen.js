import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthorisedFetch } from './useAuthorisedFetch';
import { useSynthetix } from './useSynthetix';

export function useKeyGen() {
  const [synthetix] = useSynthetix();
  const { chainId } = synthetix;
  const authorisedFetch = useAuthorisedFetch();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (keyName) => {
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
