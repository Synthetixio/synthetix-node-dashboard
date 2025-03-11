import { useMutation } from '@tanstack/react-query';
import { useAuthorisedFetch } from './useAuthorisedFetch';
import { useSynthetix } from './useSynthetix';

export function useDagImport() {
  const [synthetix] = useSynthetix();
  const { isLoading, isError, data: authorisedFetch } = useAuthorisedFetch();

  return useMutation({
    mutationFn: async ({ formData, key }) => {
      if (!synthetix.chainId || isLoading || isError || !authorisedFetch) {
        throw 'Failed';
      }
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
