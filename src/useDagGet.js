import { useMutation } from '@tanstack/react-query';
import { useFetch } from './useFetch';

export function useDagGet() {
  const { fetch } = useFetch();

  return useMutation({
    mutationFn: async (rootCID) => {
      const response = await fetch(`/api/v0/dag/get?arg=${rootCID}`);
      if (!response.ok) {
        throw new Error('DAG fetch failed');
      }
      return response.json();
    },
  });
}
