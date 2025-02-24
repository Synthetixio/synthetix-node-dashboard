import { CarWriter } from '@ipld/car/writer';
import { useQuery } from '@tanstack/react-query';
import React, { useCallback, useEffect, useState } from 'react';
import CollapsibleSection from './CollapsibleSection';
import { KeyRemovalConfirmationModal } from './KeyRemovalConfirmationModal';
import { ProgressTracker } from './ProgressTracker';
import { useDagGet } from './useDagGet';
import { useDagImport } from './useDagImport';
import { useHelia } from './useHelia';
import { useKeyRemove } from './useKeyRemove';
import { useNamePublish } from './useNamePublish';
import { useParams } from './useRoutes';
import { carWriterOutToBlob, downloadCarFile, readFileAsUint8Array } from './utils';
import { getApiUrl } from './utils';

export function Project() {
  const { heliaCar, fs } = useHelia();
  const [params, setParams] = useParams();
  const [files, setFiles] = useState([]);
  const [carBlob, setCarBlob] = useState(null);
  const [rootCID, setRootCID] = useState(null);
  const [fileUploadError, setFileUploadError] = useState(null);

  const handleFolderUpload = useCallback((e) => {
    const filesToUpload = [...e.target.files];

    if (filesToUpload.length === 0) {
      return;
    }

    if (!filesToUpload.some((file) => file.name === 'index.html')) {
      setFileUploadError('Error: The index.html file is required for upload!');
      return;
    }

    setFileUploadError(null);
    setFiles(filesToUpload);
  }, []);

  const dagImportMutation = useDagImport();
  const dagGetMutation = useDagGet();
  const namePublishMutation = useNamePublish();
  const keyRemoveMutation = useKeyRemove();

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
      dagGetMutation.reset();
    } else {
      setCarBlob(null);
      setRootCID(null);
    }
  }, [carBlobFolderQuery.data, dagGetMutation.reset]);

  useEffect(() => {
    if (rootCID && carBlob) {
      const formData = new FormData();
      formData.append('file', carBlob);

      dagImportMutation.mutate({ formData, key: params.name });
    }
  }, [rootCID, carBlob, params.name, dagImportMutation.mutate]);

  const handleKeyRemoval = () => {
    keyRemoveMutation.mutate(params.name, {
      onSuccess: () => {
        setIsModalOpen(false);
        setParams({ page: 'projects' });
      },
    });
  };
  const [isModalOpen, setIsModalOpen] = useState(false);

  const progress = [
    {
      id: 'car_process',
      text: 'Processing CAR file with Helia...',
      status: carBlobFolderQuery.status,
      errorMessage: carBlobFolderQuery.error?.message || 'Unknown error occurred.',
      response: carBlobFolderQuery.isSuccess ? carBlobFolderQuery.data : null,
      requestUrl: null,
      kuboCli: null,
    },
    {
      id: 'dag_import',
      text: 'Importing DAG from CAR file...',
      status: dagImportMutation.status,
      errorMessage: dagImportMutation.error?.message || 'Unknown error occurred.',
      response: dagImportMutation.isSuccess ? dagImportMutation.data : null,
      requestUrl: `${getApiUrl()}api/v0/dag/import?pin-roots=true`,
      kuboCli: 'ipfs dag import --pin-roots=true <path_to_car_file>',
    },
    {
      id: 'name_publish',
      text: 'Publishing IPNS name...',
      status: namePublishMutation.status,
      errorMessage: namePublishMutation.error?.message || 'Unknown error occurred.',
      response: namePublishMutation.isSuccess ? namePublishMutation.data : null,
      requestUrl: `${getApiUrl()}api/v0/name/publish?key=${params.name}&arg=/ipfs/${rootCID}&ttl=10s`,
      kuboCli: `ipfs name publish --key=${params.name} --ttl=10s /ipfs/${rootCID}`,
    },
  ];

  const dagInteraction = [
    {
      id: 'dag_get',
      text: 'Fetching DAG node from IPFS...',
      status: dagGetMutation.status,
      errorMessage: dagGetMutation.error?.message || 'Unknown error occurred.',
      response: dagGetMutation.isSuccess ? dagGetMutation.data : null,
      requestUrl: `${getApiUrl()}api/v0/dag/get?arg=${rootCID}`,
      kuboCli: `ipfs dag get ${rootCID}`,
    },
  ];

  const removeProjectProgress = [
    {
      id: 'key_remove',
      text: 'Removing IPNS key...',
      status: keyRemoveMutation.status,
      errorMessage: keyRemoveMutation.error?.message || 'Unknown error occurred.',
      response: keyRemoveMutation.isSuccess ? keyRemoveMutation.data : null,
      requestUrl: `${getApiUrl()}api/v0/key/rm?arg=${params.name}`,
      kuboCli: `ipfs key rm ${params.name}`,
    },
  ];

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
          {dagImportMutation.data?.Root.Cid['/'] ? (
            <div className="my-4">
              <div className="mb-4">
                <p>
                  <strong>IPFS Hash:</strong> <code>{dagImportMutation.data?.Root.Cid['/']}</code>
                </p>
                <span>
                  Preview on&nbsp;
                  <a
                    href={`http://127.0.0.1:8080/ipfs/${dagImportMutation.data?.Root.Cid['/']}/`}
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
                onClick={() => {
                  namePublishMutation.mutate({ keyName: params.name, rootCID });
                }}
              >
                Publish
              </button>
            </div>
          ) : null}

          {namePublishMutation.data ? (
            <div className="is-flex is-gap-3">
              <span>
                Visit&nbsp;
                <a
                  href={`http://127.0.0.1:8080/ipns/${namePublishMutation.data.Name}/`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  IPNS
                </a>
              </span>
              <span>
                Visit&nbsp;
                <a
                  href={`http://127.0.0.1:8080${namePublishMutation.data.Value}/`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  IPFS
                </a>
              </span>
            </div>
          ) : null}
        </>
      )}

      {dagImportMutation.status !== 'idle' || namePublishMutation.status !== 'idle' ? (
        <div className="mt-6">
          <CollapsibleSection title="Details">
            <ProgressTracker progress={progress} />
          </CollapsibleSection>
        </div>
      ) : null}

      {rootCID == null || files.length === 0 ? null : (
        <div className="mt-6">
          <CollapsibleSection title="Dag Interaction">
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
                disabled={!dagImportMutation.data || dagGetMutation.isPending}
                onClick={() => {
                  dagGetMutation.mutate(dagImportMutation.data?.Root.Cid['/']);
                }}
              >
                Get DAG Object
              </button>
            </div>
            <ProgressTracker progress={dagInteraction} />
          </CollapsibleSection>
        </div>
      )}

      {keyRemoveMutation.status !== 'idle' ? (
        <div className="mt-6">
          <CollapsibleSection title="Remove Project Details">
            <ProgressTracker progress={removeProjectProgress} />
          </CollapsibleSection>
        </div>
      ) : null}
    </>
  );
}
