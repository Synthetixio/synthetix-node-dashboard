import { useMutation } from '@tanstack/react-query';
import { useFetch } from './useFetch';

export function useUniqueNamespaceCheck() {
  const { fetch } = useFetch();

  return useMutation({
    mutationFn: async (namespace) => {
      const response = await fetch('/api/unique-namespace', {
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
