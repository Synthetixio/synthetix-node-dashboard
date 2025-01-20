import React from 'react';
import { useMintNamespace } from './useMintNamespace';
import { useNamespaces } from './useNamespaces';
import { validateNamespace } from './validateNamespace';

export function Namespace() {
  const mintNamespaceMutation = useMintNamespace();
  const [namespace, setNamespace] = React.useState('');
  const [validationErrors, setValidationErrors] = React.useState([]);
  const namespaces = useNamespaces();

  const handleNamespaceSubmit = async (e) => {
    e.preventDefault();

    const errors = validateNamespace(namespace.trim(), namespaces.data?.namespaces);

    if (errors.length > 0) {
      setValidationErrors(errors);
      return;
    }
    setValidationErrors([]);
    mintNamespaceMutation.mutate(namespace, {
      onSuccess: () => {
        setNamespace('');
      },
    });
  };

  return (
    <section className="section">
      <form className="mb-4" onSubmit={handleNamespaceSubmit}>
        <div className="field">
          <label className="label">Namespace</label>
          <div className="control">
            <input
              className={`input ${validationErrors.length > 0 ? 'is-danger' : ''} is-small`}
              type="text"
              placeholder="Enter namespace"
              value={namespace}
              onChange={(e) => {
                setNamespace(e.target.value);
                setValidationErrors([]);
              }}
            />
          </div>
          {validationErrors.map((error, index) => (
            <p key={index} className="help is-danger">
              {error}
            </p>
          ))}
        </div>
        <button
          type="submit"
          className={`button is-small ${mintNamespaceMutation.isPending ? 'is-loading' : ''}`}
          disabled={!namespace.trim() || validationErrors.length > 0}
        >
          Submit
        </button>
      </form>

      <div className="mt-4">
        {mintNamespaceMutation.isPending ? (
          <p>Submitting..</p>
        ) : (
          <>
            {mintNamespaceMutation.isError ? (
              <p className="help is-danger">
                An error occurred:{' '}
                {mintNamespaceMutation.error?.message || 'Unknown error occurred.'}
              </p>
            ) : null}

            {mintNamespaceMutation.isSuccess ? <p>Namespace submitted successfully!</p> : null}
          </>
        )}
      </div>

      <div className="mt-4">
        {namespaces.isPending ? (
          <p>Loading..</p>
        ) : (
          <>
            {namespaces.isError ? (
              <p className="help is-danger">
                An error occurred: {namespaces.error?.message || 'Unknown error occurred.'}
              </p>
            ) : null}

            {namespaces.isSuccess ? (
              <>
                <h4 className="title is-4">Namespaces:</h4>
                <ul>
                  {namespaces.data.namespaces.map((namespace) => (
                    <li key={namespace}>{namespace}</li>
                  ))}
                </ul>
              </>
            ) : null}
          </>
        )}
      </div>
    </section>
  );
}
