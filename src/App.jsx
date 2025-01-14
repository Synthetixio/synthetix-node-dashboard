import React from 'react';
import {GlobalStats} from './GlobalStats';
import {RootLayout} from './RootLayout';
import {safeImport} from './safeImport';
import {usePermissions} from './usePermissions';
import {usePageRoute} from './useRoutes';
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

const Admin = React.lazy(() =>
  safeImport(() =>
    import(/* webpackChunkName: "news-add" */ './Admin').then((m) => ({
      default: m.Admin,
    }))
  )
);

const ProtectedRoute = ({ isAllowed, goTo, redirectPath = 'stats', children }) => {
  if (!isAllowed) {
    goTo(redirectPath);
    return;
  }
  return children;
};

function Routes() {
  const [synthetix] = useSynthetix();
  const permissions = usePermissions();
  const [page, setPage] = usePageRoute();
  const { walletAddress, token } = synthetix;
  const isUserAuthenticated = walletAddress && token;
  const isAdminAuthenticated = isUserAuthenticated && permissions.data?.isAdmin;

  function renderRoute() {
    switch (true) {
      case page === 'registration':
        return (
          <ProtectedRoute isAllowed={isUserAuthenticated} goTo={setPage}>
            <React.Suspense fallback={null}>
              <Registration />
            </React.Suspense>
          </ProtectedRoute>
        );
      case page === 'refresh-api-key':
        return (
          <ProtectedRoute isAllowed={isUserAuthenticated} goTo={setPage}>
            <React.Suspense fallback={null}>
              <RefreshApiKey />
            </React.Suspense>
          </ProtectedRoute>
        );
      case page === 'admin':
        return (
          <ProtectedRoute isAllowed={isAdminAuthenticated} goTo={setPage}>
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
