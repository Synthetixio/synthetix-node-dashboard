import { useMutation } from '@tanstack/react-query';
import React from 'react';
import { Link } from 'react-router-dom';
import Logo from '../logo.svg';
import { usePermissions } from './usePermissions';
import { makeSearch, useParams } from './useRoutes';
import { useSynthetix } from './useSynthetix';
import { getApiUrl, saveToken } from './utils';

function NavLinksList({ isUserAuthenticated, isAdminAuthenticated, setParams }) {
  return (
    <>
      <Link
        to={`?${makeSearch({ page: 'stats' })}`}
        className="navbar-item"
        onClick={() => setParams({ page: 'stats' })}
      >
        Home
      </Link>
      {isUserAuthenticated ? (
        <>
          <Link
            to={`?${makeSearch({ page: 'registration' })}`}
            className="navbar-item"
            onClick={() => setParams({ page: 'registration' })}
          >
            Registration
          </Link>
          <Link
            to={`?${makeSearch({ page: 'refresh-api-key' })}`}
            className="navbar-item"
            onClick={() => setParams({ page: 'refresh-api-key' })}
          >
            Refresh Api Key
          </Link>
          <Link
            to={`?${makeSearch({ page: 'namespace' })}`}
            className="navbar-item"
            onClick={() => setParams({ page: 'namespace' })}
          >
            Namespace
          </Link>
          <Link
            to={`?${makeSearch({ page: 'keys' })}`}
            className="navbar-item"
            onClick={() => setParams({ page: 'keys' })}
          >
            Keys
          </Link>
          <Link
            to={`?${makeSearch({ page: 'upload' })}`}
            className="navbar-item"
            onClick={() => setParams({ page: 'upload' })}
          >
            Upload
          </Link>
        </>
      ) : null}
      {isAdminAuthenticated ? (
        <Link
          to={`?${makeSearch({ page: 'admin' })}`}
          className="navbar-item"
          onClick={() => setParams({ page: 'admin' })}
        >
          Admin
        </Link>
      ) : null}
    </>
  );
}

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
  const isAdminAuthenticated = isUserAuthenticated && permissions.data?.isAdmin;

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

          <div className="navbar-menu">
            <div className="navbar-start">
              <NavLinksList
                isUserAuthenticated={isUserAuthenticated}
                isAdminAuthenticated={isAdminAuthenticated}
                setParams={setParams}
              />
            </div>
          </div>

          <div className="navbar-end">
            <div className="navbar-item">
              <div className="buttons">
                <a
                  className="button is-small"
                  href="https://github.com/synthetixio/synthetix-node"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Run a Node
                </a>
                {walletAddress && token ? (
                  <button type="button" className="button is-small" onClick={logout}>
                    Log Out
                  </button>
                ) : null}

                {walletAddress && !token ? (
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

          <div className="navbar-item has-dropdown">
            <div className="navbar-dropdown">
              <NavLinksList
                isUserAuthenticated={isUserAuthenticated}
                isAdminAuthenticated={isAdminAuthenticated}
                setParams={setParams}
              />
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
}
