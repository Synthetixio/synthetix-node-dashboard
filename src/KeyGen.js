import { useMutation, useQueryClient } from '@tanstack/react-query';
import React from 'react';
import { useIpnsKeys } from './useIpnsKeys';
import { useSynthetix } from './useSynthetix';
import { getApiUrl } from './utils';

export function KeyGen() {
  const queryClient = useQueryClient();
  const [synthetix] = useSynthetix();
  const { chainId, token } = synthetix;
  const [ipnsKey, setIpnsKey] = React.useState('');
  const [response, setResponse] = React.useState(null);
  const ipnsKeys = useIpnsKeys();

  const keyGen = useMutation({
    mutationFn: async (ipnsKey) => {
      const response = await fetch(`${getApiUrl()}api/v0/key/gen?arg=${ipnsKey}&type=rsa`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) {
        throw new Error('Failed to generate a new keypair');
      }
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [chainId, 'useIpnsKeys'] });
      queryClient.invalidateQueries({ queryKey: [chainId, 'useGeneratedIpnsKeys'] });
      setIpnsKey('');
      setResponse(data);
    },
  });

  return (
    <form
      className="my-4 p-4 simple-border"
      onSubmit={(e) => {
        e.preventDefault();
        keyGen.mutate(ipnsKey);
      }}
    >
      {ipnsKeys.isPending ? (
        <p>Loading..</p>
      ) : (
        <>
          {ipnsKeys.isError ? (
            <p className="help is-danger">
              An error occurred: {ipnsKeys.error?.message || 'Unknown error occurred.'}
            </p>
          ) : null}

          {ipnsKeys.isSuccess ? (
            <>
              <h4 className="title is-4">Create a new keypair</h4>
              <div className={`select is-small ${keyGen.isPending ? 'is-loading' : ''}`}>
                <select value={ipnsKey} onChange={(e) => setIpnsKey(e.target.value)}>
                  <option value="" disabled>
                    Select a key
                  </option>
                  {ipnsKeys.data.keys.map((key) => (
                    <option key={key} value={key}>
                      {key}
                    </option>
                  ))}
                </select>
              </div>
              <div className="buttons mt-4">
                <button
                  type="submit"
                  className={`button is-small ${keyGen.isPending ? 'is-loading' : ''}`}
                  disabled={!ipnsKey}
                >
                  Generate
                </button>
              </div>
            </>
          ) : null}
        </>
      )}

      {keyGen.isPending ? (
        <p>Creating a new keypair..</p>
      ) : (
        <>
          {keyGen.isError ? (
            <p className="has-text-danger">An error occurred: {keyGen.error?.message}</p>
          ) : null}

          {keyGen.isSuccess ? <p>Keypair created successfully.</p> : null}
        </>
      )}

      {response ? (
        <pre className="mt-4 is-size-7 simple-border">{JSON.stringify(response, null, 2)}</pre>
      ) : null}
    </form>
  );
}
