'use client';
import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useParams } from 'next/navigation';
import Topbar from '@/components/Topbar';

const isImage = (url) => /\.(jpg|jpeg|png|gif|webp|bmp|svg)$/i.test(url);
const isPdf   = (url) => /\.pdf$/i.test(url);

const formatDepartment = (dept) => {
  if (dept === 'Fasiliti') return 'Bahagian Fasiliti';
  if (dept === 'ICT') return 'Teknologi Maklumat dan Komunikasi (ICT)';
  return dept;
};

function AttachmentPreview({ url }) {
  const name = url.split('/').pop();
  if (isImage(url)) {
    return (
      <a href={url} target="_blank" rel="noopener noreferrer" style={{ display: 'block', textDecoration: 'none' }}>
        <img
          src={url}
          alt={name}
          style={{
            width: '100%',
            maxHeight: '200px',
            objectFit: 'cover',
            borderRadius: 0,
            border: '1px solid #e5e7eb',
            display: 'block',
          }}
        />
        <div style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {name}
        </div>
      </a>
    );
  }
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        padding: '12px 14px',
        border: '1px solid #e5e7eb',
        borderRadius: 0,
        textDecoration: 'none',
        background: '#f9fafb',
        color: '#374151',
        fontSize: '0.85rem',
        fontWeight: 600,
        transition: 'background 0.15s',
      }}
      onMouseEnter={(e) => { e.currentTarget.style.background = '#f3f4f6'; }}
      onMouseLeave={(e) => { e.currentTarget.style.background = '#f9fafb'; }}
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        {isPdf(url)
          ? <><rect x="3" y="2" width="18" height="20" rx="2"/><path d="M8 10h8M8 14h5"/></>
          : <><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></>
        }
      </svg>
      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{name}</span>
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginLeft: 'auto', flexShrink: 0 }}>
        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>
      </svg>
    </a>
  );
}

export default function ComplaintDetailPage() {
  const params = useParams();
  const id = params?.id || '';
  const { data: session } = useSession();
  const router = useRouter();
  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(true);
  const [response, setResponse] = useState('');
  const [staffList, setStaffList] = useState([]);
  const [showResolveModal, setShowResolveModal] = useState(false);
  const [resolveMessage, setResolveMessage] = useState('');
  const [feedbackRating, setFeedbackRating] = useState(0);
  const [feedbackComment, setFeedbackComment] = useState('');
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const role = session?.user?.role;

  const showToast = (msg, type = 'success') => {
    setToast({ show: true, message: msg, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3500);
  };

  useEffect(() => {
    fetch(`/api/complaints/${id}`).then(r => r.json()).then(d => { setComplaint(d); setLoading(false); }).catch(() => setLoading(false));
    if (role === 'admin' || role === 'staff') fetch('/api/users').then(r => r.json()).then(d => setStaffList(Array.isArray(d) ? d.filter(u => u.role === 'staff') : [])).catch(() => {});
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
  const handleResolveSubmit = async (e) => {
    e.preventDefault();
    if (!resolveMessage.trim()) {
      showToast('Sila berikan keterangan penyelesaian', 'error');
      return;
    }
    await updateComplaint({ status: 'Resolved', response: resolveMessage });
    setShowResolveModal(false);
    setResolveMessage('');
  };
  const handleFeedback = async () => { if (feedbackRating > 0) await updateComplaint({ feedback: { rating: feedbackRating, comment: feedbackComment } }); };

  const statusBadgeClass = (s) => {
    if (!s) return '';
    if (s === 'In Progress') return 'badge-progress';
    return `badge-${s.toLowerCase()}`;
  };

  if (loading) return <><Topbar title="Butiran Aduan" /><div className="page-content"><div className="loading"><div className="spinner" /></div></div></>;
  if (!complaint) return <><Topbar title="Butiran Aduan" /><div className="page-content"><div className="empty-state"><h3>Aduan tidak dijumpai</h3></div></div></>;

  const attachments = complaint.attachments?.filter(Boolean) || [];

  return (
    <>
      <Topbar title="Butiran Aduan" />
      <div className="page-content" style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#ffffff', marginBottom: '24px' }}>Butiran Aduan</h1>
        <button onClick={() => router.back()} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', marginBottom: '20px', background: 'transparent', border: 'none', color: '#ffffff', fontSize: '0.9rem', fontWeight: 600, cursor: 'pointer', opacity: 0.9 }}>
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
                <span className="badge" style={{ background: '#f3f4f6', color: '#374151', border: '1px solid #e5e7eb' }}>
                  {formatDepartment(complaint.categoryId?.name || complaint.category || 'N/A')}
                </span>
              </div>
            </div>
            
            <div style={{ display: 'flex', gap: '8px' }}>
              {(role === 'admin' || role === 'staff') && complaint.status !== 'Resolved' && complaint.status !== 'Rejected' && (
                <>
                  {complaint.status === 'Pending' && (
                    <button 
                      onClick={() => {
                        if (!complaint.assignedTo) {
                          showToast('Sila ambil aduan ini terlebih dahulu sebelum memulakan proses.', 'error');
                          return;
                        }
                        handleStatusChange('In Progress');
                      }} 
                      className="btn btn-primary btn-sm"
                    >
                      Mula Proses
                    </button>
                  )}
                  {complaint.status === 'In Progress' && <button onClick={() => setShowResolveModal(true)} className="btn btn-sm" style={{ background: '#10b981', color: '#fff', border: 'none' }}>Tanda Selesai</button>}
                  <button onClick={() => handleStatusChange('Rejected')} className="btn btn-danger btn-sm">Tolak</button>
                </>
              )}
              {role === 'staff' && !complaint.assignedTo && complaint.status === 'Pending' && (
                <button onClick={() => updateComplaint({ assignedTo: session.user.id })} className="btn btn-secondary btn-sm" style={{ background: '#3b82f6', color: '#fff', border: 'none' }}>Ambil Aduan</button>
              )}
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px', alignItems: 'start' }}>
          {/* Left Column: Description, Attachments & Responses */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', gridColumn: 'span 2' }}>

            {/* Description */}
            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
              <div style={{ padding: '16px 24px', borderBottom: '1px solid #e5e7eb', background: '#f9fafb' }}>
                <h3 style={{ fontSize: '0.9rem', color: '#111827', margin: 0, fontWeight: 600 }}>Keterangan</h3>
              </div>
              <div style={{ padding: '24px' }}>
                <p style={{ color: '#374151', fontSize: '0.95rem', margin: 0, whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>{complaint.description}</p>
              </div>
            </div>

            {/* Attachments */}
            {attachments.length > 0 && (
              <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                <div style={{ padding: '16px 24px', borderBottom: '1px solid #e5e7eb', background: '#f9fafb', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/>
                  </svg>
                  <h3 style={{ fontSize: '0.9rem', color: '#111827', margin: 0, fontWeight: 600 }}>
                    Lampiran ({attachments.length})
                  </h3>
                </div>
                <div style={{ padding: '24px' }}>
                  {/* Image grid */}
                  {attachments.some(isImage) && (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '12px', marginBottom: attachments.some(a => !isImage(a)) ? '16px' : 0 }}>
                      {attachments.filter(isImage).map((url, i) => (
                        <AttachmentPreview key={i} url={url} />
                      ))}
                    </div>
                  )}
                  {/* Non-image files */}
                  {attachments.filter(a => !isImage(a)).length > 0 && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {attachments.filter(a => !isImage(a)).map((url, i) => (
                        <AttachmentPreview key={i} url={url} />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Responses */}
            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
              <div style={{ padding: '16px 24px', borderBottom: '1px solid #e5e7eb', background: '#f9fafb' }}>
                <h3 style={{ fontSize: '0.9rem', color: '#111827', margin: 0, fontWeight: 600 }}>Aktiviti & Respons ({complaint.responses?.length || 0})</h3>
              </div>
              
              <div style={{ padding: '24px' }}>
                {complaint.responses?.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {complaint.responses.map((r, i) => (
                      <div key={i} style={{ background: '#f9fafb', padding: '16px', borderRadius: 0, border: '1px solid #e5e7eb' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ fontWeight: 600, color: '#111827', fontSize: '0.85rem' }}>{r.respondedBy?.name || 'Staf'}</span>
                            {r.status && (
                              <span style={{ fontSize: '0.7rem', fontWeight: 600, background: r.status === 'Resolved' ? '#10b981' : '#3b82f6', color: '#fff', padding: '2px 6px', borderRadius: '4px', textTransform: 'uppercase' }}>
                                {r.status === 'Resolved' ? 'Selesai' : 'Dalam Proses'}
                              </span>
                            )}
                          </div>
                          <span style={{ color: '#6b7280', fontSize: '0.75rem' }}>{new Date(r.createdAt).toLocaleString('ms-MY')}</span>
                        </div>
                        <p style={{ color: '#374151', fontSize: '0.9rem', margin: 0, whiteSpace: 'pre-wrap', lineHeight: 1.5 }}>{r.message}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ padding: '32px 24px', textAlign: 'center', background: '#f9fafb', borderRadius: 0, border: '1px dashed #e5e7eb' }}>
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

            {/* Feedback */}
            {complaint.feedbackRating && (
              <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                <div style={{ padding: '16px 24px', borderBottom: '1px solid #e5e7eb', background: '#f9fafb' }}>
                  <h3 style={{ fontSize: '0.9rem', color: '#111827', margin: 0, fontWeight: 600 }}>Maklum Balas Pengguna</h3>
                </div>
                <div style={{ padding: '24px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                    <span style={{ color: '#f59e0b', fontSize: '1.2rem', letterSpacing: '2px' }}>{'★'.repeat(complaint.feedbackRating)}{'☆'.repeat(5 - complaint.feedbackRating)}</span>
                    <span style={{ color: '#111827', fontSize: '0.9rem', fontWeight: 600 }}>{complaint.feedbackRating} / 5</span>
                  </div>
                  {complaint.feedbackComment ? (
                    <p style={{ color: '#374151', fontSize: '0.9rem', fontStyle: 'italic', margin: 0, background: '#f9fafb', padding: '12px', borderRadius: 0, border: '1px solid #e5e7eb' }}>"{complaint.feedbackComment}"</p>
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
                  {complaint.submittedBy?.studentId && (
                    <div style={{ color: '#6b7280', fontSize: '0.8rem', marginTop: '2px' }}>No. Pelajar: {complaint.submittedBy.studentId}</div>
                  )}
                  {complaint.submittedBy?.department && (
                    <div style={{ color: '#6b7280', fontSize: '0.8rem', marginTop: '2px' }}>{formatDepartment(complaint.submittedBy.department)}</div>
                  )}
                </div>
                
                <div>
                  <div style={{ fontSize: '0.75rem', color: '#6b7280', marginBottom: '6px', fontWeight: 600, textTransform: 'uppercase' }}>Ditugaskan Kepada</div>
                  {complaint.assignedTo ? (
                    <>
                      <div style={{ color: '#111827', fontSize: '0.9rem', fontWeight: 600, marginBottom: '2px' }}>{complaint.assignedTo.name}</div>
                      <div style={{ color: '#6b7280', fontSize: '0.8rem' }}>{formatDepartment(complaint.assignedTo.department)}</div>
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

                {attachments.length > 0 && (
                  <>
                    <div style={{ height: '1px', background: '#e5e7eb', margin: '4px 0' }} />
                    <div>
                      <div style={{ fontSize: '0.75rem', color: '#6b7280', marginBottom: '6px', fontWeight: 600, textTransform: 'uppercase' }}>Lampiran</div>
                      <div style={{ color: '#374151', fontSize: '0.85rem', fontWeight: 600 }}>{attachments.length} fail dilampirkan</div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>


        {/* Resolve Modal */}
        {showResolveModal && (
          <div className="modal-overlay" onClick={() => setShowResolveModal(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div className="card" onClick={e => e.stopPropagation()} style={{ width: '100%', maxWidth: '420px', padding: 0 }}>
              <div style={{ padding: '20px 24px', borderBottom: '1px solid #e5e7eb', background: '#f9fafb' }}>
                <h2 style={{ fontSize: '1.1rem', color: '#111827', margin: 0, fontWeight: 700 }}>Sahkan Penyelesaian</h2>
              </div>
              <form onSubmit={handleResolveSubmit} style={{ padding: '24px' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', color: '#374151', fontWeight: 600, marginBottom: '8px' }}>Keterangan / Tindakan Penyelesaian</label>
                <textarea 
                  className="form-textarea" 
                  value={resolveMessage} 
                  onChange={e => setResolveMessage(e.target.value)} 
                  placeholder="Sila nyatakan tindakan yang telah diambil..." 
                  style={{ marginBottom: '24px', minHeight: '100px' }} 
                  required
                />
                <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                  <button type="button" onClick={() => setShowResolveModal(false)} className="btn btn-secondary btn-sm">Batal</button>
                  <button type="submit" className="btn btn-primary btn-sm" style={{ background: '#10b981', border: 'none' }}>Sahkan Selesai</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>

      {/* Toast Notification */}
      {toast.show && (
        <div style={{
          position: 'fixed', bottom: 24, right: 24, zIndex: 9999,
          background: toast.type === 'error' ? '#ef4444' : '#10b981',
          color: '#fff', padding: '14px 24px', borderRadius: 0,
          boxShadow: '0 10px 25px -5px rgba(0,0,0,0.2)',
          fontWeight: 600, fontSize: '0.95rem',
          display: 'flex', alignItems: 'center', gap: 10,
          animation: 'slideInRight 0.3s ease-out',
        }}>
          {toast.type === 'error' ? (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
          ) : (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
          )}
          {toast.message}
        </div>
      )}
      <style>{`
        @keyframes slideInRight {
          from { opacity: 0; transform: translateX(40px); }
          to   { opacity: 1; transform: translateX(0); }
        }
      `}</style>
    </>
  );
}
