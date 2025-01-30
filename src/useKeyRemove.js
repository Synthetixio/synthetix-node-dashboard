import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useSynthetix } from './useSynthetix';
import { getApiUrl } from './utils';

export function useKeyRemove() {
  const [synthetix] = useSynthetix();
  const { chainId, token } = synthetix;
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (ipnsKey) => {
      const response = await fetch(`${getApiUrl()}api/v0/key/rm?arg=${ipnsKey}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) {
        throw new Error('Network response was not ok');
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
