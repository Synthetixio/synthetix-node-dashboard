import { CarWriter } from '@ipld/car/writer';
import { useQuery } from '@tanstack/react-query';
import React, { useCallback, useEffect, useState } from 'react';
import CollapsibleSection from './CollapsibleSection';
import { KeyRemovalConfirmationModal } from './KeyRemovalConfirmationModal';
import { useDagGet } from './useDagGet';
import { useDagImport } from './useDagImport';
import { useHelia } from './useHelia';
import { useKeyRemove } from './useKeyRemove';
import { useNamePublish } from './useNamePublish';
import { useParams } from './useRoutes';
import { carWriterOutToBlob, downloadCarFile, readFileAsUint8Array } from './utils';

export function Project() {
  const { heliaCar, fs } = useHelia();
  const [params, setParams] = useParams();
  const [files, setFiles] = useState([]);
  const [carBlob, setCarBlob] = useState(null);
  const [rootCID, setRootCID] = useState(null);
  const [dagImportResponse, setDagImportResponse] = useState(null);
  const [dagData, setDagData] = useState(null);
  const [fileUploadError, setFileUploadError] = useState(null);

  const handleFolderUpload = useCallback((e) => {
    const filesToUpload = [...e.target.files];

    if (filesToUpload.length === 0) {
      return;
    }

    const hasIndexHtml = filesToUpload.some((file) => file.name === 'index.html');

    if (!hasIndexHtml) {
      setFileUploadError('Error: The index.html file is required for upload!');
      return;
    }

    setFileUploadError(null);
    setFiles(filesToUpload);
  }, []);

  const kuboIpfsDagImportMutation = useDagImport();
  const dagGetMutation = useDagGet();
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
      setDagImportResponse(null);
      setDagData(null);
    }
  }, [carBlobFolderQuery.data]);

  useEffect(() => {
    if (rootCID && carBlob && !dagImportResponse) {
      const formData = new FormData();
      formData.append('file', carBlob);

      kuboIpfsDagImportMutation.mutate(formData, {
        onSuccess: setDagImportResponse,
      });
    }
  }, [rootCID, carBlob, dagImportResponse, kuboIpfsDagImportMutation.mutate]);

  const namePublishMutation = useNamePublish();
  const [namePublishResponse, setNamePublishResponse] = React.useState(null);

  const publishIpnsName = () => {
    namePublishMutation.mutate(
      { keyName: params.name, rootCID },
      {
        onSuccess: setNamePublishResponse,
      }
    );
  };

  const keyRemoveMutation = useKeyRemove();
  const handleKeyRemoval = () => {
    keyRemoveMutation.mutate(params.name, {
      onSuccess: () => {
        setIsModalOpen(false);
        setParams({ page: 'projects' });
      },
    });
  };
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <div className="is-flex is-justify-content-space-between is-align-items-center mb-4">
        <div>
          <p className="mt-4">
            <strong>Upload the folder</strong> with your app build (e.g., <code>dist</code>).
          </p>
          <div className="file mt-4">
            <label className="file-label">
              <input
                className="file-input"
                type="file"
                webkitdirectory="true"
                multiple
                onChange={handleFolderUpload}
              />
              <span className="file-cta">
                <span className="file-label">Choose a folder…</span>
              </span>
            </label>
          </div>
        </div>
        <button
          type="button"
          className="button is-small"
          disabled={!params.name}
          onClick={() => setIsModalOpen(true)}
        >
          Remove Project
        </button>
      </div>

      <KeyRemovalConfirmationModal
        isOpen={isModalOpen}
        onConfirm={handleKeyRemoval}
        onCancel={() => setIsModalOpen(false)}
        isLoading={keyRemoveMutation.isPending}
        name={params.name}
      />

      {fileUploadError && <p className="has-text-danger">{fileUploadError}</p>}

      {rootCID == null || files.length === 0 ? null : (
        <>
          {kuboIpfsDagImportMutation.isPending ? (
            <p>Uploading directory as a CAR file to IPFS..</p>
          ) : (
            <>
              {kuboIpfsDagImportMutation.isError ? (
                <p className="has-text-danger">{kuboIpfsDagImportMutation.error?.message}</p>
              ) : null}

              {kuboIpfsDagImportMutation.isSuccess ? <p>Successfully uploaded to IPFS</p> : null}
            </>
          )}

          {dagImportResponse?.Root.Cid['/'] ? (
            <div className="my-4">
              <div className="mb-4">
                <p>
                  <strong>IPFS Hash:</strong> <code>{dagImportResponse?.Root.Cid['/']}</code>
                </p>
                <span>
                  Preview on&nbsp;
                  <a
                    href={`http://127.0.0.1:8080/ipfs/${dagImportResponse?.Root.Cid['/']}/`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    IPFS
                  </a>
                </span>
              </div>
              <button
                type="button"
                className={`button is-small ${namePublishMutation.isPending ? 'is-loading' : ''}`}
                disabled={!params.name}
                onClick={publishIpnsName}
              >
                Publish
              </button>
            </div>
          ) : null}

          {namePublishMutation.isPending ? (
            <p>Publishing your content to IPNS..</p>
          ) : (
            <>
              {namePublishMutation.isError ? (
                <p className="has-text-danger">{namePublishMutation.error?.message}</p>
              ) : null}

              {namePublishMutation.isSuccess ? (
                <p>Your content has been successfully published to IPNS!</p>
              ) : null}
            </>
          )}

          {namePublishResponse ? (
            <div className="is-flex is-gap-3">
              <span>
                Visit&nbsp;
                <a
                  href={`http://127.0.0.1:8080/ipns/${namePublishResponse.Name}/`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  IPNS
                </a>
              </span>
              <span>
                Visit&nbsp;
                <a
                  href={`http://127.0.0.1:8080${namePublishResponse.Value}/`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  IPFS
                </a>
              </span>
            </div>
          ) : null}

          {keyRemoveMutation.isPending ? (
            <p>Removing the selected keypair from the IPNS server..</p>
          ) : (
            <>
              {keyRemoveMutation.isError ? (
                <p className="has-text-danger">
                  An error occurred: {keyRemoveMutation.error?.message}
                </p>
              ) : null}

              {keyRemoveMutation.isSuccess ? (
                <p>The keypair was successfully removed from the IPNS server!</p>
              ) : null}
            </>
          )}
        </>
      )}

      {namePublishResponse ||
      dagImportResponse ||
      dagData ||
      rootCID == null ||
      files.length === 0 ? (
        <div className="mt-6">
          <CollapsibleSection title="Metadata">
            {rootCID == null || files.length === 0 ? null : (
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
                  className={`button is-small ${dagGetMutation.isPending ? 'is-loading' : ''}`}
                  disabled={!dagImportResponse || dagGetMutation.isPending}
                  onClick={() => {
                    dagGetMutation.mutate(dagImportResponse.Root.Cid['/'], {
                      onSuccess: setDagData,
                    });
                  }}
                >
                  Get DAG Object
                </button>
              </div>
            )}
            {namePublishResponse ? (
              <pre className="mt-4 is-size-7 simple-border">
                <p>/api/v0/name/publish</p>
                {JSON.stringify(namePublishResponse, null, 2)}
              </pre>
            ) : null}
            {dagImportResponse ? (
              <pre className="mt-4 is-size-7 simple-border">
                <p>/api/v0/dag/import</p>
                {JSON.stringify(dagImportResponse, null, 2)}
              </pre>
            ) : null}
            {dagData ? (
              <pre className="mt-4 is-size-7 simple-border">
                <p>Dag Data</p>
                {JSON.stringify(dagData, null, 2)}
              </pre>
            ) : null}
          </CollapsibleSection>
        </div>
      ) : null}
    </>
  );
}
