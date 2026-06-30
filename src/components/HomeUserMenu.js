'use client';
import { useState } from 'react';
import { signOut } from 'next-auth/react';
import Link from 'next/link';

export default function HomeUserMenu({ session }) {
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const initials = session?.user?.name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || '?';
  const role = session?.user?.role;
  const roleLabel = role === 'admin' ? 'Pentadbir' : role === 'staff' ? 'Staf' : role;

  return (
    <div className="db-topbar-user-wrap" style={{ marginLeft: '12px' }}>
      <style>{`
        .home-user-btn {
          display: flex; align-items: center; gap: 8px;
          padding: 5px 10px 5px 5px;
          background: #f9fafb; border: 1px solid #e5e7eb;
          border-radius: 6px; cursor: pointer; font-family: inherit;
          transition: background 0.15s;
        }
        .home-user-btn:hover { background: #f3f4f6; }
      `}</style>
      <button
        className="home-user-btn"
        onClick={() => setUserMenuOpen(o => !o)}
        id="home-user-btn"
      >
        <div className="db-topbar-avatar" style={{ background: 'linear-gradient(135deg, #8b2be2, #5b21b6)', color: '#fff', borderRadius: '4px' }}>{initials}</div>
        <div className="db-topbar-user-text">
          <span className="db-topbar-user-name" style={{ color: '#111827' }}>{session?.user?.name?.split(' ')[0]}</span>
          <span className="db-topbar-user-role" style={{ color: '#6b7280' }}>{roleLabel}</span>
        </div>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" style={{color: '#9ca3af'}}>
          <polyline points="6 9 12 15 18 9"/>
        </svg>
      </button>

      {userMenuOpen && (
        <>
          <div style={{ position: 'fixed', inset: 0, zIndex: 49 }} onClick={() => setUserMenuOpen(false)} />
          <div className="db-topbar-dropdown" style={{ top: 'calc(100% + 8px)' }}>
            <div className="db-topbar-dropdown-user">
              <div className="db-topbar-dropdown-avatar">{initials}</div>
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.85rem', color: '#111827' }}>{session?.user?.name}</div>
                <div style={{ fontSize: '0.72rem', color: '#6b7280' }}>{session?.user?.email}</div>
              </div>
            </div>
            <div className="db-topbar-dropdown-divider" />
            
            {(role === 'admin' || role === 'staff') && (
              <Link href="/dashboard" className="db-topbar-dropdown-item" onClick={() => setUserMenuOpen(false)}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="7" height="7" />
                </svg>
                Dashboard
              </Link>
            )}

            <Link href="/" className="db-topbar-dropdown-item" onClick={() => setUserMenuOpen(false)}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                <polyline points="9 22 9 12 15 12 15 22" />
              </svg>
              Laman Utama
            </Link>

            <button className="db-topbar-dropdown-item db-topbar-dropdown-logout" onClick={() => signOut({ callbackUrl: '/' })}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
              Log Keluar
            </button>
          </div>
        </>
      )}
    </div>
  );
}
