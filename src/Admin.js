import { useQuery, useQueryClient } from '@tanstack/react-query';
import { ethers } from 'ethers';
import { useState } from 'react';
import { WalletsList } from './WalletsList';
import { useApproveApplicationMutation } from './useApproveApplicationMutation';
import { useAuthorisedFetch } from './useAuthorisedFetch';
import { usePermissions } from './usePermissions';
import { useRejectApplicationMutation } from './useRejectApplicationMutation';
import { useSynthetix } from './useSynthetix';

export function Admin() {
  const queryClient = useQueryClient();
  const [synthetix] = useSynthetix();
  const permissions = usePermissions();
  const approveApplicationMutation = useApproveApplicationMutation();
  const rejectApplicationMutation = useRejectApplicationMutation();
  const [userApproveWallet, setUserApproveWallet] = useState('');
  const [userApproveWalletError, setUserApproveWalletError] = useState(false);
  const [userRejectWallet, setUserRejectWallet] = useState('');
  const [userRevokeWalletError, setUserRevokeWalletError] = useState(false);
  const { isLoading: fetchLoading, isError, data: authorisedFetch } = useAuthorisedFetch();

  const submittedWallets = useQuery({
    enabled: Boolean(
      synthetix.chainId &&
        !fetchLoading &&
        !isError &&
        authorisedFetch &&
        permissions.data.isAdmin === true
    ),
    queryKey: [synthetix.chainId, 'submitted-wallets'],
    queryFn: async () => {
      const response = await authorisedFetch('/api/submitted-wallets', {
        method: 'GET',
      });
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    },
    select: (data) => data.data.wallets,
  });

  const approvedWallets = useQuery({
    enabled: Boolean(
      synthetix.chainId &&
        !fetchLoading &&
        !isError &&
        authorisedFetch &&
        permissions.data.isAdmin === true
    ),
    queryKey: [synthetix.chainId, 'approved-wallets'],
    queryFn: async () => {
      const response = await authorisedFetch('/api/approved-wallets', {
        method: 'GET',
      });
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    },
    select: (data) => data.data.wallets,
  });

  const handleApproveApplicationSubmit = async (e) => {
    e.preventDefault();

    if (ethers.isAddress(userApproveWallet)) {
      approveApplicationMutation.mutate(userApproveWallet, {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: [synthetix.chainId, 'approved-wallets'] });
          queryClient.invalidateQueries({ queryKey: [synthetix.chainId, 'submitted-wallets'] });
        },
      });
    } else {
      setUserApproveWalletError(true);
    }
  };

  const handleRejectApplicationSubmit = async (e) => {
    e.preventDefault();

    if (ethers.isAddress(userRejectWallet)) {
      rejectApplicationMutation.mutate(userRejectWallet);
    } else {
      setUserRevokeWalletError(true);
    }
  };

  const isLoading =
    permissions.isFetching ||
    approveApplicationMutation.isPending ||
    rejectApplicationMutation.isPending;

  if (isLoading) {
    return <p>Loading..</p>;
  }

  return (
    <>
      <section className="section">
        <form className="mb-4" onSubmit={handleApproveApplicationSubmit}>
          <div className="field">
            <label className="label" htmlFor="approveWalletAddress">
              Approve application
            </label>
            <div className="control">
              <input
                id="approveWalletAddress"
                className={`input ${userApproveWalletError && 'is-danger'} is-primary`}
                type="text"
                placeholder="Enter wallet address"
                onChange={(e) => {
                  setUserApproveWalletError(false);
                  setUserApproveWallet(e.target.value);
                }}
              />
            </div>
            {userApproveWalletError ? (
              <p className="help is-danger">This address is invalid</p>
            ) : null}
          </div>
          <button
            type="submit"
            className="button is-primary"
            disabled={!userApproveWallet || userApproveWalletError}
          >
            Submit
          </button>
        </form>
        <WalletsList
          title="Submitted wallets"
          data={submittedWallets.data}
          isFetching={submittedWallets.isFetching}
          isError={submittedWallets.isError}
          error={submittedWallets.error}
        />
      </section>

      <section className="section">
        <form className="mb-4" onSubmit={handleRejectApplicationSubmit}>
          <div className="field">
            <label className="label" htmlFor="revokeWalletAddress">
              Revoke access
            </label>
            <div className="control">
              <input
                id="revokeWalletAddress"
                className={`input ${userRevokeWalletError && 'is-danger'} is-primary`}
                type="text"
                placeholder="Enter wallet address"
                onChange={(e) => {
                  setUserRevokeWalletError(false);
                  setUserRejectWallet(e.target.value);
                }}
              />
            </div>
            {userRevokeWalletError ? (
              <p className="help is-danger">This address is invalid</p>
            ) : null}
          </div>
          <button
            type="submit"
            className="button is-primary"
            disabled={!userRejectWallet || userRevokeWalletError}
          >
            Submit
          </button>
        </form>
        <WalletsList
          title="Approved wallets"
          data={approvedWallets.data}
          isFetching={approvedWallets.isFetching}
          isError={approvedWallets.isError}
        />
      </section>
    </>
  );
}
