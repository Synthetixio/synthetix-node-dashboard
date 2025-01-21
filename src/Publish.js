import { useMutation, useQueryClient } from '@tanstack/react-query';
import React from 'react';
import { useSynthetix } from './useSynthetix';
import { useUnpublishedNamespaces } from './useUnpublishedNamespaces';
import { getApiUrl } from './utils';

export function Publish({ rootCID }) {
  const queryClient = useQueryClient();
  const [synthetix] = useSynthetix();
  const { token, chainId } = synthetix;
  const [selectedNamespace, setSelectedNamespace] = React.useState('');
  const [publishResponse, setPublishResponse] = React.useState(null);
  const unpublishedNamespaces = useUnpublishedNamespaces();

  const namePublish = useMutation({
    mutationFn: async (Name) => {
      const response = await fetch(`${getApiUrl()}api/v0/name/publish?arg=${rootCID}&key=${Name}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${synthetix.token}` },
      });
      if (!response.ok) {
        throw new Error('Failed to publish');
      }
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: [chainId, 'useDeployments'],
      });
      queryClient.invalidateQueries({
        queryKey: [chainId, 'useUnpublishedNamespaces'],
      });
      setPublishResponse(data);
    },
  });

  const keyGen = useMutation({
    mutationFn: async () => {
      const response = await fetch(
        `${getApiUrl()}api/v0/key/gen?arg=${selectedNamespace}&type=rsa`,
        {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (!response.ok) {
        throw new Error('Failed to generate a new keypair');
      }
      return response.json();
    },
    onSuccess: (data) => {
      namePublish.mutate(data.Name);
    },
  });

  return (
    <div className="my-6">
      {unpublishedNamespaces.isPending ? (
        <p>Loading..</p>
      ) : (
        <>
          {unpublishedNamespaces.isError ? (
            <p className="help is-danger">
              An error occurred: {unpublishedNamespaces.error?.message || 'Unknown error occurred.'}
            </p>
          ) : null}

          {unpublishedNamespaces.isSuccess ? (
            <>
              <h4 className="title is-4">Your Unpublished Namespaces:</h4>
              <div className="select is-small">
                <select
                  value={selectedNamespace}
                  onChange={(e) => setSelectedNamespace(e.target.value)}
                >
                  <option value="" disabled>
                    Select a namespace
                  </option>
                  {unpublishedNamespaces.data.namespaces.map((namespace) => (
                    <option key={namespace} value={namespace}>
                      {namespace}
                    </option>
                  ))}
                </select>
              </div>
            </>
          ) : null}
        </>
      )}

      <div className="buttons mt-4">
        <button
          type="button"
          className={`button is-small ${keyGen.isPending || namePublish.isPending ? 'is-loading' : ''}`}
          disabled={!selectedNamespace}
          onClick={keyGen.mutate}
        >
          Publish Build
        </button>

        {publishResponse ? (
          <div className="buttons">
            <a
              className="button is-small"
              href={`http://127.0.0.1:8080/ipns/${publishResponse.Name}/`}
              target="_blank"
              rel="noopener noreferrer"
            >
              http://127.0.0.1:8080/ipns/{publishResponse.Name}/
            </a>
            <a
              className="button is-small"
              href={`http://127.0.0.1:8080${publishResponse.Value}/`}
              target="_blank"
              rel="noopener noreferrer"
            >
              http://127.0.0.1:8080{publishResponse.Value}/
            </a>
          </div>
        ) : null}
      </div>

      {keyGen.isPending ? (
        <p>Creating a new keypair..</p>
      ) : (
        <>
          {keyGen.isError ? (
            <p className="has-text-danger">An error occurred: {keyGen.error?.message}</p>
          ) : null}

          {keyGen.isSuccess ? <p>Keypair created successfully. Proceeding to publish..</p> : null}
        </>
      )}

      {keyGen.isSuccess && namePublish.isPending ? (
        <p>Publishing..</p>
      ) : (
        <>
          {namePublish.isError ? (
            <p className="has-text-danger">An error occurred: {namePublish.error?.message}</p>
          ) : null}

          {namePublish.isSuccess ? <p>Publishing completed successfully.</p> : null}
        </>
      )}

      {publishResponse ? (
        <pre className="mt-4 is-size-7">{JSON.stringify(publishResponse, null, 2)}</pre>
      ) : null}
    </div>
  );
}
