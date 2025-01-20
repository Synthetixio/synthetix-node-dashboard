import React from 'react';
import { GlobalStats } from './GlobalStats';
import { HeliaProvider } from './HeliaProvider';
import { RootLayout } from './RootLayout';
import { safeImport } from './safeImport';
import { usePermissions } from './usePermissions';
import { useParams } from './useRoutes';
import { useSynthetix } from './useSynthetix';

const Registration = React.lazy(() =>
  safeImport(() =>
    import(/* webpackChunkName: "registration" */ './Registration').then((m) => ({
      default: m.Registration,
    }))
  )
);

const RefreshApiKey = React.lazy(() =>
  safeImport(() =>
    import(/* webpackChunkName: "refresh-api-key" */ './RefreshApiKey').then((m) => ({
      default: m.RefreshApiKey,
    }))
  )
);

const Namespace = React.lazy(() =>
  safeImport(() =>
    import(/* webpackChunkName: "namespace" */ './Namespace').then((m) => ({
      default: m.Namespace,
    }))
  )
);

const Upload = React.lazy(() =>
  safeImport(() =>
    import(/* webpackChunkName: "upload" */ './Upload').then((m) => ({
      default: m.Upload,
    }))
  )
);

const Admin = React.lazy(() =>
  safeImport(() =>
    import(/* webpackChunkName: "admin" */ './Admin').then((m) => ({
      default: m.Admin,
    }))
  )
);

const ProtectedRoute = ({ isAllowed, goTo, redirectPath = 'stats', children }) => {
  React.useEffect(() => {
    if (!isAllowed) {
      goTo({ page: redirectPath });
    }
  }, [isAllowed, goTo, redirectPath]);

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
              <HeliaProvider>
                <Upload />
              </HeliaProvider>
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
