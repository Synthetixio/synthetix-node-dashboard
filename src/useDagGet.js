import { useMutation } from '@tanstack/react-query';
import { useAuthorisedFetch } from './useAuthorisedFetch';

export function useDagGet() {
  const authorisedFetch = useAuthorisedFetch();

  return useMutation({
    mutationFn: async (rootCID) => {
      const response = await authorisedFetch(`/api/v0/dag/get?arg=${rootCID}`);
      if (!response.ok) {
        throw new Error('DAG fetch failed');
      }
      return response.json();
    },
  });
}
