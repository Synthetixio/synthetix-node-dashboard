import { useQuery } from '@tanstack/react-query';
import { useAuthorisedFetch } from './useAuthorisedFetch';
import { useSynthetix } from './useSynthetix';

export function useScreenshot({ siteUrl, published }) {
  const [synthetix] = useSynthetix();
  const { isLoading, isError, data: authorisedFetch } = useAuthorisedFetch();

  return useQuery({
    enabled: Boolean(
      synthetix.chainId && !isLoading && !isError && authorisedFetch && siteUrl && published
    ),
    queryKey: [synthetix.chainId, 'useScreenshot', siteUrl, { published }],
    queryFn: async () => {
      const response = await authorisedFetch(`/api/screenshot?url=${encodeURIComponent(siteUrl)}`, {
        method: 'GET',
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      return response.json();
    },
  });
}
