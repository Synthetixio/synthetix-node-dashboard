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

const Projects = React.lazy(() =>
  safeImport(() =>
    import(/* webpackChunkName: "projects" */ './Projects').then((m) => ({
      default: m.Projects,
    }))
  )
);

const AddProject = React.lazy(() =>
  safeImport(() =>
    import(/* webpackChunkName: "add-project" */ './AddProject').then((m) => ({
      default: m.AddProject,
    }))
  )
);

const Project = React.lazy(() =>
  safeImport(() =>
    import(/* webpackChunkName: "project" */ './Project').then((m) => ({
      default: m.Project,
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

const Admin = React.lazy(() =>
  safeImport(() =>
    import(/* webpackChunkName: "admin" */ './Admin').then((m) => ({
      default: m.Admin,
    }))
  )
);

const ProtectedRoute = ({ isPending, isAllowed, goTo, redirectPath = 'stats', children }) => {
  React.useEffect(() => {
    if (!isPending && !isAllowed) {
      goTo({ page: redirectPath });
    }
  }, [isPending, isAllowed, goTo, redirectPath]);

  return children;
};

function Routes() {
  const [synthetix] = useSynthetix();
  const permissions = usePermissions();
  const [params, setParams] = useParams();
  const { walletAddress, token } = synthetix;
  const isUserAuthenticated = walletAddress && token;
  const isPending = isUserAuthenticated && permissions.isPending;
  const isUserAuthenticatedAndGranted = isUserAuthenticated && permissions.data?.isGranted;
  const isUserAuthenticatedAndAdmin = isUserAuthenticated && permissions.data?.isAdmin;

  function renderRoute() {
    switch (true) {
      case params.page === 'registration':
        return (
          <ProtectedRoute isPending={isPending} isAllowed={isUserAuthenticated} goTo={setParams}>
            <React.Suspense fallback={null}>
              <Registration />
            </React.Suspense>
          </ProtectedRoute>
        );
      case params.page === 'projects':
        return (
          <ProtectedRoute
            isPending={isPending}
            isAllowed={isUserAuthenticatedAndGranted}
            goTo={setParams}
            redirectPath="registration"
          >
            <React.Suspense fallback={null}>
              <Projects />
            </React.Suspense>
          </ProtectedRoute>
        );
      case params.page === 'add-project':
        return (
          <ProtectedRoute
            isPending={isPending}
            isAllowed={isUserAuthenticatedAndGranted}
            goTo={setParams}
            redirectPath="registration"
          >
            <React.Suspense fallback={null}>
              <AddProject />
            </React.Suspense>
          </ProtectedRoute>
        );
      case params.page === 'project':
        return (
          <ProtectedRoute
            isPending={isPending}
            isAllowed={isUserAuthenticatedAndGranted}
            goTo={setParams}
            redirectPath="registration"
          >
            <React.Suspense fallback={null}>
              <HeliaProvider>
                <Project />
              </HeliaProvider>
            </React.Suspense>
          </ProtectedRoute>
        );
      case params.page === 'refresh-api-key':
        return (
          <ProtectedRoute isPending={isPending} isAllowed={isUserAuthenticated} goTo={setParams}>
            <React.Suspense fallback={null}>
              <RefreshApiKey />
            </React.Suspense>
          </ProtectedRoute>
        );
      case params.page === 'admin':
        return (
          <ProtectedRoute
            isPending={isPending}
            isAllowed={isUserAuthenticatedAndAdmin}
            goTo={setParams}
          >
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
