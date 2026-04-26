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

  return (
    <>
      <Topbar title="Complaints" />
      <div className="page-content">
        <div className="complaints-header">
          <div className="filters">
            <select className="form-select" style={{width:'auto'}} value={filters.status} onChange={e => setFilters({...filters, status: e.target.value})}>
              <option value="">All Status</option>
              <option>Pending</option><option>In Progress</option><option>Resolved</option><option>Rejected</option>
            </select>
            <select className="form-select" style={{width:'auto'}} value={filters.category} onChange={e => setFilters({...filters, category: e.target.value})}>
              <option value="">All Categories</option>
              <option>Academic</option><option>Facility</option><option>Financial</option><option>Administrative</option><option>Other</option>
            </select>
            <select className="form-select" style={{width:'auto'}} value={filters.priority} onChange={e => setFilters({...filters, priority: e.target.value})}>
              <option value="">All Priority</option>
              <option>Low</option><option>Medium</option><option>High</option><option>Urgent</option>
            </select>
          </div>
          {session?.user?.role === 'student' && <Link href="/dashboard/complaints/new" className="btn btn-primary">✏️ New Complaint</Link>}
        </div>
        {loading ? <div className="loading"><div className="spinner" /></div> : complaints.length === 0 ? (
          <div className="empty-state"><h3>No complaints found</h3><p>Try adjusting your filters.</p></div>
        ) : (
          <div className="complaint-list">
            {complaints.map(c => (
              <Link key={c._id} href={`/dashboard/complaints/${c._id}`} style={{textDecoration:'none',color:'inherit'}}>
                <div className="card complaint-card">
                  <div>
                    <div className="complaint-title">{c.title}</div>
                    <div className="complaint-meta">
                      <span className={`badge badge-${c.status === 'In Progress' ? 'progress' : c.status.toLowerCase()}`}>{c.status}</span>
                      <span className={`badge badge-${c.priority.toLowerCase()}`}>{c.priority}</span>
                      <span>{c.category}</span>
                      {c.submittedBy && <span>by {c.submittedBy.name}</span>}
                    </div>
                  </div>
                  <div className="complaint-right">
                    <span className="complaint-date">{new Date(c.createdAt).toLocaleDateString()}</span>
                    {c.responses?.length > 0 && <span style={{fontSize:'0.75rem',color:'var(--text-muted)'}}>{c.responses.length} responses</span>}
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
