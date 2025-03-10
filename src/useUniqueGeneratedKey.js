import { useMutation } from '@tanstack/react-query';
import { useAuthorisedFetch } from './useAuthorisedFetch';

export function useUniqueGeneratedKey() {
  const authorisedFetch = useAuthorisedFetch();

  return useMutation({
    mutationFn: async (key) => {
      const response = await authorisedFetch('/api/unique-generated-key', {
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key }),
      });
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    },
  });
}
