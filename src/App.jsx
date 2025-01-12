import {Navigate, Outlet, Route, Routes} from 'react-router';
import {GlobalStats} from './GlobalStats';
import {Registration} from './Registration';
import {RootLayout} from './RootLayout';
import {useSynthetix} from './useSynthetix';

const ProtectedRoute = ({ isAllowed, redirectPath = '/', children }) => {
  if (!isAllowed) {
    return <Navigate to={redirectPath} replace />;
  }
  return children ? children : <Outlet />;
};

export function App() {
  const [synthetix] = useSynthetix();
  const { walletAddress, token } = synthetix;

  return (
    <Routes>
      <Route element={<RootLayout />}>
        <Route index element={<GlobalStats />} />
        <Route element={<ProtectedRoute isAllowed={walletAddress && token} />}>
          <Route path="registration" element={<Registration />} />
        </Route>
        <Route path="/*" element={<p>404</p>} />
      </Route>
    </Routes>
  );
}
