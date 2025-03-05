import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useFetch } from './useFetch';

export function useKeyGen() {
  const { fetch, chainId } = useFetch();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (keyName) => {
      const response = await fetch(`/api/v0/key/gen?arg=${keyName}&type=rsa`);
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
