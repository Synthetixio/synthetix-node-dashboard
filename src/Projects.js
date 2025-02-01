import { Link } from 'react-router-dom';
import { ProjectItem } from './ProjectItem';
import { useGeneratedKeys } from './useGeneratedKeys';
import { makeSearch, useParams } from './useRoutes';

export function Projects() {
  const generatedKeys = useGeneratedKeys();
  const [, setParams] = useParams();

  return (
    <>
      <div className="is-flex is-justify-content-space-between is-align-items-center mb-4">
        <h4 className="title is-4 m-0">Projects</h4>
        <Link
          to={`?${makeSearch({ page: 'add-project' })}`}
          onClick={() => setParams({ page: 'add-project' })}
          className="button is-small"
        >
          Add Project
        </Link>
      </div>

      {generatedKeys.isPending ? (
        <p>Loading...</p>
      ) : generatedKeys.isError ? (
        <p className="help is-danger">
          An error occurred: {generatedKeys.error?.message || 'Unknown error occurred.'}
        </p>
      ) : (
        <>
          {generatedKeys.data.keys.length === 0 ? (
            <p>No generatedKeys found.</p>
          ) : (
            <ul className="projects-list mt-6">
              {generatedKeys.data.keys.map(({ key, id, ipfs, published }) => {
                return (
                  <li key={key}>
                    <ProjectItem
                      name={key}
                      ipfs={ipfs || '/ipfs/unknown'}
                      ipns={id}
                      setParams={setParams}
                      published={published}
                    />
                  </li>
                );
              })}
            </ul>
          )}
        </>
      )}
    </>
  );
}
