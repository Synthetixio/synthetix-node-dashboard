import { useMutation } from '@tanstack/react-query';
import { useAuthorisedFetch } from './useAuthorisedFetch';

export function useDagImport() {
  const authorisedFetch = useAuthorisedFetch();

  return useMutation({
    mutationFn: async ({ formData, key }) => {
      const response = await authorisedFetch(`/api/v0/dag/import?pin-roots=true&key=${key}`, {
        body: formData,
      });
      if (!response.ok) {
        throw new Error('DAG upload failed');
      }
      return response.json();
    },
  });
}
