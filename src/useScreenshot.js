import { useQuery } from '@tanstack/react-query';
import { useFetch } from './useFetch';

export function useScreenshot({ siteUrl, published }) {
  const { fetch, chainId } = useFetch();

  return useQuery({
    enabled: Boolean(fetch && siteUrl && published),
    queryKey: [chainId, 'useScreenshot', siteUrl, { published }],
    queryFn: async () => {
      const response = await fetch(`/api/screenshot?url=${encodeURIComponent(siteUrl)}`, {
        method: 'GET',
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      return response.json();
    },
  });
}
