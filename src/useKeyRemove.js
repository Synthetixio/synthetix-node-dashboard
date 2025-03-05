import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useFetch } from './useFetch';

export function useKeyRemove() {
  const { fetch, chainId } = useFetch();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (ipnsKey) => {
      const response = await fetch(`/api/v0/key/rm?arg=${ipnsKey}`);
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
