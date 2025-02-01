import { useMutation } from '@tanstack/react-query';
import { useSynthetix } from './useSynthetix';
import { getApiUrl } from './utils';

export function useUniqueGeneratedKey() {
  const [synthetix] = useSynthetix();

  return useMutation({
    mutationFn: async (key) => {
      const response = await fetch(`${getApiUrl()}unique-generated-key`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${synthetix.token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ key }),
      });
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    },
  });
}
