import { useMutation } from '@tanstack/react-query';
import { useSynthetix } from './useSynthetix';
import { getApiUrl, saveToken } from './utils';

export function RefreshApiKey() {
  const [synthetix, updateSynthetix] = useSynthetix();
  const { walletAddress, token } = synthetix;

  const refreshTokenMutation = useMutation({
    mutationFn: async (data) => {
      const response = await fetch(`${getApiUrl()}refresh-token`, {
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

  return (
    <div className="has-text-centered">
      {refreshTokenMutation.isPending ? (
        'Refreshing...'
      ) : (
        <>
          {refreshTokenMutation.isError ? (
            <p>An error occurred: {refreshTokenMutation.error.message || 'Unknown error'}</p>
          ) : null}

          {refreshTokenMutation.isSuccess ? <p>Token successfully refreshed!</p> : null}

          <button
            type="button"
            className="button is-small"
            disabled={refreshTokenMutation.isPending}
            onClick={() => {
              refreshTokenMutation.mutate({ walletAddress });
            }}
          >
            Refresh token
          </button>
        </>
      )}
    </div>
  );
}
