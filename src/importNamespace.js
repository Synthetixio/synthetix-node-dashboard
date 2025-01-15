export async function importNamespace({ chainId }) {
  switch (`${chainId}`) {
    case '11155111': {
      const [{ Namespace: address }, abi] = await Promise.all([
        import('../namespace/deployments.json').then((m) => m.default),
        import('../namespace/Namespace.json').then((m) => m.default),
      ]);
      return { address, abi };
    }
    // case '1': {
    //   const [{Namespace: address}, abi] = await Promise.all([
    //     import('./deployments/1/deployments.json').then(m => m.default),
    //     import('./deployments/1/Namespace.json').then(m => m.default),
    //   ]);
    //   return {address, abi};
    // }
    default:
      throw new Error(`Unsupported chain ${chainId} for Namespace`);
  }
}
