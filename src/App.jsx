import {useMutation, useQuery} from '@tanstack/react-query';
import Logo from '../logo.svg';
import NetworkMismatchBanner from './NetworkMismatchBanner';
import usePermissions from './usePermissions';
import {useSynthetix} from './useSynthetix';

import {getApiUrl, humanReadableDuration, humanReadableNumber, humanReadableSize, saveToken,} from './utils';

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

const useFetchApi = () => {
  return useQuery({
    queryKey: ['apiData'],
    queryFn: async () => {
      const response = await fetch('http://127.0.0.1:3002/api');
      if (!response.ok) {
        throw new Error(`Request error: ${response.status}`);
      }
      return await response.json();
    },
    refetchInterval: 5_000,
  });
};

export function App() {
  const [synthetix, updateSynthetix] = useSynthetix();
  const { walletAddress, token, logout, connect, signer } = synthetix;
  const permissions = usePermissions();
  console.log('permissions', permissions.data);
  const { data, isPending, error } = useFetchApi();

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
    <>
      <NetworkMismatchBanner />
      <header>
        <nav className="navbar" aria-label="main navigation">
          <div className="container is-max-desktop">
            <div className="navbar-brand">
              <a className="navbar-item" href="/">
                <img
                  src={Logo}
                  alt="Synthetix"
                  className="image"
                  style={{ width: '200px', maxWidth: '200px' }}
                />
              </a>
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
          </div>
        </nav>
      </header>

      <section className="main p-5">
        <div className="container is-max-desktop">
          <div className="columns is-centered">
            <div className="column">
              {isPending && <div>Loading data...</div>}

              {error && (
                <div style={{ color: 'red' }}>
                  An error occurred: {error.message || 'Unknown error'}
                </div>
              )}

              {data ? (
                <div className="content">
                  <h4 className="title is-4 has-text-centered">Stats</h4>
                  <table>
                    <tbody>
                      <tr>
                        <td>Uptime</td>
                        <td>{humanReadableDuration(data.uptime)}</td>
                      </tr>
                      <tr>
                        <td>Objects stored</td>
                        <td>{humanReadableNumber(data.numObjects)}</td>
                      </tr>
                      <tr>
                        <td>Total size</td>
                        <td>{humanReadableSize(data.repoSize)}</td>
                      </tr>
                      <tr>
                        <td>Total in</td>
                        <td>{humanReadableSize(data.totalIn)}</td>
                      </tr>
                      <tr>
                        <td>Total out</td>
                        <td>{humanReadableSize(data.totalOut)}</td>
                      </tr>
                      <tr>
                        <td>Daily in</td>
                        <td>{humanReadableSize(data.dailyIn)} / day</td>
                      </tr>
                      <tr>
                        <td>Daily out</td>
                        <td>{humanReadableSize(data.dailyOut)} / day</td>
                      </tr>
                      <tr>
                        <td>Hourly in</td>
                        <td>{humanReadableSize(data.hourlyIn)} / hour</td>
                      </tr>
                      <tr>
                        <td>Hourly out</td>
                        <td>{humanReadableSize(data.hourlyOut)} / hour</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              ) : null}

              <div className="content">
                <h4 className="title is-4 has-text-centered">
                  {data?.peers.length === 1 ? '1 Node' : `${data?.peers.length} Nodes`}
                </h4>
                <table>
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Version</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data?.peers?.map((peer) => (
                      <tr key={peer.id}>
                        <td>{peer.id}</td>
                        <td>{peer.version}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
