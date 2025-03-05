import { useMutation } from '@tanstack/react-query';
import { useFetch } from './useFetch';

export function useDagImport() {
  const { fetch } = useFetch();

  return useMutation({
    mutationFn: async ({ formData, key }) => {
      const response = await fetch(`/api/v0/dag/import?pin-roots=true&key=${key}`, {
        body: formData,
      });
      if (!response.ok) {
        throw new Error('DAG upload failed');
      }
      return response.json();
    },
  });
}
