import {useQuery} from '@tanstack/react-query';
import {Contract} from 'ethers';
import {importNamespace} from './importNamespace';
import {useSynthetix} from './useSynthetix';

export function useTokenBalance({ walletAddress: address }) {
  const [synthetix] = useSynthetix();
  const { walletAddress, provider, signer, chainId } = synthetix;

  return useQuery({
    enabled: Boolean(provider && signer && chainId && walletAddress && address),
    queryKey: [chainId, { walletAddress }, 'useTokenBalance', { address }],
    queryFn: async () => {
      const Namespace = await importNamespace({ chainId: Number.parseInt(chainId, 16) });
      const NamespaceContract = new Contract(Namespace.address, Namespace.abi, provider);

      const result = await NamespaceContract.balanceOf(address);
      return result;
    },
  });
}
