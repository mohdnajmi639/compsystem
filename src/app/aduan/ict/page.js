'use client';
import { useState, useEffect, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import { NavDropdownAduan, NavDropdownSemak } from '@/components/NavDropdown';
import HomeUserMenu from '@/components/HomeUserMenu';

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
          title: `[ICT] ${form.category}`,
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
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="spinner" />
      </div>
    );
  }

  const userName = session?.user?.name || 'USER';

  if (submitted) {
    return (
      <div className="aduan-root">
        <AduanNav session={session} />
        <main className="aduan-body">
          <div className="aduan-success-box">
            <div className="aduan-success-icon">✓</div>
            <h2 className="aduan-success-title">Aduan Berjaya Dihantar!</h2>
            <p className="aduan-success-text">
              Aduan ICT anda telah diterima. No. Tiket: <strong style={{ color: '#7c3aed' }}>{ticketId}</strong>
              <br />Anda akan menerima maklum balas melalui e-mel dalam masa 3–5 hari bekerja.
            </p>
            <div className="aduan-success-actions">
              <button
                className="aduan-submit-btn"
                onClick={() => { setSubmitted(false); handleReset(); }}
                id="ict-new-aduan"
              >
                Hantar Aduan Baharu
              </button>
              <Link href="/aduan/ict/status" className="aduan-cancel-btn" id="ict-status-link">
                Status Aduan ICT
              </Link>
            </div>
          </div>
        </main>
        <AduanFooter />
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
              <span>Aduan Baharu</span>
              <span className="aduan-breadcrumb-sep">›</span>
              <span className="aduan-breadcrumb-active">Aduan ICT</span>
            </div>
            <h1 className="aduan-page-title">Aduan ICT</h1>
            <p className="aduan-page-desc">Aduan berkaitan rangkaian, perkakasan, perisian, akaun dan perkhidmatan IT universiti</p>
          </div>
        </div>

        {/* Form Container */}
        <div className="aduan-form-wrap">
          {error && <div className="aduan-form-error">{error}</div>}

          <form onSubmit={handleSubmit} noValidate>

            {/* ── Bahagian 1: Maklumat Pengguna ── */}
            <div className="aduan-section">
              <div className="aduan-section-title">
                <span className="aduan-section-num">1</span>
                Maklumat Pengguna
              </div>
              <div className="aduan-section-body">
                <div className="aduan-field-grid aduan-field-grid-2">
                  <div className="aduan-field">
                    <label className="aduan-label">Nama Penuh</label>
                    <div className="aduan-value-box aduan-value-highlight">{userName.toUpperCase()}</div>
                  </div>
                  <div className="aduan-field">
                    <label className="aduan-label">No. Pelajar / Staf</label>
                    <div className="aduan-value-box">{session?.user?.studentId || session?.user?.staffId || '—'}</div>
                  </div>

                  <div className="aduan-field">
                    <label className="aduan-label">Fakulti</label>
                    <div className="aduan-value-box aduan-value-highlight">{session?.user?.department || '—'}</div>
                  </div>
                  <div className="aduan-field">
                    <label className="aduan-label">E-mel UiTM</label>
                    <div className="aduan-value-box">{session?.user?.email || '—'}</div>
                  </div>
                  <div className="aduan-field">
                    <label className="aduan-label">E-mel Alternatif</label>
                    <input
                      className="aduan-input"
                      type="email"
                      placeholder="E-mel alternatif"
                      value={form.alternateEmail}
                      onChange={e => setForm({ ...form, alternateEmail: e.target.value })}
                      id="ict-alt-email"
                    />
                  </div>
                  <div className="aduan-field">
                    <label className="aduan-label">No. Handphone <span className="aduan-required">*</span></label>
                    <input
                      className="aduan-input"
                      type="tel"
                      placeholder="01X-XXXXXXXX"
                      value={form.handphone}
                      onChange={e => setForm({ ...form, handphone: e.target.value })}
                      id="ict-handphone"
                    />
                  </div>
                </div>
                <p className="aduan-field-hint" style={{ marginTop: 8 }}>
                  * Maklumat ini adalah untuk kegunaan UniTS sahaja dan tidak akan dikemas kini ke sistem lain.
                </p>
              </div>
            </div>

            {/* ── Bahagian 2: Maklumat Laporan ── */}
            <div className="aduan-section">
              <div className="aduan-section-title">
                <span className="aduan-section-num">2</span>
                Maklumat Laporan
              </div>
              <div className="aduan-section-body">
                <div className="aduan-field-grid aduan-field-grid-2">
                  <div className="aduan-field">
                    <label className="aduan-label">No. Tiket</label>
                    <div className="aduan-value-box aduan-value-highlight">{ticketId}</div>
                  </div>
                  <div className="aduan-field">
                    <label className="aduan-label">Jenis Pengguna</label>
                    <div className="aduan-value-box">Pelajar</div>
                  </div>

                  <div className="aduan-field">
                    <label className="aduan-label">Kategori <span className="aduan-required">*</span></label>
                    <select
                      className="aduan-input aduan-select"
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
                </div>

                <div className="aduan-field" style={{ marginTop: 8 }}>
                  <label className="aduan-label">Butiran Lokasi <span className="aduan-required">*</span></label>
                  <textarea
                    className="aduan-textarea"
                    placeholder="Location Detail"
                    rows={3}
                    value={form.locationDetail}
                    onChange={e => setForm({ ...form, locationDetail: e.target.value })}
                    id="ict-location"
                    required
                  />
                </div>

                <div className="aduan-field">
                  <label className="aduan-label">Butiran Laporan <span className="aduan-required">*</span></label>
                  <textarea
                    className="aduan-textarea"
                    placeholder="Report Details"
                    rows={5}
                    value={form.details}
                    onChange={e => setForm({ ...form, details: e.target.value })}
                    id="ict-details"
                    required
                  />
                </div>
              </div>
            </div>

            {/* ── Bahagian 3: Lampiran ── */}
            <div className="aduan-section">
              <div className="aduan-section-title">
                <span className="aduan-section-num">3</span>
                Lampiran
              </div>
              <div className="aduan-section-body">
                <p className="aduan-field-hint">
                  Format PDF dan Imej (jpeg, jpg, gif, png) sahaja. Saiz maksimum 1MB.
                </p>
                <div className="aduan-field">
                  <label className="aduan-label">Pilih Fail</label>
                  <input
                    id="ict-attachment-input"
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.gif,.png"
                    onChange={handleFileChange}
                    className="aduan-input"
                  />
                </div>
                {attachment && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 8 }}>
                    <span className="aduan-file-chip">📎 {attachment.name}</span>
                    <button
                      type="button"
                      className="aduan-reset-btn"
                      style={{ padding: '6px 14px', fontSize: '0.8rem', margin: 0 }}
                      onClick={handleRemoveAttachment}
                      id="ict-remove-attachment"
                    >
                      🗑 Hapus
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* ── Actions ── */}
            <div className="aduan-actions">
              <button
                type="submit"
                className="aduan-submit-btn"
                disabled={loading}
                id="ict-submit"
              >
                {loading ? 'Menghantar...' : 'Hantar Aduan'}
              </button>
              <button
                type="button"
                className="aduan-reset-btn"
                onClick={handleReset}
                id="ict-reset"
              >
                Padam Semula
              </button>
              <Link href="/" className="aduan-cancel-btn">Batal</Link>
            </div>

          </form>

          {/* Disclaimer */}
          <div className="aduan-disclaimer">
            <strong>Penafian dan Notis Privasi:</strong>{' '}
            Sistem ini disediakan untuk pengurusan aduan rasmi UiTM. Semua data yang dikemukakan adalah sulit dan hanya untuk kegunaan dalaman universiti.
            Sistem ini dipantau secara berterusan dan sebarang penyalahgunaan boleh dikenakan tindakan undang-undang atau tatatertib.
          </div>
        </div>
      </main>

      <AduanFooter />
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
            <Link href="/login?callbackUrl=/aduan/ict" className="lp-login-btn" id="anav-login">
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

export default function AduanICTPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><div className="spinner" /></div>}>
      <AduanICTForm />
    </Suspense>
  );
}
