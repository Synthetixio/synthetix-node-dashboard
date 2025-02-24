import { useMutation } from '@tanstack/react-query';
import { useSynthetix } from './useSynthetix';
import { getApiUrl } from './utils';

export function useDagImport() {
  const [synthetix] = useSynthetix();

  return useMutation({
    mutationFn: async ({ formData, key }) => {
      const response = await fetch(`${getApiUrl()}api/v0/dag/import?pin-roots=true&key=${key}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${synthetix.token}` },
        body: formData,
      });
      if (!response.ok) {
        throw new Error('DAG upload failed');
      }
      return response.json();
    },
  });
}
