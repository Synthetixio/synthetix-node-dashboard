import { useQuery } from '@tanstack/react-query';
import { useSynthetix } from './useSynthetix';
import { getApiUrl } from './utils';

export function useScreenshot({ ipns, published }) {
  const [synthetix] = useSynthetix();
  const { chainId, token } = synthetix;

  return useQuery({
    enabled: Boolean(chainId && ipns && published),
    queryKey: [chainId, 'useScreenshot', ipns, { published }],
    queryFn: async () => {
      const response = await fetch(`${getApiUrl()}/api/screenshot?ipns=${ipns}`, {
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
