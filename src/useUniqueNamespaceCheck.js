import { useMutation } from '@tanstack/react-query';
import { useAuthorisedFetch } from './useAuthorisedFetch';

export function useUniqueNamespaceCheck() {
  const authorisedFetch = useAuthorisedFetch();

  return useMutation({
    mutationFn: async (namespace) => {
      const response = await authorisedFetch('/api/unique-namespace', {
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ namespace }),
      });
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    },
  });
}
