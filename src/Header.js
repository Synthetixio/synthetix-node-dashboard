import { useMutation } from '@tanstack/react-query';
import React from 'react';
import { Link } from 'react-router-dom';
import Logo from '../logo.svg';
import { usePermissions } from './usePermissions';
import { makeSearch, useParams } from './useRoutes';
import { useSynthetix } from './useSynthetix';
import { getApiUrl, saveToken } from './utils';

const makeUnauthenticatedRequest = async (endpoint, data) => {
  const response = await fetch(`${getApiUrl()}${endpoint}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (response.ok) {
    const contentType = response.headers.get('content-type');
    if (contentType?.includes('application/json')) {
      return response.json();
    }
    return response.text();
  }
  throw new Error('Network response was not ok');
};

export function Header() {
  const [synthetix, updateSynthetix] = useSynthetix();
  const { walletAddress, token, logout, connect, signer } = synthetix;
  const permissions = usePermissions();
  const [, setParams] = useParams();
  const isUserAuthenticated = walletAddress && token;
  const isUserAuthenticatedAndGranted = isUserAuthenticated && permissions.data?.isGranted;
  const isUserAuthenticatedAndAdmin = isUserAuthenticated && permissions.data?.isAdmin;

  const signupMutation = useMutation({
    mutationFn: (data) => makeUnauthenticatedRequest('signup', data),
    onSuccess: ({ nonce }) =>
      signer.signMessage(nonce).then((signedMessage) => {
        verificationMutation.mutate({ nonce, signedMessage });
      }),
  });

  const verificationMutation = useMutation({
    mutationFn: (data) => makeUnauthenticatedRequest('verify', data),
    onSuccess: ({ token }) => {
      saveToken({ walletAddress, token });
      updateSynthetix({ token });
    },
  });

  const isChainSupported = `0x${Number(11155420).toString(16)}` === `${synthetix.chainId}`;

  return (
    <header>
      <nav className="navbar" aria-label="main navigation">
        <div className="container is-max-desktop">
          <div className="navbar-brand">
            <Link
              to={`?${makeSearch({ page: 'stats' })}`}
              className="navbar-item"
              onClick={() => setParams({ page: 'stats' })}
            >
              <img
                src={Logo}
                alt="Synthetix"
                className="image"
                style={{ width: '200px', maxWidth: '200px' }}
              />
            </Link>
          </div>

          <div className="navbar-end">
            <div className="navbar-item">
              <div className="buttons" style={{ gap: '1.5em' }}>
                {isUserAuthenticatedAndGranted ? (
                  <Link
                    to={`?${makeSearch({ page: 'projects' })}`}
                    onClick={() => setParams({ page: 'projects' })}
                  >
                    Projects
                  </Link>
                ) : null}

                {isUserAuthenticated ? (
                  <>
                    <Link
                      to={`?${makeSearch({ page: 'refresh-api-key' })}`}
                      onClick={() => setParams({ page: 'refresh-api-key' })}
                    >
                      API Key
                    </Link>
                  </>
                ) : null}

                {isUserAuthenticatedAndAdmin ? (
                  <Link
                    to={`?${makeSearch({ page: 'admin' })}`}
                    onClick={() => setParams({ page: 'admin' })}
                  >
                    Admin
                  </Link>
                ) : null}

                {walletAddress && token ? (
                  <button type="button" className="link" onClick={logout}>
                    Log Out
                  </button>
                ) : null}

                {!isChainSupported && walletAddress && !token ? (
                  <>
                    <button
                      type="button"
                      className="button is-small"
                      onClick={() => {
                        window.ethereum?.request({
                          method: 'wallet_switchEthereumChain',
                          params: [{ chainId: `0x${Number(11155420).toString(16)}` }],
                        });
                      }}
                    >
                      Switch to Supported Network
                    </button>
                  </>
                ) : null}

                {isChainSupported && walletAddress && !token ? (
                  <>
                    <button
                      type="button"
                      className="button is-small"
                      onClick={() => signupMutation.mutate({ walletAddress })}
                    >
                      Log In
                    </button>
                    <button type="button" className="button is-small" onClick={logout}>
                      Disconnect
                    </button>
                  </>
                ) : null}

                {!walletAddress && !token ? (
                  <button
                    type="button"
                    className="button is-small"
                    onClick={async () => updateSynthetix(await connect())}
                  >
                    Connect
                  </button>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
}
