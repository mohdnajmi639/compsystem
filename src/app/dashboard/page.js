'use client';
import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import Topbar from '@/components/Topbar';

export default function DashboardPage() {
  const { data: session } = useSession();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const role = session?.user?.role;

  useEffect(() => {
    fetch('/api/complaints').then(r => r.json()).then(d => { setComplaints(Array.isArray(d) ? d : []); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  const pending = complaints.filter(c => c.status === 'Pending').length;
  const inProgress = complaints.filter(c => c.status === 'In Progress').length;
  const resolved = complaints.filter(c => c.status === 'Resolved').length;
  const total = complaints.length;

  const getTitle = () => {
    if (role === 'admin') return 'Admin Dashboard';
    if (role === 'staff') return 'Staff Dashboard';
    return 'My Dashboard';
  };

  return (
    <>
      <Topbar title={getTitle()} />
      <div className="page-content">
        <div className="stats-grid">
          <div className="card stat-card">
            <div className="stat-icon purple">📋</div>
            <div className="stat-info"><h3>{total}</h3><p>Total Complaints</p></div>
          </div>
          <div className="card stat-card">
            <div className="stat-icon orange">⏳</div>
            <div className="stat-info"><h3>{pending}</h3><p>Pending</p></div>
          </div>
          <div className="card stat-card">
            <div className="stat-icon blue">🔄</div>
            <div className="stat-info"><h3>{inProgress}</h3><p>In Progress</p></div>
          </div>
          <div className="card stat-card">
            <div className="stat-icon green">✅</div>
            <div className="stat-info"><h3>{resolved}</h3><p>Resolved</p></div>
          </div>
        </div>

        <div className="card" style={{marginBottom:'24px'}}>
          <h3 style={{marginBottom:'16px'}}>Recent Complaints</h3>
          {loading ? (
            <div className="loading"><div className="spinner" /></div>
          ) : complaints.length === 0 ? (
            <div className="empty-state">
              <h3>No complaints yet</h3>
              <p>{role === 'student' ? 'Submit your first complaint to get started.' : 'No complaints to display.'}</p>
              {role === 'student' && <Link href="/dashboard/complaints/new" className="btn btn-primary" style={{marginTop:'12px'}}>New Complaint</Link>}
            </div>
          ) : (
            <div className="complaint-list">
              {complaints.slice(0, 5).map(c => (
                <Link key={c._id} href={`/dashboard/complaints/${c._id}`} style={{textDecoration:'none',color:'inherit'}}>
                  <div className="card complaint-card">
                    <div>
                      <div className="complaint-title">{c.title}</div>
                      <div className="complaint-meta">
                        <span className={`badge badge-${c.status === 'In Progress' ? 'progress' : c.status.toLowerCase()}`}>{c.status}</span>
                        <span className={`badge badge-${c.priority.toLowerCase()}`}>{c.priority}</span>
                        <span>{c.category}</span>
                      </div>
                    </div>
                    <div className="complaint-right">
                      <span className="complaint-date">{new Date(c.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {role === 'student' && (
          <Link href="/dashboard/complaints/new" className="btn btn-primary btn-lg">✏️ Submit New Complaint</Link>
        )}
        {role === 'admin' && (
          <div style={{display:'flex',gap:'12px'}}>
            <Link href="/dashboard/analytics" className="btn btn-primary">📈 View Analytics</Link>
            <Link href="/dashboard/users" className="btn btn-secondary">👥 Manage Users</Link>
          </div>
        )}
      </div>
    </>
  );
}
