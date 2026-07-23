'use client';
import { useEffect, useState } from 'react';
import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Topbar() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [unread, setUnread] = useState(0);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  useEffect(() => {
    async function fetchCount() {
      try {
        const res = await fetch('/api/notifications');
        if (res.ok) { const d = await res.json(); setUnread(d.unreadCount ?? 0); }
      } catch {}
    }
    fetchCount();
    const i = setInterval(fetchCount, 30000);
    return () => clearInterval(i);
  }, []);

  const initials = session?.user?.name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || '?';
  const role = session?.user?.role;
  let displayDept = session?.user?.department || 'Staf';
  if (displayDept === 'Fasiliti') displayDept = 'Bahagian Fasiliti';
  if (displayDept === 'ICT') displayDept = 'Teknologi Maklumat dan Komunikasi (ICT)';
  
  const roleLabel = role === 'admin' ? 'Pentadbir' : role === 'staff' ? displayDept : role;

  const navLinks = [
    {
      href: '/dashboard', label: 'Dashboard',
      icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /></svg>
    },
    {
      href: '/dashboard/complaints', label: 'Senarai Aduan',
      icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="8" y1="13" x2="16" y2="13" /><line x1="8" y1="17" x2="16" y2="17" /></svg>
    },
    ...(role === 'admin' ? [
      {
        href: '/dashboard/users', label: 'Pengguna',
        icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>
      },
      {
        href: '/dashboard/analytics', label: 'Analitik',
        icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" /><line x1="2" y1="20" x2="22" y2="20" /></svg>
      },
    ] : [])
  ];

  return (
    <header className="db-topbar">
      <div className="db-topbar-left">
        {/* Brand */}
        <Link href="/dashboard" className="db-topbar-brand">
          <img src="/images/logo aduan2.png" alt="Aduan Logo" style={{height: 32, width: 'auto'}} />
        </Link>

        {/* Navigation Links */}
        <nav className="db-topbar-nav">
          {navLinks.map(link => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`db-topbar-nav-link ${isActive ? 'db-topbar-nav-active' : ''}`}
              >
                <span className="db-topbar-nav-icon">{link.icon}</span>
                {link.label}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="db-topbar-right">
        {/* Notification bell */}
        <Link href="/dashboard/notifications" className="db-topbar-notif" id="topbar-notif">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
            <path d="M13.73 21a2 2 0 0 1-3.46 0" />
          </svg>
          {unread > 0 && (
            <span className="db-topbar-notif-badge">{unread > 9 ? '9+' : unread}</span>
          )}
        </Link>

        {/* User menu */}
        <div className="db-topbar-user-wrap">
          <button
            className="db-topbar-user-btn"
            onClick={() => setUserMenuOpen(o => !o)}
            id="topbar-user-btn"
          >
            <div className="db-topbar-avatar">{initials}</div>
            <div className="db-topbar-user-text">
              <span className="db-topbar-user-name">{session?.user?.name?.split(' ')[0]}</span>
              <span className="db-topbar-user-role">{roleLabel}</span>
            </div>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" style={{color: '#fff', opacity: 0.7}}>
              <polyline points="6 9 12 15 18 9"/>
            </svg>
          </button>

          {userMenuOpen && (
            <>
              <div style={{ position: 'fixed', inset: 0, zIndex: 49 }} onClick={() => setUserMenuOpen(false)} />
              <div className="db-topbar-dropdown">
                <div className="db-topbar-dropdown-user">
                  <div className="db-topbar-dropdown-avatar">{initials}</div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.85rem', color: '#111827' }}>{session?.user?.name}</div>
                    <div style={{ fontSize: '0.72rem', color: '#6b7280' }}>{session?.user?.email}</div>
                  </div>
                </div>
                <div className="db-topbar-dropdown-divider" />
                <Link href="/" className="db-topbar-dropdown-item" onClick={() => setUserMenuOpen(false)} id="topbar-goto-home">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                    <polyline points="9 22 9 12 15 12 15 22"/>
                  </svg>
                  Laman Utama
                </Link>
                <button className="db-topbar-dropdown-item db-topbar-dropdown-logout" onClick={() => signOut({ callbackUrl: '/' })} id="topbar-logout">
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
      </div>
    </header>
  );
}
