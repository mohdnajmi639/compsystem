'use client';
import { useState, useEffect, useMemo, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';

/* ── helpers ── */
function fmtDate(iso) {
  if (!iso) return '—';
  const d = new Date(iso);
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const yyyy = d.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
}

function statusBadge(s) {
  const styles = {
    Resolved:    { bg: '#f3e8ff', color: '#7c3aed', label: 'Selesai' },
    'In Progress': { bg: '#fef3c7', color: '#d97706', label: 'Dalam Proses' },
    Pending:     { bg: '#dbeafe', color: '#2563eb', label: 'Menunggu' },
    Rejected:    { bg: '#fee2e2', color: '#dc2626', label: 'Ditolak' },
  };
  const style = styles[s] || { bg: '#f3f4f6', color: '#6b7280', label: s || '—' };
  return (
    <span style={{
      background: style.bg,
      color: style.color,
      fontWeight: 700,
      fontSize: '0.75rem',
      padding: '3px 10px',
      borderRadius: 99,
      whiteSpace: 'nowrap',
    }}>
      {style.label}
    </span>
  );
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
  const [sortDir, setSortDir]       = useState('desc');
  const [selected, setSelected]     = useState(null); // detail modal

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

  const userName = session?.user?.name || '';

  if (status === 'loading') {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="spinner" />
      </div>
    );
  }

  return (
    <div className="aduan-root">

      {/* ── Navbar (same style as Aduan Umum) ── */}
      <nav className="lp-nav">
        <div className="lp-nav-inner">
          <Link href="/" className="lp-logo" id="semak-nav-logo">
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
            <Link href="/" className="lp-nav-link" id="semak-nav-anjung">Anjung</Link>
            <Link href="/aduan/umum" className="lp-nav-link" id="semak-nav-new">Aduan Baharu</Link>
            <Link href="/aduan/umum/semak" className="lp-nav-link lp-nav-active" id="semak-nav-semak">Semakan</Link>
            <Link href="/#help" className="lp-nav-link" id="semak-nav-panduan">Panduan</Link>
            <Link href="/#faq" className="lp-nav-link" id="semak-nav-faq">Soalan Lazim</Link>
          </div>
          <div className="lp-nav-end">
            <div className="lp-lang-group">
              <button className="lp-lang-active" id="semak-lang-my">🇲🇾</button>
              <button className="lp-lang-btn" id="semak-lang-en">🇬🇧</button>
            </div>
            {session ? (
              <div className="aduan-nav-user">
                <span className="aduan-nav-username">{userName.split(' ')[0]}</span>
                <button
                  className="lp-login-btn"
                  onClick={() => signOut({ callbackUrl: '/' })}
                  id="semak-logout"
                >
                  Log Keluar
                </button>
              </div>
            ) : (
              <Link href="/login?callbackUrl=/aduan/umum/semak" className="lp-login-btn" id="semak-login">
                Log Masuk
              </Link>
            )}
          </div>
        </div>
      </nav>

      {/* ── Page Header ── */}
      <div className="aduan-page-header">
        <div className="aduan-page-header-inner">
          <div className="aduan-breadcrumb">
            <Link href="/">Anjung</Link>
            <span className="aduan-breadcrumb-sep">›</span>
            <span className="aduan-breadcrumb-active">Semak Aduan Umum</span>
          </div>
          <h1 className="aduan-page-title">Semak Aduan Umum</h1>
          <p className="aduan-page-desc">Senarai aduan umum yang telah anda hantar beserta status semasa.</p>
        </div>
      </div>

      {/* ── Main Body ── */}
      <main className="aduan-body" style={{ paddingTop: 0 }}>
        <div className="aduan-form-wrap" style={{ maxWidth: '100%', padding: '24px 32px' }}>

          {/* Controls */}
          <div className="sts-controls-row">
            <div className="sts-per-page-wrap">
              <select
                className="sts-per-page-select"
                value={perPage}
                onChange={e => { setPerPage(Number(e.target.value)); setPage(1); }}
                id="semak-umum-per-page"
              >
                {[5, 10, 25, 50].map(n => <option key={n} value={n}>{n}</option>)}
              </select>
              <span className="sts-per-page-label">rekod per halaman</span>
            </div>
            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
              <button
                onClick={() => setSortDir(d => d === 'desc' ? 'asc' : 'desc')}
                style={{
                  padding: '7px 14px', fontSize: '0.8rem', borderRadius: 6,
                  border: '1px solid #d1d5db', background: '#f9fafb', cursor: 'pointer',
                }}
                id="semak-umum-sort"
              >
                Tarikh {sortDir === 'desc' ? '↓' : '↑'}
              </button>
              <div className="sts-search-wrap">
                <input
                  className="sts-search-input"
                  type="text"
                  placeholder="Cari aduan..."
                  value={search}
                  onChange={e => { setSearch(e.target.value); setPage(1); }}
                  id="semak-umum-search"
                />
              </div>
            </div>
          </div>

          {error && <div className="aduan-form-error">{error}</div>}

          {/* Table */}
          <div className="sts-table-wrap" style={{ marginTop: 16 }}>
            <table className="sts-table" id="semak-umum-table">
              <thead>
                <tr>
                  <th className="sts-th">Bil</th>
                  <th className="sts-th">Tarikh Hantar</th>
                  <th className="sts-th">Tajuk Aduan</th>
                  <th className="sts-th">Status</th>
                  <th className="sts-th">Tarikh Selesai</th>
                  <th className="sts-th">Tindakan</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={6} className="sts-td sts-td-center">
                      <div className="spinner" style={{ margin: '24px auto' }} />
                    </td>
                  </tr>
                ) : pageRows.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="sts-td sts-td-center sts-empty">
                      {search ? 'Tiada rekod sepadan dengan carian.' : 'Tiada aduan umum ditemui.'}
                    </td>
                  </tr>
                ) : pageRows.map((c, idx) => {
                  const globalIdx = (page - 1) * perPage + idx + 1;
                  const isResolved = c.status === 'Resolved';
                  return (
                    <tr key={c._id} className={`sts-tr${idx % 2 === 0 ? '' : ' sts-tr-alt'}`}>
                      <td className="sts-td sts-td-center">{globalIdx}</td>
                      <td className="sts-td">{fmtDate(c.createdAt)}</td>
                      <td className="sts-td" style={{ maxWidth: 280 }}>
                        <div style={{ fontWeight: 600, fontSize: '0.85rem', marginBottom: 2 }}>{c.title}</div>
                        {c.description && (
                          <div style={{ fontSize: '0.75rem', color: '#6b7280', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 260 }}>
                            {c.description}
                          </div>
                        )}
                      </td>
                      <td className="sts-td sts-td-center">{statusBadge(c.status)}</td>
                      <td className="sts-td">{isResolved ? fmtDate(c.updatedAt) : '—'}</td>
                      <td className="sts-td sts-td-center">
                        <button
                          className="sts-verify-btn"
                          style={{ padding: '6px 14px', fontSize: '0.78rem' }}
                          onClick={() => setSelected(c)}
                          id={`semak-umum-detail-${c._id}`}
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
          <div className="sts-pagination-row">
            <span className="sts-pagination-info">
              {sorted.length === 0
                ? 'Tiada rekod'
                : `Menunjukkan ${(page - 1) * perPage + 1} hingga ${Math.min(page * perPage, sorted.length)} daripada ${sorted.length} rekod`
              }
            </span>
            <div className="sts-pagination-btns">
              <button className="sts-page-btn" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} id="semak-umum-prev">‹</button>
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter(p => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
                .reduce((acc, p, i, arr) => {
                  if (i > 0 && p - arr[i - 1] > 1) acc.push('...');
                  acc.push(p);
                  return acc;
                }, [])
                .map((p, i) =>
                  p === '...'
                    ? <span key={`ellipsis-${i}`} className="sts-page-ellipsis">…</span>
                    : (
                      <button
                        key={p}
                        className={`sts-page-btn${page === p ? ' sts-page-active' : ''}`}
                        onClick={() => setPage(p)}
                        id={`semak-umum-page-${p}`}
                      >
                        {p}
                      </button>
                    )
                )
              }
              <button className="sts-page-btn" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} id="semak-umum-next">›</button>
            </div>
          </div>

        </div>
      </main>

      {/* ── Detail Modal ── */}
      {selected && (
        <div className="sts-modal-overlay" onClick={() => setSelected(null)}>
          <div className="sts-modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 520 }}>
            <h3 className="sts-modal-title">Butiran Aduan</h3>
            <div className="sts-modal-body">
              <div className="sts-modal-row">
                <span className="sts-modal-label">Tajuk</span>
                <span className="sts-modal-value" style={{ fontWeight: 600 }}>{selected.title}</span>
              </div>
              <div className="sts-modal-row">
                <span className="sts-modal-label">Tarikh Hantar</span>
                <span className="sts-modal-value">{fmtDate(selected.createdAt)}</span>
              </div>
              <div className="sts-modal-row">
                <span className="sts-modal-label">Status</span>
                <span className="sts-modal-value">{statusBadge(selected.status)}</span>
              </div>
              {selected.description && (
                <div className="sts-modal-row" style={{ alignItems: 'flex-start' }}>
                  <span className="sts-modal-label">Keterangan</span>
                  <span className="sts-modal-value" style={{ whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>{selected.description}</span>
                </div>
              )}
              {selected.responses && selected.responses.length > 0 && (
                <div style={{ marginTop: 16 }}>
                  <div style={{ fontWeight: 700, fontSize: '0.85rem', color: '#374151', marginBottom: 8 }}>Maklum Balas:</div>
                  {selected.responses.map((r, i) => (
                    <div key={i} style={{
                      background: '#f3e8ff', borderRadius: 8, padding: '10px 14px',
                      marginBottom: 8, fontSize: '0.85rem', color: '#4a0070'
                    }}>
                      <div style={{ fontWeight: 600, marginBottom: 4 }}>{r.author?.name || 'Pentadbir'} · {fmtDate(r.createdAt)}</div>
                      <div style={{ whiteSpace: 'pre-wrap' }}>{r.message}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="sts-modal-actions">
              <button className="sts-modal-close-btn" onClick={() => setSelected(null)} id="semak-umum-modal-close">
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Footer ── */}
      <footer className="lp-footer">
        <div className="lp-footer-inner">
          <p className="lp-footer-text">
            <strong>Penafian dan Notis Privasi:</strong>{' '}
            Sistem ini disediakan untuk pengurusan aduan rasmi UiTM. Semua data yang dikemukakan adalah sulit dan hanya untuk kegunaan dalaman universiti.
          </p>
          <p className="lp-footer-copy">© Pejabat Komunikasi Strategik, UiTM 2025</p>
        </div>
      </footer>

    </div>
  );
}

export default function SemakAduanUmumPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><div className="spinner" /></div>}>
      <SemakUmumContent />
    </Suspense>
  );
}
