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

  const statusBadgeClass = (s) => {
    if (!s) return '';
    if (s === 'In Progress') return 'badge-progress';
    return `badge-${s.toLowerCase()}`;
  };

  if (loading) return <><Topbar title="Butiran Aduan" /><div className="page-content"><div className="loading"><div className="spinner" /></div></div></>;
  if (!complaint) return <><Topbar title="Butiran Aduan" /><div className="page-content"><div className="empty-state"><h3>Aduan tidak dijumpai</h3></div></div></>;

  return (
    <>
      <Topbar title="Butiran Aduan" />
      <div className="page-content" style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#111827', marginBottom: '24px' }}>Butiran Aduan</h1>
        <button onClick={() => router.back()} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', marginBottom: '20px', background: 'transparent', border: 'none', color: '#6b7280', fontSize: '0.9rem', fontWeight: 600, cursor: 'pointer' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
          Kembali
        </button>

        {/* Header Section */}
        <div className="card" style={{ padding: '24px', marginBottom: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <div style={{ fontSize: '0.8rem', color: '#6b7280', marginBottom: '8px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Aduan #{id.slice(-6).toUpperCase()}
              </div>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 700, color: '#111827', margin: '0 0 16px 0', lineHeight: 1.3 }}>{complaint.title}</h2>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                <span className={`badge ${statusBadgeClass(complaint.status)}`}>
                  {complaint.status}
                </span>
                {complaint.priority && (
                  <span className={`badge badge-${complaint.priority.toLowerCase()}`}>
                    Priority: {complaint.priority}
                  </span>
                )}
                <span className="badge" style={{ background: '#f3f4f6', color: '#374151', border: '1px solid #e5e7eb' }}>
                  {complaint.category}
                </span>
              </div>
            </div>
            
            <div style={{ display: 'flex', gap: '8px' }}>
              {(role === 'admin' || role === 'staff') && complaint.status !== 'Resolved' && complaint.status !== 'Rejected' && (
                <>
                  {complaint.status === 'Pending' && <button onClick={() => handleStatusChange('In Progress')} className="btn btn-primary btn-sm">Mula Proses</button>}
                  {complaint.status === 'In Progress' && <button onClick={() => handleStatusChange('Resolved')} className="btn btn-sm" style={{ background: '#10b981', color: '#fff', border: 'none' }}>Tandai Selesai</button>}
                  <button onClick={() => handleStatusChange('Rejected')} className="btn btn-danger btn-sm">Tolak</button>
                </>
              )}
              {role === 'admin' && <button onClick={() => setShowAssign(true)} className="btn btn-secondary btn-sm">Tugaskan Staf</button>}
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px', alignItems: 'start' }}>
          {/* Left Column: Description & Responses */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', gridColumn: 'span 2' }}>
            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
              <div style={{ padding: '16px 24px', borderBottom: '1px solid #e5e7eb', background: '#f9fafb' }}>
                <h3 style={{ fontSize: '0.9rem', color: '#111827', margin: 0, fontWeight: 600 }}>Keterangan</h3>
              </div>
              <div style={{ padding: '24px' }}>
                <p style={{ color: '#374151', fontSize: '0.95rem', margin: 0, whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>{complaint.description}</p>
              </div>
            </div>

            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
              <div style={{ padding: '16px 24px', borderBottom: '1px solid #e5e7eb', background: '#f9fafb' }}>
                <h3 style={{ fontSize: '0.9rem', color: '#111827', margin: 0, fontWeight: 600 }}>Aktiviti & Respons ({complaint.responses?.length || 0})</h3>
              </div>
              
              <div style={{ padding: '24px' }}>
                {complaint.responses?.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {complaint.responses.map((r, i) => (
                      <div key={i} style={{ background: '#f9fafb', padding: '16px', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', alignItems: 'center' }}>
                          <span style={{ fontWeight: 600, color: '#111827', fontSize: '0.85rem' }}>{r.respondedBy?.name || 'Staf'}</span>
                          <span style={{ color: '#6b7280', fontSize: '0.75rem' }}>{new Date(r.createdAt).toLocaleString('ms-MY')}</span>
                        </div>
                        <p style={{ color: '#374151', fontSize: '0.9rem', margin: 0, whiteSpace: 'pre-wrap', lineHeight: 1.5 }}>{r.message}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ padding: '32px 24px', textAlign: 'center', background: '#f9fafb', borderRadius: '8px', border: '1px dashed #e5e7eb' }}>
                    <p style={{ color: '#9ca3af', fontSize: '0.85rem', margin: 0 }}>Tiada respons direkodkan setakat ini.</p>
                  </div>
                )}

                {(role === 'admin' || role === 'staff') && complaint.status !== 'Resolved' && complaint.status !== 'Rejected' && (
                  <form onSubmit={handleResponse} style={{ marginTop: '24px', paddingTop: '24px', borderTop: '1px solid #e5e7eb' }}>
                    <label style={{ display: 'block', fontSize: '0.8rem', color: '#6b7280', fontWeight: 600, marginBottom: '8px' }}>Tambah Respons</label>
                    <textarea className="form-textarea" value={response} onChange={e => setResponse(e.target.value)} placeholder="Taip respons anda di sini..." style={{ marginBottom: '12px' }} />
                    <button type="submit" className="btn btn-primary btn-sm">Hantar Respons</button>
                  </form>
                )}
              </div>
            </div>

            {complaint.feedback?.rating && (
              <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                <div style={{ padding: '16px 24px', borderBottom: '1px solid #e5e7eb', background: '#f9fafb' }}>
                  <h3 style={{ fontSize: '0.9rem', color: '#111827', margin: 0, fontWeight: 600 }}>Maklum Balas Pengguna</h3>
                </div>
                <div style={{ padding: '24px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                    <span style={{ color: '#f59e0b', fontSize: '1.2rem', letterSpacing: '2px' }}>{'★'.repeat(complaint.feedback.rating)}{'☆'.repeat(5 - complaint.feedback.rating)}</span>
                    <span style={{ color: '#111827', fontSize: '0.9rem', fontWeight: 600 }}>{complaint.feedback.rating} / 5</span>
                  </div>
                  {complaint.feedback.comment ? (
                    <p style={{ color: '#374151', fontSize: '0.9rem', fontStyle: 'italic', margin: 0, background: '#f9fafb', padding: '12px', borderRadius: '8px', border: '1px solid #e5e7eb' }}>"{complaint.feedback.comment}"</p>
                  ) : (
                    <p style={{ color: '#9ca3af', fontSize: '0.85rem', margin: 0 }}>Tiada komen tambahan diberikan.</p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Meta Info */}
          <div style={{ gridColumn: 'span 1' }}>
            <div className="card" style={{ padding: 0, overflow: 'hidden', position: 'sticky', top: '80px' }}>
              <div style={{ padding: '16px 24px', borderBottom: '1px solid #e5e7eb', background: '#f9fafb' }}>
                <h3 style={{ fontSize: '0.9rem', color: '#111827', margin: 0, fontWeight: 600 }}>Maklumat Lanjut</h3>
              </div>
              
              <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div>
                  <div style={{ fontSize: '0.75rem', color: '#6b7280', marginBottom: '6px', fontWeight: 600, textTransform: 'uppercase' }}>Dilapor Oleh</div>
                  <div style={{ color: '#111827', fontSize: '0.9rem', fontWeight: 600, marginBottom: '2px' }}>{complaint.submittedBy?.name}</div>
                  <div style={{ color: '#6b7280', fontSize: '0.8rem' }}>{complaint.submittedBy?.email}</div>
                </div>
                
                <div>
                  <div style={{ fontSize: '0.75rem', color: '#6b7280', marginBottom: '6px', fontWeight: 600, textTransform: 'uppercase' }}>Ditugaskan Kepada</div>
                  {complaint.assignedTo ? (
                    <>
                      <div style={{ color: '#111827', fontSize: '0.9rem', fontWeight: 600, marginBottom: '2px' }}>{complaint.assignedTo.name}</div>
                      <div style={{ color: '#6b7280', fontSize: '0.8rem' }}>{complaint.assignedTo.department}</div>
                    </>
                  ) : (
                    <div style={{ color: '#9ca3af', fontSize: '0.85rem', fontStyle: 'italic' }}>Belum ditugaskan</div>
                  )}
                </div>

                <div style={{ height: '1px', background: '#e5e7eb', margin: '4px 0' }} />

                <div>
                  <div style={{ fontSize: '0.75rem', color: '#6b7280', marginBottom: '6px', fontWeight: 600, textTransform: 'uppercase' }}>Tarikh Dicipta</div>
                  <div style={{ color: '#374151', fontSize: '0.85rem' }}>{new Date(complaint.createdAt).toLocaleString('ms-MY')}</div>
                </div>
                
                <div>
                  <div style={{ fontSize: '0.75rem', color: '#6b7280', marginBottom: '6px', fontWeight: 600, textTransform: 'uppercase' }}>Kemaskini Terakhir</div>
                  <div style={{ color: '#374151', fontSize: '0.85rem' }}>{new Date(complaint.updatedAt).toLocaleString('ms-MY')}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {showAssign && (
          <div className="modal-overlay" onClick={() => setShowAssign(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div className="card" onClick={e => e.stopPropagation()} style={{ width: '100%', maxWidth: '420px', padding: 0 }}>
              <div style={{ padding: '20px 24px', borderBottom: '1px solid #e5e7eb', background: '#f9fafb' }}>
                <h2 style={{ fontSize: '1.1rem', color: '#111827', margin: 0, fontWeight: 700 }}>Tugaskan kepada Staf</h2>
              </div>
              <div style={{ padding: '24px' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', color: '#374151', fontWeight: 600, marginBottom: '8px' }}>Pilih Staf</label>
                <select className="form-select" value={assignTo} onChange={e => setAssignTo(e.target.value)} style={{ marginBottom: '24px' }}>
                  <option value="">Pilih ahli staf...</option>
                  {staffList.map(s => <option key={s._id} value={s._id}>{s.name} - {s.department}</option>)}
                </select>
                <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                  <button onClick={() => setShowAssign(false)} className="btn btn-secondary btn-sm">Batal</button>
                  <button onClick={handleAssign} className="btn btn-primary btn-sm">Simpan Tugasan</button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
