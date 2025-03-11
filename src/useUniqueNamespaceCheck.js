import { useMutation } from '@tanstack/react-query';
import { useAuthorisedFetch } from './useAuthorisedFetch';
import { useSynthetix } from './useSynthetix';

export function useUniqueNamespaceCheck() {
  const [synthetix] = useSynthetix();
  const { isLoading, isError, data: authorisedFetch } = useAuthorisedFetch();

  return useMutation({
    mutationFn: async (namespace) => {
      if (!synthetix.chainId || isLoading || isError || !authorisedFetch) {
        throw 'Failed';
      }
      const response = await authorisedFetch('/api/unique-namespace', {
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
