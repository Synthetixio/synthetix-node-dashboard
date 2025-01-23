import React from 'react';
import { useDeployments } from './useDeployments';
import { useNamePublish } from './useNamePublish';

export function Update({ rootCID }) {
  const [selectedName, setSelectedName] = React.useState('');
  const [publishResponse, setPublishResponse] = React.useState(null);
  const deployments = useDeployments();
  const namePublish = useNamePublish();

  return (
    <form
      className="mt-4 p-4 simple-border"
      onSubmit={(e) => {
        e.preventDefault();
        namePublish.mutate(
          { Name: selectedName, rootCID },
          {
            onSuccess: (data) => setPublishResponse(data),
          }
        );
      }}
    >
      <h4 className="title is-4">Update</h4>
      <div className="control mb-4">
        <div className={`select is-small ${namePublish.isPending ? 'is-loading' : ''}`}>
          <select value={selectedName} onChange={(e) => setSelectedName(e.target.value)}>
            <option value="" disabled>
              Select a namespace
            </option>
            {deployments.data.map((deployments) => (
              <option key={deployments.name} value={deployments.name}>
                {deployments.name}
              </option>
            ))}
          </select>
        </div>
        {namePublish.isError ? (
          <p className="has-text-danger">An error occurred: {namePublish.error?.message}</p>
        ) : null}
      </div>

      <div className="buttons mt-4">
        <button
          type="submit"
          className={`button is-small ${namePublish.isPending ? 'is-loading' : ''}`}
          disabled={!selectedName}
        >
          Update Build
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
      {namePublish.isSuccess ? <p className="mt-4">Update successfully!</p> : null}
    </form>
  );
}
