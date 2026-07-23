'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import Topbar from '@/components/Topbar';
import { CategoryChart, StatusChart, TrendChart } from '@/components/Charts';

export default function AnalyticsPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/analytics')
      .then((r) => r.json())
      .then((d) => {
        setData(d);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading)
    return (
      <>
        <Topbar title="Analitik" />
        <div className="page-content">
          <div className="loading">
            <div className="spinner" style={{ margin: '0 auto' }} />
          </div>
        </div>
      </>
    );
  if (!data)
    return (
      <>
        <Topbar title="Analitik" />
        <div className="page-content">
          <div className="empty-state">
            <h3>Gagal memuatkan analitik</h3>
          </div>
        </div>
      </>
    );

  const o = data.overview;

  return (
    <>
      <Topbar title="Analitik" />
      <div className="page-content">
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '24px',
          }}
        >
          <h1
            style={{
              fontSize: '1.8rem',
              fontWeight: 800,
              color: '#ffffff',
              margin: 0,
            }}
            className="print-title"
          >
            Analitik Sistem
          </h1>
          <div style={{ display: 'flex', gap: '12px' }} className="print-hide">
            <a
              href="/api/analytics/export"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 16px',
                background: '#10b981',
                color: '#fff',
                border: 'none',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'opacity 0.2s',
                textDecoration: 'none',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.9')}
              onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              Muat Turun CSV
            </a>
            <button
              onClick={() => window.print()}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 16px',
                background: '#7c3aed',
                color: '#fff',
                border: 'none',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'opacity 0.2s',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.9')}
              onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M17 17h2a2 2 0 0 0 2-2v-4a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v4a2 2 0 0 0 2 2h2" />
                <polyline points="6 17 6 21 18 21 18 17" />
                <rect x="6" y="3" width="12" height="8" />
              </svg>
              Muat Turun PDF
            </button>
          </div>
        </div>

        <div
          className="card print-hide"
          style={{
            display: 'flex',
            padding: 0,
            marginBottom: 24,
            overflow: 'hidden',
            flexWrap: 'wrap',
          }}
        >
          {[
            {
              label: 'Jumlah Aduan',
              value: o.totalComplaints,
              color: '#7c3aed',
              bg: '#f5f3ff',
              icon: (
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
              ),
            },
            {
              label: 'Kadar Penyelesaian',
              value: o.resolutionRate + '%',
              color: '#16a34a',
              bg: '#f0fdf4',
              icon: (
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
              ),
            },
            {
              label: 'Jumlah Pengguna',
              value: o.totalUsers,
              color: '#2563eb',
              bg: '#eff6ff',
              icon: (
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
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                  <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
              ),
            },
            {
              label: 'Purata Penilaian',
              value: o.avgRating,
              color: '#ea580c',
              bg: '#fff7ed',
              icon: (
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
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                </svg>
              ),
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
                {stat.icon}
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

        <div
          className="card print-hide"
          style={{ padding: 0, overflow: 'hidden' }}
        >
          <div
            style={{
              padding: '20px 24px',
              borderBottom: '1px solid #e5e7eb',
              background: '#f9fafb',
            }}
          >
            <h3
              style={{
                fontSize: '1rem',
                color: '#111827',
                margin: 0,
                fontWeight: 700,
              }}
            >
              Laporan Keseluruhan
            </h3>
          </div>

          <div
            className="chart-grid-container"
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))',
            }}
          >
            <div
              style={{
                padding: '24px',
                borderRight: '1px solid #e5e7eb',
                borderBottom: '1px solid #e5e7eb',
              }}
            >
              <h3
                style={{
                  marginBottom: '16px',
                  fontSize: '1rem',
                  fontWeight: 700,
                  color: '#111827',
                }}
              >
                Aduan Mengikut Kategori
              </h3>
              <div className="chart-container" style={{ height: '280px' }}>
                <CategoryChart data={data.categoryData} />
              </div>
            </div>
            <div style={{ padding: '24px', borderBottom: '1px solid #e5e7eb' }}>
              <h3
                style={{
                  marginBottom: '16px',
                  fontSize: '1rem',
                  fontWeight: 700,
                  color: '#111827',
                }}
              >
                Taburan Status
              </h3>
              <div className="chart-container" style={{ height: '280px' }}>
                <StatusChart data={o} />
              </div>
            </div>
            <div
              style={{
                padding: '24px',
                borderRight: '1px solid #e5e7eb',
                borderBottom: '1px solid #e5e7eb',
                gridColumn: 'span 2',
              }}
            >
              <h3
                style={{
                  marginBottom: '16px',
                  fontSize: '1rem',
                  fontWeight: 700,
                  color: '#111827',
                }}
              >
                Trend Bulanan
              </h3>
              <div className="chart-container" style={{ height: '280px' }}>
                <TrendChart data={data.monthlyData} />
              </div>
            </div>
          </div>
        </div>

        <div
          className="card print-break-auto"
          style={{
            padding: 0,
            overflow: 'hidden',
            marginTop: 24,
            border: 'none',
            boxShadow: 'none',
          }}
        >
          <div
            className="print-hide"
            style={{
              padding: '20px 24px',
              borderBottom: '1px solid #e5e7eb',
              background: '#f9fafb',
              border: '1px solid #e5e7eb',
              borderBottom: 'none',
              borderTopLeftRadius: '8px',
              borderTopRightRadius: '8px',
            }}
          >
            <h3
              style={{
                fontSize: '1rem',
                color: '#111827',
                margin: 0,
                fontWeight: 700,
              }}
            >
              Senarai Penuh Aduan
            </h3>
          </div>
          <div
            className="table-print-expand"
            style={{
              overflowX: 'auto',
              maxHeight: '600px',
              overflowY: 'auto',
              border: '1px solid #e5e7eb',
              borderTop: 'none',
              borderBottomLeftRadius: '8px',
              borderBottomRightRadius: '8px',
            }}
          >
            <table
              className="print-table"
              style={{
                width: '100%',
                borderCollapse: 'collapse',
                textAlign: 'left',
                fontSize: '0.9rem',
              }}
            >
              <thead style={{ position: 'sticky', top: 0, zIndex: 10 }}>
                <tr
                  style={{
                    background: '#f3f4f6',
                    borderBottom: '1px solid #e5e7eb',
                  }}
                >
                  <th
                    style={{
                      padding: '12px 24px',
                      color: '#4b5563',
                      fontWeight: 600,
                    }}
                  >
                    ID Tiket
                  </th>
                  <th
                    style={{
                      padding: '12px 24px',
                      color: '#4b5563',
                      fontWeight: 600,
                    }}
                  >
                    Tarikh
                  </th>
                  <th
                    style={{
                      padding: '12px 24px',
                      color: '#4b5563',
                      fontWeight: 600,
                    }}
                  >
                    Tajuk
                  </th>
                  <th
                    style={{
                      padding: '12px 24px',
                      color: '#4b5563',
                      fontWeight: 600,
                    }}
                  >
                    Kategori
                  </th>
                  <th
                    style={{
                      padding: '12px 24px',
                      color: '#4b5563',
                      fontWeight: 600,
                    }}
                  >
                    Pengadu
                  </th>
                  <th
                    style={{
                      padding: '12px 24px',
                      color: '#4b5563',
                      fontWeight: 600,
                    }}
                  >
                    Status
                  </th>
                  <th
                    style={{
                      padding: '12px 24px',
                      color: '#4b5563',
                      fontWeight: 600,
                    }}
                    className="print-hide"
                  >
                    Tindakan
                  </th>
                </tr>
              </thead>
              <tbody>
                {data.recentComplaints.length === 0 ? (
                  <tr>
                    <td
                      colSpan="7"
                      style={{
                        textAlign: 'center',
                        padding: '24px',
                        color: '#6b7280',
                      }}
                    >
                      Tiada aduan direkodkan.
                    </td>
                  </tr>
                ) : (
                  data.recentComplaints.map((c) => (
                    <tr
                      key={c._id}
                      style={{ borderBottom: '1px solid #f3f4f6' }}
                    >
                      <td
                        style={{
                          padding: '12px 24px',
                          fontWeight: 600,
                          color: '#111827',
                        }}
                      >
                        A{c._id.slice(-6).toUpperCase()}
                      </td>
                      <td style={{ padding: '12px 24px', color: '#6b7280' }}>
                        {new Date(c.createdAt).toLocaleDateString('ms-MY', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </td>
                      <td
                        style={{
                          padding: '12px 24px',
                          fontWeight: 600,
                          color: '#4f46e5',
                        }}
                      >
                        {c.title}
                      </td>
                      <td style={{ padding: '12px 24px', color: '#4b5563' }}>
                        {c.category}
                      </td>
                      <td style={{ padding: '12px 24px', color: '#4b5563' }}>
                        {c.submittedBy?.name || 'Unknown'}
                      </td>
                      <td style={{ padding: '12px 24px' }}>
                        <span
                          style={{
                            padding: '4px 8px',
                            borderRadius: 0,
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            textTransform: 'uppercase',
                            background:
                              c.status === 'Resolved'
                                ? '#dcfce7'
                                : c.status === 'Pending'
                                  ? '#fef3c7'
                                  : c.status === 'Rejected'
                                    ? '#fee2e2'
                                    : '#dbeafe',
                            color:
                              c.status === 'Resolved'
                                ? '#166534'
                                : c.status === 'Pending'
                                  ? '#92400e'
                                  : c.status === 'Rejected'
                                    ? '#991b1b'
                                    : '#1e40af',
                            border: `1px solid ${c.status === 'Resolved' ? '#bbf7d0' : c.status === 'Pending' ? '#fde68a' : c.status === 'Rejected' ? '#fecaca' : '#bfdbfe'}`,
                          }}
                        >
                          {c.status}
                        </span>
                      </td>
                      <td
                        style={{ padding: '12px 24px' }}
                        className="print-hide"
                      >
                        <Link
                          href={`/dashboard/complaints/${c._id}`}
                          style={{
                            color: '#7c3aed',
                            fontWeight: 600,
                            textDecoration: 'none',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 4,
                          }}
                        >
                          Lihat
                          <svg
                            width="14"
                            height="14"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <polyline points="9 18 15 12 9 6" />
                          </svg>
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}
