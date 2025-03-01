import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Contract } from 'ethers';
import { importWhitelist } from './importWhitelist';
import { useSynthetix } from './useSynthetix';

export function useRejectApplicationMutation() {
  const [synthetix] = useSynthetix();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (wallet) => {
      const { address, abi } = await importWhitelist({ chainId: synthetix.chainId });
      const WhitelistContract = new Contract(address, abi, synthetix.signer);
      const tx = await WhitelistContract.rejectApplication(wallet);
      await tx.wait();

      queryClient.invalidateQueries({
        queryKey: [synthetix.chainId, wallet, 'permissions'],
      });
    },
    onError: console.error,
  });
}
