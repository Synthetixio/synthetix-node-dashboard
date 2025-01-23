import { useMutation } from '@tanstack/react-query';
import React from 'react';
import { useNamePublish } from './useNamePublish';
import { useSynthetix } from './useSynthetix';
import { useUnpublishedNamespaces } from './useUnpublishedNamespaces';
import { getApiUrl } from './utils';

export function Publish({ rootCID }) {
  const [synthetix] = useSynthetix();
  const [selectedNamespace, setSelectedNamespace] = React.useState('');
  const [publishResponse, setPublishResponse] = React.useState(null);
  const unpublishedNamespaces = useUnpublishedNamespaces();
  const namePublish = useNamePublish();
  const keyGen = useMutation({
    mutationFn: async () => {
      const response = await fetch(
        `${getApiUrl()}api/v0/key/gen?arg=${selectedNamespace}&type=rsa`,
        {
          method: 'POST',
          headers: { Authorization: `Bearer ${synthetix.token}` },
        }
      );
      if (!response.ok) {
        throw new Error('Failed to generate a new keypair');
      }
      return response.json();
    },
    onSuccess: (data) => {
      namePublish.mutate(
        { Name: data.Name, rootCID },
        { onSuccess: (publishData) => setPublishResponse(publishData) }
      );
    },
  });

  return (
    <form
      className="my-4 p-4 simple-border"
      onSubmit={(e) => {
        e.preventDefault();
        keyGen.mutate();
      }}
    >
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
          type="submit"
          className={`button is-small ${keyGen.isPending || namePublish.isPending ? 'is-loading' : ''}`}
          disabled={!selectedNamespace}
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
        <pre className="mt-4 is-size-7 simple-border">
          {JSON.stringify(publishResponse, null, 2)}
        </pre>
      ) : null}
    </form>
  );
}
