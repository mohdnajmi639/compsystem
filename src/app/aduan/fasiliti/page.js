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
const BANGUNAN_OPTS = ['--Sila Pilih--','Blok Akademik','Jasmine 1','Jasmine 2','Jasmine 3','Jasmine 4','Jasmine 5','Surau','Dewan Makan','Pos Pengawal Kolej','Perhentian Bas'];
const ARAS_OPTS = ['--Sila Pilih--','Aras 1','Aras 2','Aras 3','Aras 4','Aras 5'];
const RUANG_OPTS = ['--Sila Pilih--','Bilik Darjah','Makmal','Pejabat','Tandas','Koridor','Parkir','Padang'];
const KATEGORI_INFRA_OPTS = ['--Sila Pilih--','Elektrik','Awam / Sivil','Mekanikal','Landskap','Telekomunikasi','Pembetungan','Paving / Perkerasan'];
const SUB_KATEGORI_INFRA_OPTS = ['--Sila Pilih--','Lampu Jalan','Saliran','Parit','Laluan Pejalan Kaki','Pagar','Tanda Jalan','Lain-lain'];
const SEKSYEN_OPTS = ['--Sila Pilih--','MAJ - AUDIO VISUAL','BAN - BANGUNAN','ELE - ELEKTRIK','INF CIV - INFRASTRUKTUR','LAN - LANSKAP','MEC - MEKANIKAL','PROJEK - PROJEK','TEL - TELEKOMUNIKASI'];
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

  const currentBangunan = jenisBangunan === 'dalam' ? dbBangunan : lbBangunan;
  const isJasmine = typeof currentBangunan === 'string' && currentBangunan.startsWith('Jasmine');
  const isBlokAkademik = currentBangunan === 'Blok Akademik';
  const isDewanMakan = currentBangunan === 'Dewan Makan';
  const showBlok = isJasmine || isBlokAkademik;
  const showAras = showBlok || isDewanMakan;

  let activeBlokOpts = ['--Sila Pilih--'];
  if (currentBangunan === 'Jasmine 5') {
    activeBlokOpts = ['--Sila Pilih--', 'Blok A', 'Blok B', 'Blok C', 'Blok D'];
  } else if (isJasmine) {
    activeBlokOpts = ['--Sila Pilih--', 'Blok A', 'Blok B', 'Blok C', 'Blok D', 'Blok E'];
  } else if (isBlokAkademik) {
    activeBlokOpts = ['--Sila Pilih--', 'Blok Akademik', 'Pos Pengawal Blok Akadamik', 'Sub Station 1'];
  }

  let activeArasOpts = ARAS_OPTS;
  if (isBlokAkademik) {
    if (dbBlok === 'Pos Pengawal Blok Akadamik') {
      activeArasOpts = ['--Sila Pilih--', 'Aras 1', 'Aras 2'];
    } else {
      activeArasOpts = ['--Sila Pilih--', 'Aras 1', 'Aras 2', 'Aras 3'];
    }
  } else if (isDewanMakan) {
    activeArasOpts = ['--Sila Pilih--', 'Aras 1', 'Aras 2', 'Aras 3'];
  }

  let activeRuangOpts = RUANG_OPTS;
  if (isJasmine) {
    activeRuangOpts = ['--Sila Pilih--', 'Balkoni', 'Bilik Air', 'Bilik Tidur Pelajar', 'Koridor Awam', 'Rumah Pelajar', 'Tangga', 'Yard'];
  } else if (isBlokAkademik && dbBlok === 'Pos Pengawal Blok Akadamik') {
    if (dbAras === 'Aras 1') {
      activeRuangOpts = ['--Sila Pilih--', 'Bilik Stor', 'Koridor Awam'];
    } else if (dbAras === 'Aras 2') {
      activeRuangOpts = ['--Sila Pilih--', 'Ruang Pengawal', 'Tandas'];
    }
  } else if (isBlokAkademik && (dbBlok === 'Blok Akademik' || dbBlok === '--Sila Pilih--')) {
    if (dbAras === 'Aras 1') {
      activeRuangOpts = ['--Sila Pilih--', 'Ante-Room', 'Bilik Anjung Prof.', 'Bilik Dokumen (ISO)', 'Bilik Elektrik', 'Bilik Fail', 'Bilik Gerakan Peperiksaan', 'Bilik ICT', 'Bilik Janitor', 'Bilik Juru Teknik', 'Bilik Kebal', 'Bilik Kerja Akaun', 'Bilik Kerja Akauntan Kanan', 'Bilik Kuliah', 'Bilik Mesyuarat', 'Bilik PABX', 'Bilik Pegawai', 'Bilik Pemandu', 'Bilik Pensyarah', 'Bilik Perbincangan', 'Bilik PHD', 'Bilik Prof.', 'Bilik Rundingan', 'Bilik Server', 'Bilik Setiausaha', 'Bilik Wudhu', 'HR', 'Info. Mgmt. (I.M) Lounge', 'Kafeteria', 'Kaunter', 'Ketua Pusat Pengajian', 'Ketua Pustakawan', 'Ketua Unit Kualiti', 'Koleksi Akses Terhad', 'Koordinator Program', 'Koridor Awam', 'Laluan Lif', 'Makmal Komputer', 'Pameran Umum', 'Pantri', 'Surau', 'Tandas', 'Tangga', 'Tempat Sampah', 'Utiliti'];
    } else if (dbAras === 'Aras 2') {
      activeRuangOpts = ['--Sila Pilih--', 'Ante-Room', 'Bibliography Laboratory', 'Bilik Fotostat', 'Bilik Juruteknik', 'Bilik Kuliah', 'Bilik Mesyuarat Umum', 'Bilik Pasca Siswazah', 'Bilik Pensyarah', 'Bilik Perbincangan', 'Bilik Rehat', 'Bilik Rundingan', 'Bilik Seminar', 'Bilik Suntingan', 'HR', 'Koridor Awam', 'Laluan Lif', 'Makmal Komputer', 'Tandas', 'Tangga'];
    } else if (dbAras === 'Aras 3') {
      activeRuangOpts = ['--Sila Pilih--', 'Anjung FiTA', 'Ante-Room', 'Bilik AV', 'Bilik Juruteknik', 'Bilik Kawalan', 'Bilik Kuliah', 'Bilik Kuliah FiTA', 'Bilik Lukisan', 'Bilik Lupus', 'Bilik Mesyuarat Mini', 'Bilik Persalinan', 'Dewan Seminar FPM', 'Dewan Seminar FiTA', 'Elektrik', 'HR', 'Koridor Awam', 'Laluan Lif', 'Makmal Komputer FiTA', 'Miniplex FiTA', 'Riser', 'Tandas', 'Tangga', 'Wardrobe', 'Studio Digital', 'Studio Gerak', 'Stor', 'Stor Dewan', 'Stor Pelupusan'];
    }
  } else if (currentBangunan === 'Surau') {
    activeRuangOpts = ['--Sila Pilih--', 'Bilik Wudhu', 'Koridor Awam', 'Surau', 'Tandas'];
  } else if (isDewanMakan) {
    if (dbAras === 'Aras 1') {
      activeRuangOpts = ['--Sila Pilih--', 'Bilik Cucian', 'Bilik VIP', 'Chiller Room', 'Dapur', 'Dewan Makan', 'Dumbwaiter', 'Koridor Awam', 'Pejabat Am', 'Refuse Chamber', 'Stor', 'Tandas', 'Tangga', 'Utiliti'];
    } else if (dbAras === 'Aras 2') {
      activeRuangOpts = ['--Sila Pilih--', 'Ante-Room', 'Bilik Cucian', 'Bilik Penyediaan Makanan', 'Bilik Rehat', 'Dewan Makan', 'Dumbwaiter', 'Refuse Chamber', 'Tandas', 'Tangga', 'VOID'];
    } else if (dbAras === 'Aras 3') {
      activeRuangOpts = ['--Sila Pilih--', 'Koridor Awam', 'Tangga', 'Tangki Air'];
    }
  } else if (currentBangunan === 'Pos Pengawal Kolej') {
    activeRuangOpts = ['--Sila Pilih--', 'Koridor Awam', 'Ruang Pengawal', 'Tandas'];
  } else if (currentBangunan === 'Perhentian Bas') {
    activeRuangOpts = ['--Sila Pilih--', 'Perhentian bas'];
  }

  let activeElemenOpts = ELEMEN_OPTS;
  if (seksyen === 'MAJ - AUDIO VISUAL') {
    activeElemenOpts = ['--Sila Pilih--', 'SISTEM VISUAL', 'SISTEM AUDIO', 'SISTEM PENCAHAYAAN PENTAS'];
  } else if (seksyen === 'BAN - BANGUNAN') {
    activeElemenOpts = ['--Sila Pilih--', 'KEROSAKAN BANGUNAN', 'KEROSAKAN PINTU', 'PERALATAN TANDAS & PLUMBING', 'PEST CONTROL', 'KEBERSIHAN DALAM BANGUNAN', 'SANITACT BIN'];
  } else if (seksyen === 'ELE - ELEKTRIK') {
    activeElemenOpts = ['--Sila Pilih--', 'BEKALAN ELEKTRIK', 'PEPASANGAN ELEKTRIK', 'LAMPU DALAM BANGUNAN', 'LAMPU LUAR BANGUNAN', 'CCTV'];
  } else if (seksyen === 'INF CIV - INFRASTRUKTUR') {
    activeElemenOpts = ['--Sila Pilih--', 'INFRASTRUKTUR', 'PEST CONTROL', 'SANITACT BIN'];
  } else if (seksyen === 'LAN - LANSKAP') {
    activeElemenOpts = ['--Sila Pilih--', 'PEST CONTROL', 'PERKHIDMATAN LANSKAP', 'PUNGUTAN SAMPAH', 'POKOK BUNGA BERPASU'];
  } else if (seksyen === 'MEC - MEKANIKAL') {
    activeElemenOpts = ['--Sila Pilih--', 'LIFT', 'MESIN AIR SEJUK/PANAS', 'PENYAMAN UDARA', 'PENCEGAH KEBAKARAN', 'ROLLER SHUTTER/GATE AUTOMATIK', 'PEMADAM API', 'MESIN PERAKAM WAKTU', 'LIQUID PETROLEUM GAS', 'BEKALAN AIR', 'KUMBAHAN'];
  } else if (seksyen === 'PROJEK - PROJEK') {
    activeElemenOpts = ['--Sila Pilih--', 'ETIKA PEKERJA KONTRAKTOR', 'PENGURUSAN PROJEK', 'PERSEKITARAN TAPAK BINA'];
  } else if (seksyen === 'TEL - TELEKOMUNIKASI') {
    activeElemenOpts = ['--Sila Pilih--', 'WALKIE_TALKIE', 'TELEFON', 'CCTV', 'DOOR ACCESS', 'PENDAWAIAN', 'BARRIER PARKING'];
  }

  let activeMasalahOpts = MASALAH_OPTS;
  if (elemen === 'PEST CONTROL') {
    activeMasalahOpts = [
      '--Sila Pilih--', 'GANGGUAN ANJING/MUSANG', 'GANGGUAN BURUNG', 'GANGGUAN LEBAH', 'GANGGUAN LIPAS',
      'GANGGUAN MONYET', 'GANGGUAN SEMUT', 'GANGGUAN ULAR', 'KUCING/TIKUS MATI',
      'LAIN-LAIN ADUAN PEST CONTROL', 'RUANG BERBAU BUSUK', 'SERANGAN ANAI-ANAI', 'SERANGAN BUBUK'
    ];
  } else if (elemen === 'SANITACT BIN') {
    activeMasalahOpts = [
      '--Sila Pilih--', 'LAIN-LAIN ADUAN SANITARY BIN', 'SANITACT BERBAU',
      'SANITACT TIDAK DIPUNGUT', 'SANITACT TIDAK TERURUS'
    ];
  } else if (elemen === 'CCTV') {
    activeMasalahOpts = [
      '--Sila Pilih--', 'CCTV TIADA BERGAMBAR', 'CCTV TIDAK MEREKOD DATA', 'LAIN-LAIN ADUAN KEROSAKAN CCTV'
    ];
  } else if (seksyen === 'MAJ - AUDIO VISUAL') {
    if (elemen === 'SISTEM VISUAL') {
      activeMasalahOpts = ['--Sila Pilih--', 'KUALITI TON WARNA VISUAL MULTIMEDIA BERUBAH', 'LAIN-LAIN KEROSAKKAN SISTEM AUDIO VISUAL', 'PAPARAN VISUAL MULTIMEDIA TIDAK SEKATA', 'SKRIN KOYAK', 'SKRIN MULTIMEDIA TIADA ISYARAT VISUAL', 'SKRIN TERJATUH', 'SKRIN TIDAK BOLEH DINAIKKAN/DITURUNKAN'];
    } else if (elemen === 'SISTEM AUDIO') {
      activeMasalahOpts = ['--Sila Pilih--', 'LAIN-LAIN KEROSAKAN SISTEM AUDIO', 'SISTEM AUDIO ROSAK'];
    } else if (elemen === 'SISTEM PENCAHAYAAN PENTAS') {
      activeMasalahOpts = ['--Sila Pilih--', 'DMX SPLITTER TIDAK BERFUNGSI / ROSAK', 'LAIN-LAIN KEROSAKKAN SISTEM PENCAHAYAAN PENTAS', 'LAMPU PENTAS ROSAK', 'LAMPU PENTAS TIDAK MENYALA', 'LIGHTING CONSOLE ROSAK'];
    }
  } else if (seksyen === 'BAN - BANGUNAN') {
    if (elemen === 'KEROSAKAN BANGUNAN') {
      activeMasalahOpts = [
        '--Sila Pilih--', 'BINGKAI TINGKAP REPUT', 'BLIND/LANGSIR ROSAK', 'BUMBUNG BOCOR', 'BUMBUNG TERCABUT',
        'CAT SILING KOTOR', 'DINDING KOTOR/BERCONTENG', 'DINDING RETAK', 'JUBIN TERTANGGAL/TERKOPEK',
        'KACA TINGKAP PECAH', 'KAYU LANTAI PARKET DIMAKAN ANAI-ANAI', 'LAIN-LAIN KEROSAKAN BANGUNAN',
        'LAMINAT DINDING ROSAK/MENGELUPAS', 'LANTAI BERLUBANG/PECAH', 'RAILING BESI TANGGA REPUT',
        'SELAK TUAS TINGKAP PATAH/ROSAK', 'SILING (KESAN RESAPAN AIR)', 'SILING BERLUBANG', 'SILING BOCOR',
        'SILING ROSAK/PECAH', 'SILING RUNTUH', 'SILING TIDAK DIPASANG', 'SIMEN SKRID TANGGA PECAH',
        'TINGKAP KETAT', 'TINTED FIRL ROSAK/TERCABUT'
      ];
    } else if (elemen === 'KEROSAKAN PINTU') {
      activeMasalahOpts = [
        '--Sila Pilih--', 'ANAK KUNCI PATAH', 'DOOR CLOSER ROSAK/TAK BERFUNGSI', 'HANDLE PINTU PATAH/ROSAK',
        'JENANG/BINGKAI PINTU ROSAK', 'KUNCI PINTU ROSAK', 'KUNCI/TOMBOL BERKARAT', 'LAIN-LAIN KEROSAKAN PINTU',
        'PINTU DIMAKAN ANAI-ANAI', 'PINTU KETAT', 'PINTU PECAH', 'PINTU TERJATUH', 'PINTU TERKUNCI', 'SELAK PINTU ROSAK'
      ];
    } else if (elemen === 'PERALATAN TANDAS & PLUMBING') {
      activeMasalahOpts = [
        '--Sila Pilih--', 'BASIN BASUH TANGAN BOCOR', 'BASIN BASUH TANGAN PECAH', 'BASIN BASUH TANGAN TERSUMBAT',
        'BESI PENYANGKUT PAKAIAN TERCABUT', 'BOTTLE TRAP ROSAK/BOCOR', 'CERMIN TANDAS PECAH/ROSAK',
        'FLUSH VALVE ROSAK', 'FLUSHING HANDLE TAK BERFUNGSI/ROSAK', 'KEPALA PAIP BOCOR', 'KEPALA PAIP LONGGAR',
        'LAIN-LAIN KEROSAKAN PERALATAN PLUMBING', 'MANGKUK TANDAS PECAH/ROSAK', 'PAIP TANDAS BOCOR',
        'PELAPIK TANDAS DUDUK TIADA', 'PENDAKAP PAIP PATAH/TERCABUT', 'SALURAN PERANGKAP LANTAI TERSUMBAT',
        'SALURAN TANDAS TERSUMBAT/TERSEKAT', 'SHOWER HEAD ROSAK', 'TANGKI PENYIMBAH PECAH',
        'TANGKI TANDAS BOCOR/MELIMPAH', 'TIADA BEKALAN AIR DI TANDAS', 'TIADA SABUN', 'TIADA TISU TANDAS'
      ];
    } else if (elemen === 'KEBERSIHAN DALAM BANGUNAN') {
      activeMasalahOpts = [
        '--Sila Pilih--', 'BANGUNAN BERBAU', 'BANGUNAN KOTOR', 'KARPET BERBAU/KOTOR',
        'LAIN-LAIN ADUAN KEBERSIHAN BANGUNAN', 'LANTAI KOTOR', 'PAPAN PUTIH TIDAK DIBERSIHKAN',
        'PERABOT/PERALATAN BERHABUK', 'SAMPAH TIDAK DIPUNGUT', 'SILING/DINDING BERSAWANG',
        'TANDAS BERBAU BUSUK', 'TANDAS KOTOR'
      ];
    }
  } else if (seksyen === 'ELE - ELEKTRIK') {
    if (elemen === 'BEKALAN ELEKTRIK') {
      activeMasalahOpts = [
        '--Sila Pilih--', 'BEKALAN ELEKTRIK TERPUTUS SATU ARAS', 'BEKALAN ELEKTRIK TERPUTUS SATU BANGUNAN',
        'BEKALAN ELEKTRIK TERPUTUS SATU BILIK', 'BEKALAN ELEKTRIK TERPUTUS SATU KAMPUS', 'LAIN-LAIN ADUAN BEKALAN ELEKTRIK'
      ];
    } else if (elemen === 'PEPASANGAN ELEKTRIK') {
      activeMasalahOpts = [
        '--Sila Pilih--', 'KIPAS ANGIN ROSAK', 'KIPAS ANGIN TERTANGGAL', 'KOTAK PAPAN AGIHAN (DB) PECAH',
        'LAIN-LAIN ADUAN PEPASANGAN ELEKTRIK', 'PINTU PAPAN AGIHAN (DB) TERTANGGAL', 'SOKET SUIS PECAH',
        'SOKET SUIS TERBAKAR', 'SOKET SUIS TERTANGGAL', 'SOKET SUIS TIADA BEKALAN', 'SUIS PECAH',
        'SUIS TERTANGGAL', 'WAYAR/KABEL/TRUNKING ELEKTRIK TERJUNTAI', 'WAYAR/KABEL/TRUNKING ELEKTRIK TERPUTUS',
        'WAYAR/KABEL/TRUNKING TERBAKAR'
      ];
    } else if (elemen === 'LAMPU DALAM BANGUNAN') {
      activeMasalahOpts = [
        '--Sila Pilih--', 'LAIN-LAIN ADUAN LAMPU DALAM BANGUNAN', 'LAMPU BERKELIP-KELIP',
        'LAMPU MALAP', 'LAMPU TERTANGGAL', 'LAMPU TIDAK DIPASANG', 'LAMPU TIDAK MENYALA'
      ];
    } else if (elemen === 'LAMPU LUAR BANGUNAN') {
      activeMasalahOpts = [
        '--Sila Pilih--', 'LAIN-LAIN ADUAN LAMPU LUAR BANGUNAN', 'LAMPU BERKELIP',
        'LAMPU JALAN TIDAK BERNYALA', 'LAMPU MALAP', 'LAMPU TANDA KELUAR (EXIT SIGN) ROSAK',
        'PENUTUP LAMPU JALAN TERBUKA', 'TIANG BESI TERDAPAT ARUS ELEKTRIK',
        'TIANG LAMPU JALAN PATAH/BENGKOK', 'WAYAR LAMPU JALAN TERKELUAR'
      ];
    }
  } else if (seksyen === 'INF CIV - INFRASTRUKTUR') {
    if (elemen === 'INFRASTRUKTUR') {
      activeMasalahOpts = [
        '--Sila Pilih--', 'PEMBAHAGI JALAN ROSAK/PECAH', 'BAHU JALAN / KERB ROSAK ATAU TANGGAL',
        'BATU INTERLOCKING MENDAP', 'CAT JALAN / PARKIR PUDAR', 'DINDING / TEMBOK PENAHAN PECAH',
        'GRATING LONGKANG PUTUS', 'JALAN/PARKIR BERLUBANG', 'JALAN/PARKIR MENDAP',
        'LAIN-LAIN ADUAN KEROSAKAN INFRASTRUKTUR', 'LONGKANG PECAH', 'PAGAR / PINTU PAGAR ROSAK',
        'PAGOLA ROSAK', 'PEMBENTUNG PAIP PECAH', 'PENUTUP LONGKANG HILAN/ROSAK',
        'SAMBUNGAN SUSUR TANGGA PUTUS', 'SUSUR ANAK TANGGA ROSAK', 'TANAH / CERUN RUNTUH', 'WAKAF ROSAK'
      ];
    }
  } else if (seksyen === 'LAN - LANSKAP') {
    if (elemen === 'PERKHIDMATAN LANSKAP') {
      activeMasalahOpts = [
        '--Sila Pilih--', 'AIR PANCUT TIDAK BERFUNGSI', 'AIR TERJUN TIDAK BERFUNGSI',
        'BUNGKUSAN SAMPAH DAUN TIDAK DIPUNGUT', 'DAHAN POKOK MELEMPAI KE STRUKTUR',
        'DAHAN POKOK PATAH', 'JALAN BERPASIR/BERMINYAK', 'JALANRAYA/PARKING KENDERAAN TIDAK DISAPU',
        'KEMUDAHAN AWAM (PERHENTIAN BAS, KERUSI & MEJA TAMAN, WAKAF, PAPANTADA DAN BBQ PIT)',
        'KOLAM/TASIK TIDAK DIBERSIHKAN', 'LAIN-LAIN ADUAN LANSKAP', 'LALUAN PEJALAN KAKI, DATARAN TIDAK DIBERSIHKAN',
        'LONGKANG TIDAK DIBERSIHKAN', 'PAGAR TIDAK DIBERSIHKAN', 'POKOK MATI / LAYU', 'POKOK TUMBANG',
        'RUMPUT PANJANG/TIDAK DIPOTONG', 'SAMPAH LUAR BANGUNAN BERSEPAH',
        'SCUPPER DRAIN TERSUMBAT/SAMPAH TIDAK DIBERSIHKAN', 'TONG SAMPAH KAWASAN LUAR BANGUNAN MELIMPAH'
      ];
    } else if (elemen === 'PUNGUTAN SAMPAH') {
      activeMasalahOpts = [
        '--Sila Pilih--', 'DRAIN SUMP RUMAH SAMPAH KOTOR/TIDAK DICUCI/TERSUMBAT',
        'KAWASAN TIDAK DISELENGGARA', 'LAIN-LAIN ADUAN SAMPAH LUAR BANGUNAN',
        'RUMAH SAMPAH TIDAK DICUCI/DIBERSIHKAN', 'SAMPAH DI RUMAH SAMPAH TIDAK DIKUTIP',
        'SAMPAH SISA BINAAN/PALLET/POLYSTYREN YANG TERBIAR MELEBIHI DARI 1 MINGGU', 'SAMPAH TIDAK DIPUNGUT'
      ];
    } else if (elemen === 'POKOK BUNGA BERPASU') {
      activeMasalahOpts = [
        '--Sila Pilih--', 'AIR SIRAMAN MELIMPAH', 'DAHAN MELEMPAI KE STRUKTUR/JALANRAYA',
        'DAHAN PATAH DI LAIN-LAIN TEMPAT/KAWASAN', 'DAHAN POKOK PATAH MENGHALANG JALAN UTAMA',
        'DAHANPATAH TERKENA BANGUNAN/STRUKTUR', 'LAIN-LAIN ADUAN POKOK BUNGA BERPASU',
        'PASU PECAH', 'POKOK BUNGA TIDAK DISELENGGARA', 'POKOK MATI/LAYU',
        'POKOK TIDAK DISELENGGARA', 'POKOK TUMBANG DI LAIN-LAIN TEMPAT/KAWASAN',
        'POKOK TUMBANG MENGHALANG JALAN UTAMA', 'POKOK TUMBANG TERKENA BANGUNAN/STRUKTUR'
      ];
    }
  } else if (seksyen === 'MEC - MEKANIKAL') {
    if (elemen === 'LIFT') {
      activeMasalahOpts = [
        '--Sila Pilih--', 'BUTTON LIF ROSAK', 'KIPAS LIF TIDAK BERFUNGSI',
        'LAIN-LAIN ADUAN KEROSAKAN LIF', 'LAMPU LIF TIDAK MENYALA',
        'LIF TERGENDALA/PENUMPANG TERPERANGKAP', 'LIF TIDAK BERFUNGSI'
      ];
    } else if (elemen === 'MESIN AIR SEJUK/PANAS') {
      activeMasalahOpts = [
        '--Sila Pilih--', 'FRONT COVER MESIN AIR SEJUK TERTANGGAL',
        'LAIN-LAIN ADUAN KEROSAKAN MESIN AIR SEJUK', 'MESIN AIR SEJUK TERSUMBAT',
        'MESIN AIR SEJUK/PANAS TAK BERFUNGSI', 'PAIP BEKALAN MESIN AIR SEJUK PATAH',
        'PENAPIS BEKALAN MESIN AIR KOTOR'
      ];
    } else if (elemen === 'PENYAMAN UDARA') {
      activeMasalahOpts = [
        '--Sila Pilih--', 'AIR MENITIK DARI PENYAMAN UDARA', 'BUNYI BISING PADA PENYAMAN UDARA',
        'LAIN-LAIN ADUAN KEROSAKAN PENYAMAN UDARA', 'PENYAMAN UDARA BERBAU BUSUK',
        'PENYAMAN UDARA ROSAK', 'PENYAMAN UDARA TIDAK BERFUNGSI', 'PENYAMAN UDARA TIDAK SEJUK',
        'STARTER PENYAMAN UDARA ROSAK'
      ];
    } else if (elemen === 'PENCEGAH KEBAKARAN') {
      activeMasalahOpts = [
        '--Sila Pilih--', 'KABINET PANEL PENGGERA KAWALAN ROSAK', 'LAIN-LAIN ADUAN KEROSAKAN PENCEGAH KEBAKARAN',
        'LOCENG KECEMASAN PENCEGAH KEBAKARAN BERBUNYI', 'PANEL PENGGERA KEBAKARAN TIADA BEKALAN KUASA',
        'PILI BOMBA BOCOR', 'TANGKI ARI PENCEGAH KEBAKARAN (MERAH) BOCOR/OVERFLOW'
      ];
    }
  }

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
                        <select className="aduan-input aduan-select" value={jenisBangunan === 'dalam' ? dbBangunan : lbBangunan} onChange={e => {
                          if (jenisBangunan === 'dalam') {
                            setDbBangunan(e.target.value);
                            setDbBlok('--Sila Pilih--');
                            setDbAras('--Sila Pilih--');
                            setDbRuang('--Sila Pilih--');
                          } else {
                            setLbBangunan(e.target.value);
                            setLbBlok('--Sila Pilih--');
                          }
                        }}>
                          {BANGUNAN_OPTS.map(o => <option key={o} value={o}>{o}</option>)}
                        </select>
                      </div>

                      {showBlok && (
                        <div className="aduan-field">
                          <label className="aduan-label">Blok <span className="aduan-required">*</span></label>
                          <select className="aduan-input aduan-select" value={jenisBangunan === 'dalam' ? dbBlok : lbBlok} onChange={e => {
                            if (jenisBangunan === 'dalam') {
                              setDbBlok(e.target.value);
                              setDbAras('--Sila Pilih--');
                              setDbRuang('--Sila Pilih--');
                            } else {
                              setLbBlok(e.target.value);
                            }
                          }}>
                            {activeBlokOpts.map(o => <option key={o} value={o}>{o}</option>)}
                          </select>
                        </div>
                      )}

                      {jenisBangunan === 'dalam' && showAras && dbBlok !== 'Sub Station 1' && (
                        <div className="aduan-field">
                          <label className="aduan-label">Aras</label>
                          <select className="aduan-input aduan-select" value={dbAras} onChange={e => {
                            setDbAras(e.target.value);
                            setDbRuang('--Sila Pilih--');
                          }}>
                            {activeArasOpts.map(o => <option key={o} value={o}>{o}</option>)}
                          </select>
                        </div>
                      )}

                      {jenisBangunan === 'dalam' && dbBlok !== 'Sub Station 1' && (
                        <div className="aduan-field">
                          <label className="aduan-label">Ruang</label>
                          <select className="aduan-input aduan-select" value={dbRuang} onChange={e => setDbRuang(e.target.value)}>
                            {activeRuangOpts.map(o => <option key={o} value={o}>{o}</option>)}
                          </select>
                        </div>
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
                        <select className="aduan-input aduan-select" value={seksyen} onChange={e => {
                          setSeksyen(e.target.value);
                          setElemen('--Sila Pilih--');
                          setMasalah('--Sila Pilih--');
                        }}>
                          {SEKSYEN_OPTS.map(o => <option key={o} value={o}>{o}</option>)}
                        </select>
                      </div>

                      <div className="aduan-field">
                        <label className="aduan-label">Elemen <span className="aduan-required">*</span></label>
                        <select className="aduan-input aduan-select" value={elemen} onChange={e => {
                          setElemen(e.target.value);
                          setMasalah('--Sila Pilih--');
                        }}>
                          {activeElemenOpts.map(o => <option key={o} value={o}>{o}</option>)}
                        </select>
                      </div>

                      <div className="aduan-field">
                        <label className="aduan-label">Masalah <span className="aduan-required">*</span></label>
                        <select className="aduan-input aduan-select" value={masalah} onChange={e => setMasalah(e.target.value)}>
                          {activeMasalahOpts.map(o => <option key={o} value={o}>{o}</option>)}
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
