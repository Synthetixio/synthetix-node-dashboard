import { useQuery } from '@tanstack/react-query';
import { flag } from 'country-emoji';
import { useFetch } from './useFetch';
import { getApiUrl, humanReadableDuration, humanReadableNumber, humanReadableSize } from './utils';

function formatVersion(fullVersion) {
  const [version] = fullVersion.split('+');
  return version;
}

const useFetchApi = () => {
  const { fetch, chainId } = useFetch();

  return useQuery({
    enabled: Boolean(fetch),
    queryKey: [chainId, 'useFetchApi'],
    queryFn: async () => {
      const response = await fetch('/api/stats', {
        method: 'GET',
      });
      if (!response.ok) {
        throw new Error(`Request error: ${response.status}`);
      }
      return await response.json();
    },
    refetchInterval: 5_000,
  });
};

export function GlobalStats() {
  const { data, isPending, error } = useFetchApi();
  return (
    <div className="columns">
      <div className="column is-8 is-offset-2">
        <div className="content">
          {isPending && <p>Loading data...</p>}

          {error && (
            <p style={{ color: 'red' }}>An error occurred: {error.message || 'Unknown error'}</p>
          )}

          {data ? (
            <>
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
            </>
          ) : null}

          <h4 className="title is-4 has-text-centered">
            {data?.peers.length === 1 ? '1 Node' : `${data?.peers.length} Nodes`}
          </h4>
          <table>
            <thead>
              <tr>
                <th>&nbsp;</th>
                <th>ID</th>
                <th className="has-text-right">Uptime (d)</th>
                <th className="has-text-right">Uptime (m)</th>
                <th className="has-text-right">Version</th>
              </tr>
            </thead>
            <tbody>
              {data?.peers?.map((peer) => (
                <tr key={peer.id}>
                  <td>{flag(peer.country)}</td>
                  <td>{peer.peerId}</td>
                  <td className="has-text-right">
                    {Math.floor(data?.peerUptime?.[peer.peerId]?.daily * 100)}%
                  </td>
                  <td className="has-text-right">
                    {Math.floor(data?.peerUptime?.[peer.peerId]?.monthly * 100)}%
                  </td>
                  <td className="has-text-right">{formatVersion(peer.version)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
