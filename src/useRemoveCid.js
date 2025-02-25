import { useMutation } from '@tanstack/react-query';
import { useSynthetix } from './useSynthetix';
import { getApiUrl } from './utils';

export function useRemoveCid() {
  const [synthetix] = useSynthetix();

  return useMutation({
    mutationFn: async (data) => {
      const response = await fetch(`${getApiUrl()}remove-cid`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${synthetix.token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    },
  });
}
