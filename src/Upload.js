import { CarWriter } from '@ipld/car/writer';
import { useMutation, useQuery } from '@tanstack/react-query';
import React, { useCallback, useEffect, useState } from 'react';
import { Publish } from './Publish';
import { Update } from './Update';
import { useDeployments } from './useDeployments';
import { useHelia } from './useHelia';
import { carWriterOutToBlob, downloadCarFile, readFileAsUint8Array } from './utils';

export function Upload() {
  const { heliaCar, fs, error, starting } = useHelia();
  const [files, setFiles] = useState([]);
  const [carBlob, setCarBlob] = useState(null);
  const [rootCID, setRootCID] = useState(null);
  const [uploadResponse, setUploadResponse] = useState(null);
  const [dagData, setDagData] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');

  const handleFileEvent = useCallback((e) => {
    const filesToUpload = [...e.target.files];
    const hasIndexHtml = filesToUpload.some((file) => file.name === 'index.html');

    if (!hasIndexHtml) {
      setErrorMessage('Error: The index.html file is required for upload!');
      return;
    }

    setErrorMessage('');
    setFiles(filesToUpload);
  }, []);

  const kuboIpfsDagImportMutation = useMutation({
    mutationFn: async (data) => {
      const response = await fetch('http://127.0.0.1:5001/api/v0/dag/import', {
        method: 'POST',
        body: data,
      });
      if (!response.ok) {
        throw new Error('DAG upload failed');
      }
      return response.json();
    },
    onSuccess: (data) => {
      setUploadResponse(data);
    },
  });

  const kuboIpfsDagGetMutation = useMutation({
    mutationFn: async (rootCID) => {
      const response = await fetch(`http://127.0.0.1:5001/api/v0/dag/get?arg=${rootCID}`, {
        method: 'POST',
      });
      if (!response.ok) {
        throw new Error('DAG fetch failed');
      }
      return response.json();
    },
    onSuccess: (data) => {
      setDagData(data);
    },
  });

  const deployments = useDeployments();

  const carBlobFolderQuery = useQuery({
    enabled: fs !== null && heliaCar !== null && files.length > 0,
    queryKey: [
      'carBlobFolderQuery',
      files.map((file) => `${file.name}_${file.lastModified}`).join(','),
    ],
    queryFn: async () => {
      const inputFiles = await Promise.all(
        files.map(async (file) => ({
          path: file.webkitRelativePath || file.name,
          content: await readFileAsUint8Array(file),
        }))
      );

      let rootCID;
      for await (const entry of fs.addAll(inputFiles)) {
        rootCID = entry.cid;
      }

      const { writer, out } = await CarWriter.create(rootCID);
      const carBlob = carWriterOutToBlob(out);
      await heliaCar.export(rootCID, writer);

      return {
        carBlob: await carBlob,
        rootCID,
      };
    },
  });

  useEffect(() => {
    if (carBlobFolderQuery.data) {
      setCarBlob(carBlobFolderQuery.data.carBlob);
      setRootCID(carBlobFolderQuery.data.rootCID);
    } else {
      setCarBlob(null);
      setRootCID(null);
      setUploadResponse(null);
      setDagData(null);
    }
  }, [carBlobFolderQuery.data]);

  let statusColor = 'is-success';
  if (error) {
    statusColor = 'is-danger';
  } else if (starting) {
    statusColor = 'is-warning';
  }

  return (
    <>
      <span className={`tag ${statusColor}`}>Helia Status</span>
      <p className="mt-4">
        <strong>Upload the folder</strong> with your app build (e.g., <code>dist</code>) with{' '}
        <strong>index.html</strong> required.
      </p>
      <div className="file mt-4">
        <label className="file-label">
          <input
            className="file-input"
            type="file"
            webkitdirectory="true"
            multiple
            onChange={handleFileEvent}
          />
          <span className="file-cta">
            <span className="file-label">Choose a folder…</span>
          </span>
        </label>
      </div>
      {errorMessage && <p className="has-text-danger">{errorMessage}</p>}

      <h4 className="title is-4">Deployments List:</h4>
      {deployments.isPending ? (
        <p>Loading...</p>
      ) : deployments.isError ? (
        <p className="help is-danger">
          An error occurred: {deployments.error?.message || 'Unknown error occurred.'}
        </p>
      ) : (
        <>
          {deployments.data.length === 0 ? (
            <p>No deployments found.</p>
          ) : (
            <>
              <ul>
                {deployments.data.map(({ name, value }) => (
                  <li key={name}>
                    <strong>{name}:</strong> {value}
                  </li>
                ))}
              </ul>
            </>
          )}
        </>
      )}

      {rootCID == null || files.length === 0 ? null : (
        <>
          <div className="mt-4 p-4 simple-border">
            <div className="field">
              <label className="label">Car file CID:</label>
              <input
                className="input is-small"
                type="text"
                placeholder="Example: bafybeideb6ss..."
                value={rootCID.toString()}
                readOnly
              />
            </div>
            <div className="buttons">
              <button
                type="button"
                className={`button is-small ${carBlobFolderQuery.isPending ? 'is-loading' : ''}`}
                disabled={!carBlob}
                onClick={() => downloadCarFile(carBlob)}
              >
                Download Car file
              </button>
              <button
                type="button"
                className={`button is-small ${kuboIpfsDagImportMutation.isPending ? 'is-loading' : ''}`}
                disabled={!carBlob || kuboIpfsDagImportMutation.isPending}
                onClick={() => {
                  if (carBlob) {
                    const formData = new FormData();
                    formData.append('file', carBlob);
                    kuboIpfsDagImportMutation.mutate(formData);
                  }
                }}
              >
                Add directory to IPFS
              </button>
              <button
                type="button"
                className={`button is-small ${kuboIpfsDagGetMutation.isPending ? 'is-loading' : ''}`}
                disabled={!uploadResponse || kuboIpfsDagGetMutation.isPending}
                onClick={() => {
                  kuboIpfsDagGetMutation.mutate(uploadResponse.Root.Cid['/']);
                }}
              >
                Get DAG Object
              </button>
            </div>

            {kuboIpfsDagImportMutation.isPending ? (
              'Importing directory to IPFS..'
            ) : (
              <>
                {kuboIpfsDagImportMutation.isError ? (
                  <p className="has-text-danger">{kuboIpfsDagImportMutation.error?.message}</p>
                ) : null}

                {kuboIpfsDagImportMutation.isSuccess ? <p>Successfully uploaded to IPFS</p> : null}
              </>
            )}
          </div>

          {uploadResponse?.Root.Cid['/'] ? (
            <>
              <Publish rootCID={uploadResponse.Root.Cid['/']} />
              <Update rootCID={uploadResponse.Root.Cid['/']} />
            </>
          ) : null}

          {uploadResponse ? (
            <pre className="mt-4 is-size-7 simple-border">
              {JSON.stringify(uploadResponse, null, 2)}
            </pre>
          ) : null}
          {dagData ? (
            <pre className="mt-4 is-size-7 simple-border">{JSON.stringify(dagData, null, 2)}</pre>
          ) : null}
        </>
      )}
    </>
  );
}
