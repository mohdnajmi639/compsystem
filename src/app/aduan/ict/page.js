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
  'APLIKASI - TURNITIN',
  'IP TELEPHONY (UITM PUNCAK ALAM)',
  'KESELAMATAN - ANTIVIRUS',
  'KESELAMATAN - DOMAIN *.UITM.EDU.MY',
  'KESELAMATAN - FIREWALL',
  'KESELAMATAN - INSIDEN',
  'KESELAMATAN - SMTP GATEWAY',
  'KESELAMATAN - SSL/TLS',
  'KESELAMATAN - WEB APPLICATION FIREWALL (WAF)',
  'KESELAMATAN - WEB SSO',
  'MOBILE APPS - MYSTUDENT',
  'OPERASI - EMEL GOOGLE',
  'OPERASI - EMEL MICROSOFT 365',
  'OPERASI - GERAN PERKAKASAN ICT',
  'OPERASI - KAD UITM PELAJAR/STAF',
  'OPERASI - LAMAN WEB',
  'OPERASI - PENGURUSAN ACARA/AKTIVITI',
  'OPERASI - PERISIAN',
  'OPERASI - PERKAKASAN KOMPUTER',
  'PUSAT DATA - LOAD BALANCER',
  'PUSAT DATA - SERVER',
  'RANGKAIAN - BERWAYAR',
  'RANGKAIAN - TANPA WAYAR',
  'SISTEM - UITMKDH',
  'SISTEM - ADUAN KORPORAT',
  'SISTEM - AFRES',
  'SISTEM - AIMS',
  'SISTEM - ALUMNI (PENGURUSAN REKOD - EALUMNI)',
  'SISTEM - ALUMNI (SOCIAL MEDIA - MYALUMNI)',
  'SISTEM - ALUMNI (VIRTUAL CARD)',
  'SISTEM - BENDAHARI',
  'SISTEM - BSU (BOOKING SYSTEM UNIVERSITY)',
  'SISTEM - COMPASS (POLIS BANTUAN)',
  'SISTEM - COUNSELLING2U (KAUNSELING)',
  'SISTEM - CTMS (COLLABORATIVE TEACHING MANAGEMENT)',
  'SISTEM - EMESYUARAT',
  'SISTEM - ENSURE (BIASISWA UITM)',
  'SISTEM - HEP (E-JPP / VOTING)',
  'SISTEM - HEP (KEBAJIKAN)',
  'SISTEM - HEP (KESELAMATAN - SAMAN)',
  'SISTEM - HEP (NR-NON RESIDENT)',
  'SISTEM - HEP (TATATERTIB)',
  'SISTEM - HEP (ZAKAT)',
  'SISTEM - HR2U (APLIKASI MOBILE)',
  'SISTEM - HR2U (WEB)',
  'SISTEM - IAMS (INTEGRATED ART MANAGEMENT SYSTEM)',
  'SISTEM - ICEPS',
  'SISTEM - ILD',
  'SISTEM - ILEARN',
  'SISTEM - INSANI',
  'SISTEM - INTEGRATION',
  'SISTEM - IPSIS',
  'SISTEM - IRPNP',
  'SISTEM - JBPNP',
  'SISTEM - JOBSHOP (KERJAYA)',
  'SISTEM - JPI',
  'SISTEM - KAD UITM',
  'SISTEM - LOAD TEST SYSTEM',
  'SISTEM - LOG KERJA',
  'SISTEM - MASMED2U',
  'SISTEM - MYATP',
  'SISTEM - MYHEP',
  'SISTEM - NILAMS',
  'SISTEM - OFFICE AUTOMATION (OA)',
  'SISTEM - OPIR',
  'SISTEM - PLATFOM KAJISELIDIK UITM',
  'SISTEM - PRIME (MODUL GERAN)',
  'SISTEM - PRIME (MODUL IP)',
  'SISTEM - PRIME (MODUL PENERBITAN)',
  'SISTEM - PRIME (MODUL STAR RATING)',
  'SISTEM - PTAR',
  'SISTEM - QBS',
  'SISTEM - SCMS (SPORT CHAMPIONSHIP MANAGEMENT SYSTEM)',
  'SISTEM - SIMS AKADEMIK',
  'SISTEM - SISTEM IDERMS',
  'SISTEM - SISTEM PELAWAT',
  'SISTEM - STARS (EPROSES)',
  'SISTEM - STARS (PENGURUSAN MAKLUMAT)',
  'SISTEM - STARS (PORTAL STAF)',
  'SISTEM - STUDENT PORTAL',
  'SISTEM - SWWEET (GREEN MATRIX)',
  'SISTEM - TRANSPORT (PENGURUSAN KENDERAAN)',
  'SISTEM - UAPS (POLIS BANTUAN)',
  'SISTEM - UFUTURE',
  'SISTEM - UHW',
];

function AduanICTForm() {
  const router = useRouter();
  const { data: session, status } = useSession();

  const [ticketId] = useState(generateTicketId);
  const [form, setForm] = useState({
    branch: 'UiTM Kampus Puncak Perdana',
    location: 'UiTM Kampus Puncak Perdana',
    locationDetail: '',
    category: '-CHOOSE CATEGORY-',
    details: '',
    alternateEmail: '',
    handphone: '',
  });
  const [attachment, setAttachment] = useState(null);      // { name, url }
  const [uploadingAttachment, setUploadingAttachment] = useState(false);
  const [fileErrorModal, setFileErrorModal] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login?callbackUrl=/aduan/ict');
    }
  }, [status, router]);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const allowed = ['image/jpeg', 'image/jpg', 'image/png'];
    if (!allowed.includes(file.type)) {
      const msg = 'Format tidak dibenarkan. Sila pilih fail Imej (jpg, png) sahaja.';
      setError(msg);
      setFileErrorModal(msg);
      setTimeout(() => setFileErrorModal(null), 3500);
      e.target.value = '';
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      const msg = 'Saiz fail melebihi 5MB. Sila pilih fail yang lebih kecil.';
      setError(msg);
      setFileErrorModal(msg);
      setTimeout(() => setFileErrorModal(null), 3500);
      e.target.value = '';
      return;
    }
    setError('');
    setUploadingAttachment(true);

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const base64 = event.target.result;
        const res = await fetch('/api/upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ file: base64, name: file.name }),
        });
        if (!res.ok) throw new Error('Gagal memuat naik fail.');
        const data = await res.json();
        setAttachment({ name: file.name, url: data.url });
      } catch (err) {
        setError(err.message || 'Ralat berlaku ketika memuat naik fail.');
        e.target.value = '';
      } finally {
        setUploadingAttachment(false);
      }
    };
    reader.onerror = () => {
      setError('Gagal membaca fail.');
      setUploadingAttachment(false);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveAttachment = () => {
    setAttachment(null);
    const input = document.getElementById('ict-attachment-input');
    if (input) input.value = '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();


    if (form.category === '-CHOOSE CATEGORY-') {
      setError('Sila pilih Kategori (Category).');
      return;
    }
    if (uploadingAttachment) {
      setError('Sila tunggu fail selesai dimuat naik.');
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
          description: `Branch: ${form.branch}\nLocation: ${form.location}\nLocation Detail: ${form.locationDetail}\n\nReport Details:\n${form.details}`,
          category: 'ICT',
          priority: 'Medium',
          attachments: attachment ? [attachment.url] : [],
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
      branch: 'UiTM Kampus Puncak Perdana',
      location: 'UiTM Kampus Puncak Perdana',
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

      {fileErrorModal && (
        <div
          style={{
            position: 'fixed',
            bottom: '28px',
            right: '28px',
            zIndex: 9999,
            background: '#dc2626',
            color: '#fff',
            padding: '14px 22px',
            borderRadius: 0,
            fontSize: '0.9rem',
            fontWeight: 600,
            boxShadow: '0 8px 30px rgba(0,0,0,0.18)',
            animation: 'slideInRight 0.3s ease',
          }}
        >
          {fileErrorModal}
        </div>
      )}

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

            {/* ── Bahagian 2: Maklumat Laporan (Report Information) ── */}
            <div className="aduan-section">
              <div className="aduan-section-title">
                <span className="aduan-section-num">2</span>
                Maklumat Laporan (Report Information)
              </div>
              <div className="aduan-section-body" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

                <div className="aduan-field-grid aduan-field-grid-2">
                  <div className="aduan-field">
                    <label className="aduan-label">No. Tiket</label>
                    <div className="aduan-value-box aduan-value-highlight">{ticketId}</div>
                  </div>
                  <div className="aduan-field">
                    <label className="aduan-label">Jenis Pengguna</label>
                    <div className="aduan-value-box">Pelajar</div>
                  </div>
                </div>

                <div className="aduan-field-grid aduan-field-grid-2">
                  <div className="aduan-field">
                    <label className="aduan-label">Cawangan (Branch)</label>
                    <input
                      type="text"
                      className="aduan-input"
                      value="UITM KAMPUS PUNCAK PERDANA"
                      id="ict-branch"
                      disabled
                      readOnly
                    />
                  </div>
                  <div className="aduan-field">
                    <label className="aduan-label">Lokasi (Location)</label>
                    <input
                      type="text"
                      className="aduan-input"
                      value="UITM KAMPUS PUNCAK PERDANA"
                      id="ict-location-select"
                      disabled
                      readOnly
                    />
                  </div>
                </div>

                <div className="aduan-field">
                  <label className="aduan-label">Butiran Lokasi (Location Detail) <span className="aduan-required">*</span></label>
                  <input
                    className="aduan-input"
                    placeholder="Location Detail"
                    value={form.locationDetail}
                    onChange={e => setForm({ ...form, locationDetail: e.target.value })}
                    id="ict-location"
                    required
                  />
                </div>

                <div className="aduan-field" style={{ maxWidth: '50%' }}>
                  <label className="aduan-label">Kategori (Category) <span className="aduan-required">*</span></label>
                  <select
                    className="aduan-input aduan-select"
                    value={form.category}
                    onChange={e => setForm({ ...form, category: e.target.value })}
                    id="ict-category"
                    required
                  >
                    {CATEGORY_OPTIONS.map(opt => (
                      <option key={opt} value={opt}>{opt.toUpperCase()}</option>
                    ))}
                  </select>
                </div>

                <div className="aduan-field">
                  <label className="aduan-label">Butiran Laporan (Report Details) <span className="aduan-required">*</span></label>
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
                  Format Imej (jpg, png) sahaja. Saiz maksimum 5MB.
                </p>
                <div className="aduan-field">
                  <label className="aduan-label">Pilih Fail</label>
                  <input
                    id="ict-attachment-input"
                    type="file"
                    accept=".jpg,.jpeg,.png"
                    onChange={handleFileChange}
                    className="aduan-input"
                    disabled={uploadingAttachment}
                  />
                </div>
                {uploadingAttachment && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8, color: '#6b7280', fontSize: '0.85rem' }}>
                    <span className="spinner" style={{ width: 14, height: 14, borderWidth: 2 }} />
                    Memuat naik fail...
                  </div>
                )}
                {attachment && !uploadingAttachment && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 8 }}>
                    <span className="aduan-file-chip">{attachment.name}</span>
                    <button
                      type="button"
                      className="aduan-reset-btn"
                      style={{ padding: '6px 14px', fontSize: '0.8rem', margin: 0 }}
                      onClick={handleRemoveAttachment}
                      id="ict-remove-attachment"
                    >
                      Hapus
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
