import { useMutation, useQueryClient } from '@tanstack/react-query';
import React from 'react';
import { useGeneratedIpnsKeys } from './useGeneratedIpnsKeys';
import { useSynthetix } from './useSynthetix';
import { getApiUrl } from './utils';

export function KeyRemove() {
  const queryClient = useQueryClient();
  const [synthetix] = useSynthetix();
  const { chainId, token } = synthetix;
  const [ipnsKey, setIpnsKey] = React.useState('');
  const generatedIpnsKeys = useGeneratedIpnsKeys();
  const [response, setResponse] = React.useState(null);

  const keyRemove = useMutation({
    mutationFn: async (ipnsKey) => {
      const response = await fetch(`${getApiUrl()}api/v0/key/rm?arg=${ipnsKey}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: [chainId, 'useGeneratedIpnsKeys'],
      });
      queryClient.invalidateQueries({
        queryKey: [chainId, 'useIpnsKeys'],
      });
      setIpnsKey('');
      setResponse(data);
    },
  });

  return (
    <form
      className="my-4 p-4 simple-border"
      onSubmit={(e) => {
        e.preventDefault();
        keyRemove.mutate(ipnsKey);
      }}
    >
      {generatedIpnsKeys.isPending ? (
        <p>Loading..</p>
      ) : (
        <>
          {generatedIpnsKeys.isError ? (
            <p className="help is-danger">
              An error occurred: {generatedIpnsKeys.error?.message || 'Unknown error occurred.'}
            </p>
          ) : null}

          {generatedIpnsKeys.isSuccess ? (
            <>
              <h4 className="title is-4">Remove a keypair</h4>
              <div className={`select is-small ${keyRemove.isPending ? 'is-loading' : ''}`}>
                <select value={ipnsKey} onChange={(e) => setIpnsKey(e.target.value)}>
                  <option value="" disabled>
                    Select a key
                  </option>
                  {generatedIpnsKeys.data.keys.map((ipfsKey) => (
                    <option key={ipfsKey.name} value={ipfsKey.name}>
                      {ipfsKey.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="buttons mt-4">
                <button
                  type="submit"
                  className={`button is-small ${keyRemove.isPending ? 'is-loading' : ''}`}
                  disabled={!ipnsKey}
                >
                  Remove
                </button>
              </div>
            </>
          ) : null}
        </>
      )}

      {keyRemove.isPending ? (
        <p>Removing keypair..</p>
      ) : (
        <>
          {keyRemove.isError ? (
            <p className="has-text-danger">An error occurred: {keyRemove.error?.message}</p>
          ) : null}

          {keyRemove.isSuccess ? <p>Remove successfully!</p> : null}
        </>
      )}

      {response ? (
        <pre className="mt-4 is-size-7 simple-border">{JSON.stringify(response, null, 2)}</pre>
      ) : null}
    </form>
  );
}
