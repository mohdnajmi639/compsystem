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
              <div className="aduan-section-body" style={{ backgroundColor: '#ffffff', padding: '16px', borderRadius: 0, border: '1px solid #d8b4e2' }}>

                {/* ── Step 1: Lokasi Lain radio ── */}
                <div style={{ marginBottom: '4px', paddingLeft: '80px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', fontSize: '0.85rem', color: '#000' }} htmlFor="ef2-lokasi-lain">
                    <input
                      id="ef2-lokasi-lain"
                      type="radio"
                      name="lokasi"
                      value="lokasi_lain"
                      checked={lokasiPilih === 'lokasi_lain'}
                      onChange={() => setLokasiPilih('lokasi_lain')}
                      style={{ margin: 0 }}
                    />
                    Lokasi Lain
                  </label>
                </div>

                {/* ── Step 2: Dalam Bangunan / Luar Bangunan ── */}
                {lokasiPilih === 'lokasi_lain' && (
                  <div style={{ display: 'flex', paddingLeft: '80px', marginBottom: '16px' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', fontSize: '0.85rem', color: '#000', width: '280px' }} htmlFor="ef2-dalam">
                      <input
                        id="ef2-dalam"
                        type="radio"
                        name="jenis_bangunan"
                        value="dalam"
                        checked={jenisBangunan === 'dalam'}
                        onChange={() => setJenisBangunan('dalam')}
                        style={{ margin: 0 }}
                      />
                      Dalam Bangunan
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', fontSize: '0.85rem', color: '#000' }} htmlFor="ef2-luar">
                      <input
                        id="ef2-luar"
                        type="radio"
                        name="jenis_bangunan"
                        value="luar"
                        checked={jenisBangunan === 'luar'}
                        onChange={() => setJenisBangunan('luar')}
                        style={{ margin: 0 }}
                      />
                      Luar Bangunan
                    </label>
                  </div>
                )}

                {/* ══ DALAM BANGUNAN / LUAR BANGUNAN FORM ══ */}
                {lokasiPilih === 'lokasi_lain' && jenisBangunan && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: '20px' }}>
                    
                    {/* LEFT COLUMN - LOKASI LAIN */}
                    <div style={{ width: '48%' }}>
                      <div style={{ textAlign: 'center', fontWeight: 'bold', color: '#000', fontSize: '0.85rem', marginBottom: '8px' }}>Lokasi Lain</div>
                      
                      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '4px' }}>
                        <label style={{ width: '140px', textAlign: 'right', marginRight: '4px', color: '#000', fontSize: '0.8rem' }}>
                          Negeri:
                        </label>
                        <input type="text" disabled readOnly style={{ width: '120px', padding: '7px 10px', border: '1px solid #d1d5db', fontSize: '0.8rem', backgroundColor: '#fff', color: '#000' }} value="B - Selangor" />
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '4px' }}>
                        <label style={{ width: '140px', textAlign: 'right', marginRight: '4px', color: '#000', fontSize: '0.8rem' }}>
                          Kampus :
                        </label>
                        <input type="text" disabled readOnly style={{ width: '220px', padding: '7px 10px', border: '1px solid #d1d5db', fontSize: '0.8rem', backgroundColor: '#fff', color: '#000' }} value="B04 - Kampus Puncak Perdana" />
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '4px' }}>
                        <label style={{ width: '140px', textAlign: 'right', marginRight: '4px', color: '#000', fontSize: '0.8rem' }}>
                          Bangunan:<span style={{ color: 'red' }}>*</span>
                        </label>
                        <select style={{ width: '180px', padding: '7px 10px', border: '1px solid #d1d5db', fontSize: '0.8rem' }} value={jenisBangunan === 'dalam' ? dbBangunan : lbBangunan} onChange={e => jenisBangunan === 'dalam' ? setDbBangunan(e.target.value) : setLbBangunan(e.target.value)}>
                          {BANGUNAN_OPTS.map(o => <option key={o} value={o}>{o}</option>)}
                        </select>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '4px' }}>
                        <label style={{ width: '140px', textAlign: 'right', marginRight: '4px', color: '#000', fontSize: '0.8rem' }}>
                          Blok:<span style={{ color: 'red' }}>*</span>
                        </label>
                        <select style={{ width: '100px', padding: '7px 10px', border: '1px solid #d1d5db', fontSize: '0.8rem' }} value={jenisBangunan === 'dalam' ? dbBlok : lbBlok} onChange={e => jenisBangunan === 'dalam' ? setDbBlok(e.target.value) : setLbBlok(e.target.value)}>
                          {BLOK_OPTS.map(o => <option key={o} value={o}>{o}</option>)}
                        </select>
                      </div>

                      {jenisBangunan === 'dalam' && (
                        <>
                          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '4px' }}>
                            <label style={{ width: '140px', textAlign: 'right', marginRight: '4px', color: '#000', fontSize: '0.8rem' }}>
                              Aras :
                            </label>
                            <select style={{ width: '100px', padding: '7px 10px', border: '1px solid #d1d5db', fontSize: '0.8rem' }} value={dbAras} onChange={e => setDbAras(e.target.value)}>
                              {ARAS_OPTS.map(o => <option key={o} value={o}>{o}</option>)}
                            </select>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '4px' }}>
                            <label style={{ width: '140px', textAlign: 'right', marginRight: '4px', color: '#000', fontSize: '0.8rem' }}>
                              Ruang :
                            </label>
                            <select style={{ width: '100px', padding: '7px 10px', border: '1px solid #d1d5db', fontSize: '0.8rem' }} value={dbRuang} onChange={e => setDbRuang(e.target.value)}>
                              {RUANG_OPTS.map(o => <option key={o} value={o}>{o}</option>)}
                            </select>
                          </div>
                        </>
                      )}

                      {jenisBangunan === 'luar' && (
                        <>
                          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '4px' }}>
                            <label style={{ width: '140px', textAlign: 'right', marginRight: '4px', color: '#000', fontSize: '0.8rem' }}>
                              Kategori Infra :<span style={{ color: 'red' }}>*</span>
                            </label>
                            <select style={{ width: '120px', padding: '7px 10px', border: '1px solid #d1d5db', fontSize: '0.8rem' }} value={lbKatInfra} onChange={e => setLbKatInfra(e.target.value)}>
                              {KATEGORI_INFRA_OPTS.map(o => <option key={o} value={o}>{o}</option>)}
                            </select>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '4px' }}>
                            <label style={{ width: '140px', textAlign: 'right', marginRight: '4px', color: '#000', fontSize: '0.8rem' }}>
                              Sub Kategori Infra :<span style={{ color: 'red' }}>*</span>
                            </label>
                            <select style={{ width: '120px', padding: '7px 10px', border: '1px solid #d1d5db', fontSize: '0.8rem' }} value={lbSubInfra} onChange={e => setLbSubInfra(e.target.value)}>
                              {SUB_KATEGORI_INFRA_OPTS.map(o => <option key={o} value={o}>{o}</option>)}
                            </select>
                          </div>
                        </>
                      )}

                      <div style={{ display: 'flex', alignItems: 'flex-start', marginBottom: '4px' }}>
                        <label style={{ width: '140px', textAlign: 'right', marginRight: '4px', color: '#000', fontSize: '0.8rem', paddingTop: '2px' }}>
                          Keterangan lokasi :<span style={{ color: 'red' }}>*</span>
                        </label>
                        <textarea rows={3} style={{ width: '280px', padding: '8px 10px', border: '1px solid #d1d5db', fontSize: '0.8rem', resize: 'vertical' }} value={jenisBangunan === 'dalam' ? dbKeterangan : lbKeterangan} onChange={e => jenisBangunan === 'dalam' ? setDbKeterangan(e.target.value) : setLbKeterangan(e.target.value)} />
                      </div>
                    </div>

                    {/* RIGHT COLUMN - JENIS KEROSAKAN */}
                    <div style={{ width: '48%' }}>
                      <div style={{ textAlign: 'center', fontWeight: 'bold', color: '#000', fontSize: '0.85rem', marginBottom: '8px' }}>Jenis Kerosakan</div>
                      
                      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '4px' }}>
                        <label style={{ width: '280px', textAlign: 'right', marginRight: '4px', color: '#000', fontSize: '0.8rem' }}>
                          Seksyen:<span style={{ color: 'red' }}>*</span>
                        </label>
                        <select style={{ width: '200px', padding: '7px 10px', border: '1px solid #d1d5db', fontSize: '0.8rem' }} value={seksyen} onChange={e => setSeksyen(e.target.value)}>
                          {SEKSYEN_OPTS.map(o => <option key={o} value={o}>{o}</option>)}
                        </select>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '4px' }}>
                        <label style={{ width: '280px', textAlign: 'right', marginRight: '4px', color: '#000', fontSize: '0.8rem' }}>
                          Elemen :<span style={{ color: 'red' }}>*</span>
                        </label>
                        <select style={{ width: '100px', padding: '7px 10px', border: '1px solid #d1d5db', fontSize: '0.8rem' }} value={elemen} onChange={e => setElemen(e.target.value)}>
                          {ELEMEN_OPTS.map(o => <option key={o} value={o}>{o}</option>)}
                        </select>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '4px' }}>
                        <label style={{ width: '280px', textAlign: 'right', marginRight: '4px', color: '#000', fontSize: '0.8rem' }}>
                          Masalah:<span style={{ color: 'red' }}>*</span>
                        </label>
                        <select style={{ width: '100px', padding: '7px 10px', border: '1px solid #d1d5db', fontSize: '0.8rem' }} value={masalah} onChange={e => setMasalah(e.target.value)}>
                          {MASALAH_OPTS.map(o => <option key={o} value={o}>{o}</option>)}
                        </select>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'flex-start', marginBottom: '4px' }}>
                        <label style={{ width: '280px', textAlign: 'right', marginRight: '4px', color: '#000', fontSize: '0.8rem', paddingTop: '2px', lineHeight: '1.2' }}>
                          Keterangan kerosakan (Sila isikan<br/>keterangan terperinci, cth<br/>no.telefon): <span style={{ color: 'red' }}>*</span>
                        </label>
                        <textarea rows={3} style={{ width: '280px', padding: '8px 10px', border: '1px solid #d1d5db', fontSize: '0.8rem', resize: 'vertical' }} value={ketKerosakan} onChange={e => setKetKerosakan(e.target.value)} />
                      </div>
                    </div>

                  </div>
                )}

              </div>
            </div>

            {/* ── Actions ── */}
            <div style={{ textAlign: 'center', marginTop: '20px' }}>
              <button
                type="submit"
                disabled={loading}
                id="ef2-hantar"
                className="btn btn-primary" style={{ padding: '10px 24px', fontWeight: 600, fontSize: '0.9rem' }}
              >
                {loading ? 'Hantar...' : 'Hantar'}
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
