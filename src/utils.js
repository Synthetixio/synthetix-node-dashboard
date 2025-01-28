export function humanReadableNumber(num) {
  if (Math.abs(num) >= 1_000_000_000) {
    return `${Math.sign(num) * (Math.abs(num) / 1_000_000_000).toFixed(2)} B`;
  }
  if (Math.abs(num) >= 1_000_000) {
    return `${Math.sign(num) * (Math.abs(num) / 1_000_000).toFixed(2)} M`;
  }
  if (Math.abs(num) >= 1_000) {
    return `${Math.sign(num) * (Math.abs(num) / 1_000).toFixed(2)} K`;
  }
  return Math.sign(num) * Math.abs(num);
}

export function humanReadableSize(bytes) {
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  if (!bytes) {
    return '0 Bytes';
  }
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / 1024 ** i).toFixed(2)} ${sizes[i]}`;
}

export function humanReadableDuration(seconds) {
  let remainingSeconds = seconds;
  const days = Math.floor(remainingSeconds / (24 * 60 * 60));
  remainingSeconds -= days * 24 * 60 * 60;
  const hrs = Math.floor(remainingSeconds / 3600);
  remainingSeconds -= hrs * 3600;
  const mnts = Math.floor(remainingSeconds / 60);
  remainingSeconds -= mnts * 60;

  if (days > 0) {
    return `${days} days, ${hrs} hours, ${mnts} minutes, and ${remainingSeconds} seconds`;
  }
  if (hrs > 0) {
    return `${hrs} hours, ${mnts} minutes, and ${remainingSeconds} seconds`;
  }
  if (mnts > 0) {
    return `${mnts} minutes, and ${remainingSeconds} seconds`;
  }
  return `${remainingSeconds} seconds`;
}

export function getApiUrl() {
  return window.localStorage.getItem('API_URL') ?? process.env.API_URL;
}

export function restoreToken({ walletAddress }) {
  try {
    const tokens = window.localStorage.getItem('tokens')
      ? JSON.parse(window.localStorage.getItem('tokens'))
      : {};
    return tokens[walletAddress];
  } catch (e) {
    console.error('Restore token error:', e);
    return undefined;
  }
}

export function saveToken({ walletAddress, token }) {
  try {
    const tokens = window.localStorage.getItem('tokens')
      ? JSON.parse(window.localStorage.getItem('tokens'))
      : {};
    tokens[walletAddress] = token;
    window.localStorage.setItem('tokens', JSON.stringify(tokens));
  } catch (e) {
    console.error('Error saving token:', e);
  }
}

export function downloadFile(data, filename = 'file') {
  const blob = new Blob([data], { type: 'application/octet-stream' });
  const downloadUrl = URL.createObjectURL(blob);
  const a = document.createElement('a');

  a.style.display = 'none';
  a.href = downloadUrl;
  a.download = filename;

  document.body.appendChild(a);
  a.click();

  document.body.removeChild(a);
  URL.revokeObjectURL(downloadUrl);
}

export async function readFileAsUint8Array(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      const arrayBuffer = reader.result;
      if (arrayBuffer != null) {
        if (typeof arrayBuffer === 'string') {
          const uint8Array = new TextEncoder().encode(arrayBuffer);
          resolve(uint8Array);
        } else if (arrayBuffer instanceof ArrayBuffer) {
          const uint8Array = new Uint8Array(arrayBuffer);
          resolve(uint8Array);
        }
        return;
      }
      reject(new Error('arrayBuffer is null'));
    };

    reader.onerror = (error) => {
      reject(error);
    };

    reader.readAsArrayBuffer(file);
  });
}

export async function carWriterOutToBlob(carReaderIterable) {
  const parts = [];
  for await (const part of carReaderIterable) {
    parts.push(part);
  }
  return new Blob(parts, { type: 'application/car' });
}

export async function downloadCarFile(carBlob) {
  if (carBlob == null) {
    return;
  }

  const now = new Date();
  const currentDate = now.toISOString().split('T')[0];
  const currentTime = now.toTimeString().split(' ')[0].replace(/:/g, '-');
  const filename = `directory-${currentDate}_${currentTime}.car`;

  const downloadEl = document.createElement('a');
  const blobUrl = window.URL.createObjectURL(carBlob);
  downloadEl.href = blobUrl;
  downloadEl.download = filename;
  document.body.appendChild(downloadEl);
  downloadEl.click();
  window.URL.revokeObjectURL(blobUrl);
}
