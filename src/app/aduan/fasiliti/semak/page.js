'use client';
import { useState, useEffect, useMemo, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
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

const COLUMNS = [
  { key: 'bil',          label: 'Bil' },
  { key: 'dateReport',   label: 'Tarikh Hantar' },
  { key: 'title',        label: 'Tajuk Aduan' },
  { key: 'location',     label: 'Lokasi' },
  { key: 'status',       label: 'Status' },
  { key: 'completeDate', label: 'Tarikh Selesai' },
  { key: 'action',       label: 'Tindakan' },
];

function SemakFasilitiContent() {
  const router = useRouter();
  const { data: session, status } = useSession();

  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState('');
  const [search, setSearch]         = useState('');
  const [perPage, setPerPage]       = useState(10);
  const [page, setPage]             = useState(1);
  const [sortDir, setSortDir]       = useState('desc');
  const [selected, setSelected]     = useState(null);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login?callbackUrl=/aduan/fasiliti/semak');
    }
  }, [status, router]);

  useEffect(() => {
    if (status !== 'authenticated') return;
    setLoading(true);
    fetch('/api/complaints?category=Facility')
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

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return complaints.filter(c =>
      !q ||
      (c.title || '').toLowerCase().includes(q) ||
      (c._id || '').toLowerCase().includes(q) ||
      (c.status || '').toLowerCase().includes(q) ||
      (c.description || '').toLowerCase().includes(q)
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

  function extractLocation(desc = '') {
    const m = desc.match(/Kampus:\s*([^|]+)/);
    return m ? m[1].trim() : '—';
  }

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
              <span className="aduan-breadcrumb-active">Semak Aduan Fasiliti</span>
            </div>
            <h1 className="aduan-page-title">Semak Aduan Fasiliti</h1>
            <p className="aduan-page-desc">Semak status aduan elektrik, sivil &amp; fasiliti yang telah dikemukakan</p>
          </div>
        </div>

        <div className="aduan-form-wrap">
          {error && <div className="aduan-form-error">{error}</div>}

          <div className="aduan-section">
            <div className="aduan-section-title">
              <span className="aduan-section-num">📋</span>
              Senarai Aduan Fasiliti — {session?.user?.name || 'Pengguna'}
            </div>
            <div className="aduan-section-body" style={{ gap: 12 }}>

              {/* Controls */}
              <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <select
                    style={{ padding: '7px 10px', border: '1.5px solid #d1d5db', borderRadius: 4, fontSize: '0.85rem', color: '#374151', background: '#fff', outline: 'none' }}
                    value={perPage}
                    onChange={e => { setPerPage(Number(e.target.value)); setPage(1); }}
                    id="semak-fas-per-page"
                  >
                    {[5, 10, 25, 50].map(n => <option key={n} value={n}>{n}</option>)}
                  </select>
                  <span style={{ fontSize: '0.82rem', color: '#6b7280' }}>rekod per halaman</span>
                </div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <button
                    onClick={() => setSortDir(d => d === 'desc' ? 'asc' : 'desc')}
                    id="semak-fas-sort"
                    style={{ padding: '7px 14px', fontSize: '0.8rem', border: '1.5px solid #d1d5db', borderRadius: 4, background: '#fff', color: '#374151', cursor: 'pointer' }}
                  >
                    Tarikh {sortDir === 'desc' ? '↓' : '↑'}
                  </button>
                  <span style={{ fontSize: '0.82rem', color: '#6b7280' }}>Cari:</span>
                  <input
                    style={{ padding: '7px 12px', border: '1.5px solid #d1d5db', borderRadius: 4, fontSize: '0.85rem', color: '#374151', background: '#fff', outline: 'none', minWidth: 180 }}
                    type="text"
                    placeholder="Cari aduan..."
                    value={search}
                    onChange={e => { setSearch(e.target.value); setPage(1); }}
                    id="semak-fas-search"
                  />
                </div>
              </div>

              {/* Table */}
              <div style={{ overflowX: 'auto', width: '100%' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.83rem' }} id="semak-fas-table">
                  <thead>
                    <tr style={{ background: '#f5f3ff' }}>
                      {COLUMNS.map(col => (
                        <th key={col.key} style={{
                          padding: '10px 12px', textAlign: 'left', fontWeight: 700,
                          fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.04em',
                          color: '#374151', borderBottom: '2px solid #e5e7eb', whiteSpace: 'nowrap',
                        }}>
                          {col.label}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr>
                        <td colSpan={COLUMNS.length} style={{ padding: 32, textAlign: 'center' }}>
                          <div className="spinner" style={{ margin: '0 auto' }} />
                        </td>
                      </tr>
                    ) : pageRows.length === 0 ? (
                      <tr>
                        <td colSpan={COLUMNS.length} style={{ padding: 32, textAlign: 'center', color: '#9ca3af', fontSize: '0.88rem' }}>
                          {search ? 'Tiada rekod sepadan.' : 'Tiada aduan fasiliti ditemui.'}
                        </td>
                      </tr>
                    ) : pageRows.map((c, idx) => {
                      const globalIdx = (page - 1) * perPage + idx + 1;
                      const isResolved = c.status === 'Resolved';
                      return (
                        <tr key={c._id} style={{ background: idx % 2 === 0 ? '#fff' : '#fafafa', borderBottom: '1px solid #f3f4f6' }}>
                          <td style={{ padding: '9px 12px', textAlign: 'center', color: '#6b7280' }}>{globalIdx}</td>
                          <td style={{ padding: '9px 12px', whiteSpace: 'nowrap', color: '#374151' }}>{fmtDate(c.createdAt)}</td>
                          <td style={{ padding: '9px 12px', maxWidth: 220 }}>
                            <div style={{ fontWeight: 600, fontSize: '0.85rem', color: '#1f2937' }}>{c.title}</div>
                          </td>
                          <td style={{ padding: '9px 12px', fontSize: '0.8rem', color: '#374151' }}>
                            {extractLocation(c.description)}
                          </td>
                          <td style={{ padding: '9px 12px', whiteSpace: 'nowrap' }}>
                            <span style={{
                              color: statusColor(c.status), fontWeight: 700,
                              background: statusBg(c.status),
                              padding: '3px 9px', borderRadius: 4, fontSize: '0.75rem',
                            }}>
                              {statusLabel(c.status).toUpperCase()}
                            </span>
                          </td>
                          <td style={{ padding: '9px 12px', whiteSpace: 'nowrap', color: '#374151' }}>
                            {isResolved ? fmtDate(c.updatedAt) : '—'}
                          </td>
                          <td style={{ padding: '9px 12px', textAlign: 'center' }}>
                            <button
                              onClick={() => setSelected(c)}
                              id={`semak-fas-detail-${c._id}`}
                              style={{
                                padding: '5px 12px', background: '#7c3aed', color: '#fff',
                                border: 'none', borderRadius: 4, fontSize: '0.75rem', fontWeight: 700,
                                cursor: 'pointer',
                              }}
                            >
                              Lihat
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
                    onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} id="semak-fas-prev"
                    style={{ padding: '5px 12px', border: '1px solid #d1d5db', borderRadius: 4, background: '#fff', color: '#374151', cursor: page === 1 ? 'not-allowed' : 'pointer', opacity: page === 1 ? 0.5 : 1, fontSize: '0.85rem' }}
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
                            key={p} onClick={() => setPage(p)} id={`semak-fas-page-${p}`}
                            style={{
                              padding: '5px 10px', border: '1px solid', borderRadius: 4,
                              background: page === p ? '#7c3aed' : '#fff',
                              borderColor: page === p ? '#7c3aed' : '#d1d5db',
                              color: page === p ? '#fff' : '#374151',
                              cursor: 'pointer', fontWeight: page === p ? 700 : 400, fontSize: '0.85rem',
                            }}
                          >{p}</button>
                        )
                    )
                  }
                  <button
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} id="semak-fas-next"
                    style={{ padding: '5px 12px', border: '1px solid #d1d5db', borderRadius: 4, background: '#fff', color: '#374151', cursor: page === totalPages ? 'not-allowed' : 'pointer', opacity: page === totalPages ? 0.5 : 1, fontSize: '0.85rem' }}
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
            style={{ background: '#fff', borderRadius: 8, padding: 28, maxWidth: 540, width: '90%', boxShadow: '0 20px 60px rgba(0,0,0,0.2)', maxHeight: '85vh', overflowY: 'auto' }}
          >
            <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#1f2937', marginBottom: 16 }}>Butiran Aduan Fasiliti</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[
                { label: 'Tajuk', value: selected.title },
                { label: 'Tarikh Hantar', value: fmtDate(selected.createdAt) },
              ].map(({ label, value }) => (
                <div key={label} style={{ display: 'flex', gap: 12, fontSize: '0.85rem' }}>
                  <span style={{ minWidth: 120, fontWeight: 700, color: '#374151' }}>{label}</span>
                  <span style={{ color: '#6b7280', flex: 1 }}>{value}</span>
                </div>
              ))}
              <div style={{ display: 'flex', gap: 12, fontSize: '0.85rem' }}>
                <span style={{ minWidth: 120, fontWeight: 700, color: '#374151' }}>Status</span>
                <span style={{ color: statusColor(selected.status), fontWeight: 700 }}>
                  {statusLabel(selected.status).toUpperCase()}
                </span>
              </div>
              {selected.description && (
                <div style={{ display: 'flex', gap: 12, fontSize: '0.85rem', alignItems: 'flex-start' }}>
                  <span style={{ minWidth: 120, fontWeight: 700, color: '#374151' }}>Keterangan</span>
                  <span style={{ color: '#6b7280', flex: 1, whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>{selected.description}</span>
                </div>
              )}
            </div>
            {selected.responses && selected.responses.length > 0 && (
              <div style={{ marginTop: 16 }}>
                <div style={{ fontWeight: 700, fontSize: '0.85rem', color: '#374151', marginBottom: 8 }}>Maklum Balas:</div>
                {selected.responses.map((r, i) => (
                  <div key={i} style={{
                    background: '#f5f3ff', borderRadius: 6, padding: '10px 14px',
                    marginBottom: 8, fontSize: '0.85rem', color: '#4a0070',
                  }}>
                    <div style={{ fontWeight: 600, marginBottom: 4 }}>{r.author?.name || 'Pentadbir'} · {fmtDate(r.createdAt)}</div>
                    <div style={{ whiteSpace: 'pre-wrap' }}>{r.message}</div>
                  </div>
                ))}
              </div>
            )}
            <div style={{ marginTop: 20 }}>
              <button
                onClick={() => setSelected(null)}
                id="semak-fas-modal-close"
                style={{ padding: '9px 24px', background: '#7c3aed', color: '#fff', border: 'none', borderRadius: 4, fontWeight: 700, cursor: 'pointer', fontSize: '0.88rem' }}
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function AduanNav({ session }) {
  return (
    <nav className="lp-nav">
      <div className="lp-nav-inner">
        <Link href="/" className="lp-logo" id="aduan-nav-logo">
          <span className="lp-logo-circle">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="#fff" strokeWidth="2"/>
              <circle cx="12" cy="12" r="4" fill="#fff"/>
              <path d="M12 2v4M12 18v4M2 12h4M18 12h4" stroke="#fff" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </span>
          <span className="lp-logo-text">ADUAN</span>
        </Link>
        <div className="lp-nav-links">
          <Link href="/" className="lp-nav-link" id="anav-anjung">Anjung</Link>
          <NavDropdownAduan />
          <NavDropdownSemak />
          <Link href="/#help" className="lp-nav-link" id="anav-panduan">Panduan</Link>
          <Link href="/#faq" className="lp-nav-link" id="anav-faq">Soalan Lazim</Link>
        </div>
        <div className="lp-nav-end">
          {session ? (
            <HomeUserMenu session={session} />
          ) : (
            <Link href="/login?callbackUrl=/aduan/fasiliti/semak" className="lp-login-btn" id="anav-login">
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
        <p className="lp-footer-copy">© Pejabat Komunikasi Strategik, UiTM 2025</p>
      </div>
    </footer>
  );
}

export default function SemakAduanFasilitiPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><div className="spinner" /></div>}>
      <SemakFasilitiContent />
    </Suspense>
  );
}
