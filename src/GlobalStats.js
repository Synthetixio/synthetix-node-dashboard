import {useQuery} from '@tanstack/react-query';
import {humanReadableDuration, humanReadableNumber, humanReadableSize} from './utils';

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
  );
}
