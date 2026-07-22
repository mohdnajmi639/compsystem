'use client';
import { useState, useEffect, useMemo, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { NavDropdownAduan, NavDropdownSemak } from '@/components/NavDropdown';
import HomeUserMenu from '@/components/HomeUserMenu';

/* ── helpers ── */
function fmtDate(iso) {
  if (!iso) return '—';
  const d = new Date(iso);
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const yyyy = d.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
}

function statusColor(s) {
  if (!s) return '#6b7280';
  const lower = s.toLowerCase();
  if (lower === 'resolved')    return '#7c3aed';
  if (lower === 'in progress') return '#d97706';
  if (lower === 'pending')     return '#2563eb';
  if (lower === 'rejected')    return '#dc2626';
  return '#6b7280';
}

function statusBg(s) {
  if (!s) return '#f3f4f6';
  const lower = s.toLowerCase();
  if (lower === 'resolved')    return '#f5f3ff';
  if (lower === 'in progress') return '#fffbeb';
  if (lower === 'pending')     return '#eff6ff';
  if (lower === 'rejected')    return '#fef2f2';
  return '#f3f4f6';
}

function statusLabel(s) {
  const map = {
    Resolved:      'Selesai',
    'In Progress': 'Dalam Proses',
    Pending:       'Menunggu',
    Rejected:      'Ditolak',
  };
  return map[s] || s || '—';
}

function SemakUmumContent() {
  const router = useRouter();
  const { data: session, status } = useSession();

  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState('');
  const [search, setSearch]         = useState('');
  const [perPage, setPerPage]       = useState(10);
  const [page, setPage]             = useState(1);
  const [sortDir, setSortDir]       = useState('asc');
  const [selected, setSelected]     = useState(null);
  const [feedbackForm, setFeedbackForm] = useState({ rating: 0, comment: '' });
  const [submittingFeedback, setSubmittingFeedback] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  const showToast = (msg, type = 'success') => {
    setToast({ show: true, message: msg, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3500);
  };

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login?callbackUrl=/aduan/umum/semak');
    }
  }, [status, router]);

  useEffect(() => {
    if (status !== 'authenticated') return;
    setLoading(true);
    fetch('/api/complaints?category=General')
      .then(r => r.json())
      .then(data => {
        setComplaints(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => {
        setError('Gagal memuatkan data aduan.');
        setLoading(false);
      });
  }, [status]);

  const handleFeedbackSubmit = async () => {
    if (feedbackForm.rating === 0) {
      showToast('Sila pilih rating (1-5 bintang).', 'error');
      return;
    }
    setSubmittingFeedback(true);
    try {
      const res = await fetch(`/api/complaints/${selected._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          feedback: { rating: feedbackForm.rating, comment: feedbackForm.comment }
        })
      });
      if (!res.ok) throw new Error('Gagal menghantar maklum balas.');
      const data = await res.json();
      setSelected(data);
      setComplaints(prev => prev.map(c => c._id === data._id ? data : c));
    } catch (err) {
      showToast(err.message, 'error');
    }
    setSubmittingFeedback(false);
  };

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return complaints.filter(c =>
      !q ||
      (c.title || '').toLowerCase().includes(q) ||
      (c._id || '').toLowerCase().includes(q) ||
      (c.status || '').toLowerCase().includes(q)
    );
  }, [complaints, search]);

  const sorted = useMemo(() => (
    [...filtered].sort((a, b) => {
      const va = new Date(a.createdAt || 0).getTime();
      const vb = new Date(b.createdAt || 0).getTime();
      return sortDir === 'desc' ? vb - va : va - vb;
    })
  ), [filtered, sortDir]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / perPage));
  const pageRows   = sorted.slice((page - 1) * perPage, page * perPage);

  if (status === 'loading') {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="spinner" />
      </div>
    );
  }

  return (
    <div className="aduan-root">
      <AduanNav session={session} />

      <main className="aduan-body">
        {/* Page Title Bar */}
        <div className="aduan-page-header">
          <div className="aduan-page-header-inner">
            <div className="aduan-breadcrumb">
              <Link href="/">Anjung</Link>
              <span className="aduan-breadcrumb-sep">›</span>
              <span>Semakan</span>
              <span className="aduan-breadcrumb-sep">›</span>
              <span className="aduan-breadcrumb-active">Semak Aduan Umum</span>
            </div>
            <h1 className="aduan-page-title">Semak Aduan Umum</h1>
            <p className="aduan-page-desc">Senarai aduan umum yang telah anda hantar beserta status semasa.</p>
          </div>
        </div>

        <div className="aduan-form-wrap">
          {error && <div className="aduan-form-error">{error}</div>}

          <div className="aduan-section">
            <div className="aduan-section-title">
              <span className="aduan-section-num">📋</span>
              Senarai Aduan Umum — {session?.user?.name || 'Pengguna'}
            </div>
            <div className="aduan-section-body" style={{ gap: 12 }}>

              {/* Controls */}
              <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <select
                    style={{ padding: '7px 10px', border: '1.5px solid #d1d5db', borderRadius: 0, fontSize: '0.85rem', color: '#111827', background: '#ffffff', outline: 'none' }}
                    value={perPage}
                    onChange={e => { setPerPage(Number(e.target.value)); setPage(1); }}
                    id="semak-umum-per-page"
                  >
                    {[5, 10, 25, 50].map(n => <option key={n} value={n}>{n}</option>)}
                  </select>
                  <span style={{ fontSize: '0.82rem', color: '#6b7280' }}>rekod per halaman</span>
                </div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <button
                    onClick={() => setSortDir(d => d === 'desc' ? 'asc' : 'desc')}
                    id="semak-umum-sort"
                    style={{ padding: '7px 14px', fontSize: '0.8rem', border: '1.5px solid #d1d5db', borderRadius: 0, background: '#ffffff', color: '#111827', cursor: 'pointer' }}
                  >
                    Tarikh {sortDir === 'desc' ? '↓' : '↑'}
                  </button>
                  <span style={{ fontSize: '0.82rem', color: '#6b7280' }}>Cari:</span>
                  <input
                    style={{ padding: '7px 12px', border: '1.5px solid #d1d5db', borderRadius: 0, fontSize: '0.85rem', color: '#111827', background: '#ffffff', outline: 'none', minWidth: 180 }}
                    type="text"
                    placeholder="Cari aduan..."
                    value={search}
                    onChange={e => { setSearch(e.target.value); setPage(1); }}
                    id="semak-umum-search"
                  />
                </div>
              </div>

              {/* Table */}
              <div className="glass-table-container">
                <table className="glass-table" id="semak-umum-table">
                  <thead>
                    <tr>
                      {['Bil', 'Tarikh Hantar', 'Tajuk Aduan', 'Status', 'Tarikh Selesai', 'Tindakan'].map(label => (
                        <th key={label} style={{
                          padding: '10px 12px', textAlign: 'left', fontWeight: 700,
                          fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.04em',
                          color: '#111827', borderBottom: '2px solid #e5e7eb', whiteSpace: 'nowrap',
                        }}>
                          {label}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr>
                        <td colSpan={6} style={{ padding: 32, textAlign: 'center' }}>
                          <div className="spinner" style={{ margin: '0 auto' }} />
                        </td>
                      </tr>
                    ) : pageRows.length === 0 ? (
                      <tr>
                        <td colSpan={6} style={{ padding: 32, textAlign: 'center', color: '#6b7280', fontSize: '0.88rem' }}>
                          {search ? 'Tiada rekod sepadan dengan carian.' : 'Tiada aduan umum ditemui.'}
                        </td>
                      </tr>
                    ) : pageRows.map((c, idx) => {
                      const globalIdx = sortDir === 'desc' ? sorted.length - ((page - 1) * perPage + idx) : (page - 1) * perPage + idx + 1;
                      const isResolved = c.status === 'Resolved';
                      return (
                        <tr key={c._id}>
                          <td style={{ padding: '9px 12px', textAlign: 'center', color: '#6b7280' }}>{globalIdx}</td>
                          <td style={{ padding: '9px 12px', whiteSpace: 'nowrap', color: '#111827' }}>{fmtDate(c.createdAt)}</td>
                          <td style={{ padding: '9px 12px', maxWidth: 280 }}>
                            <div style={{ fontWeight: 600, fontSize: '0.85rem', color: '#111827', marginBottom: 2 }}>{c.title}</div>
                            {c.description && (
                              <div style={{ fontSize: '0.75rem', color: '#6b7280', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 260 }}>
                                {c.description}
                              </div>
                            )}
                          </td>
                          <td style={{ padding: '9px 12px', textAlign: 'center' }}>
                            <span style={{
                              color: statusColor(c.status), fontWeight: 700,
                              background: statusBg(c.status),
                              padding: '3px 9px', borderRadius: 0, fontSize: '0.75rem', whiteSpace: 'nowrap',
                            }}>
                              {statusLabel(c.status).toUpperCase()}
                            </span>
                          </td>
                          <td style={{ padding: '9px 12px', whiteSpace: 'nowrap', color: '#111827' }}>
                            {isResolved ? fmtDate(c.updatedAt) : '—'}
                          </td>
                          <td style={{ padding: '9px 12px', textAlign: 'center' }}>
                            <button
                              onClick={() => { setSelected(c); setFeedbackForm({ rating: 0, comment: '' }); }}
                              id={`semak-umum-detail-${c._id}`}
                              className="glass-btn glass-btn-primary"
                              style={{ padding: '5px 12px', fontSize: '0.75rem' }}
                            >
                              {(isResolved && !c.feedbackRating) ? 'Sahkan' : 'Lihat'}
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8, paddingTop: 4 }}>
                <span style={{ fontSize: '0.82rem', color: '#6b7280' }}>
                  {sorted.length === 0
                    ? 'Tiada rekod'
                    : `Menunjukkan ${(page - 1) * perPage + 1} hingga ${Math.min(page * perPage, sorted.length)} daripada ${sorted.length} rekod`
                  }
                </span>
                <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                  <button
                    onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} id="semak-umum-prev"
                    style={{ padding: '5px 12px', border: '1px solid #d1d5db', borderRadius: 0, background: '#ffffff', color: '#111827', cursor: page === 1 ? 'not-allowed' : 'pointer', opacity: page === 1 ? 0.5 : 1, fontSize: '0.85rem' }}
                  >‹</button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter(p => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
                    .reduce((acc, p, i, arr) => {
                      if (i > 0 && p - arr[i - 1] > 1) acc.push('...');
                      acc.push(p);
                      return acc;
                    }, [])
                    .map((p, i) =>
                      p === '...'
                        ? <span key={`e-${i}`} style={{ padding: '5px 8px', color: '#6b7280' }}>…</span>
                        : (
                          <button
                            key={p} onClick={() => setPage(p)} id={`semak-umum-page-${p}`}
                            style={{
                              padding: '5px 10px', border: '1px solid', borderRadius: 0,
                              background: page === p ? '#7c3aed' : '#fff',
                              borderColor: page === p ? '#7c3aed' : '#d1d5db',
                              color: page === p ? '#ffffff' : '#111827',
                              cursor: 'pointer', fontWeight: page === p ? 700 : 400, fontSize: '0.85rem',
                            }}
                          >{p}</button>
                        )
                    )
                  }
                  <button
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} id="semak-umum-next"
                    style={{ padding: '5px 12px', border: '1px solid #d1d5db', borderRadius: 0, background: '#ffffff', color: '#111827', cursor: page === totalPages ? 'not-allowed' : 'pointer', opacity: page === totalPages ? 0.5 : 1, fontSize: '0.85rem' }}
                  >›</button>
                </div>
              </div>

            </div>
          </div>

          <div className="aduan-disclaimer">
            <strong>Penafian dan Notis Privasi:</strong>{' '}
            Sistem ini disediakan untuk pengurusan aduan rasmi UiTM. Semua data yang dikemukakan adalah sulit dan hanya untuk kegunaan dalaman universiti.
          </div>
        </div>
      </main>

      <AduanFooter />

      {/* Detail Modal */}
      {selected && (
        <div
          onClick={() => setSelected(null)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{ background: '#ffffff', borderRadius: 0, padding: 28, maxWidth: 520, width: '90%', boxShadow: '0 20px 60px rgba(0,0,0,0.2)', maxHeight: '85vh', overflowY: 'auto' }}
          >
            <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#1f2937', marginBottom: 16 }}>Butiran Aduan</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[
                { label: 'Tajuk', value: selected.title },
                { label: 'Tarikh Hantar', value: fmtDate(selected.createdAt) },
              ].map(({ label, value }) => (
                <div key={label} style={{ display: 'flex', gap: 12, fontSize: '0.85rem' }}>
                  <span style={{ minWidth: 120, fontWeight: 700, color: '#1f2937' }}>{label}</span>
                  <span style={{ color: '#4b5563', flex: 1 }}>{value}</span>
                </div>
              ))}
              <div style={{ display: 'flex', gap: 12, fontSize: '0.85rem' }}>
                <span style={{ minWidth: 120, fontWeight: 700, color: '#1f2937' }}>Status</span>
                <span style={{
                  color: statusColor(selected.status), fontWeight: 700,
                  background: statusBg(selected.status),
                  padding: '2px 9px', borderRadius: 0, fontSize: '0.75rem',
                }}>
                  {statusLabel(selected.status).toUpperCase()}
                </span>
              </div>
              {selected.description && (
                <div style={{ display: 'flex', gap: 12, fontSize: '0.85rem', alignItems: 'flex-start' }}>
                  <span style={{ minWidth: 120, fontWeight: 700, color: '#1f2937' }}>Keterangan</span>
                  <span style={{ color: '#4b5563', flex: 1, whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>{selected.description}</span>
                </div>
              )}
              {selected.attachments && selected.attachments.length > 0 && (
                <div style={{ display: 'flex', gap: 12, fontSize: '0.85rem', alignItems: 'flex-start', marginTop: 4 }}>
                  <span style={{ minWidth: 120, fontWeight: 700, color: '#1f2937' }}>Lampiran</span>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6, flex: 1 }}>
                    {selected.attachments.map((url, i) => {
                      const isImage = /\.(jpg|jpeg|png|gif|webp|bmp|svg)$/i.test(url);
                      return (
                        <a key={i} href={url} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none', color: '#7c3aed', fontWeight: 600, background: '#f3f4f6', padding: '6px 10px', borderRadius: 0 }}>
                          {isImage ? '🖼️' : '📎'} {url.split('/').pop()}
                        </a>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
            {selected.responses && selected.responses.length > 0 && (
              <div style={{ marginTop: 16 }}>
                <div style={{ fontWeight: 700, fontSize: '0.85rem', color: '#1f2937', marginBottom: 8 }}>Maklum Balas:</div>
                {selected.responses.map((r, i) => (
                  <div key={i} style={{
                    background: '#ffffff', borderRadius: 0, padding: '10px 14px',
                    marginBottom: 8, fontSize: '0.85rem', color: '#4a0070',
                  }}>
                    <div style={{ fontWeight: 600, marginBottom: 4 }}>{r.author?.name || 'Pentadbir'} · {fmtDate(r.createdAt)}</div>
                    <div style={{ whiteSpace: 'pre-wrap' }}>{r.message}</div>
                  </div>
                ))}
              </div>
            )}
            
            {/* Feedback Section */}
            {selected.status === 'Resolved' && (
              <div style={{ marginTop: 20, padding: 16, border: '1px solid #e5e7eb', background: '#f9fafb' }}>
                <h4 style={{ margin: '0 0 12px 0', fontSize: '0.9rem', color: '#1f2937' }}>Pengesahan & Penilaian Pemohon</h4>
                
                {selected.feedbackRating ? (
                  <div style={{ fontSize: '0.85rem' }}>
                    <div style={{ display: 'flex', gap: 4, marginBottom: 8 }}>
                      {[1, 2, 3, 4, 5].map(star => (
                        <span key={star} style={{ color: star <= selected.feedbackRating ? '#f59e0b' : '#d1d5db', fontSize: '1.2rem' }}>★</span>
                      ))}
                    </div>
                    {selected.feedbackComment && (
                      <div style={{ color: '#4b5563', whiteSpace: 'pre-wrap' }}>"{selected.feedbackComment}"</div>
                    )}
                  </div>
                ) : (
                  <div>
                    <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
                      {[1, 2, 3, 4, 5].map(star => (
                        <span
                          key={star}
                          onClick={() => setFeedbackForm({ ...feedbackForm, rating: star })}
                          style={{ color: star <= feedbackForm.rating ? '#f59e0b' : '#d1d5db', fontSize: '1.5rem', cursor: 'pointer' }}
                        >
                          ★
                        </span>
                      ))}
                    </div>
                    <textarea
                      value={feedbackForm.comment}
                      onChange={e => setFeedbackForm({ ...feedbackForm, comment: e.target.value })}
                      placeholder="Sila masukkan ulasan anda (pilihan)..."
                      style={{ width: '100%', padding: '8px 12px', borderRadius: 0, border: '1px solid #d1d5db', fontSize: '0.85rem', minHeight: 60, marginBottom: 12 }}
                    />
                    <button
                      onClick={handleFeedbackSubmit}
                      disabled={submittingFeedback}
                      style={{ padding: '6px 16px', background: '#16a34a', color: '#fff', border: 'none', borderRadius: 0, fontWeight: 700, cursor: 'pointer', fontSize: '0.85rem' }}
                    >
                      {submittingFeedback ? 'Menghantar...' : 'Sahkan & Hantar'}
                    </button>
                  </div>
                )}
              </div>
            )}

            <div style={{ marginTop: 20 }}>
              <button
                onClick={() => setSelected(null)}
                id="semak-umum-modal-close"
                style={{ padding: '9px 24px', background: '#7c3aed', color: '#fff', border: 'none', borderRadius: 0, fontWeight: 700, cursor: 'pointer', fontSize: '0.88rem' }}
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

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
    </div>
  );
}

function AduanNav({ session }) {
  return (
    <nav className="lp-nav">
      <div className="lp-nav-inner">
        <Link href="/" className="lp-logo" id="aduan-nav-logo">
          <img src="/images/logo aduan2.png" alt="Aduan Logo" style={{height: 32, width: 'auto'}} />
        </Link>
        <div className="lp-nav-links">
          <Link href="/" className="lp-nav-link" id="anav-anjung">Anjung</Link>
          <NavDropdownAduan />
          <NavDropdownSemak />
          <Link href="/panduan" className="lp-nav-link" id="anav-panduan">Panduan</Link>
          <Link href="/faq" className="lp-nav-link" id="anav-faq">Soalan Lazim</Link>
        </div>
        <div className="lp-nav-end">
          {session ? (
            <HomeUserMenu session={session} />
          ) : (
            <Link href="/login?callbackUrl=/aduan/umum/semak" className="lp-login-btn" id="anav-login">
              Log Masuk
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}

function AduanFooter() {
  return (
    <footer className="lp-footer">
      <div className="lp-footer-inner">
        <p className="lp-footer-text">
          <strong>Penafian dan Notis Privasi:</strong>{' '}
          Sistem ini disediakan untuk pengurusan aduan rasmi UiTM. Semua data yang dikemukakan adalah sulit dan hanya untuk kegunaan dalaman universiti.
        </p>
        <p className="lp-footer-copy">© Pejabat Komunikasi Strategik, UiTM 2026</p>
      </div>
    </footer>
  );
}

export default function SemakAduanUmumPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><div className="spinner" /></div>}>
      <SemakUmumContent />
    </Suspense>
  );
}
