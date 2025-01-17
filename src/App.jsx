import React from 'react';
import {GlobalStats} from './GlobalStats';
import {RootLayout} from './RootLayout';
import {safeImport} from './safeImport';
import {usePermissions} from './usePermissions';
import {useParams} from './useRoutes';
import {useSynthetix} from './useSynthetix';

const Registration = React.lazy(() =>
  safeImport(() =>
    import(/* webpackChunkName: "news-add" */ './Registration').then((m) => ({
      default: m.Registration,
    }))
  )
);

const RefreshApiKey = React.lazy(() =>
  safeImport(() =>
    import(/* webpackChunkName: "news-add" */ './RefreshApiKey').then((m) => ({
      default: m.RefreshApiKey,
    }))
  )
);

const Namespace = React.lazy(() =>
  safeImport(() =>
    import(/* webpackChunkName: "news-add" */ './Namespace').then((m) => ({
      default: m.Namespace,
    }))
  )
);

const Upload = React.lazy(() =>
  safeImport(() =>
    import(/* webpackChunkName: "news-add" */ './Upload').then((m) => ({
      default: m.Upload,
    }))
  )
);

const Admin = React.lazy(() =>
  safeImport(() =>
    import(/* webpackChunkName: "news-add" */ './Admin').then((m) => ({
      default: m.Admin,
    }))
  )
);

const ProtectedRoute = ({ isAllowed, goTo, redirectPath = 'stats', children }) => {
  if (!isAllowed) {
    goTo({ page: redirectPath });
    return;
  }
  return children;
};

function Routes() {
  const [synthetix] = useSynthetix();
  const permissions = usePermissions();
  const [params, setParams] = useParams();
  const { walletAddress, token } = synthetix;
  const isUserAuthenticated = walletAddress && token;
  const isAdminAuthenticated = isUserAuthenticated && permissions.data?.isAdmin;

  function renderRoute() {
    switch (true) {
      case params.page === 'registration':
        return (
          <ProtectedRoute isAllowed={isUserAuthenticated} goTo={setParams}>
            <React.Suspense fallback={null}>
              <Registration />
            </React.Suspense>
          </ProtectedRoute>
        );
      case params.page === 'refresh-api-key':
        return (
          <ProtectedRoute isAllowed={isUserAuthenticated} goTo={setParams}>
            <React.Suspense fallback={null}>
              <RefreshApiKey />
            </React.Suspense>
          </ProtectedRoute>
        );
      case params.page === 'namespace':
        return (
          <ProtectedRoute isAllowed={isUserAuthenticated} goTo={setParams}>
            <React.Suspense fallback={null}>
              <Namespace />
            </React.Suspense>
          </ProtectedRoute>
        );
      case params.page === 'upload':
        return (
          <ProtectedRoute isAllowed={isUserAuthenticated} goTo={setParams}>
            <React.Suspense fallback={null}>
              <Upload />
            </React.Suspense>
          </ProtectedRoute>
        );
      case params.page === 'admin':
        return (
          <ProtectedRoute isAllowed={isAdminAuthenticated} goTo={setParams}>
            <React.Suspense fallback={null}>
              <Admin />
            </React.Suspense>
          </ProtectedRoute>
        );
      default:
        return <GlobalStats />;
    }
  }

  return <RootLayout>{renderRoute()}</RootLayout>;
}

export function App() {
  return <Routes />;
}
