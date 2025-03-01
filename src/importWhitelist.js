export async function importWhitelist({ chainId }) {
  switch (`${chainId}`) {
    case `0x${Number(11155420).toString(16)}`: {
      const { address, abi } = await import(
        '@synthetixio/synthetix-node-namespace/deployments/11155420/Whitelist'
      ).catch((e) => console.log(e));
      return { address, abi };
    }
    default:
      throw new Error(`Unsupported chain ${chainId} for Whitelist`);
  }
}
