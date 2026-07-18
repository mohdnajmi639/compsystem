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

function subCategory(title = '') {
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

const COLUMNS = [
  { key: 'bil',          label: 'Bil',               sortable: false },
  { key: 'action',       label: 'Tindakan',           sortable: false },
  { key: 'ticketId',     label: 'ICT Service Ticket', sortable: true  },
  { key: 'dateReport',   label: 'Tarikh Hantar',      sortable: true  },
  { key: 'staffCharge',  label: 'Staff Bertanggungjawab', sortable: true },
  { key: 'staffDuty',    label: 'Staff Bertugas',     sortable: true  },
  { key: 'details',      label: 'Butiran',            sortable: false },
  { key: 'category',     label: 'Kategori',           sortable: true  },
  { key: 'subCategory',  label: 'Sub Kategori',       sortable: true  },
  { key: 'status',       label: 'Status',             sortable: true  },
  { key: 'completeDate', label: 'Tarikh Selesai',     sortable: true  },
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
  const [verifyModal, setVerifyModal] = useState(null);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login?callbackUrl=/aduan/ict/status');
    }
  }, [status, router]);

  useEffect(() => {
    if (status !== 'authenticated') return;
    setLoading(true);
    fetch('/api/complaints?category=ICT')
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
        va = ''; vb = '';
      }
      if (va < vb) return sortDir === 'asc' ? -1 : 1;
      if (va > vb) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });
  }, [filtered, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / perPage));
  const pageRows   = sorted.slice((page - 1) * perPage, page * perPage);

  function SortIcon({ colKey }) {
    if (sortKey !== colKey) return <span style={{ opacity: 0.35, marginLeft: 4 }}>⇅</span>;
    return <span style={{ color: '#7c3aed', marginLeft: 4 }}>{sortDir === 'asc' ? '↑' : '↓'}</span>;
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
              <span className="aduan-breadcrumb-active">Status Aduan ICT</span>
            </div>
            <h1 className="aduan-page-title">Status Aduan ICT</h1>
            <p className="aduan-page-desc">Semak status aduan WiFi, internet &amp; ICT yang telah dikemukakan</p>
          </div>
        </div>

        <div className="aduan-form-wrap">
          {error && <div className="aduan-form-error">{error}</div>}

          {/* Controls bar */}
          <div className="aduan-section">
            <div className="aduan-section-title">
              <span className="aduan-section-num">📋</span>
              Senarai Aduan ICT — {session?.user?.name || 'Pengguna'}
            </div>
            <div className="aduan-section-body" style={{ gap: 12 }}>
              <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <select
                    style={{ padding: '7px 10px', border: '1.5px solid #d1d5db', borderRadius: 4, fontSize: '0.85rem', color: '#374151', background: '#fff', outline: 'none' }}
                    value={perPage}
                    onChange={e => { setPerPage(Number(e.target.value)); setPage(1); }}
                    id="sts-per-page"
                  >
                    {[5, 10, 25, 50, 100].map(n => (
                      <option key={n} value={n}>{n}</option>
                    ))}
                  </select>
                  <span style={{ fontSize: '0.82rem', color: '#6b7280' }}>rekod per halaman</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: '0.82rem', color: '#6b7280' }}>Cari:</span>
                  <input
                    style={{ padding: '7px 12px', border: '1.5px solid #d1d5db', borderRadius: 4, fontSize: '0.85rem', color: '#374151', background: '#fff', outline: 'none', minWidth: 200 }}
                    type="text"
                    placeholder="Search..."
                    value={search}
                    onChange={e => { setSearch(e.target.value); setPage(1); }}
                    id="sts-search"
                  />
                </div>
              </div>

              {/* Table */}
              <div style={{ overflowX: 'auto', width: '100%' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }} id="sts-complaints-table">
                  <thead>
                    <tr style={{ background: '#f5f3ff' }}>
                      {COLUMNS.map(col => (
                        <th
                          key={col.key}
                          onClick={() => col.sortable && handleSort(col.key)}
                          style={{
                            padding: '10px 12px', textAlign: 'left', fontWeight: 700,
                            fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.04em',
                            color: '#374151', borderBottom: '2px solid #e5e7eb',
                            cursor: col.sortable ? 'pointer' : 'default',
                            whiteSpace: 'nowrap', userSelect: 'none',
                          }}
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
                        <td colSpan={COLUMNS.length} style={{ padding: 32, textAlign: 'center' }}>
                          <div className="spinner" style={{ margin: '0 auto' }} />
                        </td>
                      </tr>
                    ) : pageRows.length === 0 ? (
                      <tr>
                        <td colSpan={COLUMNS.length} style={{ padding: 32, textAlign: 'center', color: '#9ca3af', fontSize: '0.88rem' }}>
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
                        <tr key={c._id} style={{ background: idx % 2 === 0 ? '#fff' : '#fafafa', borderBottom: '1px solid #f3f4f6' }}>
                          <td style={{ padding: '9px 12px', textAlign: 'center', color: '#6b7280' }}>{globalIdx}</td>
                          <td style={{ padding: '9px 12px', textAlign: 'center' }}>
                            <button
                              onClick={() => setVerifyModal(c)}
                              id={`sts-verify-${c._id}`}
                              style={{
                                padding: '5px 12px', background: '#7c3aed', color: '#fff',
                                border: 'none', borderRadius: 4, fontSize: '0.75rem', fontWeight: 700,
                                cursor: 'pointer', whiteSpace: 'nowrap',
                              }}
                            >
                              ✓ Verify
                            </button>
                          </td>
                          <td style={{ padding: '9px 12px', color: '#5b21b6', fontWeight: 700, whiteSpace: 'nowrap' }}>
                            {`A${ticketShort}`}
                          </td>
                          <td style={{ padding: '9px 12px', whiteSpace: 'nowrap', color: '#374151' }}>{fmtDate(c.createdAt)}</td>
                          <td style={{ padding: '9px 12px', color: '#374151' }}>{staffCharge}</td>
                          <td style={{ padding: '9px 12px', color: '#374151' }}>{staffDuty}</td>
                          <td style={{ padding: '9px 12px', maxWidth: 200, color: '#374151' }}>
                            <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {c.description || c.title || '—'}
                            </div>
                          </td>
                          <td style={{ padding: '9px 12px', fontSize: '0.75rem', color: '#374151', whiteSpace: 'nowrap' }}>
                            {categoryLabel(c.category, c.title)}
                          </td>
                          <td style={{ padding: '9px 12px', fontSize: '0.75rem', color: '#374151', whiteSpace: 'nowrap' }}>
                            {subCategory(c.title)}
                          </td>
                          <td style={{ padding: '9px 12px', whiteSpace: 'nowrap' }}>
                            <span style={{
                              color: statusColor(c.status), fontWeight: 700,
                              background: statusBg(c.status),
                              padding: '3px 9px', borderRadius: 4, fontSize: '0.75rem',
                            }}>
                              {(c.status || '—').toUpperCase()}
                            </span>
                          </td>
                          <td style={{ padding: '9px 12px', whiteSpace: 'nowrap', color: '#374151' }}>
                            {isResolved ? fmtDate(c.updatedAt) : '—'}
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
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                    id="sts-prev"
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
                            key={p}
                            onClick={() => setPage(p)}
                            id={`sts-page-${p}`}
                            style={{
                              padding: '5px 10px', border: '1px solid', borderRadius: 4,
                              background: page === p ? '#7c3aed' : '#fff',
                              borderColor: page === p ? '#7c3aed' : '#d1d5db',
                              color: page === p ? '#fff' : '#374151',
                              cursor: 'pointer', fontWeight: page === p ? 700 : 400,
                              fontSize: '0.85rem',
                            }}
                          >{p}</button>
                        )
                    )
                  }
                  <button
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    id="sts-next"
                    style={{ padding: '5px 12px', border: '1px solid #d1d5db', borderRadius: 4, background: '#fff', color: '#374151', cursor: page === totalPages ? 'not-allowed' : 'pointer', opacity: page === totalPages ? 0.5 : 1, fontSize: '0.85rem' }}
                  >›</button>
                </div>
              </div>
            </div>
          </div>

          {/* Disclaimer */}
          <div className="aduan-disclaimer">
            <strong>Penafian dan Notis Privasi:</strong>{' '}
            Sistem ini disediakan untuk pengurusan aduan rasmi UiTM. Semua data yang dikemukakan adalah sulit dan hanya untuk kegunaan dalaman universiti.
          </div>
        </div>
      </main>

      <AduanFooter />

      {/* Verify Modal */}
      {verifyModal && (
        <div
          onClick={() => setVerifyModal(null)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{ background: '#fff', borderRadius: 8, padding: 28, maxWidth: 480, width: '90%', boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }}
          >
            <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#1f2937', marginBottom: 16 }}>Verify Complaint</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[
                { label: 'Ticket', value: `A${verifyModal._id?.slice(-12).toUpperCase()}` },
                { label: 'Date', value: fmtDate(verifyModal.createdAt) },
                { label: 'Details', value: verifyModal.description || verifyModal.title || '—' },
              ].map(({ label, value }) => (
                <div key={label} style={{ display: 'flex', gap: 12, fontSize: '0.85rem' }}>
                  <span style={{ minWidth: 80, fontWeight: 700, color: '#374151' }}>{label}</span>
                  <span style={{ color: '#6b7280', flex: 1 }}>{value}</span>
                </div>
              ))}
              <div style={{ display: 'flex', gap: 12, fontSize: '0.85rem' }}>
                <span style={{ minWidth: 80, fontWeight: 700, color: '#374151' }}>Status</span>
                <span style={{ color: statusColor(verifyModal.status), fontWeight: 700 }}>
                  {(verifyModal.status || '—').toUpperCase()}
                </span>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
              <button
                onClick={() => setVerifyModal(null)}
                id="sts-modal-confirm"
                style={{ padding: '9px 24px', background: '#7c3aed', color: '#fff', border: 'none', borderRadius: 4, fontWeight: 700, cursor: 'pointer', fontSize: '0.88rem' }}
              >
                ✓ Confirm
              </button>
              <button
                onClick={() => setVerifyModal(null)}
                id="sts-modal-close"
                style={{ padding: '9px 20px', background: '#fff', color: '#374151', border: '1.5px solid #d1d5db', borderRadius: 4, fontWeight: 600, cursor: 'pointer', fontSize: '0.88rem' }}
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
          <Link href="/panduan" className="lp-nav-link" id="anav-panduan">Panduan</Link>
          <Link href="/faq" className="lp-nav-link" id="anav-faq">Soalan Lazim</Link>
        </div>
        <div className="lp-nav-end">
          {session ? (
            <HomeUserMenu session={session} />
          ) : (
            <Link href="/login?callbackUrl=/aduan/ict/status" className="lp-login-btn" id="anav-login">
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

export default function StatusAduanICTPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><div className="spinner" /></div>}>
      <StatusICTContent />
    </Suspense>
  );
}
