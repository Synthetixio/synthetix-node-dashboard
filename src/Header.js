import {useMutation} from '@tanstack/react-query';
import {Link} from 'react-router';
import Logo from '../logo.svg';
import usePermissions from './usePermissions';
import {useSynthetix} from './useSynthetix';
import {getApiUrl, saveToken} from './utils';

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
  console.log('permissions', permissions.data);

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
            <Link to="/" className="navbar-item">
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
              <Link to="/" className="navbar-item">
                Home
              </Link>
              <Link to="/registration" className="navbar-item">
                Registration
              </Link>
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
                      className="button is-small is-light"
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
              <Link to="/" className="navbar-item">
                Home
              </Link>
              <Link to="/registration" className="navbar-item">
                Registration
              </Link>
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
}
