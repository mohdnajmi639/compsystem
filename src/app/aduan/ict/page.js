'use client';
import { useState, useEffect, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';

/* ── Ticket ID generator ── */
function generateTicketId() {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  const rand = Math.floor(Math.random() * 9000 + 1000);
  return `A${y}${m}${d}${rand}`;
}

const CAMPUS_OPTIONS = [
  '-CHOOSE CAMPUS-',
  'UiTM Shah Alam',
  'UiTM Kampus Puncak Perdana',
  'UiTM Kampus Puncak Alam',
  'UiTM Kampus Dengkil',
  'UiTM Kampus Arau',
  'UiTM Kampus Kota Bharu',
  'UiTM Kampus Kuantan',
  'UiTM Kampus Dungun',
  'UiTM Kampus Johor Bahru',
  'UiTM Kampus Alor Gajah',
];

const CATEGORY_OPTIONS = [
  '-CHOOSE CATEGORY-',
  'Network / Internet',
  'Email / Microsoft 365',
  'Hardware / Equipment',
  'Software / Application',
  'Account / Password',
  'Portal / Website',
  'Printing',
  'Others',
];

function AduanICTForm() {
  const router = useRouter();
  const { data: session, status } = useSession();

  const [ticketId] = useState(generateTicketId);
  const [form, setForm] = useState({
    branch: '-CHOOSE CAMPUS-',
    locationDetail: '',
    category: '-CHOOSE CATEGORY-',
    details: '',
    alternateEmail: '',
    handphone: '',
  });
  const [attachment, setAttachment] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login?callbackUrl=/aduan/ict');
    }
  }, [status, router]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const allowed = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/gif', 'image/png'];
    if (!allowed.includes(file.type)) {
      setError('Format tidak dibenarkan. Sila pilih fail PDF atau Imej (jpeg, jpg, gif, png).');
      e.target.value = '';
      return;
    }
    if (file.size > 1 * 1024 * 1024) {
      setError('Saiz fail melebihi 1MB. Sila pilih fail yang lebih kecil.');
      e.target.value = '';
      return;
    }
    setError('');
    setAttachment(file);
  };

  const handleRemoveAttachment = () => {
    setAttachment(null);
    const input = document.getElementById('ict-attachment-input');
    if (input) input.value = '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.branch === '-CHOOSE CAMPUS-') {
      setError('Sila pilih kampus (Branch).');
      return;
    }
    if (form.category === '-CHOOSE CATEGORY-') {
      setError('Sila pilih kategori.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/complaints', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: `[ICT] ${form.category} — ${form.branch}`,
          description: form.details,
          category: 'ICT',
          priority: 'Medium',
          attachments: [],
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setSubmitted(true);
    } catch (err) {
      setError(err.message || 'Gagal menghantar aduan. Sila cuba lagi.');
    }
    setLoading(false);
  };

  const handleReset = () => {
    setForm({
      branch: '-CHOOSE CAMPUS-',
      locationDetail: '',
      category: '-CHOOSE CATEGORY-',
      details: '',
      alternateEmail: '',
      handphone: '',
    });
    setAttachment(null);
    setError('');
    const input = document.getElementById('ict-attachment-input');
    if (input) input.value = '';
  };

  if (status === 'loading') {
    return (
      <div className="units-shell">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 1, minHeight: '100vh' }}>
          <div className="spinner" />
        </div>
      </div>
    );
  }

  const userName = session?.user?.name || 'USER';
  const userFirstName = userName.split(' ')[0];

  if (submitted) {
    return (
      <div className="units-shell">
        <UnitsSidebar active="new" />
        <div className="units-main">
          <UnitsTopbar userName={userName} onSignOut={() => signOut({ callbackUrl: '/' })} />
          <div className="units-content">
            <div className="units-success-box">
              <div className="units-success-icon">✓</div>
              <h2 className="units-success-title">Aduan Berjaya Dihantar!</h2>
              <p className="units-success-text">
                Aduan ICT anda telah diterima. No. Tiket: <strong style={{ color: '#d97706' }}>{ticketId}</strong>
                <br />Anda akan menerima maklum balas melalui e-mel dalam masa 3–5 hari bekerja.
              </p>
              <div className="units-success-actions">
                <button
                  className="units-btn-green"
                  onClick={() => { setSubmitted(false); handleReset(); }}
                >
                  New ADUAN ICT
                </button>
                <Link href="/aduan/ict/status" className="units-btn-outline">
                  Status ADUAN ICT
                </Link>
              </div>
            </div>
          </div>
          <UnitsFooter />
        </div>
      </div>
    );
  }

  return (
    <div className="units-shell">
      {/* Left Sidebar */}
      <UnitsSidebar active="new" />

      {/* Main Area */}
      <div className="units-main">
        {/* Top Bar */}
        <UnitsTopbar userName={userName} onSignOut={() => signOut({ callbackUrl: '/' })} />

        {/* Scrollable Content */}
        <div className="units-content">
          {error && <div className="units-form-error">{error}</div>}

          <form onSubmit={handleSubmit} noValidate>

            {/* ── Ticket ID + User Type ── */}
            <div className="units-ticket-row">
              <div className="units-ticket-cell">
                <span className="units-ticket-label">Ticket ID :</span>
                <span className="units-ticket-value">{ticketId}</span>
              </div>
              <div className="units-ticket-cell">
                <span className="units-ticket-label">User Type :</span>
                <label className="units-radio-inline">
                  <input type="radio" name="userType" defaultChecked readOnly />
                  Student
                </label>
              </div>
            </div>

            {/* ── Personal Information ── */}
            <div className="units-section-heading">Personal Information</div>
            <div className="units-info-grid">
              {/* Row 1 */}
              <div className="units-info-label">Name :</div>
              <div className="units-info-value units-info-highlight">
                {userName.toUpperCase()}
              </div>
              <div className="units-info-label">Student ID :</div>
              <div className="units-info-value">{session?.user?.studentId || '2025197521'}</div>

              {/* Row 2 */}
              <div className="units-info-label">Campus :</div>
              <div className="units-info-value units-info-highlight">
                {session?.user?.campus || 'UiTM Kampus Puncak Perdana'}
              </div>
              <div className="units-info-label">Faculty :</div>
              <div className="units-info-value units-info-highlight">
                {session?.user?.faculty || 'KOLEJ PENGAJIAN PENGKOMPUTERAN, INFORMATIK DAN MATEMATIK'}
              </div>

              {/* Row 3 */}
              <div className="units-info-label">UiTM Email :</div>
              <div className="units-info-value">
                {session?.user?.email || '2025197521@student.uitm.edu.my'}
              </div>
              <div className="units-info-label">
                Alternate Email * :<br />
                <small className="units-info-note">
                  * Feedback complaint will be sent to <em>UiTM Email / Alternate Email</em>. Please make sure the email is correct.
                </small>
              </div>
              <div className="units-info-value">
                <input
                  className="units-input"
                  type="email"
                  placeholder="Alternate Email"
                  value={form.alternateEmail}
                  onChange={e => setForm({ ...form, alternateEmail: e.target.value })}
                  id="ict-alt-email"
                />
              </div>

              {/* Row 4 — Handphone spans left col */}
              <div className="units-info-label">Handphone No * :</div>
              <div className="units-info-value units-info-colspan">
                <input
                  className="units-input units-input-sm"
                  type="tel"
                  placeholder="01X-XXXXXXXX"
                  value={form.handphone}
                  onChange={e => setForm({ ...form, handphone: e.target.value })}
                  id="ict-handphone"
                />
              </div>
            </div>

            <p className="units-personal-note">
              * <strong>Important!</strong> This information is for UniTS only. The information updated here will not be updated to other systems.
            </p>

            {/* ── Report Information ── */}
            <div className="units-section-heading" style={{ marginTop: 28 }}>Report Information</div>

            <div className="units-report-grid">

              {/* Branch */}
              <div className="units-report-label">Branch * :</div>
              <div className="units-report-value">
                <select
                  className="units-select"
                  value={form.branch}
                  onChange={e => setForm({ ...form, branch: e.target.value })}
                  id="ict-branch"
                  required
                >
                  {CAMPUS_OPTIONS.map(opt => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>

              {/* Location Detail */}
              <div className="units-report-label">Location Detail * :</div>
              <div className="units-report-value">
                <textarea
                  className="units-textarea units-textarea-sm"
                  placeholder="Location Detail"
                  rows={3}
                  value={form.locationDetail}
                  onChange={e => setForm({ ...form, locationDetail: e.target.value })}
                  id="ict-location"
                  required
                />
              </div>

              {/* Category */}
              <div className="units-report-label">Category * :</div>
              <div className="units-report-value">
                <select
                  className="units-select"
                  value={form.category}
                  onChange={e => setForm({ ...form, category: e.target.value })}
                  id="ict-category"
                  required
                >
                  {CATEGORY_OPTIONS.map(opt => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>

              {/* Details */}
              <div className="units-report-label">Details * :</div>
              <div className="units-report-value">
                <textarea
                  className="units-textarea"
                  placeholder="Report Details"
                  rows={5}
                  value={form.details}
                  onChange={e => setForm({ ...form, details: e.target.value })}
                  id="ict-details"
                  required
                />
              </div>

              {/* Attachment */}
              <div className="units-report-label">Attachment :</div>
              <div className="units-report-value">
                <input
                  id="ict-attachment-input"
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.gif,.png"
                  onChange={handleFileChange}
                  className="units-file-input"
                />
                <p className="units-attach-note">
                  * Format Pdf and Image (jpeg, jpg, Gif, Png) only. Maximum upload file size is 1MB.
                </p>
                {attachment && (
                  <button
                    type="button"
                    className="units-remove-btn"
                    onClick={handleRemoveAttachment}
                  >
                    🗑 Remove Attachment
                  </button>
                )}
              </div>

            </div>

            {/* ── Submit / Reset ── */}
            <div className="units-actions-bar">
              <button
                type="submit"
                className="units-btn-submit"
                disabled={loading}
                id="ict-submit"
              >
                {loading ? 'Submitting...' : 'SUBMIT'}
              </button>
              <button
                type="button"
                className="units-btn-reset"
                onClick={handleReset}
                id="ict-reset"
              >
                RESET
              </button>
            </div>

          </form>
        </div>

        <UnitsFooter />
      </div>
    </div>
  );
}

/* ── Sidebar ── */
function UnitsSidebar({ active }) {
  return (
    <aside className="units-sidebar">
      {/* Logo area */}
      <div className="units-sidebar-logo-area">
        <Link href="/" style={{ textDecoration: 'none' }}>
          <div className="units-logo-box">
            <svg width="52" height="28" viewBox="0 0 80 40" fill="none">
              {/* uniTS-style text logo */}
              <text x="2" y="30" fontFamily="Arial, sans-serif" fontWeight="900" fontSize="30" fill="white">u</text>
              <text x="20" y="30" fontFamily="Arial, sans-serif" fontWeight="900" fontSize="30" fill="white">n</text>
              <text x="38" y="30" fontFamily="Arial, sans-serif" fontWeight="900" fontSize="30" fill="white" fontStyle="italic">i</text>
              <text x="48" y="30" fontFamily="Arial, sans-serif" fontWeight="900" fontSize="30" fill="#f59e0b">T</text>
              <text x="62" y="30" fontFamily="Arial, sans-serif" fontWeight="900" fontSize="30" fill="#f59e0b">S</text>
            </svg>
            <div className="units-logo-sub">University IT Services</div>
          </div>
        </Link>
      </div>

      {/* Navigation */}
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

/* ── Top Bar ── */
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
          WELCOME : <strong>{(userName || 'USER').toUpperCase().split(' ')[0]}</strong>
        </span>
        <span style={{ fontSize: '0.65rem', marginLeft: 4 }}>▾</span>

        {open && (
          <div className="units-topbar-dropdown">
            <Link href="/" className="units-topbar-dropdown-item" style={{ textDecoration: 'none', display: 'block', color: '#374151' }}>
              Laman Utama
            </Link>
            <button onClick={onSignOut} className="units-topbar-dropdown-item" id="topbar-logout">
              Log Out
            </button>
          </div>
        )}
      </div>
    </header>
  );
}

/* ── Footer ── */
function UnitsFooter() {
  return (
    <footer className="units-footer">
      2017 © Pengurusan Sistem Sokongan, Jabatan Infostruktur.
    </footer>
  );
}

/* ── Page Export ── */
export default function AduanICTPage() {
  return (
    <Suspense
      fallback={
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="spinner" />
        </div>
      }
    >
      <AduanICTForm />
    </Suspense>
  );
}
