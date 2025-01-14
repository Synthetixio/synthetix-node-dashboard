import {Header} from './Header';
import {NetworkMismatchBanner} from './NetworkMismatchBanner';

export function RootLayout({ children }) {
  return (
    <>
      <NetworkMismatchBanner />
      <Header />
      <section className="section background">
        <div className="container is-max-desktop">{children}</div>
      </section>
    </>
  );
}
