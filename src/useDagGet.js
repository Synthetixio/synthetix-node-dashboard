import { useMutation } from '@tanstack/react-query';
import { useAuthorisedFetch } from './useAuthorisedFetch';
import { useSynthetix } from './useSynthetix';

export function useDagGet() {
  const [synthetix] = useSynthetix();
  const { isLoading, isError, data: authorisedFetch } = useAuthorisedFetch();

  return useMutation({
    mutationFn: async (rootCID) => {
      if (!synthetix.chainId || isLoading || isError || !authorisedFetch) {
        throw 'Failed';
      }
      const response = await authorisedFetch(`/api/v0/dag/get?arg=${rootCID}`);
      if (!response.ok) {
        throw new Error('DAG fetch failed');
      }
      return response.json();
    },
  });
}
