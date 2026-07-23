import './globals.css';
import { SessionProvider } from './providers';

import BackToTop from '@/components/BackToTop';
import PageTransition from '@/components/PageTransition';

export const metadata = {
  title: 'E-Aduan UiTM',
  description: 'Submit, track, and resolve university complaints efficiently.',
  icons: {
    icon: '/images/favicon3.png',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body suppressHydrationWarning>
        <SessionProvider>
          <PageTransition>{children}</PageTransition>
          <BackToTop />
        </SessionProvider>
      </body>
    </html>
  );
}
