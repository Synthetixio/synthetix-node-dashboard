import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Contract } from 'ethers';
import { importWhitelist } from './importWhitelist';
import { useSynthetix } from './useSynthetix';

export function useSubmitApplicationMutation() {
  const [synthetix] = useSynthetix();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const { address, abi } = await importWhitelist({ chainId: synthetix.chainId });
      const WhitelistContract = new Contract(address, abi, synthetix.signer);
      const tx = await WhitelistContract.submitApplication();
      await tx.wait();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [synthetix.chainId, synthetix.walletAddress, 'permissions'],
      });
    },
    onError: console.error,
  });
}
