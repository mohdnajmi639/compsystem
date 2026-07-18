'use client';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function DashboardLayout({ children }) {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'loading') return;
    if (!session) {
      router.push('/login');
    } else if (session.user.role === 'student') {
      router.replace('/');
    }
  }, [session, status, router]);

  if (status === 'loading' || !session || session.user.role === 'student') {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f4f5f7' }}>
        <div className="spinner" style={{ borderTopColor: '#7c3aed' }} />
      </div>
    );
  }

  return (
    <div className="db-layout">
      <div className="db-main">
        {children}
      </div>
    </div>
  );
}

