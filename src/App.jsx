import {Route, Routes} from 'react-router';
import {GlobalStats} from './GlobalStats';
import {Registration} from './Registration';
import {RootLayout} from './RootLayout';

export function App() {
  return (
    <Routes>
      <Route element={<RootLayout />}>
        <Route index element={<GlobalStats />} />
        <Route path="registration" element={<Registration />} />
        <Route path="/*" element={<p>404</p>} />
      </Route>
    </Routes>
  );
}
