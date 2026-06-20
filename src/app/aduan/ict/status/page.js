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
  if (lower === 'resolved') return '#7c3aed';      // purple like reference
  if (lower === 'in progress') return '#d97706';   // amber
  if (lower === 'pending') return '#2563eb';        // blue
  if (lower === 'rejected') return '#dc2626';       // red
  return '#6b7280';
}

function subCategory(title = '') {
  // Derive a sub-category label from the ICT ticket title
  if (title.toLowerCase().includes('email') || title.toLowerCase().includes('akaun emel')) return 'NEW ACCOUNT';
  if (title.toLowerCase().includes('network')) return 'CONNECTIVITY';
  if (title.toLowerCase().includes('hardware')) return 'DEVICE';
  if (title.toLowerCase().includes('software')) return 'INSTALLATION';
  if (title.toLowerCase().includes('password')) return 'RESET';
  if (title.toLowerCase().includes('portal')) return 'WEB';
  if (title.toLowerCase().includes('print')) return 'PRINTER';
  return 'OTHERS';
}

function categoryLabel(c = '', title = '') {
  if (c === 'ICT') {
    if (title.toLowerCase().includes('email') || title.toLowerCase().includes('akaun emel')) return 'OPERASI - EMEL GOOGLE';
    if (title.toLowerCase().includes('network')) return 'OPERASI - RANGKAIAN';
    if (title.toLowerCase().includes('hardware')) return 'PERKAKASAN';
    if (title.toLowerCase().includes('software')) return 'PERISIAN';
    if (title.toLowerCase().includes('password')) return 'AKAUN - KATA LALUAN';
    return 'OPERASI - AM';
  }
  return c;
}

/* ── columns definition (matches the reference image) ── */
const COLUMNS = [
  { key: 'bil',          label: 'Bil',               sortable: false },
  { key: 'action',       label: 'Action',             sortable: false },
  { key: 'ticketId',     label: 'ICT Service Ticket', sortable: true  },
  { key: 'dateReport',   label: 'Date Report',        sortable: true  },
  { key: 'staffCharge',  label: 'Staff in Charge',    sortable: true  },
  { key: 'staffDuty',    label: 'Staff on Duty',      sortable: true  },
  { key: 'details',      label: 'Details',            sortable: false },
  { key: 'category',     label: 'Category',           sortable: true  },
  { key: 'subCategory',  label: 'Sub Category',       sortable: true  },
  { key: 'status',       label: 'Status',             sortable: true  },
  { key: 'completeDate', label: 'Complete date',      sortable: true  },
];

function StatusICTContent() {
  const router = useRouter();
  const { data: session, status } = useSession();

  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState('');
  const [search, setSearch]         = useState('');
  const [perPage, setPerPage]       = useState(10);
  const [page, setPage]             = useState(1);
  const [sortKey, setSortKey]       = useState('dateReport');
  const [sortDir, setSortDir]       = useState('desc');
  const [verifyModal, setVerifyModal] = useState(null); // complaint being verified

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login?callbackUrl=/aduan/ict/status');
    }
  }, [status, router]);

  /* fetch ICT complaints */
  useEffect(() => {
    if (status !== 'authenticated') return;
    setLoading(true);
    fetch('/api/complaints?category=ICT')
      .then(r => r.json())
      .then(data => {
        setComplaints(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(err => {
        setError('Gagal memuatkan data aduan.');
        setLoading(false);
      });
  }, [status]);

  /* sorting */
  function handleSort(key) {
    if (!key) return;
    if (sortKey === key) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
    setPage(1);
  }

  /* derived rows */
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

  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      let va, vb;
      if (sortKey === 'dateReport') {
        va = new Date(a.createdAt || 0).getTime();
        vb = new Date(b.createdAt || 0).getTime();
      } else if (sortKey === 'completeDate') {
        va = new Date(a.updatedAt || 0).getTime();
        vb = new Date(b.updatedAt || 0).getTime();
      } else if (sortKey === 'status') {
        va = (a.status || '').toLowerCase();
        vb = (b.status || '').toLowerCase();
      } else if (sortKey === 'ticketId') {
        va = (a._id || '').toLowerCase();
        vb = (b._id || '').toLowerCase();
      } else {
        va = '';
        vb = '';
      }
      if (va < vb) return sortDir === 'asc' ? -1 : 1;
      if (va > vb) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });
  }, [filtered, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / perPage));
  const pageRows   = sorted.slice((page - 1) * perPage, page * perPage);

  /* SortIcon */
  function SortIcon({ colKey }) {
    if (sortKey !== colKey) return <span className="sts-sort-icon">⇅</span>;
    return <span className="sts-sort-icon sts-sort-active">{sortDir === 'asc' ? '↑' : '↓'}</span>;
  }

  const userName = session?.user?.name || 'GUEST';

  if (status === 'loading') {
    return (
      <div className="units-shell">
        <div style={{ display:'flex', alignItems:'center', justifyContent:'center', flex:1, minHeight:'100vh' }}>
          <div className="spinner" />
        </div>
      </div>
    );
  }

  return (
    <div className="units-shell">
      <UnitsSidebar active="status" />

      <div className="units-main">
        <UnitsTopbar userName={userName} onSignOut={() => signOut({ callbackUrl: '/' })} />

        <div className="units-content">

          {/* ── Controls bar: records per page + search ── */}
          <div className="sts-controls-row">
            <div className="sts-per-page-wrap">
              <select
                className="sts-per-page-select"
                value={perPage}
                onChange={e => { setPerPage(Number(e.target.value)); setPage(1); }}
                id="sts-per-page"
              >
                {[5, 10, 25, 50, 100].map(n => (
                  <option key={n} value={n}>{n}</option>
                ))}
              </select>
              <span className="sts-per-page-label">records per page</span>
            </div>

            <div className="sts-search-wrap">
              <input
                className="sts-search-input"
                type="text"
                placeholder="Search..."
                value={search}
                onChange={e => { setSearch(e.target.value); setPage(1); }}
                id="sts-search"
              />
            </div>
          </div>

          {/* ── Error ── */}
          {error && <div className="units-form-error">{error}</div>}

          {/* ── Table ── */}
          <div className="sts-table-wrap">
            <table className="sts-table" id="sts-complaints-table">
              <thead>
                <tr>
                  {COLUMNS.map(col => (
                    <th
                      key={col.key}
                      className={`sts-th${col.sortable ? ' sts-th-sortable' : ''}`}
                      onClick={() => col.sortable && handleSort(col.key)}
                    >
                      {col.label}
                      {col.sortable && <SortIcon colKey={col.key} />}
                    </th>
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
                      Tiada rekod dijumpai.
                    </td>
                  </tr>
                ) : pageRows.map((c, idx) => {
                  const globalIdx = (page - 1) * perPage + idx + 1;
                  const staffCharge = c.assignedTo?.name || '—';
                  const staffDuty   = c.assignedTo?.name || '—';
                  const ticketShort = c._id?.slice(-12).toUpperCase() || '—';
                  const isResolved  = c.status === 'Resolved';
                  return (
                    <tr key={c._id} className={`sts-tr${idx % 2 === 0 ? '' : ' sts-tr-alt'}`}>
                      {/* Bil */}
                      <td className="sts-td sts-td-center">{globalIdx}</td>

                      {/* Action */}
                      <td className="sts-td sts-td-center">
                        <button
                          className="sts-verify-btn"
                          onClick={() => setVerifyModal(c)}
                          id={`sts-verify-${c._id}`}
                        >
                          ✓ Verify
                        </button>
                      </td>

                      {/* ICT Service Ticket */}
                      <td className="sts-td sts-td-ticket">
                        {`A${ticketShort}`}
                      </td>

                      {/* Date Report */}
                      <td className="sts-td">{fmtDate(c.createdAt)}</td>

                      {/* Staff in Charge */}
                      <td className="sts-td sts-td-staff">{staffCharge}</td>

                      {/* Staff on Duty */}
                      <td className="sts-td sts-td-staff">{staffDuty}</td>

                      {/* Details */}
                      <td className="sts-td sts-td-details">
                        {c.description || c.title || '—'}
                      </td>

                      {/* Category */}
                      <td className="sts-td sts-td-small">
                        {categoryLabel(c.category, c.title)}
                      </td>

                      {/* Sub Category */}
                      <td className="sts-td sts-td-small">
                        {subCategory(c.title)}
                      </td>

                      {/* Status */}
                      <td className="sts-td sts-td-status">
                        <span style={{ color: statusColor(c.status), fontWeight: 700 }}>
                          {(c.status || '—').toUpperCase()}
                          {isResolved && (
                            <><br /><span style={{ color: '#7c3aed', fontWeight: 700 }}>COMPLETED</span></>
                          )}
                        </span>
                      </td>

                      {/* Complete date */}
                      <td className="sts-td">
                        {isResolved ? fmtDate(c.updatedAt) : '—'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* ── Pagination info + controls ── */}
          <div className="sts-pagination-row">
            <span className="sts-pagination-info">
              {sorted.length === 0
                ? 'Showing 0 entries'
                : `Showing ${(page - 1) * perPage + 1} to ${Math.min(page * perPage, sorted.length)} of ${sorted.length} entries`
              }
            </span>
            <div className="sts-pagination-btns">
              <button
                className="sts-page-btn"
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                id="sts-prev"
              >
                ‹
              </button>
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
                        id={`sts-page-${p}`}
                      >
                        {p}
                      </button>
                    )
                )
              }
              <button
                className="sts-page-btn"
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                id="sts-next"
              >
                ›
              </button>
            </div>
          </div>

        </div>{/* /units-content */}

        <UnitsFooter />
      </div>

      {/* ── Verify Modal ── */}
      {verifyModal && (
        <div className="sts-modal-overlay" onClick={() => setVerifyModal(null)}>
          <div className="sts-modal" onClick={e => e.stopPropagation()}>
            <h3 className="sts-modal-title">Verify Complaint</h3>
            <div className="sts-modal-body">
              <div className="sts-modal-row">
                <span className="sts-modal-label">Ticket</span>
                <span className="sts-modal-value sts-modal-ticket">
                  A{verifyModal._id?.slice(-12).toUpperCase()}
                </span>
              </div>
              <div className="sts-modal-row">
                <span className="sts-modal-label">Date</span>
                <span className="sts-modal-value">{fmtDate(verifyModal.createdAt)}</span>
              </div>
              <div className="sts-modal-row">
                <span className="sts-modal-label">Status</span>
                <span className="sts-modal-value" style={{ color: statusColor(verifyModal.status), fontWeight: 700 }}>
                  {(verifyModal.status || '—').toUpperCase()}
                </span>
              </div>
              <div className="sts-modal-row">
                <span className="sts-modal-label">Details</span>
                <span className="sts-modal-value">{verifyModal.description || verifyModal.title || '—'}</span>
              </div>
            </div>
            <div className="sts-modal-actions">
              <button
                className="sts-verify-btn"
                style={{ padding: '9px 28px' }}
                onClick={() => setVerifyModal(null)}
                id="sts-modal-confirm"
              >
                ✓ Confirm
              </button>
              <button
                className="sts-modal-close-btn"
                onClick={() => setVerifyModal(null)}
                id="sts-modal-close"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ══════════════════════════════════
   Shared UI Components (same as ICT new page)
══════════════════════════════════ */
function UnitsSidebar({ active }) {
  return (
    <aside className="units-sidebar">
      <div className="units-sidebar-logo-area">
        <div className="units-logo-box">
          <svg width="52" height="28" viewBox="0 0 80 40" fill="none">
            <text x="2"  y="30" fontFamily="Arial, sans-serif" fontWeight="900" fontSize="30" fill="white">u</text>
            <text x="20" y="30" fontFamily="Arial, sans-serif" fontWeight="900" fontSize="30" fill="white">n</text>
            <text x="38" y="30" fontFamily="Arial, sans-serif" fontWeight="900" fontSize="30" fill="white" fontStyle="italic">i</text>
            <text x="48" y="30" fontFamily="Arial, sans-serif" fontWeight="900" fontSize="30" fill="#f59e0b">T</text>
            <text x="62" y="30" fontFamily="Arial, sans-serif" fontWeight="900" fontSize="30" fill="#f59e0b">S</text>
          </svg>
          <div className="units-logo-sub">University IT Services</div>
        </div>
      </div>
      <nav className="units-sidebar-nav">
        <Link
          href="/aduan/ict"
          className={`units-sidebar-link${active === 'new' ? ' units-sidebar-link-active' : ''}`}
          id="sidebar-new-aduan"
        >
          New ADUAN ICT
        </Link>
        <Link
          href="/aduan/ict/status"
          className={`units-sidebar-link${active === 'status' ? ' units-sidebar-link-active' : ''}`}
          id="sidebar-status-aduan"
        >
          Status ADUAN ICT
        </Link>
      </nav>
    </aside>
  );
}

function UnitsTopbar({ userName, onSignOut }) {
  const [open, setOpen] = useState(false);
  return (
    <header className="units-topbar">
      <div style={{ flex: 1 }} />
      <div className="units-topbar-user" onClick={() => setOpen(o => !o)} id="topbar-user-menu">
        <div className="units-topbar-avatar">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="8" r="4" />
            <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
          </svg>
        </div>
        <span className="units-topbar-label">
          WELCOME : <strong>{(userName || 'GUEST').toUpperCase().split(' ')[0]}</strong>
        </span>
        <span style={{ fontSize: '0.65rem', marginLeft: 4 }}>▾</span>
        {open && (
          <div className="units-topbar-dropdown">
            <button onClick={onSignOut} className="units-topbar-dropdown-item" id="topbar-logout">
              Log Out
            </button>
          </div>
        )}
      </div>
    </header>
  );
}

function UnitsFooter() {
  return (
    <footer className="units-footer">
      2017 © Pengurusan Sistem Sokongan, Jabatan Infostruktur.
    </footer>
  );
}

/* ── Page Export ── */
export default function StatusAduanICTPage() {
  return (
    <Suspense
      fallback={
        <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center' }}>
          <div className="spinner" />
        </div>
      }
    >
      <StatusICTContent />
    </Suspense>
  );
}
