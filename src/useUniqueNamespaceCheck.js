import { useMutation } from '@tanstack/react-query';
import { useSynthetix } from './useSynthetix';
import { getApiUrl } from './utils';

export function useUniqueNamespaceCheck() {
  const [synthetix] = useSynthetix();

  return useMutation({
    mutationFn: async (namespace) => {
      const response = await fetch(`${getApiUrl()}unique-namespace`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${synthetix.token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ namespace }),
      });
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    },
  });
}
