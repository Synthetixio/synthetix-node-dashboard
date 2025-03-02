import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useSynthetix } from './useSynthetix';
import { getApiUrl } from './utils';

export function useKeyGen() {
  const [synthetix] = useSynthetix();
  const { chainId, token } = synthetix;
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (keyName) => {
      const response = await fetch(`${getApiUrl()}/api/v0/key/gen?arg=${keyName}&type=rsa`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
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
