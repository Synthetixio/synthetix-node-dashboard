import { useMutation } from '@tanstack/react-query';

export function usePinAdd() {
  return useMutation({
    mutationFn: async (ipfsCid) => {
      console.log('ipfsCid', ipfsCid);
      const response = await fetch(
        `http://127.0.0.1:5001/api/v0/pin/add?arg=${ipfsCid}&recursive=true&progress=true`,
        {
          method: 'POST',
        }
      );
      if (!response.ok) {
        throw new Error('Failed to publish');
      }
      return response.text();
    },
  });
}
