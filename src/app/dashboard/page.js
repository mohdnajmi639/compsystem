'use client';
import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Topbar from '@/components/Topbar';

export default function DashboardPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const role = session?.user?.role;

  useEffect(() => {
    fetch('/api/complaints', { cache: 'no-store' })
      .then((r) => r.json())
      .then((d) => {
        setComplaints(Array.isArray(d) ? d : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const pending = complaints.filter((c) => c.status === 'Pending').length;
  const inProgress = complaints.filter(
    (c) => c.status === 'In Progress',
  ).length;
  const resolved = complaints.filter((c) => c.status === 'Resolved').length;
  const total = complaints.length;

  const statusBadge = (s) => {
    const map = {
      Pending: 'badge-pending',
      'In Progress': 'badge-progress',
      Resolved: 'badge-resolved',
      Rejected: 'badge-rejected',
    };
    return <span className={`badge ${map[s] || ''}`}>{s}</span>;
  };

  return (
    <>
      <Topbar />
      <div className="page-content">
        <h1
          style={{
            fontSize: '1.8rem',
            fontWeight: 800,
            color: '#ffffff',
            marginBottom: '24px',
          }}
        >
          Dashboard Utama
        </h1>

        {/* ── Welcome bar ── */}
        <div
          style={{
            background: '#ffffff',
            border: '1px solid #e5e7eb',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            borderRadius: 0,
            padding: '24px 28px',
            marginBottom: 24,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 12,
          }}
        >
          <div>
            <div
              style={{
                fontSize: '0.75rem',
                fontWeight: 700,
                color: '#6b7280',
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                marginBottom: 4,
              }}
            >
              Selamat datang
            </div>
            <div
              style={{ fontSize: '1.4rem', fontWeight: 800, color: '#111827' }}
            >
              {session?.user?.name}
            </div>
            <div
              style={{ fontSize: '0.82rem', color: '#6b7280', marginTop: 3 }}
            >
              {role === 'admin' ? 'Pentadbir Sistem' : 'Staf'}
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <style>{`
              .hero-btn-users {
                background: #f9fafb !important;
                color: #374151 !important;
                border: 1px solid #e5e7eb !important;
                transition: background 0.15s, border-color 0.15s !important;
                border-radius: 0 !important;
              }
              .hero-btn-users:hover {
                background: #f3f4f6 !important;
                border-color: #d1d5db !important;
              }
              .hero-btn-analytics {
                background: #7c3aed !important;
                color: #fff !important;
                font-weight: 700 !important;
                transition: background 0.15s, opacity 0.15s !important;
                border-radius: 0 !important;
                border: none !important;
              }
              .hero-btn-analytics:hover {
                background: #6d28d9 !important;
              }
            `}</style>
            {role === 'admin' && (
              <Link
                href="/dashboard/users"
                className="btn hero-btn-users"
                id="dash-manage-users"
              >
                <svg
                  width="15"
                  height="15"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                  <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
                Pengguna
              </Link>
            )}
            {role === 'admin' ? (
              <Link
                href="/dashboard/analytics"
                className="btn hero-btn-analytics"
                id="dash-analytics"
              >
                <svg
                  width="15"
                  height="15"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="18" y1="20" x2="18" y2="10" />
                  <line x1="12" y1="20" x2="12" y2="4" />
                  <line x1="6" y1="20" x2="6" y2="14" />
                  <line x1="2" y1="20" x2="22" y2="20" />
                </svg>
                Analitik
              </Link>
            ) : (
              <Link
                href="/dashboard/complaints"
                className="btn hero-btn-analytics"
                id="dash-complaints"
              >
                <svg
                  width="15"
                  height="15"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="8" y1="6" x2="21" y2="6"></line>
                  <line x1="8" y1="12" x2="21" y2="12"></line>
                  <line x1="8" y1="18" x2="21" y2="18"></line>
                  <line x1="3" y1="6" x2="3.01" y2="6"></line>
                  <line x1="3" y1="12" x2="3.01" y2="12"></line>
                  <line x1="3" y1="18" x2="3.01" y2="18"></line>
                </svg>
                Senarai Aduan
              </Link>
            )}
          </div>
        </div>

        {/* ── Single Unified Stats Bar ── */}
        <div
          style={{
            display: 'flex',
            padding: 0,
            margin: '0 0 24px 0',
            overflow: 'hidden',
            flexWrap: 'wrap',
            border: '1px solid #e5e7eb',
            background: '#ffffff',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          }}
        >
          {[
            {
              label: 'Jumlah Aduan',
              value: total,
              color: '#7c3aed',
              bg: '#f5f3ff',
            },
            {
              label: 'Menunggu',
              value: pending,
              color: '#ea580c',
              bg: '#fff7ed',
            },
            {
              label: 'Dalam Proses',
              value: inProgress,
              color: '#2563eb',
              bg: '#eff6ff',
            },
            {
              label: 'Selesai',
              value: resolved,
              color: '#16a34a',
              bg: '#f0fdf4',
            },
          ].map((stat, i) => (
            <div
              key={i}
              style={{
                flex: '1 1 200px',
                padding: '24px',
                borderRight: i < 3 ? '1px solid #e5e7eb' : 'none',
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
                minWidth: '200px',
              }}
            >
              <div
                style={{
                  width: '48px',
                  height: '48px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: stat.bg,
                  color: stat.color,
                  flexShrink: 0,
                }}
              >
                {i === 0 && (
                  <svg
                    width="22"
                    height="22"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                    <line x1="8" y1="13" x2="16" y2="13" />
                    <line x1="8" y1="17" x2="16" y2="17" />
                  </svg>
                )}
                {i === 1 && (
                  <svg
                    width="22"
                    height="22"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" />
                  </svg>
                )}
                {i === 2 && (
                  <svg
                    width="22"
                    height="22"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="23 4 23 10 17 10" />
                    <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
                  </svg>
                )}
                {i === 3 && (
                  <svg
                    width="22"
                    height="22"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                    <polyline points="22 4 12 14.01 9 11.01" />
                  </svg>
                )}
              </div>
              <div>
                <div
                  style={{
                    fontSize: '1.6rem',
                    fontWeight: 800,
                    color: '#111827',
                    lineHeight: 1,
                  }}
                >
                  {stat.value}
                </div>
                <div
                  style={{
                    fontSize: '0.78rem',
                    color: '#6b7280',
                    marginTop: '4px',
                  }}
                >
                  {stat.label}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* ── Recent Complaints Data Table ── */}
        <div
          style={{
            padding: 0,
            overflow: 'hidden',
            border: '1px solid #e5e7eb',
            background: '#ffffff',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '20px 24px',
              borderBottom: '1px solid rgba(0,0,0,0.05)',
            }}
          >
            <div>
              <h3
                style={{
                  fontSize: '1rem',
                  fontWeight: 700,
                  color: '#111827',
                  margin: 0,
                }}
              >
                Aduan Terkini
              </h3>
              <p
                style={{
                  fontSize: '0.78rem',
                  color: '#6b7280',
                  margin: '4px 0 0 0',
                }}
              >
                5 aduan terkini dalam sistem
              </p>
            </div>
            <Link
              href="/dashboard/complaints"
              className="btn btn-secondary"
              style={{ padding: '6px 14px', fontSize: '0.8rem' }}
              id="dash-view-all"
            >
              Lihat Semua →
            </Link>
          </div>

          {loading ? (
            <div style={{ padding: '40px', textAlign: 'center' }}>
              <div className="spinner" style={{ margin: '0 auto' }} />
            </div>
          ) : complaints.length === 0 ? (
            <div className="empty-state" style={{ padding: '40px' }}>
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
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
              </svg>
              <h3
                style={{
                  color: '#6b7280',
                  margin: '0 0 8px 0',
                  fontSize: '1rem',
                }}
              >
                Tiada aduan
              </h3>
              <p style={{ margin: 0, fontSize: '0.9rem' }}>
                Belum ada aduan dalam sistem.
              </p>
            </div>
          ) : (
            <div
              className="table-container"
              style={{ margin: 0, borderRadius: 0, border: 'none' }}
            >
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    <th>ID / Tajuk</th>
                    <th>Status</th>
                    <th>Kategori</th>
                    <th>Pengadu</th>
                    <th style={{ textAlign: 'right' }}>Tarikh</th>
                  </tr>
                </thead>
                <tbody>
                  {complaints.slice(0, 5).map((c) => (
                    <tr
                      key={c._id}
                      className="complaint-row"
                      onClick={() =>
                        router.push(`/dashboard/complaints/${c._id}`)
                      }
                    >
                      <td>
                        <div
                          style={{
                            color: '#111827',
                            fontSize: '0.92rem',
                            fontWeight: 700,
                            marginBottom: '2px',
                          }}
                        >
                          {c.title}
                        </div>
                        <div style={{ color: '#6b7280', fontSize: '0.75rem' }}>
                          #{c._id.slice(-6).toUpperCase()}
                        </div>
                      </td>
                      <td>{statusBadge(c.status)}</td>
                      <td>
                        <span style={{ color: '#374151', fontSize: '0.85rem' }}>
                          {c.category}
                        </span>
                      </td>
                      <td>
                        <span style={{ color: '#374151', fontSize: '0.85rem' }}>
                          {c.submittedBy?.name || '-'}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ color: '#6b7280', fontSize: '0.85rem' }}>
                          {new Date(c.createdAt).toLocaleDateString('ms-MY')}
                        </div>
                        {c.responses?.length > 0 && (
                          <div
                            style={{
                              fontSize: '0.7rem',
                              color: '#9ca3af',
                              marginTop: '2px',
                            }}
                          >
                            {c.responses.length} respons
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <style>{`
        .complaint-row {
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .complaint-row:hover {
          background-color: #f3e8ff !important;
          box-shadow: 0 0 12px rgba(124, 58, 237, 0.15);
          transform: translateY(-1px);
        }
        .complaint-row:hover td {
          background-color: transparent !important;
        }
      `}</style>
    </>
  );
}
