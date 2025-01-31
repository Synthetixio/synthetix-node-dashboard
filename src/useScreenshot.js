import { useQuery } from '@tanstack/react-query';
import { useSynthetix } from './useSynthetix';
import { getApiUrl } from './utils';

export function useScreenshot({ siteUrl, published }) {
  const [synthetix] = useSynthetix();
  const { chainId, token } = synthetix;

  return useQuery({
    enabled: Boolean(chainId && siteUrl && published),
    queryKey: [chainId, 'useScreenshot', siteUrl, { published }],
    queryFn: async () => {
      const response = await fetch(`${getApiUrl()}screenshot?url=${encodeURIComponent(siteUrl)}`, {
        method: 'GET',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      return response.json();
    },
  });
}
