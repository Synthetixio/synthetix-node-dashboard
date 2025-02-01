import { useMutation } from '@tanstack/react-query';
import { useSynthetix } from './useSynthetix';
import { getApiUrl } from './utils';

export function useDagImport() {
  const [synthetix] = useSynthetix();

  return useMutation({
    mutationFn: async (data) => {
      const response = await fetch(`${getApiUrl()}api/v0/dag/import?pin-roots=true`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${synthetix.token}` },
        body: data,
      });
      if (!response.ok) {
        throw new Error('DAG upload failed');
      }
      return response.json();
    },
  });
}
