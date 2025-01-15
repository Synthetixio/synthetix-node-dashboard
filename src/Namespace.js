import React from 'react';
import {useMintNamespace} from './useMintNamespace';
import {useSynthetix} from './useSynthetix';
import {useTokenBalance} from './useTokenBalance';
import {useTokenOfOwnerByIndex} from './useTokenOfOwnerByIndex';
import {validateNamespace} from './validateNamespace';

export function Namespace() {
  const [synthetix] = useSynthetix();
  const { walletAddress } = synthetix;
  const mintNamespaceMutation = useMintNamespace();
  const [namespace, setNamespace] = React.useState('');
  const [validationErrors, setValidationErrors] = React.useState([]);

  const ownerBalance = useTokenBalance({ walletAddress });
  console.log('ownerBalance', ownerBalance.data);
  const tokensIds = useTokenOfOwnerByIndex({ ownerBalance: ownerBalance.data });
  console.log('tokensIds', tokensIds.data);

  const handleNamespaceSubmit = async (e) => {
    e.preventDefault();

    const errors = validateNamespace(namespace);

    if (errors.length > 0) {
      setValidationErrors(errors);
      return;
    }
    setValidationErrors([]);
    mintNamespaceMutation.mutate(namespace);
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
          className="button is-small"
          disabled={
            !namespace.trim() || validationErrors.length > 0 || mintNamespaceMutation.isPending
          }
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
    </section>
  );
}
