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

function statusColor(s) {
  if (!s) return '#6b7280';
  const lower = s.toLowerCase();
  if (lower === 'resolved')    return '#7c3aed';
  if (lower === 'in progress') return '#d97706';
  if (lower === 'pending')     return '#2563eb';
  if (lower === 'rejected')    return '#dc2626';
  return '#6b7280';
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

/* ── column definition ── */
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

  /* Extract location from description */
  function extractLocation(desc = '') {
    const m = desc.match(/Kampus:\s*([^|]+)/);
    return m ? m[1].trim() : '—';
  }

  const userName = session?.user?.name || '';

  if (status === 'loading') {
    return (
      <div className="ef-root">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 1, minHeight: '100vh' }}>
          <div className="spinner" />
        </div>
      </div>
    );
  }

  return (
    <div className="ef-root">

      {/* ── Top strip ── */}
      <div className="ef-topstrip" />

      {/* ── Header ── */}
      <header className="ef-header">
        <div className="ef-header-logo">
          <Link href="/" style={{ textDecoration: 'none' }}>
            <div className="ef-logo-box">
              <svg width="52" height="52" viewBox="0 0 60 60" fill="none">
                <rect x="0" y="0" width="60" height="60" fill="#6b0d8a" rx="4" />
                <text x="30" y="22" textAnchor="middle" fontFamily="Georgia, serif" fontWeight="900" fontSize="11" fill="#f5c518">UNIVERSITI</text>
                <text x="30" y="34" textAnchor="middle" fontFamily="Georgia, serif" fontWeight="900" fontSize="9"  fill="white">TEKNOLOGI</text>
                <text x="30" y="46" textAnchor="middle" fontFamily="Georgia, serif" fontWeight="900" fontSize="11" fill="#f5c518">MARA</text>
              </svg>
            </div>
          </Link>
        </div>
        <div className="ef-header-title">
          <h1 className="ef-title">e-Aduan Fasiliti</h1>
          <p className="ef-subtitle">Semak Status Aduan Fasiliti</p>
        </div>
        <div className="ef-header-deco">
          <div className="ef-deco-squares">
            <span className="ef-sq ef-sq-1" /><span className="ef-sq ef-sq-2" />
            <span className="ef-sq ef-sq-3" /><span className="ef-sq ef-sq-4" />
          </div>
          <div className="ef-deco-building">
            <svg width="90" height="70" viewBox="0 0 90 70" fill="none">
              <rect x="10" y="20" width="18" height="50" fill="#d1c4e9" opacity="0.7" />
              <rect x="32" y="10" width="26" height="60" fill="#b39ddb" opacity="0.8" />
              <rect x="62" y="28" width="18" height="42" fill="#d1c4e9" opacity="0.7" />
            </svg>
          </div>
        </div>
      </header>

      {/* ── Purple bar ── */}
      <div className="ef-purplebar" />

      {/* ── Top-right action links ── */}
      <div className="ef2-toplinks">
        <Link href="/aduan/fasiliti" className="ef2-toplink" id="semak-fas-baharu">Aduan Baharu</Link>
        <span className="ef2-toplink-sep">|</span>
        <Link href="/aduan/fasiliti/semak" className="ef2-toplink" style={{ fontWeight: 700 }} id="semak-fas-semak">Semak Aduan</Link>
        <span className="ef2-toplink-sep">|</span>
        <button
          className="ef2-toplink ef2-toplink-btn"
          onClick={() => signOut({ callbackUrl: '/' })}
          id="semak-fas-keluar"
        >
          Keluar
        </button>
      </div>

      {/* ── Main body ── */}
      <main className="ef2-body">

        {/* Controls */}
        <div className="ef2-card" style={{ marginBottom: 16 }}>
          <div className="ef2-card-hdr">
            Senarai Aduan Fasiliti — {userName || 'Pengguna'}
          </div>
          <div style={{ padding: '16px 20px', display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
            <div className="sts-per-page-wrap">
              <select
                className="sts-per-page-select"
                value={perPage}
                onChange={e => { setPerPage(Number(e.target.value)); setPage(1); }}
                id="semak-fas-per-page"
              >
                {[5, 10, 25, 50].map(n => <option key={n} value={n}>{n}</option>)}
              </select>
              <span className="sts-per-page-label">rekod per halaman</span>
            </div>
            <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
              <button
                onClick={() => setSortDir(d => d === 'desc' ? 'asc' : 'desc')}
                style={{
                  padding: '7px 14px', fontSize: '0.8rem', borderRadius: 6,
                  border: '1px solid #d1d5db', background: '#f9fafb', cursor: 'pointer',
                }}
                id="semak-fas-sort"
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
                  id="semak-fas-search"
                />
              </div>
            </div>
          </div>

          {error && <div className="ef2-error" style={{ margin: '0 20px 16px' }}>{error}</div>}

          {/* Table */}
          <div className="sts-table-wrap" style={{ margin: '0 20px 20px' }}>
            <table className="sts-table" id="semak-fas-table">
              <thead>
                <tr>
                  {COLUMNS.map(col => (
                    <th key={col.key} className="sts-th">{col.label}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={COLUMNS.length} className="sts-td sts-td-center">
                      <div className="spinner" style={{ margin: '24px auto' }} />
                    </td>
                  </tr>
                ) : pageRows.length === 0 ? (
                  <tr>
                    <td colSpan={COLUMNS.length} className="sts-td sts-td-center sts-empty">
                      {search ? 'Tiada rekod sepadan.' : 'Tiada aduan fasiliti ditemui.'}
                    </td>
                  </tr>
                ) : pageRows.map((c, idx) => {
                  const globalIdx = (page - 1) * perPage + idx + 1;
                  const isResolved = c.status === 'Resolved';
                  return (
                    <tr key={c._id} className={`sts-tr${idx % 2 === 0 ? '' : ' sts-tr-alt'}`}>
                      <td className="sts-td sts-td-center">{globalIdx}</td>
                      <td className="sts-td">{fmtDate(c.createdAt)}</td>
                      <td className="sts-td" style={{ maxWidth: 220 }}>
                        <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>{c.title}</div>
                      </td>
                      <td className="sts-td" style={{ fontSize: '0.8rem' }}>
                        {extractLocation(c.description)}
                      </td>
                      <td className="sts-td sts-td-status">
                        <span style={{ color: statusColor(c.status), fontWeight: 700 }}>
                          {statusLabel(c.status).toUpperCase()}
                        </span>
                      </td>
                      <td className="sts-td">{isResolved ? fmtDate(c.updatedAt) : '—'}</td>
                      <td className="sts-td sts-td-center">
                        <button
                          className="sts-verify-btn"
                          style={{ padding: '6px 14px', fontSize: '0.78rem' }}
                          onClick={() => setSelected(c)}
                          id={`semak-fas-detail-${c._id}`}
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
          <div className="sts-pagination-row" style={{ padding: '0 20px 16px' }}>
            <span className="sts-pagination-info">
              {sorted.length === 0
                ? 'Tiada rekod'
                : `Menunjukkan ${(page - 1) * perPage + 1} hingga ${Math.min(page * perPage, sorted.length)} daripada ${sorted.length} rekod`
              }
            </span>
            <div className="sts-pagination-btns">
              <button className="sts-page-btn" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} id="semak-fas-prev">‹</button>
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
                        id={`semak-fas-page-${p}`}
                      >
                        {p}
                      </button>
                    )
                )
              }
              <button className="sts-page-btn" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} id="semak-fas-next">›</button>
            </div>
          </div>
        </div>

        {/* Kembali bar */}
        <div className="ef2-kembali-bar">
          <Link href="/" className="ef2-kembali" id="semak-fas-kembali">
            &lt;&lt; Kembali
          </Link>
        </div>

        <div className="ef2-footer-copy">
          HAKCIPTA TERPELIHARA © 2009 PPF dan DFMS, UiTM SHAH ALAM.
        </div>

      </main>

      {/* ── Detail Modal ── */}
      {selected && (
        <div className="sts-modal-overlay" onClick={() => setSelected(null)}>
          <div className="sts-modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 540 }}>
            <h3 className="sts-modal-title">Butiran Aduan Fasiliti</h3>
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
                <span className="sts-modal-value" style={{ color: statusColor(selected.status), fontWeight: 700 }}>
                  {statusLabel(selected.status).toUpperCase()}
                </span>
              </div>
              {selected.description && (
                <div className="sts-modal-row" style={{ alignItems: 'flex-start' }}>
                  <span className="sts-modal-label">Keterangan</span>
                  <span className="sts-modal-value" style={{ whiteSpace: 'pre-wrap', lineHeight: 1.6, fontSize: '0.82rem' }}>{selected.description}</span>
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
              <button className="sts-modal-close-btn" onClick={() => setSelected(null)} id="semak-fas-modal-close">
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default function SemakAduanFasilitiPage() {
  return (
    <Suspense
      fallback={
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#6b0d8a' }}>
          <div className="spinner" />
        </div>
      }
    >
      <SemakFasilitiContent />
    </Suspense>
  );
}
