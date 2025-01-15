import {useQuery} from '@tanstack/react-query';
import {Contract, ethers} from 'ethers';
import {importMulticall3} from './importMulticall3';
import {importNamespace} from './importNamespace';
import {useSynthetix} from './useSynthetix';

const BATCH_SIZE = 500;

export function useTokenOfOwnerByIndex({ ownerBalance }) {
  const [synthetix] = useSynthetix();
  const { walletAddress, provider, signer, chainId } = synthetix;

  return useQuery({
    enabled: Boolean(
      provider && signer && chainId && walletAddress && ownerBalance && ownerBalance > 0
    ),
    queryKey: [
      chainId,
      { walletAddress },
      'useTokenOfOwnerByIndex',
      { ownerBalance: Number(ownerBalance) },
    ],
    queryFn: async () => {
      const Multicall3 = await importMulticall3({ chainId: Number.parseInt(chainId, 16) });
      const Multicall3Contract = new Contract(Multicall3.address, Multicall3.abi, provider);

      const Namespace = await importNamespace({ chainId: Number.parseInt(chainId, 16) });
      const NamespaceInterface = new ethers.Interface(Namespace.abi);

      const ownerTokensArray = Array.from({ length: Number(ownerBalance) }, (_, index) => index);
      const chunks = [];
      for (let i = 0; i < ownerTokensArray.length; i += BATCH_SIZE) {
        chunks.push(ownerTokensArray.slice(i, i + BATCH_SIZE));
      }

      let allResults = [];
      for (const chunk of chunks) {
        const calls = chunk.map((index) => ({
          target: Namespace.address,
          allowFailure: true,
          callData: NamespaceInterface.encodeFunctionData('tokenOfOwnerByIndex', [
            walletAddress,
            index,
          ]),
        }));
        // TODO: need FIX
        const multicallResults = await Multicall3Contract.callStatic.aggregate3(calls);
        const results = multicallResults.map(({ success, returnData }, i) => {
          if (!success) {
            console.error(`Failed to retrieve token for index: ${chunk[i]}`);
            return null;
          }
          return NamespaceInterface.decodeFunctionResult('tokenOfOwnerByIndex', returnData)[0];
        });

        allResults = allResults.concat(results);
      }

      return allResults;
    },
    placeholderData: [],
  });
}
