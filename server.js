const http = require('node:http');
const fs = require('node:fs');
const cp = require('node:child_process');

const API_ENDPOINT = `http://127.0.0.1:${process.env.IPFS_API_PORT ?? 5001}/api/v0`;

const indexHtml = fs.readFileSync('./index.html', 'utf-8');
const files = {
  'index.html': indexHtml,
  'favicon.ico': fs.readFileSync('public/favicon.ico'),
  'logo.svg': fs.readFileSync('./logo.svg'),
  // 'main.js': fs.readFileSync('./main.js', 'utf-8'),
  // 'main.css': fs.readFileSync('./main.css', 'utf-8'),
};

const state = {
  peers: [],
  uptime: 0,
  numObjects: 0,
  repoSize: 0,
  totalIn: 0,
  totalOut: 0,
  dailyIn: 0,
  hourlyIn: 0,
  dailyOut: 0,
  hourlyOut: 0,
};

function render() {
  const updatedIndexHtml = indexHtml.replace('___STATE___', JSON.stringify(state, null, 2));
  files['index.html'] = updatedIndexHtml;
  return updatedIndexHtml;
}

const server = http.createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');

  switch (true) {
    case req.url.endsWith('/api'): {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(state, null, 2), 'utf-8');
      return;
    }

    case req.url.endsWith('/logo.svg'): {
      res.writeHead(200, { 'Content-Type': 'image/svg+xml' });
      res.end(files['logo.svg']);
      return;
    }

    case req.url.endsWith('/favicon.ico'): {
      res.writeHead(200, { 'Content-Type': 'image/x-icon' });
      res.end(files['favicon.ico']);
      return;
    }

    // case req.url.endsWith('/main.js'): {
    //   res.writeHead(200, { 'Content-Type': 'text/javascript' });
    //   res.end(files['main.js']);
    //   return;
    // }

    // case req.url.endsWith('/main.css'): {
    //   res.writeHead(200, { 'Content-Type': 'text/css' });
    //   res.end(files['main.css']);
    //   return;
    // }

    case req.url.endsWith('/'): {
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(files['index.html']);
      return;
    }
  }

  if (req.url in files) {
    const file = files[req.url];
    res.writeHead(200, { 'Content-Type': file.contentType });
    res.end(file.content, 'utf-8');
    return;
  }
  res.writeHead(404, { 'Content-Type': 'text/html' });
  res.end('Not Found', 'utf-8');
  return;
});

async function updateStats() {
  try {
    const { RepoSize: repoSize, NumObjects: numObjects } = await (
      await fetch(`${API_ENDPOINT}/repo/stat`, { method: 'POST' })
    ).json();
    Object.assign(state, { repoSize, numObjects });
  } catch (e) {
    console.error(e);
  }

  try {
    const { TotalIn: totalIn, TotalOut: totalOut } = await (
      await fetch(`${API_ENDPOINT}/stats/bw`, { method: 'POST' })
    ).json();
    Object.assign(state, { totalIn, totalOut });
  } catch (e) {
    console.error(e);
  }

  const [pid] = await new Promise((resolve) =>
    cp.exec('pgrep -f "ipfs daemon"', (err, stdout, stderr) => {
      if (err) {
        console.error(err);
        return resolve(null);
      }
      if (stderr) {
        console.error(new Error(stderr));
        return resolve(null);
      }
      return resolve(
        stdout
          .split('\n')
          .map((s) => s.trim())
          .filter(Boolean)
      );
    })
  );
  if (!pid) {
    return;
  }

  const uptime = await new Promise((resolve) =>
    cp.exec(`ps -p ${pid} -o lstart=`, (err, stdout, stderr) => {
      if (err) {
        console.error(err);
        return resolve(null);
      }
      if (stderr) {
        console.error(new Error(stderr));
        return resolve(null);
      }
      const startDate = new Date(stdout);
      const uptimeInSeconds = Math.floor((Date.now() - startDate.getTime()) / 1000);
      return resolve(uptimeInSeconds);
    })
  );
  if (!uptime) {
    return;
  }
  Object.assign(state, { uptime });

  const uptimeHours = uptime / (60 * 60);
  const uptimeDays = uptimeHours / 24;
  const dailyIn = state.totalIn / uptimeDays;
  const hourlyIn = state.totalIn / uptimeHours;
  const dailyOut = state.totalOut / uptimeDays;
  const hourlyOut = state.totalOut / uptimeHours;
  Object.assign(state, { dailyIn, hourlyIn, dailyOut, hourlyOut });
  console.log(state);
  render();
}

async function updatePeers() {
  const peers = await new Promise((resolve) =>
    cp.exec("ipfs-cluster-ctl --enc=json peers ls | jq '[inputs]'", (err, stdout, stderr) => {
      if (err) {
        console.error(err);
        return resolve([]);
      }
      if (stderr) {
        console.error(new Error(stderr));
        return resolve([]);
      }
      try {
        const result = JSON.parse(stdout);
        return resolve(
          result
            .map(({ id, version }) => ({ id, version }))
            .sort((a, b) => a.id.localeCompare(b.id))
        );
      } catch (_e) {
        return resolve([]);
      }
    })
  );
  Object.assign(state, { peers });
  render();
}
setInterval(updatePeers, 60_000);
setInterval(updateStats, 60_000);
Promise.all([updatePeers(), updateStats()]).then(() =>
  server.listen(3002, '0.0.0.0', () => console.log('Server running at http://0.0.0.0:3002/'))
);

if (process.env.NODE_ENV !== 'production') {
  fs.watch('.', (_, filename) => {
    if (filename in files) {
      fs.readFile(filename, 'utf-8', (err, content) => {
        if (!err && content) {
          Object.assign(files, { [filename]: content });
        }
      });
      return;
    }
  });
}
