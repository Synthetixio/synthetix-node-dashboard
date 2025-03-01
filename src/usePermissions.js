import { useQuery } from '@tanstack/react-query';
import { Contract } from 'ethers';
import { importWhitelist } from './importWhitelist';
import { useSynthetix } from './useSynthetix';

export function usePermissions() {
  const [synthetix] = useSynthetix();
  return useQuery({
    enabled: Boolean(synthetix.chainId && synthetix.walletAddress && synthetix.provider),
    queryKey: [synthetix.chainId, synthetix.walletAddress, 'permissions'],
    queryFn: async () => {
      if (!(synthetix.chainId && synthetix.walletAddress && synthetix.provider)) {
        throw 'OMFG';
      }
      const { address, abi } = await importWhitelist({ chainId: synthetix.chainId });
      const WhitelistContract = new Contract(address, abi, synthetix.provider);
      const [isPending, isGranted, isAdmin] = await Promise.all([
        WhitelistContract.isPending(synthetix.walletAddress),
        WhitelistContract.isGranted(synthetix.walletAddress),
        WhitelistContract.isAdmin(synthetix.walletAddress),
      ]);

      return { isPending, isGranted, isAdmin };
    },
  });
}
