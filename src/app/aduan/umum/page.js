'use client';
import { useState, useEffect, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import { NavDropdownAduan, NavDropdownSemak } from '@/components/NavDropdown';
import HomeUserMenu from '@/components/HomeUserMenu';

function AduanUmumForm() {
  const router = useRouter();
  const { data: session, status } = useSession();

  const [form, setForm] = useState({
    title: '',
    description: '',
  });
  const [rows, setRows] = useState([{ id: 1 }]);
  const [attachments, setAttachments] = useState({});
  const [uploadingRowId, setUploadingRowId] = useState(null);
  const [fileErrorModal, setFileErrorModal] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Redirect unauthenticated users to login preserving this URL
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login?callbackUrl=/aduan/umum');
    }
  }, [status, router]);

  const handleRowFileChange = async (rowId, e) => {
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

    setUploadingRowId(rowId);
    setError('');

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const base64 = event.target.result;
        const res = await fetch('/api/upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ file: base64, name: file.name }),
        });

        if (!res.ok) throw new Error(`Gagal memuat naik fail: ${file.name}`);

        const data = await res.json();
        setAttachments((prev) => ({
          ...prev,
          [rowId]: { name: file.name, url: data.url }
        }));
      } catch (err) {
        setError(err.message || 'Ralat berlaku ketika memuat naik fail.');
      } finally {
        setUploadingRowId(null);
      }
    };
    reader.onerror = () => {
      setError('Gagal membaca fail.');
      setUploadingRowId(null);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveRow = (rowId) => {
    setRows((prev) => prev.filter((r) => r.id !== rowId));
    setAttachments((prev) => {
      const next = { ...prev };
      delete next[rowId];
      return next;
    });
  };

  const handleAddRow = () => {
    setRows((prev) => [...prev, { id: Date.now() }]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const uploadingCount = rows.filter(r => uploadingRowId === r.id).length;
    if (uploadingCount > 0) {
      setError('Sila tunggu sehingga semua fail selesai dimuat naik.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const attachmentUrls = Object.values(attachments).map((a) => a.url);
      const res = await fetch('/api/complaints', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: form.title,
          description: form.description,
          category: 'General', // Store as General complaint
          priority: 'Medium',
          attachments: attachmentUrls,
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
      title: '',
      description: '',
    });
    setRows([{ id: 1 }]);
    setAttachments({});
    setError('');
  };

  if (status === 'loading') {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="spinner" />
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="aduan-root">
        <AduanNav session={session} />
        <main className="aduan-body">
          <div className="aduan-success-box">
            <div className="aduan-success-icon">✓</div>
            <h2 className="aduan-success-title">Aduan Berjaya Dihantar!</h2>
            <p className="aduan-success-text">
              Aduan anda telah diterima dan akan diproses dalam masa 3–5 hari bekerja.
              Anda boleh menyemak status aduan di halaman Semakan.
            </p>
            <div className="aduan-success-actions">
              <Link href="/" className="aduan-success-btn-primary">Kembali ke Laman Utama</Link>
              <button onClick={() => setSubmitted(false) || handleReset()} className="aduan-success-btn-outline">Hantar Aduan Baharu</button>
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
              <span className="aduan-breadcrumb-active">Aduan Umum</span>
            </div>
            <h1 className="aduan-page-title">Aduan Umum</h1>
            <p className="aduan-page-desc">Sebarang aduan umum, pertanyaan, cadangan dan penghargaan</p>
          </div>
        </div>

        {/* Form Container */}
        <div className="aduan-form-wrap">
          {error && <div className="aduan-form-error">{error}</div>}

          <form onSubmit={handleSubmit}>

            {/* ── Bahagian 1: Profil Pengguna ── */}
            <div className="aduan-section">
              <div className="aduan-section-title">
                <span className="aduan-section-num">1</span>
                Maklumat Pengguna
              </div>
              <div className="aduan-section-body">
                <div className="aduan-field-grid aduan-field-grid-2">
                  <div className="aduan-field">
                    <label className="aduan-label">Kategori Pengguna</label>
                    <div className="aduan-value-box">{session?.user?.role === 'public' ? 'Umum' : 'Pelajar'}</div>
                  </div>
                  <div className="aduan-field">
                    <label className="aduan-label">Nama Penuh</label>
                    <div className="aduan-value-box aduan-value-highlight">
                      {session?.user?.name || '—'}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* ── Bahagian 2: Maklumat Aduan ── */}
            <div className="aduan-section">
              <div className="aduan-section-title">
                <span className="aduan-section-num">2</span>
                Maklumat Aduan
              </div>
              <div className="aduan-section-body">
                <div className="aduan-field-grid aduan-field-grid-2">
                  <div className="aduan-field">
                    <label className="aduan-label">Kategori Aduan</label>
                    <select className="aduan-input aduan-select" value="General" disabled>
                      <option value="General">Aduan Umum</option>
                    </select>
                  </div>
                  <div className="aduan-field">
                    <label className="aduan-label">Tarikh</label>
                    <div className="aduan-value-box">
                      {new Date().toLocaleDateString('ms-MY', { day: '2-digit', month: 'long', year: 'numeric' })}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* ── Bahagian 3: Perkara ── */}
            <div className="aduan-section">
              <div className="aduan-section-title">
                <span className="aduan-section-num">3</span>
                Perkara
              </div>
              <div className="aduan-section-body">
                <div className="aduan-field">
                  <label className="aduan-label">Tajuk Aduan <span className="aduan-required">*</span></label>
                  <input
                    className="aduan-input"
                    required
                    value={form.title}
                    onChange={e => setForm({ ...form, title: e.target.value })}
                    placeholder="Nyatakan tajuk aduan anda secara ringkas"
                  />
                </div>
                <div className="aduan-field">
                  <label className="aduan-label">
                    Keterangan Aduan <span className="aduan-required">*</span>
                  </label>
                  <p className="aduan-field-hint">
                    Perhatikan dengan jelas isu, atau masalah yang menjadi sebab aduan dibuat. Terangkan dengan sepenuh-penuhnya apa yang berlaku, bila dan bagaimana ia berlaku.
                  </p>
                  <textarea
                    className="aduan-textarea"
                    required
                    rows={7}
                    value={form.description}
                    onChange={e => setForm({ ...form, description: e.target.value })}
                    placeholder="Huraikan aduan anda dengan terperinci..."
                  />
                </div>
              </div>
            </div>

            {/* ── Bahagian 4: Lampiran ── */}
            <div className="aduan-section">
              <div className="aduan-section-title">
                <span className="aduan-section-num">4</span>
                Senarai Lampiran
              </div>
              <div className="aduan-section-body" style={{ gap: '16px' }}>
                <p className="aduan-field-hint" style={{ marginBottom: 4 }}>
                  Sertakan dokumen seperti surat, sertifikasi, kronologi atau mana-mana bukti lain yang menyokong aduan anda.
                  <br /><em>Format diterima: JPG, PNG (Maks. 5MB setiap fail)</em>
                </p>

                {/* List of File Input Rows */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '100%' }}>
                  {rows.map((row, idx) => (
                    <div key={row.id} style={{ display: 'flex', gap: '12px', alignItems: 'center', width: '100%', flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#374151', minWidth: '90px' }}>
                        FAIL {idx + 1}
                      </span>
                      <input
                        type="file"
                        className="aduan-input"
                        style={{ flex: 1, minWidth: '220px' }}
                        accept=".jpg,.jpeg,.png"
                        onChange={(e) => handleRowFileChange(row.id, e)}
                        disabled={uploadingRowId === row.id}
                      />
                      {uploadingRowId === row.id && (
                        <span style={{ fontSize: '0.8rem', color: '#6b7280' }}>Memuat naik...</span>
                      )}
                      {attachments[row.id] && (
                        <span style={{ fontSize: '0.8rem', color: '#16a34a', fontWeight: 600 }}>✓ Berjaya</span>
                      )}
                      {rows.length > 1 && (
                        <button
                          type="button"
                          className="aduan-reset-btn"
                          style={{ padding: '9px 16px', fontSize: '0.8rem', margin: 0, height: '40px' }}
                          onClick={() => handleRemoveRow(row.id)}
                        >
                          Hapus
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                {/* Add Row Button */}
                <button
                  type="button"
                  className="aduan-attach-btn"
                  onClick={handleAddRow}
                  style={{ alignSelf: 'flex-start' }}
                >
                  + Tambah Lampiran
                </button>

                {/* Selected Files Summary List */}
                {Object.keys(attachments).length > 0 && (
                  <div style={{ marginTop: '8px', width: '100%' }}>
                    <label className="aduan-label" style={{ marginBottom: '8px', display: 'block' }}>Senarai Fail Terpilih</label>
                    <div className="aduan-file-list" style={{ width: '100%' }}>
                      {Object.entries(attachments).map(([rowId, fileInfo]) => (
                        <span key={rowId} className="aduan-file-chip">
                          📎 {fileInfo.name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* ── Actions ── */}
            <div className="aduan-actions">
              <button
                type="submit"
                className="aduan-submit-btn"
                disabled={loading || uploadingRowId !== null}
              >
                {loading ? 'Menghantar...' : 'Hantar Aduan'}
              </button>
              <button
                type="button"
                className="aduan-reset-btn"
                onClick={handleReset}
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
              <circle cx="12" cy="12" r="10" stroke="#fff" strokeWidth="2" />
              <circle cx="12" cy="12" r="4" fill="#fff" />
              <path d="M12 2v4M12 18v4M2 12h4M18 12h4" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
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
            <Link href="/login?callbackUrl=/aduan/umum" className="lp-login-btn" id="anav-login">
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

export default function AduanUmumPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><div className="spinner" /></div>}>
      <AduanUmumForm />
    </Suspense>
  );
}
