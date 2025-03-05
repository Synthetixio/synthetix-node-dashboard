import { useQuery } from '@tanstack/react-query';
import { useFetch } from './useFetch';

export function useCheckApiToken() {
  const { fetch, chainId } = useFetch();

  return useQuery({
    enabled: Boolean(fetch),
    queryKey: [chainId, 'useCheckApiToken'],
    queryFn: async () => {
      const response = await fetch('/api/check-api-token', {
        method: 'GET',
      });
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    },
  });
}
