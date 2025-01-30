import React from 'react';
import { useGeneratedKeys } from './useGeneratedKeys';
import { useKeyGen } from './useKeyGen';
import { useMintNamespace } from './useMintNamespace';
import { useNamespaces } from './useNamespaces';
import { validateNamespace } from './validateNamespace';

export function AddProject() {
  const mintNamespaceMutation = useMintNamespace();
  const keyGenMutation = useKeyGen();
  const [namespace, setNamespace] = React.useState('');
  const [namespaceValidationErrors, setNamespaceValidationErrors] = React.useState([]);
  const namespaces = useNamespaces();
  const generatedKeys = useGeneratedKeys();

  const [keyGenResponse, setKeyGenResponse] = React.useState(null);

  const handleSubmitNamespace = async (e) => {
    e.preventDefault();

    const errors = validateNamespace({
      namespace: namespace.trim(),
      namespaces: namespaces.data?.namespaces,
      generatedKeys: generatedKeys.data.keys,
    });

    if (errors.length > 0) {
      setNamespaceValidationErrors(errors);
      return;
    }
    setNamespaceValidationErrors([]);
    mintNamespaceMutation.mutate(namespace, {
      onSuccess: () => {
        setNamespace('');
        handleGenerateIpnsKey(namespace);
      },
    });
  };

  const handleGenerateIpnsKey = (namespace) => {
    keyGenMutation.mutate(namespace, {
      onSuccess: setKeyGenResponse,
    });
  };

  const isNamespaceAlreadyExistsError =
    namespaceValidationErrors.includes('Namespace already exists.') &&
    !namespaceValidationErrors.includes('Keypair already exists.');

  return (
    <>
      <h4 className="title is-4">Add Project</h4>
      <form className="mb-4" onSubmit={handleSubmitNamespace}>
        <div className="field">
          <div className="control">
            <input
              className={`input ${namespaceValidationErrors.length > 0 ? 'is-danger' : ''} is-small`}
              type="text"
              placeholder="Enter project name"
              value={namespace}
              onChange={(e) => {
                setNamespace(e.target.value);
                setNamespaceValidationErrors([]);
                keyGenMutation.reset();
              }}
            />
          </div>
          {namespaceValidationErrors.map((error, index) => (
            <p key={index} className="help is-danger">
              {error}
            </p>
          ))}
        </div>
        <button
          type="submit"
          className={`button is-small ${mintNamespaceMutation.isPending ? 'is-loading' : ''}`}
          disabled={
            !namespace.trim() ||
            namespaces.isPending ||
            generatedKeys.isPending ||
            namespaceValidationErrors.length > 0
          }
        >
          Add project
        </button>
      </form>

      {mintNamespaceMutation.isPending ? (
        <p>Submitting transaction to mint namespace on the blockchain..</p>
      ) : (
        <>
          {mintNamespaceMutation.isError ? (
            <p className="help is-danger">
              An error occurred: {mintNamespaceMutation.error?.message || 'Unknown error occurred.'}
            </p>
          ) : null}

          {mintNamespaceMutation.isSuccess ? <p>Namespace submitted successfully!</p> : null}
        </>
      )}

      {keyGenMutation.isPending ? (
        <p>Generating a new IPNS keypair on the server..</p>
      ) : (
        <>
          {keyGenMutation.isError || isNamespaceAlreadyExistsError ? (
            <div className="mt-4">
              <p className="has-text-danger">
                {keyGenMutation.isError
                  ? `An error occurred: ${keyGenMutation.error?.message || 'Unknown error occurred.'}`
                  : ''}
              </p>
              <button
                type="button"
                className="button is-small"
                onClick={() => handleGenerateIpnsKey(namespace)}
              >
                Retry Key Generation
              </button>
            </div>
          ) : null}

          {keyGenMutation.isSuccess ? <p>Keypair created successfully!</p> : null}
        </>
      )}

      {keyGenResponse ? (
        <pre className="mt-4 is-size-7 simple-border">
          {JSON.stringify(keyGenResponse, null, 2)}
        </pre>
      ) : null}
    </>
  );
}
