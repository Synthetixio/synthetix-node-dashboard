import {useMutation} from '@tanstack/react-query';
import React from 'react';

export function Publish({ rootCID }) {
  const [publishResponse, setPublishResponse] = React.useState(null);

  const namePublish = useMutation({
    mutationFn: async () => {
      const response = await fetch(`http://127.0.0.1:5001/api/v0/name/publish?arg=${rootCID}`, {
        method: 'POST',
      });
      if (!response.ok) {
        throw new Error('Failed to publish');
      }
      return response.json();
    },
    onSuccess: (data) => {
      setPublishResponse(data);
    },
  });

  return (
    <div className="my-6">
      <div className="buttons">
        <button
          type="button"
          className={`button is-small ${namePublish.isPending ? 'is-loading' : ''}`}
          onClick={namePublish.mutate}
        >
          Publish Build
        </button>

        {publishResponse ? (
          <a
            className="button is-small"
            href={`http://127.0.0.1:8080/ipns/${publishResponse.Name}/`}
            target="_blank"
            rel="noopener noreferrer"
          >
            Open Published Site
          </a>
        ) : null}
      </div>

      {namePublish.isPending ? (
        <p>Publishing..</p>
      ) : (
        <>
          {namePublish.isError ? <p>An error occurred: {namePublish.error?.message}</p> : null}

          {namePublish.isSuccess ? <p>Publishing completed successfully.</p> : null}
        </>
      )}

      {publishResponse ? (
        <pre className="mt-4 is-size-7">{JSON.stringify(publishResponse, null, 2)}</pre>
      ) : null}
    </div>
  );
}
