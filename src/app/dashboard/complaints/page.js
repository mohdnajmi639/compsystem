'use client';
import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import Topbar from '@/components/Topbar';

export default function ComplaintsPage() {
  const { data: session } = useSession();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ status: '', category: '', priority: '' });

  useEffect(() => {
    const params = new URLSearchParams();
    if (filters.status) params.set('status', filters.status);
    if (filters.category) params.set('category', filters.category);
    if (filters.priority) params.set('priority', filters.priority);
    fetch(`/api/complaints?${params}`).then(r => r.json()).then(d => { setComplaints(Array.isArray(d) ? d : []); setLoading(false); }).catch(() => setLoading(false));
  }, [filters]);

  const statusBadge = (s) => {
    const map = {
      Pending:       'badge-pending',
      'In Progress': 'badge-progress',
      Resolved:      'badge-resolved',
      Rejected:      'badge-rejected',
    };
    return <span className={`badge ${map[s] || ''}`}>{s}</span>;
  };

  return (
    <>
      <Topbar title="Complaints" />
      <div className="page-content">
        <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#111827', marginBottom: '24px' }}>Senarai Aduan</h1>
        <div className="card complaints-header">
          <div className="filters">
            <select className="form-select" style={{ width: 'auto' }} value={filters.status} onChange={e => setFilters({...filters, status: e.target.value})}>
              <option value="">Semua Status</option>
              <option>Pending</option><option>In Progress</option><option>Resolved</option><option>Rejected</option>
            </select>
            <select className="form-select" style={{ width: 'auto' }} value={filters.category} onChange={e => setFilters({...filters, category: e.target.value})}>
              <option value="">Semua Kategori</option>
              <option value="General">Aduan Umum</option><option value="ICT">Aduan ICT</option><option value="Facility">Aduan Fasiliti</option>
            </select>
            <select className="form-select" style={{ width: 'auto' }} value={filters.priority} onChange={e => setFilters({...filters, priority: e.target.value})}>
              <option value="">Semua Keutamaan</option>
              <option>Low</option><option>Medium</option><option>High</option><option>Urgent</option>
            </select>
          </div>
        </div>

        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          {loading ? (
            <div style={{ padding: '40px', textAlign: 'center' }}><div className="spinner" style={{ margin: '0 auto' }} /></div>
          ) : complaints.length === 0 ? (
            <div className="empty-state" style={{ padding: '40px' }}>
              <h3 style={{ margin: '0 0 8px 0', color: '#6b7280' }}>Tiada aduan dijumpai</h3>
              <p style={{ margin: 0, fontSize: '0.9rem' }}>Cuba ubah tetapan penapis anda.</p>
            </div>
          ) : (
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>ID / Tajuk</th>
                    <th>Status</th>
                    <th>Keutamaan</th>
                    <th>Kategori</th>
                    <th>Pengadu</th>
                    <th style={{ textAlign: 'right' }}>Tarikh</th>
                  </tr>
                </thead>
                <tbody>
                  {complaints.map(c => (
                    <tr key={c._id}>
                      <td>
                        <Link href={`/dashboard/complaints/${c._id}`} style={{ textDecoration: 'none', display: 'block' }}>
                          <div style={{ color: '#111827', fontSize: '0.92rem', fontWeight: 700, marginBottom: '2px' }}>{c.title}</div>
                          <div style={{ color: '#6b7280', fontSize: '0.75rem' }}>#{c._id.slice(-6).toUpperCase()}</div>
                        </Link>
                      </td>
                      <td>
                        {statusBadge(c.status)}
                      </td>
                      <td>
                        {c.priority ? (
                          <span className={`badge badge-${c.priority.toLowerCase()}`}>
                            {c.priority}
                          </span>
                        ) : (
                          <span style={{ color: '#9ca3af' }}>-</span>
                        )}
                      </td>
                      <td>
                        <span style={{ color: '#374151', fontSize: '0.85rem' }}>{c.category}</span>
                      </td>
                      <td>
                        <span style={{ color: '#374151', fontSize: '0.85rem' }}>{c.submittedBy?.name || '-'}</span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ color: '#6b7280', fontSize: '0.85rem' }}>{new Date(c.createdAt).toLocaleDateString('ms-MY')}</div>
                        {c.responses?.length > 0 && <div style={{ fontSize: '0.7rem', color: '#9ca3af', marginTop: '2px' }}>{c.responses.length} respons</div>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
