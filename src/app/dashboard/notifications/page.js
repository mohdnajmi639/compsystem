'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import Topbar from '@/components/Topbar';

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/notifications')
      .then((r) => r.json())
      .then((d) => {
        setNotifications(d.notifications || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const markAllRead = async () => {
    await fetch('/api/notifications', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    });
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const typeIcons = {
    status_update: '🔄',
    new_assignment: '📌',
    new_response: '💬',
    new_complaint: '📝',
  };

  return (
    <>
      <Topbar title="Pemberitahuan" />
      <div className="page-content">
        <h1
          style={{
            fontSize: '1.8rem',
            fontWeight: 800,
            color: '#ffffff',
            marginBottom: '24px',
          }}
        >
          Pemberitahuan
        </h1>

        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '20px 24px',
              borderBottom: '1px solid #e5e7eb',
              background: '#f9fafb',
            }}
          >
            <div>
              <h3
                style={{
                  fontSize: '1rem',
                  color: '#111827',
                  margin: 0,
                  fontWeight: 700,
                }}
              >
                Peti Masuk
              </h3>
              <p
                style={{
                  color: '#6b7280',
                  fontSize: '0.8rem',
                  margin: '4px 0 0 0',
                }}
              >
                {notifications.filter((n) => !n.read).length} belum dibaca
              </p>
            </div>
            <button className="btn btn-secondary btn-sm" onClick={markAllRead}>
              Tanda semua sebagai dibaca
            </button>
          </div>

          {loading ? (
            <div style={{ padding: '40px', textAlign: 'center' }}>
              <div className="spinner" style={{ margin: '0 auto' }} />
            </div>
          ) : notifications.length === 0 ? (
            <div className="empty-state" style={{ padding: '60px 20px' }}>
              <svg
                width="40"
                height="40"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#d1d5db"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{ margin: '0 auto 12px', display: 'block' }}
              >
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
              </svg>
              <h3
                style={{
                  color: '#6b7280',
                  margin: '0 0 8px 0',
                  fontSize: '1rem',
                }}
              >
                Tiada pemberitahuan
              </h3>
              <p style={{ margin: 0, fontSize: '0.9rem' }}>
                Anda telah membaca semua pemberitahuan!
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {notifications.map((n, idx) => (
                <Link
                  key={n._id}
                  href={
                    n.relatedComplaint
                      ? `/dashboard/complaints/${n.relatedComplaint._id || n.relatedComplaint}`
                      : '#'
                  }
                  style={{ textDecoration: 'none', color: 'inherit' }}
                >
                  <div
                    style={{
                      display: 'flex',
                      gap: '14px',
                      alignItems: 'flex-start',
                      padding: '20px 24px',
                      borderBottom:
                        idx === notifications.length - 1
                          ? 'none'
                          : '1px solid #e5e7eb',
                      background: n.read ? '#ffffff' : '#fafafe',
                      transition: 'background 0.2s',
                      position: 'relative',
                    }}
                  >
                    {!n.read && (
                      <div
                        style={{
                          position: 'absolute',
                          left: 0,
                          top: 0,
                          bottom: 0,
                          width: '3px',
                          background: '#7c3aed',
                        }}
                      />
                    )}
                    <div style={{ fontSize: '1.2rem', marginTop: '2px' }}>
                      {typeIcons[n.type] || '🔔'}
                    </div>
                    <div>
                      <div
                        style={{
                          fontWeight: 700,
                          fontSize: '0.92rem',
                          color: '#111827',
                          marginBottom: '4px',
                        }}
                      >
                        {n.title}
                      </div>
                      <div
                        style={{
                          fontSize: '0.85rem',
                          color: '#374151',
                          lineHeight: 1.5,
                        }}
                      >
                        {n.message}
                      </div>
                      <div
                        style={{
                          fontSize: '0.75rem',
                          color: '#9ca3af',
                          marginTop: '6px',
                        }}
                      >
                        {new Date(n.createdAt).toLocaleString('ms-MY')}
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
