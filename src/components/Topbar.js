'use client';
import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';

export default function Topbar({ title, onMenuClick }) {
  const { data: session } = useSession();
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    async function fetchCount() {
      try {
        const res = await fetch('/api/notifications');
        if (res.ok) { const d = await res.json(); setUnread(d.unreadCount); }
      } catch {}
    }
    fetchCount();
    const i = setInterval(fetchCount, 30000);
    return () => clearInterval(i);
  }, []);

  return (
    <div className="topbar">
      <div style={{display:'flex',alignItems:'center',gap:'12px'}}>
        <button className="mobile-toggle" onClick={onMenuClick}>☰</button>
        <h1 className="topbar-title">{title}</h1>
      </div>
      <div className="topbar-actions">
        <a href="/dashboard/notifications" className="notification-btn">
          🔔
          {unread > 0 && <span className="notification-badge">{unread > 9 ? '9+' : unread}</span>}
        </a>
        <span style={{fontSize:'0.85rem',color:'var(--text-secondary)'}}>{session?.user?.name}</span>
      </div>
    </div>
  );
}
