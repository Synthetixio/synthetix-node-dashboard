import React from 'react';
import CollapsibleSection from './CollapsibleSection';
import ProgressTracker from './ProgressTracker';
import { useKeyGen } from './useKeyGen';
import { useMintNamespace } from './useMintNamespace';
import { useUniqueGeneratedKey } from './useUniqueGeneratedKey';
import { useUniqueNamespaceCheck } from './useUniqueNamespaceCheck';
import { getApiUrl } from './utils';
import { validateNamespace } from './validateNamespace';

export function AddProject() {
  const mintNamespaceMutation = useMintNamespace();
  const keyGenMutation = useKeyGen();
  const uniqueNamespaceMutation = useUniqueNamespaceCheck();
  const uniqueGeneratedKeyMutation = useUniqueGeneratedKey();
  const [namespace, setNamespace] = React.useState('');
  const [validationErrors, setValidationErrors] = React.useState([]);
  const [checks, setChecks] = React.useState(null);

  const handleSubmitNamespace = async (e) => {
    e.preventDefault();
    setValidationErrors([]);

    const validationErrors = validateNamespace(namespace.trim());
    if (validationErrors.length > 0) {
      setValidationErrors(validationErrors);
      return;
    }

    const [namespaceCheck, keyCheck] = await Promise.allSettled([
      uniqueNamespaceMutation.mutateAsync(namespace),
      uniqueGeneratedKeyMutation.mutateAsync(namespace),
    ]);

    setChecks([namespaceCheck, keyCheck]);

    const errors = [];
    if (namespaceCheck.status === 'fulfilled' && !namespaceCheck.value.unique) {
      errors.push('Namespace already exists.');
    } else if (namespaceCheck.status === 'rejected') {
      errors.push('Error validating namespace.');
    }

    if (keyCheck.status === 'fulfilled' && !keyCheck.value.unique) {
      errors.push('Keypair already exists.');
    } else if (keyCheck.status === 'rejected') {
      errors.push('Error validating keypair.');
    }

    if (errors.length > 0) {
      setValidationErrors(errors);
      return;
    }

    mintNamespaceMutation.mutate(namespace, {
      onSuccess: () => {
        keyGenMutation.mutate(namespace);
      },
    });
  };

  const progress = [
    {
      id: 'namespace_validation',
      text: 'Validating namespace...',
      status: uniqueNamespaceMutation.status,
      errorMessage: uniqueNamespaceMutation.error?.message || 'Unknown error occurred.',
      response:
        uniqueNamespaceMutation.isSuccess && checks?.[0]?.status === 'fulfilled'
          ? checks[0].value
          : null,
      requestUrl: `${getApiUrl()}unique-namespace`,
      payload: JSON.stringify({ namespace }),
    },
    {
      id: 'key_validation',
      text: 'Validating keypair...',
      status: uniqueGeneratedKeyMutation.status,
      errorMessage: uniqueGeneratedKeyMutation.error?.message || 'Unknown error occurred.',
      response:
        uniqueGeneratedKeyMutation.isSuccess && checks?.[1]?.status === 'fulfilled'
          ? checks[1].value
          : null,
      requestUrl: `${getApiUrl()}unique-generated-key`,
      payload: JSON.stringify({ namespace }),
    },
    {
      id: 'mint_namespace',
      text: 'Minting namespace...',
      status: mintNamespaceMutation.status,
      errorMessage: mintNamespaceMutation.error?.message || 'Unknown error occurred.',
      response: mintNamespaceMutation.isSuccess ? mintNamespaceMutation.data : null,
      requestUrl: 'Executing safeMint on the contract.',
    },
    {
      id: 'key_generation',
      text: 'Generating keypair...',
      status: keyGenMutation.status,
      errorMessage: keyGenMutation.error?.message || 'Unknown error occurred.',
      response: keyGenMutation.isSuccess ? keyGenMutation.data : null,
      requestUrl: `${getApiUrl()}api/v0/key/gen?arg=${namespace}&type=rsa`,
      kuboCli: `ipfs key gen ${namespace} --type=rsa`,
    },
  ];

  const isMutating =
    uniqueNamespaceMutation.isPending ||
    uniqueGeneratedKeyMutation.isPending ||
    mintNamespaceMutation.isPending ||
    keyGenMutation.isPending;

  const hasProgress =
    uniqueNamespaceMutation.status !== 'idle' ||
    uniqueGeneratedKeyMutation.status !== 'idle' ||
    mintNamespaceMutation.status !== 'idle' ||
    keyGenMutation.status !== 'idle';

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
                if (validationErrors.length > 0) setValidationErrors([]);
                if (checks) setChecks(null);
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
          className={`button is-small ${isMutating ? 'is-loading' : ''}`}
          disabled={!namespace.trim() || isMutating || validationErrors.length > 0}
        >
          Save
        </button>
      </form>

      {keyGenMutation.isError ? (
        <button
          type="button"
          className="button is-small"
          onClick={() => keyGenMutation.mutate(namespace)}
        >
          Retry Key Generation
        </button>
      ) : null}

      {hasProgress ? (
        <div className="mt-6">
          <CollapsibleSection title="Details">
            <ProgressTracker progress={progress} />
          </CollapsibleSection>
        </div>
      ) : null}
    </>
  );
}
