import { useMutation } from '@tanstack/react-query';
import { useAuthorisedFetch } from './useAuthorisedFetch';
import { useSynthetix } from './useSynthetix';

export function useUniqueGeneratedKey() {
  const [synthetix] = useSynthetix();
  const { isLoading, isError, data: authorisedFetch } = useAuthorisedFetch();

  return useMutation({
    mutationFn: async (key) => {
      if (!synthetix.chainId || isLoading || isError || !authorisedFetch) {
        throw 'Failed';
      }
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
