'use client';
import { useState, useEffect, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import { NavDropdownAduan, NavDropdownSemak } from '@/components/NavDropdown';
import HomeUserMenu from '@/components/HomeUserMenu';

/* ══════════════════════════════════════
   DROPDOWN DATA
══════════════════════════════════════ */
const NEGERI_OPTS = ['-- Sila Pilih --','Johor','Kedah','Kelantan','Melaka','Negeri Sembilan','Pahang','Perak','Perlis','Pulau Pinang','Sabah','Sarawak','Selangor','Terengganu','W.P. Kuala Lumpur','W.P. Labuan','W.P. Putrajaya'];
const KAMPUS_OPTS = ['--Sila Pilih--','UiTM Shah Alam','UiTM Kampus Puncak Perdana','UiTM Kampus Puncak Alam','UiTM Kampus Dengkil','UiTM Kampus Arau','UiTM Kampus Kota Bharu','UiTM Kampus Kuantan','UiTM Kampus Dungun','UiTM Kampus Johor Bahru','UiTM Kampus Alor Gajah'];
const BANGUNAN_OPTS = ['--Sila Pilih--','B0410 - Blok Akademik','B0407 - Dewan Makan','B0401 - Kolej Blok 1','B0402 - Kolej Blok 2','B0403 - Kolej Blok 3','B0404 - Kolej Blok 4','B0405 - Kolej Blok 5','B0408 - Kolej Blok 6','B0411 - Perhentian Bas','B0409 - Pos Pengawal Kolej','B0406 - Surau'];
const BLOK_OPTS = ['--Sila Pilih--','Blok A','Blok B','Blok C','Blok D','Blok E','Blok F'];
const ARAS_OPTS = ['--Sila Pilih--','Aras 1','Aras 2','Aras 3','Aras 4','Aras 5'];
const RUANG_OPTS = ['--Sila Pilih--','Bilik Darjah','Makmal','Pejabat','Tandas','Koridor','Parkir','Padang'];
const KATEGORI_INFRA_OPTS = ['--Sila Pilih--','Elektrik','Awam / Sivil','Mekanikal','Landskap','Telekomunikasi','Pembetungan','Paving / Perkerasan'];
const SUB_KATEGORI_INFRA_OPTS = ['--Sila Pilih--','Lampu Jalan','Saliran','Parit','Laluan Pejalan Kaki','Pagar','Tanda Jalan','Lain-lain'];
const SEKSYEN_OPTS = ['--Sila Pilih--','Elektrik','Awam / Sivil','Mekanikal','Landskap','Pembersihan','Keselamatan','Lain-lain'];
const ELEMEN_OPTS = ['--Sila Pilih--','Pendawaian','Paip','HVAC','Pintu / Tingkap','Bumbung','Dinding / Lantai','Perabot','Lif','Eskalator'];
const MASALAH_OPTS = ['--Sila Pilih--','Rosak','Bocor','Tidak Berfungsi','Kotor / Perlu Pembersihan','Perlu Penggantian','Perlu Pemasangan Baharu','Bahaya / Merbahaya'];

/* ══════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════ */
function AduanFasilitiContent() {
  const router = useRouter();
  const { data: session, status } = useSession();

  /* ── User-editable fields ── */
  const [telefon, setTelefon] = useState('');

  /* ── Location cascade state ── */
  const [lokasiPilih, setLokasiPilih] = useState(''); // '' | 'lokasi_lain'
  const [jenisBangunan, setJenisBangunan] = useState(''); // '' | 'dalam' | 'luar'

  /* ── Dalam Bangunan fields ── */
  const [dbNegeri, setDbNegeri]     = useState('B - Selangor');
  const [dbKampus]                  = useState('B04 - Kampus Puncak Perdana');
  const [dbBangunan, setDbBangunan] = useState('--Sila Pilih--');
  const [dbBlok, setDbBlok]         = useState('--Sila Pilih--');
  const [dbAras, setDbAras]         = useState('--Sila Pilih--');
  const [dbRuang, setDbRuang]       = useState('--Sila Pilih--');
  const [dbKeterangan, setDbKeterangan] = useState('');

  /* ── Luar Bangunan fields ── */
  const [lbNegeri, setLbNegeri]         = useState('B - Selangor');
  const [lbKampus]                      = useState('B04 - Kampus Puncak Perdana');
  const [lbBangunan, setLbBangunan]     = useState('--Sila Pilih--');
  const [lbBlok, setLbBlok]             = useState('--Sila Pilih--');
  const [lbKatInfra, setLbKatInfra]     = useState('--Sila Pilih--');
  const [lbSubInfra, setLbSubInfra]     = useState('--Sila Pilih--');
  const [lbKeterangan, setLbKeterangan] = useState('');

  /* ── Jenis Kerosakan (shared) ── */
  const [seksyen, setSeksyen]       = useState('--Sila Pilih--');
  const [elemen, setElemen]         = useState('--Sila Pilih--');
  const [masalah, setMasalah]       = useState('--Sila Pilih--');
  const [ketKerosakan, setKetKerosakan] = useState('');

  /* ── Submission ── */
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login?callbackUrl=/aduan/fasiliti');
    }
  }, [status, router]);

  /* Reset sub-state when lokasi changes */
  useEffect(() => {
    setJenisBangunan('');
    setError('');
  }, [lokasiPilih]);

  const userName    = session?.user?.name    || '';
  const userEmail   = session?.user?.email   || '';
  const userFaculty = session?.user?.department || '—';
  const userCampus  = session?.user?.campus  || '';
  const userProgram = session?.user?.program || '';
  const userId      = session?.user?.studentId || session?.user?.staffId || '';

  /* ── Submit handler ── */
  const handleHantar = async (e) => {
    e.preventDefault();
    if (!lokasiPilih) { setError('Sila pilih lokasi kerosakan.'); return; }
    if (!jenisBangunan) { setError('Sila pilih jenis lokasi (Dalam Bangunan / Luar Bangunan).'); return; }

    const isDB = jenisBangunan === 'dalam';
    const negeri   = isDB ? dbNegeri   : lbNegeri;
    const kampus   = isDB ? dbKampus   : lbKampus;
    const ket      = isDB ? dbKeterangan : lbKeterangan;

    if (negeri.startsWith('--') || negeri === '-- Sila Pilih --') { setError('Sila pilih Negeri.'); return; }

    if (!ket.trim()) { setError('Sila isi keterangan lokasi.'); return; }
    if (!ketKerosakan.trim()) { setError('Sila isi keterangan kerosakan.'); return; }

    setLoading(true);
    setError('');
    try {
      const desc = isDB
        ? `[DALAM BANGUNAN] Negeri: ${negeri} | Kampus: ${kampus} | Bangunan: ${dbBangunan} | Blok: ${dbBlok} | Aras: ${dbAras} | Ruang: ${dbRuang} | Ket. Lokasi: ${ket} | Seksyen: ${seksyen} | Elemen: ${elemen} | Masalah: ${masalah} | Ket. Kerosakan: ${ketKerosakan}`
        : `[LUAR BANGUNAN] Negeri: ${negeri} | Kampus: ${kampus} | Bangunan: ${lbBangunan} | Blok: ${lbBlok} | Kat. Infra: ${lbKatInfra} | Sub Infra: ${lbSubInfra} | Ket. Lokasi: ${ket} | Seksyen: ${seksyen} | Elemen: ${elemen} | Masalah: ${masalah} | Ket. Kerosakan: ${ketKerosakan}`;

      const res = await fetch('/api/complaints', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: `[Fasiliti] ${isDB ? 'Dalam Bangunan' : 'Luar Bangunan'} — ${kampus}`,
          description: desc,
          category: 'Facility',
          priority: 'Medium',
          attachments: [],
          targetDepartment: 'Fasiliti',
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setSubmitted(true);
    } catch (err) {
      setError(err.message || 'Ralat berlaku. Sila cuba lagi.');
    }
    setLoading(false);
  };

  const handleReset = () => {
    setLokasiPilih('');
    setJenisBangunan('');
    setDbNegeri('B - Selangor');
    setDbBangunan('--Sila Pilih--'); setDbBlok('--Sila Pilih--');
    setDbAras('--Sila Pilih--');     setDbRuang('--Sila Pilih--');
    setDbKeterangan('');
    setLbNegeri('B - Selangor');
    setLbBangunan('--Sila Pilih--'); setLbBlok('--Sila Pilih--');
    setLbKatInfra('--Sila Pilih--'); setLbSubInfra('--Sila Pilih--');
    setLbKeterangan('');
    setSeksyen('--Sila Pilih--'); setElemen('--Sila Pilih--');
    setMasalah('--Sila Pilih--'); setKetKerosakan('');
    setError(''); setSubmitted(false);
  };

  if (status === 'loading') {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="spinner" />
      </div>
    );
  }

  /* ── Shared select helper ── */
  const Sel = ({ id, value, onChange, opts }) => (
    <select id={id} className="aduan-input aduan-select" value={value} onChange={e => onChange(e.target.value)}>
      {opts.map(o => <option key={o} value={o}>{o}</option>)}
    </select>
  );

  if (submitted) {
    return (
      <div className="aduan-root">
        <AduanNav session={session} />
        <main className="aduan-body">
          <div className="aduan-success-box">
            <div className="aduan-success-icon">✓</div>
            <h2 className="aduan-success-title">Aduan Berjaya Dihantar!</h2>
            <p className="aduan-success-text">
              Terima kasih. Aduan Fasiliti anda telah diterima dan akan diproses dalam masa 3–5 hari bekerja.
              Anda boleh menyemak status aduan di halaman Semakan.
            </p>
            <div className="aduan-success-actions">
              <button className="aduan-submit-btn" onClick={handleReset} id="fasiliti-aduan-baharu">
                Hantar Aduan Baharu
              </button>
              <Link href="/aduan/fasiliti/semak" className="aduan-cancel-btn" id="fasiliti-semak-link">
                Semak Status Aduan
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
              <span className="aduan-breadcrumb-active">Aduan Fasiliti</span>
            </div>
            <h1 className="aduan-page-title">Aduan Fasiliti</h1>
            <p className="aduan-page-desc">Sistem Pengurusan Aduan dan Perkhidmatan Pejabat Pengurusan Fasiliti</p>
          </div>
        </div>

        {/* Form Container */}
        <div className="aduan-form-wrap">
          {error && <div className="aduan-form-error">{error}</div>}

          <form onSubmit={handleHantar} noValidate>

            {/* ── Bahagian 1: Maklumat Pengguna ── */}
            <div className="aduan-section">
              <div className="aduan-section-title">
                <span className="aduan-section-num">1</span>
                Maklumat Pengguna
              </div>
              <div className="aduan-section-body">
                <div className="aduan-field-grid aduan-field-grid-2">
                  <div className="aduan-field">
                    <label className="aduan-label">Nama Pelajar</label>
                    <div className="aduan-value-box aduan-value-highlight">{userName.toUpperCase()}</div>
                  </div>

                  <div className="aduan-field">
                    <label className="aduan-label">Fakulti</label>
                    <div className="aduan-value-box aduan-value-highlight">{userFaculty}</div>
                  </div>
                  <div className="aduan-field">
                    <label className="aduan-label">E-mel</label>
                    <div className="aduan-value-box">{userEmail || '—'}</div>
                  </div>
                  <div className="aduan-field">
                    <label className="aduan-label">Program / No. ID</label>
                    <div className="aduan-value-box">{userProgram || userId || '—'}</div>
                  </div>
                  <div className="aduan-field">
                    <label className="aduan-label">No. Telefon</label>
                    <input
                      className="aduan-input"
                      type="tel"
                      value={telefon}
                      onChange={e => setTelefon(e.target.value)}
                      placeholder="01X-XXXXXXXX"
                      id="ef2-telefon"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* ── Bahagian 2: Lokasi & Kerosakan ── */}
            <div className="aduan-section">
              <div className="aduan-section-title">
                <span className="aduan-section-num">2</span>
                Lokasi dan Jenis Kerosakan
              </div>
              <div className="aduan-section-body">

                {/* ── Step 1: Lokasi Lain radio ── */}
                <div className="aduan-field" style={{ marginBottom: '16px' }}>
                  <label className="aduan-radio-label">
                    <input
                      id="ef2-lokasi-lain"
                      type="radio"
                      name="lokasi"
                      value="lokasi_lain"
                      checked={lokasiPilih === 'lokasi_lain'}
                      onChange={() => setLokasiPilih('lokasi_lain')}
                    />
                    Lokasi Lain
                  </label>
                </div>

                {/* ── Step 2: Dalam Bangunan / Luar Bangunan ── */}
                {lokasiPilih === 'lokasi_lain' && (
                  <div className="aduan-field-grid aduan-field-grid-2" style={{ marginBottom: '24px' }}>
                    <div className="aduan-field">
                      <label className="aduan-radio-label">
                        <input
                          id="ef2-dalam"
                          type="radio"
                          name="jenis_bangunan"
                          value="dalam"
                          checked={jenisBangunan === 'dalam'}
                          onChange={() => setJenisBangunan('dalam')}
                        />
                        Dalam Bangunan
                      </label>
                    </div>
                    <div className="aduan-field">
                      <label className="aduan-radio-label">
                        <input
                          id="ef2-luar"
                          type="radio"
                          name="jenis_bangunan"
                          value="luar"
                          checked={jenisBangunan === 'luar'}
                          onChange={() => setJenisBangunan('luar')}
                        />
                        Luar Bangunan
                      </label>
                    </div>
                  </div>
                )}

                {/* ══ DALAM BANGUNAN / LUAR BANGUNAN FORM ══ */}
                {lokasiPilih === 'lokasi_lain' && jenisBangunan && (
                  <div className="aduan-field-grid aduan-field-grid-2">
                    
                    {/* LEFT COLUMN - LOKASI LAIN */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      <h3 style={{ color: '#111827', fontSize: '1.05rem', borderBottom: '1px solid #e5e7eb', paddingBottom: '8px', marginBottom: '8px' }}>Lokasi Lain</h3>
                      
                      <div className="aduan-field">
                        <label className="aduan-label">Negeri</label>
                        <div className="aduan-value-box">B - Selangor</div>
                      </div>

                      <div className="aduan-field">
                        <label className="aduan-label">Kampus</label>
                        <div className="aduan-value-box">B04 - Kampus Puncak Perdana</div>
                      </div>

                      <div className="aduan-field">
                        <label className="aduan-label">Bangunan <span className="aduan-required">*</span></label>
                        <select className="aduan-input aduan-select" value={jenisBangunan === 'dalam' ? dbBangunan : lbBangunan} onChange={e => jenisBangunan === 'dalam' ? setDbBangunan(e.target.value) : setLbBangunan(e.target.value)}>
                          {BANGUNAN_OPTS.map(o => <option key={o} value={o}>{o}</option>)}
                        </select>
                      </div>

                      <div className="aduan-field">
                        <label className="aduan-label">Blok <span className="aduan-required">*</span></label>
                        <select className="aduan-input aduan-select" value={jenisBangunan === 'dalam' ? dbBlok : lbBlok} onChange={e => jenisBangunan === 'dalam' ? setDbBlok(e.target.value) : setLbBlok(e.target.value)}>
                          {BLOK_OPTS.map(o => <option key={o} value={o}>{o}</option>)}
                        </select>
                      </div>

                      {jenisBangunan === 'dalam' && (
                        <>
                          <div className="aduan-field">
                            <label className="aduan-label">Aras</label>
                            <select className="aduan-input aduan-select" value={dbAras} onChange={e => setDbAras(e.target.value)}>
                              {ARAS_OPTS.map(o => <option key={o} value={o}>{o}</option>)}
                            </select>
                          </div>
                          <div className="aduan-field">
                            <label className="aduan-label">Ruang</label>
                            <select className="aduan-input aduan-select" value={dbRuang} onChange={e => setDbRuang(e.target.value)}>
                              {RUANG_OPTS.map(o => <option key={o} value={o}>{o}</option>)}
                            </select>
                          </div>
                        </>
                      )}

                      {jenisBangunan === 'luar' && (
                        <>
                          <div className="aduan-field">
                            <label className="aduan-label">Kategori Infra <span className="aduan-required">*</span></label>
                            <select className="aduan-input aduan-select" value={lbKatInfra} onChange={e => setLbKatInfra(e.target.value)}>
                              {KATEGORI_INFRA_OPTS.map(o => <option key={o} value={o}>{o}</option>)}
                            </select>
                          </div>
                          <div className="aduan-field">
                            <label className="aduan-label">Sub Kategori Infra <span className="aduan-required">*</span></label>
                            <select className="aduan-input aduan-select" value={lbSubInfra} onChange={e => setLbSubInfra(e.target.value)}>
                              {SUB_KATEGORI_INFRA_OPTS.map(o => <option key={o} value={o}>{o}</option>)}
                            </select>
                          </div>
                        </>
                      )}

                      <div className="aduan-field">
                        <label className="aduan-label">Keterangan lokasi <span className="aduan-required">*</span></label>
                        <textarea className="aduan-textarea" rows={3} value={jenisBangunan === 'dalam' ? dbKeterangan : lbKeterangan} onChange={e => jenisBangunan === 'dalam' ? setDbKeterangan(e.target.value) : setLbKeterangan(e.target.value)} />
                      </div>
                    </div>

                    {/* RIGHT COLUMN - JENIS KEROSAKAN */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      <h3 style={{ color: '#111827', fontSize: '1.05rem', borderBottom: '1px solid #e5e7eb', paddingBottom: '8px', marginBottom: '8px' }}>Jenis Kerosakan</h3>
                      
                      <div className="aduan-field">
                        <label className="aduan-label">Seksyen <span className="aduan-required">*</span></label>
                        <select className="aduan-input aduan-select" value={seksyen} onChange={e => setSeksyen(e.target.value)}>
                          {SEKSYEN_OPTS.map(o => <option key={o} value={o}>{o}</option>)}
                        </select>
                      </div>

                      <div className="aduan-field">
                        <label className="aduan-label">Elemen <span className="aduan-required">*</span></label>
                        <select className="aduan-input aduan-select" value={elemen} onChange={e => setElemen(e.target.value)}>
                          {ELEMEN_OPTS.map(o => <option key={o} value={o}>{o}</option>)}
                        </select>
                      </div>

                      <div className="aduan-field">
                        <label className="aduan-label">Masalah <span className="aduan-required">*</span></label>
                        <select className="aduan-input aduan-select" value={masalah} onChange={e => setMasalah(e.target.value)}>
                          {MASALAH_OPTS.map(o => <option key={o} value={o}>{o}</option>)}
                        </select>
                      </div>

                      <div className="aduan-field">
                        <label className="aduan-label">
                          Keterangan kerosakan
                          <div className="aduan-field-hint">(Sila isikan keterangan terperinci, cth no.telefon) <span className="aduan-required">*</span></div>
                        </label>
                        <textarea className="aduan-textarea" rows={5} value={ketKerosakan} onChange={e => setKetKerosakan(e.target.value)} />
                      </div>
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
                disabled={loading}
                id="ef2-hantar"

              >
                {loading ? 'Hantar...' : 'Hantar Aduan'}
              </button>
              <button
                type="button"
                className="aduan-reset-btn"
                onClick={handleReset}
              >
                Padam Semula
              </button>

            </div>

          </form>

          {/* Disclaimer */}
          <div className="aduan-disclaimer">
            <strong>Penafian:</strong>{' '}
            Saya mengaku bahawa segala maklumat aduan yang dikemukakan adalah benar dan saya bertanggungjawab ke atas aduan tersebut.
            Sistem ini disediakan untuk pengurusan aduan rasmi UiTM. Semua data yang dikemukakan adalah sulit dan hanya untuk kegunaan dalaman universiti.
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
            <Link href="/login?callbackUrl=/aduan/fasiliti" className="lp-login-btn" id="anav-login">
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

export default function AduanFasilitiPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><div className="spinner" /></div>}>
      <AduanFasilitiContent />
    </Suspense>
  );
}
