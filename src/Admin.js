import { useQuery, useQueryClient } from '@tanstack/react-query';
import { ethers } from 'ethers';
import { useState } from 'react';
import { WalletsList } from './WalletsList';
import { useApproveApplicationMutation } from './useApproveApplicationMutation';
import { useFetch } from './useFetch';
import { usePermissions } from './usePermissions';
import { useRejectApplicationMutation } from './useRejectApplicationMutation';

export function Admin() {
  const queryClient = useQueryClient();
  const permissions = usePermissions();
  const approveApplicationMutation = useApproveApplicationMutation();
  const rejectApplicationMutation = useRejectApplicationMutation();
  const [userApproveWallet, setUserApproveWallet] = useState('');
  const [userApproveWalletError, setUserApproveWalletError] = useState(false);
  const [userRejectWallet, setUserRejectWallet] = useState('');
  const [userRevokeWalletError, setUserRevokeWalletError] = useState(false);
  const { fetch, chainId } = useFetch();

  const submittedWallets = useQuery({
    queryKey: [chainId, 'submitted-wallets'],
    queryFn: async () => {
      const response = await fetch('/api/submitted-wallets', {
        method: 'GET',
      });
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    },
    enabled: fetch && permissions.data.isAdmin === true,
    select: (data) => data.data.wallets,
  });

  const approvedWallets = useQuery({
    queryKey: [chainId, 'approved-wallets'],
    queryFn: async () => {
      const response = await fetch('/api/approved-wallets', {
        method: 'GET',
      });
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    },
    enabled: fetch && permissions.data.isAdmin === true,
    select: (data) => data.data.wallets,
  });

  const handleApproveApplicationSubmit = async (e) => {
    e.preventDefault();

    if (ethers.isAddress(userApproveWallet)) {
      approveApplicationMutation.mutate(userApproveWallet, {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: [chainId, 'approved-wallets'] });
          queryClient.invalidateQueries({ queryKey: [chainId, 'submitted-wallets'] });
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
