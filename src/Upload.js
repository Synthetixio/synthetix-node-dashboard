import {CarWriter} from '@ipld/car/writer';
import {useMutation, useQuery} from '@tanstack/react-query';
import React, {useCallback, useEffect, useState} from 'react';
import {useHelia} from './useHelia';
import {carWriterOutToBlob, downloadCarFile, readFileAsUint8Array} from './utils';

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
      const formData = new FormData();
      formData.append('file', data);
      const response = await fetch('http://127.0.0.1:5001/api/v0/dag/import', {
        method: 'POST',
        body: formData,
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

      {rootCID == null || files.length === 0 ? null : (
        <>
          <div className="field my-4">
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
                  kuboIpfsDagImportMutation.mutate(carBlob);
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

              {kuboIpfsDagImportMutation.isSuccess ? <p>Success!</p> : null}
            </>
          )}

          {uploadResponse ? (
            <pre className="mt-4 is-size-7">{JSON.stringify(uploadResponse, null, 2)}</pre>
          ) : null}
          {dagData ? (
            <pre className="mt-4 is-size-7">{JSON.stringify(dagData, null, 2)}</pre>
          ) : null}
        </>
      )}
    </>
  );
}
