import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { makeSearch } from './useRoutes';
import { useScreenshot } from './useScreenshot';

export function Card({ name, ipfs, ipns, setParams, published }) {
  const screenshot = useScreenshot({ siteUrl: `http://127.0.0.1:8080/ipns/${ipns}/`, published });

  useEffect(() => {
    return () => {
      if (screenshot.data) {
        URL.revokeObjectURL(screenshot.data);
      }
    };
  }, [screenshot.data]);

  return (
    <div className="card">
      <div className="card-image">
        <figure className="image is-4by3">
          <img
            src={screenshot.data || 'https://bulma.io/assets/images/placeholders/1280x960.png'}
            alt={name || 'Project screenshot'}
          />
        </figure>
      </div>
      <div className="card-content">
        <div className="content">
          <Link
            to={`?${makeSearch({ page: 'project', name })}`}
            onClick={() => setParams({ page: 'project', name })}
            className="title is-4 project-name"
          >
            {name}
          </Link>
          {published ? '' : <p style={{ fontSize: '12px' }}>Not published</p>}
        </div>
        <footer className="card-footer">
          <p className="card-footer-item">
            {published ? (
              <span>
                Visit&nbsp;
                <a href={`http://127.0.0.1:8080${ipfs}/`} target="_blank" rel="noopener noreferrer">
                  IPFS
                </a>
              </span>
            ) : (
              <span className="not-published">Visit IPFS</span>
            )}
          </p>
          <p className="card-footer-item">
            {published ? (
              <span>
                Visit&nbsp;
                <a
                  href={`http://127.0.0.1:8080/ipns/${ipns}/`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  IPNS
                </a>
              </span>
            ) : (
              <span className="not-published">Visit IPNS</span>
            )}
          </p>
        </footer>
      </div>
    </div>
  );
}
