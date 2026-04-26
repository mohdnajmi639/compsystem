'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import Topbar from '@/components/Topbar';

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/notifications').then(r => r.json()).then(d => { setNotifications(d.notifications || []); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  const markAllRead = async () => {
    await fetch('/api/notifications', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({}) });
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const typeIcons = { status_update: '🔄', new_assignment: '📌', new_response: '💬', new_complaint: '📝' };

  return (
    <>
      <Topbar title="Notifications" />
      <div className="page-content">
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'20px'}}>
          <p style={{color:'var(--text-secondary)',fontSize:'0.9rem'}}>{notifications.filter(n => !n.read).length} unread</p>
          <button className="btn btn-secondary btn-sm" onClick={markAllRead}>Mark all as read</button>
        </div>
        {loading ? <div className="loading"><div className="spinner" /></div> : notifications.length === 0 ? (
          <div className="empty-state"><h3>No notifications</h3><p>You are all caught up!</p></div>
        ) : (
          <div className="notification-list">
            {notifications.map(n => (
              <Link key={n._id} href={n.relatedComplaint ? `/dashboard/complaints/${n.relatedComplaint._id || n.relatedComplaint}` : '#'} style={{textDecoration:'none',color:'inherit'}}>
                <div className={`card notification-item ${n.read ? 'read' : 'unread'}`}>
                  <div className="notification-dot" />
                  <div>
                    <div className="notification-title">{typeIcons[n.type] || '🔔'} {n.title}</div>
                    <div className="notification-message">{n.message}</div>
                    <div className="notification-time">{new Date(n.createdAt).toLocaleString()}</div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
