import { useMutation } from '@tanstack/react-query';
import { useAuthorisedFetch } from './useAuthorisedFetch';

export function useRemoveCid() {
  const authorisedFetch = useAuthorisedFetch();

  return useMutation({
    mutationFn: async (data) => {
      const response = await authorisedFetch('/api/remove-cid', {
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    },
  });
}
