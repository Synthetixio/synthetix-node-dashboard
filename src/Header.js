import {useMutation} from '@tanstack/react-query';
import React from 'react';
import Logo from '../logo.svg';
import {usePermissions} from './usePermissions';
import {getPageRoute, usePageRoute} from './useRoutes';
import {useSynthetix} from './useSynthetix';
import {getApiUrl, saveToken} from './utils';

function NavLink({ page: pageTo, className, ...rest }) {
  const [page, setPage] = usePageRoute();

  const onClick = React.useCallback(
    (e) => {
      e.preventDefault();
      setPage(pageTo);
    },
    [pageTo, setPage]
  );

  return (
    <a
      href={getPageRoute(pageTo)}
      onClick={onClick}
      className={`${className || ''} ${page === pageTo ? 'active' : ''}`}
      {...rest}
    />
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
            <NavLink page="stats" className="navbar-item">
              <img
                src={Logo}
                alt="Synthetix"
                className="image"
                style={{ width: '200px', maxWidth: '200px' }}
              />
            </NavLink>
          </div>

          <div className="navbar-menu">
            <div className="navbar-start">
              <NavLink page="stats" className="navbar-item">
                Home
              </NavLink>
              {isUserAuthenticated ? (
                <NavLink page="registration" className="navbar-item">
                  Registration
                </NavLink>
              ) : null}
              {isUserAuthenticated ? (
                <NavLink page="refresh-api-key" className="navbar-item">
                  Refresh Api Key
                </NavLink>
              ) : null}
              {isAdminAuthenticated ? (
                <NavLink page="admin" className="navbar-item">
                  Admin
                </NavLink>
              ) : null}
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
              <NavLink page="stats" className="navbar-item">
                Home
              </NavLink>
              {isUserAuthenticated ? (
                <NavLink page="registration" className="navbar-item">
                  Registration
                </NavLink>
              ) : null}
              {isUserAuthenticated ? (
                <NavLink page="refresh-api-key" className="navbar-item">
                  Refresh Api Key
                </NavLink>
              ) : null}
              {isAdminAuthenticated ? (
                <NavLink page="admin" className="navbar-item">
                  Admin
                </NavLink>
              ) : null}
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
}
