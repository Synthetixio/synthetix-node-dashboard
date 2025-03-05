import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { useCheckApiToken } from './useCheckApiToken';
import { useFetch } from './useFetch';
import { useSynthetix } from './useSynthetix';

export function ApiKey() {
  const [synthetix] = useSynthetix();
  const { walletAddress, signer } = synthetix;
  const queryClient = useQueryClient();
  const checkApiTokenQuery = useCheckApiToken();
  const [apiToken, setApiToken] = useState(null);
  const { fetch, chainId } = useFetch();

  const generateApiNonceMutation = useMutation({
    mutationFn: async (data) => {
      const response = await fetch('/api/generate-api-nonce', {
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    },
    onSuccess: ({ nonce }) => {
      signer.signMessage(nonce).then((signedMessage) => {
        verifyApiTokenMutation.mutate({ nonce, signedMessage });
      });
    },
  });

  const verifyApiTokenMutation = useMutation({
    mutationFn: async (data) => {
      const response = await fetch('/api/verify-api-token', {
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    },
    onSuccess: ({ apiToken }) => {
      setApiToken(apiToken);
      queryClient.invalidateQueries({
        queryKey: [chainId, 'useCheckApiToken'],
      });
    },
  });

  const regenerateApiTokenMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/regenerate-api-token');
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    },
    onSuccess: ({ apiToken }) => {
      setApiToken(apiToken);
    },
  });

  const [isCopied, setIsCopied] = useState(false);

  return (
    <div>
      {checkApiTokenQuery.isPending ? <p>Loading..</p> : null}
      {apiToken ? (
        <div className="is-flex is-align-items-center">
          <code className="token">{apiToken}</code>
          <div style={{ marginLeft: '10px' }}>
            <button
              type="button"
              className="button is-primary"
              disabled={isCopied}
              style={{ width: '100px' }}
              onClick={() => {
                navigator.clipboard.writeText(apiToken);
                setIsCopied(true);
                setTimeout(() => {
                  setIsCopied(false);
                }, 500);
              }}
            >
              {isCopied ? 'Copied!' : 'Copy'}
            </button>
          </div>
        </div>
      ) : null}

      {checkApiTokenQuery.data?.apiTokenGenerated ? (
        <>
          {apiToken ? null : <p>******</p>}
          <p className="api-token-warning">
            Warning! If you regenerate token - old one will stop working.
          </p>
        </>
      ) : null}

      <div className="buttons" style={{ marginTop: '10px' }}>
        {apiToken || checkApiTokenQuery.data?.apiTokenGenerated ? (
          <button
            type="button"
            className="button is-primary"
            disabled={regenerateApiTokenMutation.isPending}
            onClick={() => {
              regenerateApiTokenMutation.mutate();
            }}
          >
            {regenerateApiTokenMutation.isPending ? 'Regenerating...' : 'Regenerate api token'}
          </button>
        ) : (
          <button
            type="button"
            className="button is-primary"
            disabled={generateApiNonceMutation.isPending || verifyApiTokenMutation.isPending}
            onClick={() => {
              generateApiNonceMutation.mutate({ walletAddress });
            }}
          >
            {generateApiNonceMutation.isPending || verifyApiTokenMutation.isPending
              ? 'Generating...'
              : 'Generate api token'}
          </button>
        )}
      </div>

      {checkApiTokenQuery.isError ? (
        <p>An error occurred: {checkApiTokenQuery.error.message || 'Unknown error'}</p>
      ) : null}

      {generateApiNonceMutation.isError ? (
        <p>An error occurred: {generateApiNonceMutation.error.message || 'Unknown error'}</p>
      ) : null}

      {verifyApiTokenMutation.isError ? (
        <p>An error occurred: {verifyApiTokenMutation.error.message || 'Unknown error'}</p>
      ) : null}

      {regenerateApiTokenMutation.isError ? (
        <p>An error occurred: {regenerateApiTokenMutation.error.message || 'Unknown error'}</p>
      ) : null}
      {regenerateApiTokenMutation.isSuccess ? <p>API token successfully regenerated!</p> : null}
    </div>
  );
}
