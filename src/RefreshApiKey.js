import { useMutation } from '@tanstack/react-query';
import { useState } from 'react';
import { useSynthetix } from './useSynthetix';
import { getApiUrl, saveToken } from './utils';

export function RefreshApiKey() {
  const [synthetix, updateSynthetix] = useSynthetix();
  const { walletAddress, token } = synthetix;

  const refreshTokenMutation = useMutation({
    mutationFn: async (data) => {
      const response = await fetch(`${getApiUrl()}/api/refresh-token`, {
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
    onSuccess: ({ token }) => {
      saveToken({ walletAddress, token });
      updateSynthetix({ token });
    },
  });

  const [isCopied, setIsCopied] = useState(false);

  return (
    <div>
      <div className="is-flex is-align-items-center">
        <code className="token">{token}</code>
        <div style={{ marginLeft: '10px' }}>
          <button
            type="button"
            className="button is-primary"
            disabled={isCopied}
            style={{ width: '100px' }}
            onClick={() => {
              navigator.clipboard.writeText(token);
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

      <div className="buttons" style={{ marginTop: '10px' }}>
        <button
          type="button"
          className="button is-primary"
          disabled={refreshTokenMutation.isPending}
          onClick={() => {
            refreshTokenMutation.mutate({ walletAddress });
          }}
        >
          {refreshTokenMutation.isPending ? 'Regenerating...' : 'Regenerate token'}
        </button>
      </div>

      {refreshTokenMutation.isError ? (
        <p>An error occurred: {refreshTokenMutation.error.message || 'Unknown error'}</p>
      ) : null}

      {refreshTokenMutation.isSuccess ? <p>Token successfully refreshed!</p> : null}
    </div>
  );
}
