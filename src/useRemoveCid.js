import { useMutation } from '@tanstack/react-query';
import { useFetch } from './useFetch';

export function useRemoveCid() {
  const { fetch } = useFetch();

  return useMutation({
    mutationFn: async (data) => {
      const response = await fetch('/api/remove-cid', {
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
