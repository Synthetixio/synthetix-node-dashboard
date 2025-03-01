import { useMutation } from '@tanstack/react-query';
import { Contract } from 'ethers';
import { importNamespace } from './importNamespace';
import { useSynthetix } from './useSynthetix';

export function useMintNamespace() {
  const [synthetix] = useSynthetix();
  const { walletAddress, provider, signer, chainId } = synthetix;

  return useMutation({
    mutationKey: [chainId, { walletAddress }, 'useMintNamespace'],
    mutationFn: async (data) => {
      if (!(provider && signer && chainId && walletAddress)) {
        throw new Error('Not ready');
      }
      const Namespace = await importNamespace({ chainId });
      const NamespaceContract = new Contract(Namespace.address, Namespace.abi, signer);

      try {
        const tx = await NamespaceContract.safeMint(data);
        console.log({ tx });
        const result = await tx.wait();
        console.log({ result });
        return { transaction: result };
      } catch (error) {
        if (error.reason) {
          throw new Error(`Reason for error: ${error.reason}`);
        }
        if (error.error?.message) {
          throw new Error(`Reason for error: ${error.error.message}`);
        }
        throw new Error(`No specific reason provided in error object: ${error}`);
      }
    },
  });
}
