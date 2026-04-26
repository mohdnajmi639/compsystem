'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';

export default function Sidebar({ isOpen, onClose }) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const role = session?.user?.role;

  const links = [
    { href: '/dashboard', label: 'Dashboard', icon: '📊' },
    { href: '/dashboard/complaints', label: 'Complaints', icon: '📋' },
    ...(role === 'student' ? [{ href: '/dashboard/complaints/new', label: 'New Complaint', icon: '✏️' }] : []),
    ...(role === 'admin' ? [
      { href: '/dashboard/analytics', label: 'Analytics', icon: '📈' },
      { href: '/dashboard/users', label: 'Users', icon: '👥' },
    ] : []),
    { href: '/dashboard/notifications', label: 'Notifications', icon: '🔔' },
  ];

  const initials = session?.user?.name?.split(' ').map(n => n[0]).join('').toUpperCase() || '?';

  return (
    <>
      {isOpen && <div className="modal-overlay" onClick={onClose} style={{zIndex:35}} />}
      <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <div className="sidebar-logo">UniComplaint</div>
          <div className="sidebar-role">{role} Portal</div>
        </div>
        <nav className="sidebar-nav">
          {links.map(link => (
            <Link key={link.href} href={link.href} className={`sidebar-link ${pathname === link.href ? 'active' : ''}`} onClick={onClose}>
              <span>{link.icon}</span> {link.label}
            </Link>
          ))}
        </nav>
        <div className="sidebar-footer">
          <div className="sidebar-user">
            <div className="sidebar-avatar">{initials}</div>
            <div className="sidebar-user-info">
              <div className="sidebar-user-name">{session?.user?.name}</div>
              <div className="sidebar-user-email">{session?.user?.email}</div>
            </div>
          </div>
          <button className="btn btn-secondary btn-sm" style={{width:'100%',marginTop:'12px'}} onClick={() => signOut({ callbackUrl: '/' })}>
            Logout
          </button>
        </div>
      </aside>
    </>
  );
}
