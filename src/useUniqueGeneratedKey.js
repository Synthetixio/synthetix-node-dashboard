import { useMutation } from '@tanstack/react-query';
import { useFetch } from './useFetch';

export function useUniqueGeneratedKey() {
  const { fetch } = useFetch();

  return useMutation({
    mutationFn: async (key) => {
      const response = await fetch('/api/unique-generated-key', {
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
