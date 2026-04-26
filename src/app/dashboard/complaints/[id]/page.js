'use client';
import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Topbar from '@/components/Topbar';

export default function ComplaintDetailPage({ params }) {
  const id = params.id;
  const { data: session } = useSession();
  const router = useRouter();
  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(true);
  const [response, setResponse] = useState('');
  const [staffList, setStaffList] = useState([]);
  const [showAssign, setShowAssign] = useState(false);
  const [assignTo, setAssignTo] = useState('');
  const [feedback, setFeedback] = useState({ rating: 0, comment: '' });
  const role = session?.user?.role;

  useEffect(() => {
    fetch(`/api/complaints/${id}`).then(r => r.json()).then(d => { setComplaint(d); setLoading(false); }).catch(() => setLoading(false));
    if (role === 'admin') fetch('/api/users').then(r => r.json()).then(d => setStaffList(Array.isArray(d) ? d.filter(u => u.role === 'staff') : [])).catch(() => {});
  }, [id, role]);

  const updateComplaint = async (body) => {
    const res = await fetch(`/api/complaints/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    const data = await res.json();
    setComplaint(data);
    return data;
  };

  const handleResponse = async (e) => {
    e.preventDefault();
    if (!response.trim()) return;
    await updateComplaint({ response });
    setResponse('');
  };

  const handleStatusChange = async (newStatus) => { await updateComplaint({ status: newStatus }); };
  const handleAssign = async () => { if (assignTo) { await updateComplaint({ assignedTo: assignTo }); setShowAssign(false); } };
  const handleFeedback = async () => { if (feedback.rating > 0) await updateComplaint({ feedback }); };

  if (loading) return <><Topbar title="Complaint Details" /><div className="page-content"><div className="loading"><div className="spinner" /></div></div></>;
  if (!complaint) return <><Topbar title="Complaint Details" /><div className="page-content"><div className="empty-state"><h3>Complaint not found</h3></div></div></>;

  return (
    <>
      <Topbar title="Complaint Details" />
      <div className="page-content">
        <button className="btn btn-secondary btn-sm" onClick={() => router.back()} style={{marginBottom:'20px'}}>← Back</button>

        <div className="detail-header">
          <div>
            <h2 className="detail-title">{complaint.title}</h2>
            <div className="detail-badges">
              <span className={`badge badge-${complaint.status === 'In Progress' ? 'progress' : complaint.status.toLowerCase()}`}>{complaint.status}</span>
              <span className={`badge badge-${complaint.priority.toLowerCase()}`}>{complaint.priority}</span>
              <span className="badge" style={{background:'var(--bg-glass)',color:'var(--text-secondary)'}}>{complaint.category}</span>
            </div>
          </div>
          <div style={{display:'flex',gap:'8px',flexWrap:'wrap'}}>
            {(role === 'admin' || role === 'staff') && complaint.status !== 'Resolved' && complaint.status !== 'Rejected' && (
              <>
                {complaint.status === 'Pending' && <button className="btn btn-primary btn-sm" onClick={() => handleStatusChange('In Progress')}>Start Progress</button>}
                {complaint.status === 'In Progress' && <button className="btn btn-primary btn-sm" onClick={() => handleStatusChange('Resolved')}>Mark Resolved</button>}
                <button className="btn btn-danger btn-sm" onClick={() => handleStatusChange('Rejected')}>Reject</button>
              </>
            )}
            {role === 'admin' && <button className="btn btn-secondary btn-sm" onClick={() => setShowAssign(true)}>Assign Staff</button>}
          </div>
        </div>

        <div className="detail-grid">
          <div>
            <div className="card detail-section">
              <h3>Description</h3>
              <p className="detail-description">{complaint.description}</p>
            </div>

            <div className="card detail-section">
              <h3>Responses ({complaint.responses?.length || 0})</h3>
              {complaint.responses?.length > 0 ? (
                <div className="timeline">
                  {complaint.responses.map((r, i) => (
                    <div key={i} className="timeline-item">
                      <div className="timeline-dot" />
                      <div className="timeline-content">
                        <span className="timeline-author">{r.respondedBy?.name || 'Staff'}</span>
                        <span className="timeline-date">{new Date(r.createdAt).toLocaleString()}</span>
                        <p className="timeline-message">{r.message}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : <p style={{color:'var(--text-muted)',fontSize:'0.9rem'}}>No responses yet.</p>}

              {(role === 'admin' || role === 'staff') && complaint.status !== 'Resolved' && complaint.status !== 'Rejected' && (
                <form className="response-form" onSubmit={handleResponse} style={{marginTop:'16px'}}>
                  <textarea className="form-textarea" value={response} onChange={e => setResponse(e.target.value)} placeholder="Write a response..." />
                  <button className="btn btn-primary btn-sm" type="submit">Send Response</button>
                </form>
              )}
            </div>

            {role === 'student' && complaint.status === 'Resolved' && !complaint.feedback?.rating && (
              <div className="card feedback-section">
                <h3 style={{marginBottom:'12px'}}>Rate the Resolution</h3>
                <div className="star-rating" style={{marginBottom:'12px'}}>
                  {[1,2,3,4,5].map(n => (
                    <span key={n} className={`star ${feedback.rating >= n ? 'active' : ''}`} onClick={() => setFeedback({...feedback, rating: n})}>★</span>
                  ))}
                </div>
                <textarea className="form-textarea" placeholder="Optional comment..." value={feedback.comment} onChange={e => setFeedback({...feedback, comment: e.target.value})} style={{minHeight:'60px',marginBottom:'12px'}} />
                <button className="btn btn-primary btn-sm" onClick={handleFeedback}>Submit Feedback</button>
              </div>
            )}
            {complaint.feedback?.rating && (
              <div className="card">
                <h3 style={{marginBottom:'8px'}}>Feedback</h3>
                <div style={{color:'#f59e0b',fontSize:'1.2rem',marginBottom:'4px'}}>{'★'.repeat(complaint.feedback.rating)}{'☆'.repeat(5 - complaint.feedback.rating)}</div>
                {complaint.feedback.comment && <p style={{color:'var(--text-secondary)',fontSize:'0.9rem'}}>{complaint.feedback.comment}</p>}
              </div>
            )}
          </div>

          <div>
            <div className="card">
              <h3 style={{marginBottom:'16px',fontSize:'1rem'}}>Details</h3>
              <div style={{display:'flex',flexDirection:'column',gap:'14px'}}>
                <div><label style={{fontSize:'0.75rem',color:'var(--text-muted)'}}>Submitted By</label><div style={{fontSize:'0.9rem',fontWeight:500}}>{complaint.submittedBy?.name}</div><div style={{fontSize:'0.8rem',color:'var(--text-muted)'}}>{complaint.submittedBy?.email}</div></div>
                {complaint.assignedTo && <div><label style={{fontSize:'0.75rem',color:'var(--text-muted)'}}>Assigned To</label><div style={{fontSize:'0.9rem',fontWeight:500}}>{complaint.assignedTo.name}</div><div style={{fontSize:'0.8rem',color:'var(--text-muted)'}}>{complaint.assignedTo.department}</div></div>}
                <div><label style={{fontSize:'0.75rem',color:'var(--text-muted)'}}>Submitted</label><div style={{fontSize:'0.9rem'}}>{new Date(complaint.createdAt).toLocaleString()}</div></div>
                <div><label style={{fontSize:'0.75rem',color:'var(--text-muted)'}}>Last Updated</label><div style={{fontSize:'0.9rem'}}>{new Date(complaint.updatedAt).toLocaleString()}</div></div>
              </div>
            </div>
          </div>
        </div>

        {showAssign && (
          <div className="modal-overlay" onClick={() => setShowAssign(false)}>
            <div className="modal" onClick={e => e.stopPropagation()}>
              <h2>Assign to Staff</h2>
              <select className="form-select" value={assignTo} onChange={e => setAssignTo(e.target.value)}>
                <option value="">Select staff member...</option>
                {staffList.map(s => <option key={s._id} value={s._id}>{s.name} - {s.department}</option>)}
              </select>
              <div className="modal-actions">
                <button className="btn btn-secondary btn-sm" onClick={() => setShowAssign(false)}>Cancel</button>
                <button className="btn btn-primary btn-sm" onClick={handleAssign}>Assign</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
