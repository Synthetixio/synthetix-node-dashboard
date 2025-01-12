import React from 'react';
import {Navigate, Outlet, Route, Routes} from 'react-router';
import {CreateApiKey} from './CreateApiKey';
import {GlobalStats} from './GlobalStats';
import {RootLayout} from './RootLayout';
import {usePermissions} from './usePermissions';
import {useSynthetix} from './useSynthetix';

const Registration = React.lazy(() =>
  import('./Registration.js').then((module) => ({ default: module.Registration }))
);
const Admin = React.lazy(() => import('./Admin.js').then((module) => ({ default: module.Admin })));

const ProtectedRoute = ({ isAllowed, redirectPath = '/', children }) => {
  if (!isAllowed) {
    return <Navigate to={redirectPath} replace />;
  }
  return children || <Outlet />;
};

export function App() {
  const [synthetix] = useSynthetix();
  const { walletAddress, token } = synthetix;
  const permissions = usePermissions();
  const isUserAuthenticated = walletAddress && token;
  const isAdminAuthenticated = isUserAuthenticated && permissions.data?.isAdmin;

  return (
    <Routes>
      <Route element={<RootLayout />}>
        <Route index element={<GlobalStats />} />

        <Route element={<ProtectedRoute isAllowed={isUserAuthenticated} />}>
          <Route path="registration" element={<Registration />} />
          <Route path="create-api-key" element={<CreateApiKey />} />
        </Route>

        <Route element={<ProtectedRoute isAllowed={isAdminAuthenticated} />}>
          <Route path="admin" element={<Admin />} />
        </Route>

        <Route path="/*" element={<p>404</p>} />
      </Route>
    </Routes>
  );
}
