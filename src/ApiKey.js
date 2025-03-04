import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { ConfirmationModal } from './ConfirmationModal';
import { useApiToken } from './useApiToken';
import { useSynthetix } from './useSynthetix';
import { getApiUrl } from './utils';

export function ApiKey() {
  const [synthetix] = useSynthetix();
  const { walletAddress, token, chainId, signer } = synthetix;
  const queryClient = useQueryClient();
  const apiTokenQuery = useApiToken();

  const generateApiNonceMutation = useMutation({
    mutationFn: async (data) => {
      const response = await fetch(`${getApiUrl()}/api/generate-api-nonce`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
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
      const response = await fetch(`${getApiUrl()}/api/verify-api-token`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    },
    onSuccess: ({ apiToken }) => {
      queryClient.setQueryData([chainId, 'useApiToken'], { apiToken });
    },
  });

  const regenerateApiTokenMutation = useMutation({
    mutationFn: async (data) => {
      const response = await fetch(`${getApiUrl()}/api/regenerate-api-token`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    },
    onSuccess: ({ apiToken }) => {
      queryClient.setQueryData([chainId, 'useApiToken'], { apiToken });
    },
  });

  const [isCopied, setIsCopied] = useState(false);

  const handleRefreshApiToken = () => {
    setIsModalOpen(false);
    regenerateApiTokenMutation.mutate({ apiToken: apiTokenQuery.data.apiToken });
  };
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div>
      {apiTokenQuery.isPending ? <p>Loading..</p> : null}
      {apiTokenQuery.data?.apiToken ? (
        <div className="is-flex is-align-items-center">
          <code className="token">{apiTokenQuery.data.apiToken}</code>
          <div style={{ marginLeft: '10px' }}>
            <button
              type="button"
              className="button is-primary"
              disabled={isCopied}
              style={{ width: '100px' }}
              onClick={() => {
                navigator.clipboard.writeText(apiTokenQuery.data.apiToken);
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

      <div className="buttons" style={{ marginTop: '10px' }}>
        {apiTokenQuery.data?.apiToken ? (
          <button
            type="button"
            className="button is-primary"
            disabled={regenerateApiTokenMutation.isPending}
            onClick={() => {
              setIsModalOpen(true);
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

      {apiTokenQuery.isError ? (
        <p>An error occurred: {apiTokenQuery.error.message || 'Unknown error'}</p>
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

      <ConfirmationModal
        isOpen={isModalOpen}
        onConfirm={handleRefreshApiToken}
        onCancel={() => setIsModalOpen(false)}
        isLoading={regenerateApiTokenMutation.isPending}
        text="Warning! If you regenerate token - old one will stop working."
      />
    </div>
  );
}
