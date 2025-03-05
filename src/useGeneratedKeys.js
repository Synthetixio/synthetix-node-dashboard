import { useQuery } from '@tanstack/react-query';
import { useFetch } from './useFetch';

export function useGeneratedKeys() {
  const { fetch, chainId } = useFetch();

  return useQuery({
    enabled: Boolean(fetch),
    queryKey: [chainId, 'useGeneratedKeys'],
    queryFn: async () => {
      const response = await fetch('/api/generated-keys', {
        method: 'GET',
      });
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    },
    placeholderData: { keys: [] },
  });
}
