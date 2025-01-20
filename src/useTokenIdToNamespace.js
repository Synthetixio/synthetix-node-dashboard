import { useQuery } from '@tanstack/react-query';
import { Contract, ethers } from 'ethers';
import { importMulticall3 } from './importMulticall3';
import { importNamespace } from './importNamespace';
import { useSynthetix } from './useSynthetix';

const BATCH_SIZE = 500;

export function useTokenIdToNamespace({ tokensIds }) {
  const [synthetix] = useSynthetix();
  const { walletAddress, provider, signer, chainId } = synthetix;

  return useQuery({
    enabled: Boolean(
      provider && signer && chainId && walletAddress && tokensIds && tokensIds.length
    ),
    queryKey: [
      chainId,
      { walletAddress },
      'useTokenIdToNamespace',
      { tokensIds: tokensIds.map((id) => Number(id)) },
    ],
    queryFn: async () => {
      const Multicall3 = await importMulticall3({ chainId: Number.parseInt(chainId, 16) });
      const Multicall3Contract = new Contract(Multicall3.address, Multicall3.abi, provider);

      const Namespace = await importNamespace({ chainId: Number.parseInt(chainId, 16) });
      const NamespaceInterface = new ethers.Interface(Namespace.abi);

      const chunks = [];
      for (let i = 0; i < tokensIds.length; i += BATCH_SIZE) {
        chunks.push(tokensIds.slice(i, i + BATCH_SIZE));
      }

      let allResults = [];

      for (const chunk of chunks) {
        const calls = chunk.map((tokensId) => ({
          target: Namespace.address,
          allowFailure: true,
          callData: NamespaceInterface.encodeFunctionData('tokenIdToNamespace', [tokensId]),
        }));

        const multicallResults = await Multicall3Contract.aggregate3.staticCall(calls);

        const results = multicallResults.map(({ success, returnData }, i) => {
          if (!success) {
            console.error(`Failed to fetch namespace for token ID ${chunk[i]}`);
            return null;
          }
          return NamespaceInterface.decodeFunctionResult('tokenIdToNamespace', returnData)[0];
        });

        allResults = allResults.concat(results);
      }

      return allResults;
    },
    placeholderData: [],
  });
}
