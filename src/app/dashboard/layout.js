'use client';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function DashboardLayout({ children }) {
  const { data: session, status } = useSession();
  const router = useRouter();

  if (status === 'loading') return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f4f5f7' }}>
      <div className="spinner" style={{ borderTopColor: '#7c3aed' }} />
    </div>
  );
  if (!session) { router.push('/login'); return null; }

  // Students have no dashboard — redirect to landing page
  if (session.user.role === 'student') {
    router.replace('/');
    return null;
  }

  return (
    <div className="db-layout">
      <div className="db-main">
        {children}
      </div>
    </div>
  );
}
