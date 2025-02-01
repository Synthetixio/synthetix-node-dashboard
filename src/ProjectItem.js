import { Link } from 'react-router-dom';
import { makeSearch } from './useRoutes';
import { useScreenshot } from './useScreenshot';

export function ProjectItem({ name, ipfs, ipns, setParams, published }) {
  const screenshot = useScreenshot({ siteUrl: `http://127.0.0.1:8080/ipns/${ipns}/`, published });

  return (
    <section className="hero">
      <div className="hero-body columns is-12 box p-5">
        <div className="column is-two-fifths p-0">
          <figure className="image is-16by9">
            <img
              src={
                screenshot.data?.image || 'https://bulma.io/assets/images/placeholders/1280x960.png'
              }
              alt={name || 'Project screenshot'}
            />
          </figure>
        </div>

        <div className="column p-0 ml-5">
          <div className="is-flex is-flex-direction-column is-gap-3">
            <dl>
              <dt>Name</dt>
              <dd>
                {name ? (
                  <Link
                    to={`?${makeSearch({ page: 'project', name })}`}
                    onClick={() => setParams({ page: 'project', name })}
                    className="project-name"
                  >
                    {name}
                  </Link>
                ) : (
                  'Unnamed project'
                )}
              </dd>
            </dl>
            <dl>
              <dt>{published ? 'Visit' : 'Status'} </dt>
              <dd>
                {published ? (
                  <div className="is-flex is-gap-3">
                    <a
                      href={`http://127.0.0.1:8080${ipfs}/`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      IPFS
                    </a>
                    <a
                      href={`http://127.0.0.1:8080/ipns/${ipns}/`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      IPNS
                    </a>
                  </div>
                ) : (
                  <p>Not published</p>
                )}
              </dd>
            </dl>
          </div>
        </div>
      </div>
    </section>
  );
}
