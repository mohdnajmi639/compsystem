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
const BANGUNAN_OPTS = ['--Sila Pilih--','Bangunan Akademik 1','Bangunan Akademik 2','Bangunan Pentadbiran','Perpustakaan','Dewan Besar','Kafeteria','Kolej Kediaman A','Kolej Kediaman B','Makmal Komputer','Pusat Sukan'];
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
  const [dbNegeri, setDbNegeri]     = useState('-- Sila Pilih --');
  const [dbKampus]                  = useState('UiTM Kampus Puncak Perdana');
  const [dbBangunan, setDbBangunan] = useState('--Sila Pilih--');
  const [dbBlok, setDbBlok]         = useState('--Sila Pilih--');
  const [dbAras, setDbAras]         = useState('--Sila Pilih--');
  const [dbRuang, setDbRuang]       = useState('--Sila Pilih--');
  const [dbKeterangan, setDbKeterangan] = useState('');

  /* ── Luar Bangunan fields ── */
  const [lbNegeri, setLbNegeri]         = useState('-- Sila Pilih --');
  const [lbKampus]                      = useState('UiTM Kampus Puncak Perdana');
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
    setDbNegeri('-- Sila Pilih --');
    setDbBangunan('--Sila Pilih--'); setDbBlok('--Sila Pilih--');
    setDbAras('--Sila Pilih--');     setDbRuang('--Sila Pilih--');
    setDbKeterangan('');
    setLbNegeri('-- Sila Pilih --');
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

                <p className="aduan-field-hint" style={{ marginBottom: 12, fontWeight: 600 }}>
                  * Lokasi kerosakan:
                </p>

                {/* ── Step 1: Lokasi Lain radio ── */}
                <div style={{ marginBottom: 12 }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: '0.9rem', fontWeight: 500 }} htmlFor="ef2-lokasi-lain">
                    <input
                      id="ef2-lokasi-lain"
                      type="radio"
                      name="lokasi"
                      value="lokasi_lain"
                      checked={lokasiPilih === 'lokasi_lain'}
                      onChange={() => setLokasiPilih('lokasi_lain')}
                      style={{ accentColor: '#7c3aed', width: 16, height: 16 }}
                    />
                    Lokasi Lain
                  </label>
                </div>

                {/* ── Step 2: Dalam Bangunan / Luar Bangunan ── */}
                {lokasiPilih === 'lokasi_lain' && (
                  <div style={{ display: 'flex', gap: 32, marginBottom: 20 }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: '0.9rem', fontWeight: 500 }} htmlFor="ef2-dalam">
                      <input
                        id="ef2-dalam"
                        type="radio"
                        name="jenis_bangunan"
                        value="dalam"
                        checked={jenisBangunan === 'dalam'}
                        onChange={() => setJenisBangunan('dalam')}
                        style={{ accentColor: '#7c3aed', width: 16, height: 16 }}
                      />
                      Dalam Bangunan
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: '0.9rem', fontWeight: 500 }} htmlFor="ef2-luar">
                      <input
                        id="ef2-luar"
                        type="radio"
                        name="jenis_bangunan"
                        value="luar"
                        checked={jenisBangunan === 'luar'}
                        onChange={() => setJenisBangunan('luar')}
                        style={{ accentColor: '#7c3aed', width: 16, height: 16 }}
                      />
                      Luar Bangunan
                    </label>
                  </div>
                )}

                {/* ══ DALAM BANGUNAN form ══ */}
                {lokasiPilih === 'lokasi_lain' && jenisBangunan === 'dalam' && (
                  <div className="aduan-field-grid aduan-field-grid-2" style={{ gap: '16px 24px' }}>

                    {/* Left — Lokasi */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                      <div style={{ background: '#7c3aed', color: '#fff', fontWeight: 700, fontSize: '0.8rem', padding: '8px 14px', borderRadius: 4, letterSpacing: '0.04em' }}>
                        LOKASI LAIN
                      </div>
                      <div className="aduan-field">
                        <label className="aduan-label">Negeri :*</label>
                        <Sel id="ef2-db-negeri" value={dbNegeri} onChange={setDbNegeri} opts={NEGERI_OPTS} />
                      </div>

                      <div className="aduan-field">
                        <label className="aduan-label">Bangunan :*</label>
                        <Sel id="ef2-db-bangunan" value={dbBangunan} onChange={setDbBangunan} opts={BANGUNAN_OPTS} />
                      </div>
                      <div className="aduan-field">
                        <label className="aduan-label">Blok :*</label>
                        <Sel id="ef2-db-blok" value={dbBlok} onChange={setDbBlok} opts={BLOK_OPTS} />
                      </div>
                      <div className="aduan-field">
                        <label className="aduan-label">Aras :</label>
                        <Sel id="ef2-db-aras" value={dbAras} onChange={setDbAras} opts={ARAS_OPTS} />
                      </div>
                      <div className="aduan-field">
                        <label className="aduan-label">Ruang :</label>
                        <Sel id="ef2-db-ruang" value={dbRuang} onChange={setDbRuang} opts={RUANG_OPTS} />
                      </div>
                      <div className="aduan-field">
                        <label className="aduan-label">Keterangan Lokasi :*</label>
                        <textarea
                          className="aduan-textarea"
                          id="ef2-db-ket"
                          rows={4}
                          value={dbKeterangan}
                          onChange={e => setDbKeterangan(e.target.value)}
                        />
                      </div>
                    </div>

                    {/* Right — Jenis Kerosakan */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                      <div style={{ background: '#7c3aed', color: '#fff', fontWeight: 700, fontSize: '0.8rem', padding: '8px 14px', borderRadius: 4, letterSpacing: '0.04em' }}>
                        JENIS KEROSAKAN
                      </div>
                      <div className="aduan-field">
                        <label className="aduan-label">Seksyen :*</label>
                        <Sel id="ef2-seksyen" value={seksyen} onChange={setSeksyen} opts={SEKSYEN_OPTS} />
                      </div>
                      <div className="aduan-field">
                        <label className="aduan-label">Elemen :*</label>
                        <Sel id="ef2-elemen" value={elemen} onChange={setElemen} opts={ELEMEN_OPTS} />
                      </div>
                      <div className="aduan-field">
                        <label className="aduan-label">Masalah :*</label>
                        <Sel id="ef2-masalah" value={masalah} onChange={setMasalah} opts={MASALAH_OPTS} />
                      </div>
                      <div className="aduan-field">
                        <label className="aduan-label" style={{ color: '#1e88e5', lineHeight: 1.4 }}>
                          Keterangan Kerosakan<br />(Sila isikan keterangan terperinci, cth no. telefon) :*
                        </label>
                        <textarea
                          className="aduan-textarea"
                          id="ef2-ket-kerosakan-db"
                          rows={4}
                          value={ketKerosakan}
                          onChange={e => setKetKerosakan(e.target.value)}
                        />
                      </div>
                    </div>

                  </div>
                )}

                {/* ══ LUAR BANGUNAN form ══ */}
                {lokasiPilih === 'lokasi_lain' && jenisBangunan === 'luar' && (
                  <div className="aduan-field-grid aduan-field-grid-2" style={{ gap: '16px 24px' }}>

                    {/* Left — Lokasi (infra) */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                      <div style={{ background: '#7c3aed', color: '#fff', fontWeight: 700, fontSize: '0.8rem', padding: '8px 14px', borderRadius: 4, letterSpacing: '0.04em' }}>
                        LOKASI LAIN
                      </div>
                      <div className="aduan-field">
                        <label className="aduan-label">Negeri :*</label>
                        <Sel id="ef2-lb-negeri" value={lbNegeri} onChange={setLbNegeri} opts={NEGERI_OPTS} />
                      </div>

                      <div className="aduan-field">
                        <label className="aduan-label">Bangunan :*</label>
                        <Sel id="ef2-lb-bangunan" value={lbBangunan} onChange={setLbBangunan} opts={BANGUNAN_OPTS} />
                      </div>
                      <div className="aduan-field">
                        <label className="aduan-label">Blok :*</label>
                        <Sel id="ef2-lb-blok" value={lbBlok} onChange={setLbBlok} opts={BLOK_OPTS} />
                      </div>
                      <div className="aduan-field">
                        <label className="aduan-label">Kategori Infra :*</label>
                        <Sel id="ef2-lb-katinfra" value={lbKatInfra} onChange={setLbKatInfra} opts={KATEGORI_INFRA_OPTS} />
                      </div>
                      <div className="aduan-field">
                        <label className="aduan-label">Sub Kategori Infra :*</label>
                        <Sel id="ef2-lb-subinfra" value={lbSubInfra} onChange={setLbSubInfra} opts={SUB_KATEGORI_INFRA_OPTS} />
                      </div>
                      <div className="aduan-field">
                        <label className="aduan-label">Keterangan Lokasi :*</label>
                        <textarea
                          className="aduan-textarea"
                          id="ef2-lb-ket"
                          rows={4}
                          value={lbKeterangan}
                          onChange={e => setLbKeterangan(e.target.value)}
                        />
                      </div>
                    </div>

                    {/* Right — Jenis Kerosakan */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                      <div style={{ background: '#7c3aed', color: '#fff', fontWeight: 700, fontSize: '0.8rem', padding: '8px 14px', borderRadius: 4, letterSpacing: '0.04em' }}>
                        JENIS KEROSAKAN
                      </div>
                      <div className="aduan-field">
                        <label className="aduan-label">Seksyen :*</label>
                        <Sel id="ef2-seksyen-lb" value={seksyen} onChange={setSeksyen} opts={SEKSYEN_OPTS} />
                      </div>
                      <div className="aduan-field">
                        <label className="aduan-label">Elemen :*</label>
                        <Sel id="ef2-elemen-lb" value={elemen} onChange={setElemen} opts={ELEMEN_OPTS} />
                      </div>
                      <div className="aduan-field">
                        <label className="aduan-label">Masalah :*</label>
                        <Sel id="ef2-masalah-lb" value={masalah} onChange={setMasalah} opts={MASALAH_OPTS} />
                      </div>
                      <div className="aduan-field">
                        <label className="aduan-label" style={{ color: '#1e88e5', lineHeight: 1.4 }}>
                          Keterangan Kerosakan<br />(Sila isikan keterangan terperinci, cth no. telefon) :*
                        </label>
                        <textarea
                          className="aduan-textarea"
                          id="ef2-ket-kerosakan-lb"
                          rows={4}
                          value={ketKerosakan}
                          onChange={e => setKetKerosakan(e.target.value)}
                        />
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
                {loading ? 'Menghantar...' : 'Hantar Aduan'}
              </button>
              <button
                type="button"
                className="aduan-reset-btn"
                onClick={handleReset}
                id="fasiliti-reset"
              >
                Padam Semula
              </button>
              <Link href="/" className="aduan-cancel-btn" id="ef2-kembali">Batal</Link>
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
        <p className="lp-footer-copy">© Pejabat Komunikasi Strategik, UiTM 2025</p>
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
