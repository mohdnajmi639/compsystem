import './globals.css';
import { SessionProvider } from './providers';

export const metadata = {
  title: 'UniComplaint - University Complaint Management System',
  description: 'Submit, track, and resolve university complaints efficiently.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body suppressHydrationWarning>
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  );
}
