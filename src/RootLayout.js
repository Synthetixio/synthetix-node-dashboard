import {Outlet} from 'react-router';
import {Header} from './Header';
import {NetworkMismatchBanner} from './NetworkMismatchBanner';

export function RootLayout() {
  return (
    <>
      <NetworkMismatchBanner />
      <Header />
      <section className="section background">
        <div className="container is-max-desktop">
          <Outlet />
        </div>
      </section>
    </>
  );
}
