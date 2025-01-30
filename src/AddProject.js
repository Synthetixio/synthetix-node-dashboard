import React from 'react';
import { useKeyGen } from './useKeyGen';
import { useMintNamespace } from './useMintNamespace';
import { useUniqueGeneratedKey } from './useUniqueGeneratedKey';
import { useUniqueNamespaceCheck } from './useUniqueNamespaceCheck';
import { validateNamespace } from './validateNamespace';

const NAMESPACE_EXISTS_ERROR = 'Namespace already exists.';
const KEYPAIR_EXISTS_ERROR = 'Keypair already exists.';

export function AddProject() {
  const mintNamespaceMutation = useMintNamespace();
  const keyGenMutation = useKeyGen();
  const uniqueNamespaceMutation = useUniqueNamespaceCheck();
  const uniqueGeneratedKeyMutation = useUniqueGeneratedKey();
  const [namespace, setNamespace] = React.useState('');
  const [validationErrors, setValidationErrors] = React.useState([]);
  const [keyGenResponse, setKeyGenResponse] = React.useState(null);

  const isNamespaceAlreadyExistsError =
    validationErrors.includes(NAMESPACE_EXISTS_ERROR) &&
    !validationErrors.includes(KEYPAIR_EXISTS_ERROR);

  const handleSubmitNamespace = async (e) => {
    e.preventDefault();
    const errors = validateNamespace(namespace.trim());

    const checks = await Promise.allSettled([
      uniqueNamespaceMutation.mutateAsync(namespace),
      uniqueGeneratedKeyMutation.mutateAsync(namespace),
    ]);

    if (checks[0].status === 'fulfilled' && !checks[0].value.unique) {
      errors.push(NAMESPACE_EXISTS_ERROR);
    } else if (checks[0].status === 'rejected') {
      console.error('Namespace mutation error:', checks[0].reason);
    }

    if (checks[1].status === 'fulfilled' && !checks[1].value.unique) {
      errors.push(KEYPAIR_EXISTS_ERROR);
    } else if (checks[1].status === 'rejected') {
      console.error('Generated key mutation error:', checks[1].reason);
    }

    if (errors.length > 0) {
      setValidationErrors(errors);
      return;
    }

    setValidationErrors([]);
    setKeyGenResponse(null);
    mintNamespaceMutation.mutate(namespace, {
      onSuccess: () => {
        setNamespace('');
        handleGenerateKeypair(namespace);
      },
    });
  };

  const handleGenerateKeypair = (namespace) => {
    keyGenMutation.mutate(namespace, {
      onSuccess: setKeyGenResponse,
    });
  };

  return (
    <>
      <h4 className="title is-4">Add Project</h4>
      <form className="mb-4" onSubmit={handleSubmitNamespace}>
        <div className="field">
          <div className="control">
            <input
              className={`input ${validationErrors.length > 0 ? 'is-danger' : ''} is-small`}
              type="text"
              placeholder="Enter project name"
              value={namespace}
              onChange={(e) => {
                setNamespace(e.target.value);
                setValidationErrors([]);
                keyGenMutation.reset();
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
          disabled={
            !namespace.trim() ||
            uniqueNamespaceMutation.isPending ||
            uniqueGeneratedKeyMutation.isPending ||
            validationErrors.length > 0
          }
        >
          Save
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
                onClick={() => handleGenerateKeypair(namespace)}
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
