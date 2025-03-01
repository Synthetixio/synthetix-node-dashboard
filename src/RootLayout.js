import { Header } from './Header';

export function RootLayout({ children }) {
  return (
    <>
      <Header />
      <section className="section background">
        <div className="container is-max-desktop">{children}</div>
      </section>
    </>
  );
}
