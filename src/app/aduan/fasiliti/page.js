'use client';
import { useState, useEffect, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';

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
  const [dbKampus, setDbKampus]     = useState('--Sila Pilih--');
  const [dbBangunan, setDbBangunan] = useState('--Sila Pilih--');
  const [dbBlok, setDbBlok]         = useState('--Sila Pilih--');
  const [dbAras, setDbAras]         = useState('--Sila Pilih--');
  const [dbRuang, setDbRuang]       = useState('--Sila Pilih--');
  const [dbKeterangan, setDbKeterangan] = useState('');

  /* ── Luar Bangunan fields ── */
  const [lbNegeri, setLbNegeri]         = useState('-- Sila Pilih --');
  const [lbKampus, setLbKampus]         = useState('--Sila Pilih--');
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
  const userFaculty = session?.user?.faculty || 'KOLEJ PENGAJIAN PENGKOMPUTERAN, INFORMATIK DAN MATEMATIK';
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
    if (kampus.startsWith('--')) { setError('Sila pilih Kampus.'); return; }
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
    setDbNegeri('-- Sila Pilih --'); setDbKampus('--Sila Pilih--');
    setDbBangunan('--Sila Pilih--'); setDbBlok('--Sila Pilih--');
    setDbAras('--Sila Pilih--');     setDbRuang('--Sila Pilih--');
    setDbKeterangan('');
    setLbNegeri('-- Sila Pilih --'); setLbKampus('--Sila Pilih--');
    setLbBangunan('--Sila Pilih--'); setLbBlok('--Sila Pilih--');
    setLbKatInfra('--Sila Pilih--'); setLbSubInfra('--Sila Pilih--');
    setLbKeterangan('');
    setSeksyen('--Sila Pilih--'); setElemen('--Sila Pilih--');
    setMasalah('--Sila Pilih--'); setKetKerosakan('');
    setError(''); setSubmitted(false);
  };

  if (status === 'loading') {
    return (
      <div className="ef-root">
        <div style={{ display:'flex', alignItems:'center', justifyContent:'center', flex:1, minHeight:'100vh' }}>
          <div className="spinner" />
        </div>
      </div>
    );
  }

  /* ── Shared select helper ── */
  const Sel = ({ id, value, onChange, opts }) => (
    <select id={id} className="ef2-select" value={value} onChange={e => onChange(e.target.value)}>
      {opts.map(o => <option key={o} value={o}>{o}</option>)}
    </select>
  );

  return (
    <div className="ef-root">

      {/* ── Top strip ── */}
      <div className="ef-topstrip" />

      {/* ── Header ── */}
      <header className="ef-header">
        <div className="ef-header-logo">
          <div className="ef-logo-box">
            <svg width="52" height="52" viewBox="0 0 60 60" fill="none">
              <rect x="0" y="0" width="60" height="60" fill="#6b0d8a" rx="4" />
              <text x="30" y="22" textAnchor="middle" fontFamily="Georgia, serif" fontWeight="900" fontSize="11" fill="#f5c518">UNIVERSITI</text>
              <text x="30" y="34" textAnchor="middle" fontFamily="Georgia, serif" fontWeight="900" fontSize="9"  fill="white">TEKNOLOGI</text>
              <text x="30" y="46" textAnchor="middle" fontFamily="Georgia, serif" fontWeight="900" fontSize="11" fill="#f5c518">MARA</text>
            </svg>
          </div>
        </div>
        <div className="ef-header-title">
          <h1 className="ef-title">e-Aduan Fasiliti</h1>
          <p className="ef-subtitle">Sistem Pengurusan Aduan dan Perkhidmatan Pejabat Pengurusan Fasiliti v.2</p>
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
              <rect x="14" y="30" width="4" height="5" fill="white" opacity="0.5" />
              <rect x="20" y="30" width="4" height="5" fill="white" opacity="0.5" />
              <rect x="36" y="18" width="5" height="6" fill="white" opacity="0.5" />
              <rect x="44" y="18" width="5" height="6" fill="white" opacity="0.5" />
              <rect x="36" y="28" width="5" height="6" fill="white" opacity="0.5" />
              <rect x="44" y="28" width="5" height="6" fill="white" opacity="0.5" />
              <rect x="66" y="36" width="4" height="5" fill="white" opacity="0.5" />
              <rect x="72" y="36" width="4" height="5" fill="white" opacity="0.5" />
            </svg>
          </div>
        </div>
      </header>

      {/* ── Purple bar ── */}
      <div className="ef-purplebar" />

      {/* ── Top-right action links ── */}
      <div className="ef2-toplinks">
        <Link href="/dashboard/complaints" className="ef2-toplink" id="ef2-semak-aduan">Semak Aduan</Link>
        <span className="ef2-toplink-sep">|</span>
        <button
          className="ef2-toplink ef2-toplink-btn"
          onClick={() => signOut({ callbackUrl: '/' })}
          id="ef2-keluar"
        >
          Keluar
        </button>
      </div>

      {/* ── Main body ── */}
      <main className="ef2-body">

        {submitted ? (
          /* ── Success ── */
          <div className="ef2-card">
            <div className="ef2-card-hdr">Aduan Berjaya Dihantar</div>
            <div style={{ padding: '24px 20px', textAlign:'center', background:'#f3e5f5' }}>
              <p style={{ color:'#4a0070', fontWeight:600, marginBottom:16 }}>
                Terima kasih. Aduan Fasiliti anda telah diterima dan akan diproses.
              </p>
              <button className="ef2-btn-hantar" onClick={handleReset} id="ef2-aduan-baharu">
                Hantar Aduan Baharu
              </button>
              <span style={{ margin:'0 10px', color:'#888' }}>|</span>
              <Link href="/dashboard/complaints" className="ef2-link" id="ef2-semak-link">Semak Status Aduan</Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleHantar} noValidate>

            {error && <div className="ef2-error">{error}</div>}

            {/* ══════════════════════════════════
                SECTION 1.0 — Maklumat Pengguna
            ══════════════════════════════════ */}
            <div className="ef2-card" style={{ marginBottom: 6 }}>
              <div className="ef2-card-hdr">1.0 Maklumat anda seperti berikut:</div>
              <div className="ef2-userinfo-grid">

                {/* Row 1 */}
                <span className="ef2-ui-label">Nama Pelajar</span>
                <span className="ef2-ui-colon">:</span>
                <span className="ef2-ui-value ef2-ui-orange">{userName.toUpperCase()}</span>
                <span className="ef2-ui-label">Kampus</span>
                <span className="ef2-ui-colon">:</span>
                <span className="ef2-ui-value">{userCampus}</span>

                {/* Row 2 */}
                <span className="ef2-ui-label">Fakulti</span>
                <span className="ef2-ui-colon">:</span>
                <span className="ef2-ui-value ef2-ui-orange">{userFaculty}</span>
                <span className="ef2-ui-label">E-mail</span>
                <span className="ef2-ui-colon">:</span>
                <span className="ef2-ui-value">{userEmail}</span>

                {/* Row 3 */}
                <span className="ef2-ui-label">No. telefon</span>
                <span className="ef2-ui-colon">:</span>
                <span className="ef2-ui-value ef2-ui-orange">
                  <input
                    className="ef2-inline-input"
                    type="tel"
                    value={telefon}
                    onChange={e => setTelefon(e.target.value)}
                    placeholder="01X-XXXXXXXX"
                    id="ef2-telefon"
                  />
                </span>
                <span className="ef2-ui-label" />
                <span className="ef2-ui-colon" />
                <span className="ef2-ui-value" />

                {/* Row 4 */}
                <span className="ef2-ui-label">Program</span>
                <span className="ef2-ui-colon">:</span>
                <span className="ef2-ui-value">{userProgram || userId}</span>
                <span className="ef2-ui-label" />
                <span className="ef2-ui-colon" />
                <span className="ef2-ui-value" />

              </div>
            </div>

            {/* ══════════════════════════════════
                SECTION 2.0 — Lokasi & Kerosakan
            ══════════════════════════════════ */}
            <div className="ef2-card">
              <div className="ef2-card-hdr">2.0 Nyatakan lokasi dan jenis kerosakan:</div>
              <div className="ef2-section2-body">

                {/* ── Lokasi kerosakan label ── */}
                <p className="ef2-lokasi-label">* Lokasi kerosakan:</p>

                {/* ── Step 1: Lokasi Lain radio ── */}
                <div className="ef2-radio-row">
                  <label className="ef2-radio-lbl" htmlFor="ef2-lokasi-lain">
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

                {/* ── Step 2: Dalam Bangunan / Luar Bangunan (only after Lokasi Lain selected) ── */}
                {lokasiPilih === 'lokasi_lain' && (
                  <div className="ef2-jenis-row">
                    <label className="ef2-radio-lbl" htmlFor="ef2-dalam">
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
                    <label className="ef2-radio-lbl" htmlFor="ef2-luar" style={{ marginLeft: 40 }}>
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
                )}

                {/* ══════════════════════════════════
                    DALAM BANGUNAN form
                ══════════════════════════════════ */}
                {lokasiPilih === 'lokasi_lain' && jenisBangunan === 'dalam' && (
                  <div className="ef2-twocol">

                    {/* Left — Lokasi Lain fields */}
                    <div className="ef2-col">
                      <div className="ef2-col-hdr">Lokasi Lain</div>
                      <div className="ef2-field-grid">
                        <label className="ef2-fl">Negeri :*</label>
                        <Sel id="ef2-db-negeri" value={dbNegeri} onChange={setDbNegeri} opts={NEGERI_OPTS} />
                        <label className="ef2-fl">Kampus :*</label>
                        <Sel id="ef2-db-kampus" value={dbKampus} onChange={setDbKampus} opts={KAMPUS_OPTS} />
                        <label className="ef2-fl">Bangunan :*</label>
                        <Sel id="ef2-db-bangunan" value={dbBangunan} onChange={setDbBangunan} opts={BANGUNAN_OPTS} />
                        <label className="ef2-fl">Blok :*</label>
                        <Sel id="ef2-db-blok" value={dbBlok} onChange={setDbBlok} opts={BLOK_OPTS} />
                        <label className="ef2-fl">Aras :</label>
                        <Sel id="ef2-db-aras" value={dbAras} onChange={setDbAras} opts={ARAS_OPTS} />
                        <label className="ef2-fl">Ruang :</label>
                        <Sel id="ef2-db-ruang" value={dbRuang} onChange={setDbRuang} opts={RUANG_OPTS} />
                        <label className="ef2-fl ef2-fl-top">Keterangan lokasi :*</label>
                        <textarea
                          className="ef2-textarea"
                          id="ef2-db-ket"
                          rows={4}
                          value={dbKeterangan}
                          onChange={e => setDbKeterangan(e.target.value)}
                        />
                      </div>
                    </div>

                    {/* Right — Jenis Kerosakan */}
                    <div className="ef2-col">
                      <div className="ef2-col-hdr">Jenis Kerosakan</div>
                      <div className="ef2-field-grid">
                        <label className="ef2-fl">Seksyen :*</label>
                        <Sel id="ef2-seksyen" value={seksyen} onChange={setSeksyen} opts={SEKSYEN_OPTS} />
                        <label className="ef2-fl">Elemen :*</label>
                        <Sel id="ef2-elemen" value={elemen} onChange={setElemen} opts={ELEMEN_OPTS} />
                        <label className="ef2-fl">Masalah :*</label>
                        <Sel id="ef2-masalah" value={masalah} onChange={setMasalah} opts={MASALAH_OPTS} />
                        <label className="ef2-fl ef2-fl-top" style={{ color:'#1e88e5', fontSize:'0.75rem', lineHeight:1.3 }}>
                          Keterangan kerosakan<br/>(Sila isikan keterangan terperinci, cth no.telefon) :*
                        </label>
                        <textarea
                          className="ef2-textarea"
                          id="ef2-ket-kerosakan-db"
                          rows={4}
                          value={ketKerosakan}
                          onChange={e => setKetKerosakan(e.target.value)}
                        />
                      </div>
                    </div>

                  </div>
                )}

                {/* ══════════════════════════════════
                    LUAR BANGUNAN form
                ══════════════════════════════════ */}
                {lokasiPilih === 'lokasi_lain' && jenisBangunan === 'luar' && (
                  <div className="ef2-twocol">

                    {/* Left — Lokasi Lain (infra) */}
                    <div className="ef2-col">
                      <div className="ef2-col-hdr">Lokasi Lain</div>
                      <div className="ef2-field-grid">
                        <label className="ef2-fl">Negeri :*</label>
                        <Sel id="ef2-lb-negeri" value={lbNegeri} onChange={setLbNegeri} opts={NEGERI_OPTS} />
                        <label className="ef2-fl">Kampus :*</label>
                        <Sel id="ef2-lb-kampus" value={lbKampus} onChange={setLbKampus} opts={KAMPUS_OPTS} />
                        <label className="ef2-fl">Bangunan :*</label>
                        <Sel id="ef2-lb-bangunan" value={lbBangunan} onChange={setLbBangunan} opts={BANGUNAN_OPTS} />
                        <label className="ef2-fl">Blok :*</label>
                        <Sel id="ef2-lb-blok" value={lbBlok} onChange={setLbBlok} opts={BLOK_OPTS} />
                        <label className="ef2-fl">Kategori Infra :*</label>
                        <Sel id="ef2-lb-katinfra" value={lbKatInfra} onChange={setLbKatInfra} opts={KATEGORI_INFRA_OPTS} />
                        <label className="ef2-fl">Sub Kategori Infra :*</label>
                        <Sel id="ef2-lb-subinfra" value={lbSubInfra} onChange={setLbSubInfra} opts={SUB_KATEGORI_INFRA_OPTS} />
                        <label className="ef2-fl ef2-fl-top">Keterangan lokasi :*</label>
                        <textarea
                          className="ef2-textarea"
                          id="ef2-lb-ket"
                          rows={4}
                          value={lbKeterangan}
                          onChange={e => setLbKeterangan(e.target.value)}
                        />
                      </div>
                    </div>

                    {/* Right — Jenis Kerosakan */}
                    <div className="ef2-col">
                      <div className="ef2-col-hdr">Jenis Kerosakan</div>
                      <div className="ef2-field-grid">
                        <label className="ef2-fl">Seksyen :*</label>
                        <Sel id="ef2-seksyen-lb" value={seksyen} onChange={setSeksyen} opts={SEKSYEN_OPTS} />
                        <label className="ef2-fl">Elemen :*</label>
                        <Sel id="ef2-elemen-lb" value={elemen} onChange={setElemen} opts={ELEMEN_OPTS} />
                        <label className="ef2-fl">Masalah :*</label>
                        <Sel id="ef2-masalah-lb" value={masalah} onChange={setMasalah} opts={MASALAH_OPTS} />
                        <label className="ef2-fl ef2-fl-top" style={{ color:'#1e88e5', fontSize:'0.75rem', lineHeight:1.3 }}>
                          Keterangan kerosakan<br/>(Sila isikan keterangan terperinci, cth no.telefon) :*
                        </label>
                        <textarea
                          className="ef2-textarea"
                          id="ef2-ket-kerosakan-lb"
                          rows={4}
                          value={ketKerosakan}
                          onChange={e => setKetKerosakan(e.target.value)}
                        />
                      </div>
                    </div>

                  </div>
                )}

                {/* ── Hantar button ── */}
                <div className="ef2-hantar-center">
                  <button type="submit" className="ef2-btn-hantar" disabled={loading} id="ef2-hantar">
                    {loading ? 'Sila tunggu...' : 'Hantar'}
                  </button>
                </div>

              </div>{/* /section2-body */}
            </div>

            {/* ── Penafian ── */}
            <p className="ef2-penafian">
              - <strong>Penafian</strong> : Saya mengaku bahawa segala maklumat aduan yang dikemukakan adalah benar dan saya bertanggungjawab ke atas aduan tersebut.
            </p>

          </form>
        )}

        {/* ── Kembali bar ── */}
        <div className="ef2-kembali-bar">
          <Link href="/" className="ef2-kembali" id="ef2-kembali">
            &lt;&lt; Kembali
          </Link>
        </div>

        {/* ── Footer copyright ── */}
        <div className="ef2-footer-copy">
          HAKCIPTA TERPELIHARA © 2009 PPF dan DFMS, UiTM SHAH ALAM.
        </div>

      </main>
    </div>
  );
}

export default function AduanFasilitiPage() {
  return (
    <Suspense
      fallback={
        <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'#6b0d8a' }}>
          <div className="spinner" />
        </div>
      }
    >
      <AduanFasilitiContent />
    </Suspense>
  );
}
