import React from 'react';
import { useNamePublish } from './useNamePublish';
import { useUnpublishedNamespaces } from './useUnpublishedNamespaces';

export function Publish({ rootCID }) {
  const [ipnsKey, setIpnsKey] = React.useState('');
  const [response, setResponse] = React.useState(null);
  const unpublishedNamespaces = useUnpublishedNamespaces();
  const namePublish = useNamePublish();

  return (
    <form
      className="my-4 p-4 simple-border"
      onSubmit={(e) => {
        e.preventDefault();
        namePublish.mutate(
          { ipnsKey, rootCID },
          { onSuccess: (publishData) => setResponse(publishData) }
        );
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
              <h4 className="title is-4">Publish</h4>
              <div className="select is-small">
                <select value={ipnsKey} onChange={(e) => setIpnsKey(e.target.value)}>
                  <option value="" disabled>
                    Select a namespace
                  </option>
                  {unpublishedNamespaces.data.namespaces.map((n) => (
                    <option key={n} value={n}>
                      {n}
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
          className={`button is-small ${namePublish.isPending ? 'is-loading' : ''}`}
          disabled={!ipnsKey}
        >
          Publish
        </button>

        {response ? (
          <div className="buttons">
            <a
              className="button is-small"
              href={`http://127.0.0.1:8080/ipns/${response.Name}/`}
              target="_blank"
              rel="noopener noreferrer"
            >
              http://127.0.0.1:8080/ipns/{response.Name}/
            </a>
            <a
              className="button is-small"
              href={`http://127.0.0.1:8080${response.Value}/`}
              target="_blank"
              rel="noopener noreferrer"
            >
              http://127.0.0.1:8080{response.Value}/
            </a>
          </div>
        ) : null}
      </div>

      {namePublish.isSuccess ? <p>Publish successfully!</p> : null}

      {response ? (
        <pre className="mt-4 is-size-7 simple-border">{JSON.stringify(response, null, 2)}</pre>
      ) : null}
    </form>
  );
}
