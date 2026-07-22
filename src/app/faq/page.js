import Link from 'next/link';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import HomeUserMenu from '@/components/HomeUserMenu';
import { NavDropdownAduan, NavDropdownSemak } from '@/components/NavDropdown';

export const metadata = {
  title: 'Soalan Lazim | E-Aduan UiTM',
  description: 'Soalan Lazim (FAQ) berkaitan Sistem e-Aduan UiTM — jawapan kepada soalan-soalan yang kerap ditanya.',
};

const faqItems = [
  {
    id: 1,
    soalan: 'Apakah Sistem e-Aduan UiTM?',
    jawapan: (
      <p>
        Sistem e-Aduan UiTM merupakan saluran aduan rasmi yang merekodkan dan memberi maklum balas
        aduan daripada warga UiTM dan juga orang awam.
      </p>
    ),
  },
  {
    id: 2,
    soalan: 'Bagaimanakah menggunakan Sistem e-Aduan UiTM?',
    jawapan: (
      <p>
        Untuk menggunakan Sistem e-Aduan UiTM, pengguna perlu log masuk dengan akaun Google (GMail)
        melalui menu log masuk. Selepas itu, pengguna boleh terus mengisi butiran aduan di borang
        &ldquo;Aduan Baru&rdquo;.
      </p>
    ),
  },
  {
    id: 3,
    soalan: 'Apakah kategori aduan yang boleh diadukan kepada Sistem e-Aduan UiTM?',
    jawapan: (
      <>
        <p>Kategori aduan adalah mengikut Audit Nilai SPAN 2.0 merangkumi:</p>
        <ul>
          <li>Tindakan Tidak Adil</li>
          <li>Salah laku Anggota Awam</li>
          <li>Kegagalan Penguatkuasaan</li>
          <li>Kekurangan Kemudahan Awam</li>
          <li>Kelewatan atau Tiada Tindakan</li>
          <li>Salah Guna Kuasa/ Penyelewengan</li>
          <li>Pelbagai Aduan (Selain kategori di atas)</li>
          <li>Kegagalan Mengikut Prosedur yang Ditetapkan</li>
          <li>Kepincangan Pelaksanaan Dasar dan Kelemahan Undang-undang</li>
          <li>Kualiti Perkhidmatan yang Tidak Memuaskan Termasuk Kaunter dan Telefon</li>
        </ul>
      </>
    ),
  },
  {
    id: 4,
    soalan: 'Apakah tatacara ringkas untuk membuat aduan?',
    jawapan: (
      <>
        <p>Berikut adalah tatacara ringkas yang diperlukan:</p>
        <ul>
          <li>
            <strong>Kenal Pasti Isu/Aduan</strong>
            <p>Pastikan perkara yang ingin diadukan adalah berkaitan dengan perkhidmatan, fasiliti, staf, atau isu berkaitan tatakelola universiti.</p>
          </li>
          <li>
            <strong>Lengkapkan Profil Pengguna</strong>
            <ul>
              <li>Nama Penuh</li>
              <li>No. Telefon</li>
            </ul>
          </li>
          <li>
            <strong>Lengkapkan Maklumat Aduan</strong>
            <ul>
              <li>Pilih Kategori Aduan dengan betul</li>
              <li>Jabatan / Fakulti / Kampus Cawangan Berkenaan (sekiranya pegadu memilih &lsquo;Tidak Pasti&rsquo;, aduan akan dihantar ke Pejabat Komunikasi Strategik untuk diproses)</li>
            </ul>
          </li>
          <li>
            <strong>Lengkapkan Aduan</strong>
            <p>Nyatakan Maklumat Aduan Secara Jelas</p>
            <ul>
              <li>Tajuk Aduan</li>
              <li>Tarikh dan masa kejadian</li>
              <li>Lokasi kejadian</li>
              <li>Pihak atau individu yang terlibat (jika diketahui)</li>
              <li>Kronologi ringkas dan fakta sebenar</li>
              <li>Lampiran bukti (jika ada &ndash; gambar, tangkap layar, dokumen)</li>
            </ul>
          </li>
          <li>
            <strong>Etika dan Bahasa yang Sesuai</strong>
            <ul>
              <li>Gunakan bahasa yang sopan dan profesional.</li>
              <li>Elakkan tuduhan tanpa bukti, kata kesat, atau maklumat palsu.</li>
            </ul>
          </li>
          <li>
            <strong>Pantau Status Aduan</strong>
            <ul>
              <li>Log masuk semula ke Sistem e-Aduan UiTM untuk melihat status terkini.</li>
              <li>Aduan akan diuruskan secara berperingkat dan tertakluk kepada prosedur dalaman universiti.</li>
            </ul>
          </li>
        </ul>
      </>
    ),
  },
  {
    id: 5,
    soalan: 'Berapakah tempoh maklum balas terhadap sesuatu aduan?',
    jawapan: (
      <p>
        Tempoh maklum balas aduan adalah dalam masa 15 hari bekerja mengikut Pekeliling AM Bilangan
        2 Tahun 2022 : Penambahbaikan Pengurusan Aduan Awam bagi Aduan Biasa. Manakala aduan
        kategori kompleks adalah sehingga 365 hari. Penentuan aduan kategori biasa dan kompleks
        adalah berdasarkan kepada butiran kes yang diterima.
      </p>
    ),
  },
  {
    id: 6,
    soalan: 'Dalam situasi kecemasan, adakah terdapat nombor telefon Polis Bantuan UiTM yang boleh dihubungi?',
    jawapan: (
      <p>
        Ya, berikut adalah senarai nombor telefon Polis Bantuan yang boleh dihubungi 24 jam bagi
        sebarang kecemasan atau pertanyaan.
      </p>
    ),
  },
];

const emergencyContacts = [
  { negeri: 'IPPB',            kampus: 'SHAH ALAM',                    telefon: '03-55442157 / 3999' },
  { negeri: 'SELANGOR',        kampus: 'PUNCAK ALAM',                  telefon: '03-32584444' },
  { negeri: '',                kampus: 'PUNCAK PERDANA',               telefon: '03-79622399' },
  { negeri: '',                kampus: 'DENGKIL',                      telefon: '03-89245551' },
  { negeri: '',                kampus: 'SG. BULOH, SELAYANG, T.INTAN', telefon: '03-61267474' },
  { negeri: '',                kampus: 'HOSPITAL AL-SULTAN ABDULLAH',  telefon: '03-33963100' },
  { negeri: 'NEGERI SEMBILAN', kampus: 'KUALA PILAH',                  telefon: '06-4832284' },
  { negeri: '',                kampus: 'SEREMBAN',                     telefon: '06-6342874' },
  { negeri: '',                kampus: 'REMBAU',                       telefon: '06-6982305' },
  { negeri: 'MELAKA',          kampus: 'ALOR GAJAH',                   telefon: '06-5582067' },
  { negeri: '',                kampus: 'BANDARAYA MELAKA',             telefon: '06-2857160' },
  { negeri: '',                kampus: 'JASIN',                        telefon: '06-2645470' },
  { negeri: 'JOHOR',           kampus: 'SEGAMAT',                      telefon: '07-9352255' },
  { negeri: '',                kampus: 'PASIR GUDANG',                 telefon: '07-3817902' },
  { negeri: 'PERAK',           kampus: 'SERI ISKANDAR',                telefon: '05-3742130' },
  { negeri: '',                kampus: 'TAPAH',                        telefon: '05-4067791 / 7790' },
  { negeri: 'PULAU PINANG',    kampus: 'PERMATANG PAUH',               telefon: '04-3823020' },
  { negeri: '',                kampus: 'BERTAM',                       telefon: '04-5623400' },
  { negeri: 'KEDAH',           kampus: 'SUNGAI PETANI',                telefon: '04-4562201 / 2200' },
  { negeri: 'PERLIS',          kampus: 'ARAU',                         telefon: '04-9882222' },
  { negeri: 'PAHANG',          kampus: 'JENGKA',                       telefon: '09-4602444' },
  { negeri: '',                kampus: 'RAUB',                         telefon: '09-3515600 / 5603' },
  { negeri: 'TERENGGANU',      kampus: 'DUNGUN',                       telefon: '09-8400121' },
  { negeri: '',                kampus: 'BUKIT BESI',                   telefon: '09-8339907' },
  { negeri: '',                kampus: 'KUALA TERENGGANU',             telefon: '(Sedang dikemaskini)' },
  { negeri: 'KELANTAN',        kampus: 'MACHANG',                      telefon: '09-9762038' },
  { negeri: '',                kampus: 'KOTA BHARU',                   telefon: '09-7417791' },
  { negeri: 'SABAH',           kampus: 'KOTA KINABALU',                telefon: '08-8325249' },
  { negeri: '',                kampus: 'TAWAU',                        telefon: '08-9951667' },
  { negeri: 'SARAWAK',         kampus: 'SAMARAHAN 1',                  telefon: '08-2677245' },
  { negeri: '',                kampus: 'SAMARAHAN 2',                  telefon: '08-2678199' },
  { negeri: '',                kampus: 'MUKAH',                        telefon: '08-4867243' },
  { negeri: 'ILD UiTM',        kampus: 'BANDAR ENSTEK, N. SEMBILAN',   telefon: '06-7580267' },
  { negeri: '',                kampus: 'KAMPUNG GAJAH, PERAK',         telefon: '05-3616299' },
];

export default async function FaqPage() {
  const session = await getServerSession(authOptions);

  return (
    <div className="lp-auth-root">

      {/* ── NAVBAR ── */}
      <nav className="lp-nav">
        <div className="lp-nav-inner">
          <Link href="/" className="lp-logo" id="faq-site-logo">
            <img src="/images/logo aduan2.png" alt="Aduan Logo" style={{height: 32, width: 'auto'}} />
          </Link>

          <div className="lp-nav-links">
            <Link href="/" className="lp-nav-link" id="faq-nav-anjung">Anjung</Link>
            <NavDropdownAduan />
            {session?.user?.role !== 'admin' && session?.user?.role !== 'staff' && (
              <NavDropdownSemak />
            )}
            <Link href="/panduan" className="lp-nav-link" id="faq-nav-panduan">Panduan</Link>
            <Link href="/faq" className="lp-nav-link lp-nav-active" id="faq-nav-faq">Soalan Lazim</Link>
          </div>

          <div className="lp-nav-end">
            {session ? (
              <HomeUserMenu session={session} />
            ) : (
              <Link href="/login" className="lp-login-btn" id="faq-login-button">Log Masuk</Link>
            )}
          </div>
        </div>
      </nav>

      {/* ── FAQ CONTENT ── */}
      <main className="faq-main">
        <div className="faq-container glass-panel" style={{ margin: '48px auto' }}>

          <h1 className="faq-title">Soalan Lazim</h1>

          {/* FAQ List */}
          <ol className="faq-list">
            {faqItems.map((item) => (
              <li key={item.id} className="faq-item">
                <p className="faq-question">{item.soalan}</p>
                <div className="faq-answer">{item.jawapan}</div>
              </li>
            ))}
          </ol>

          {/* Emergency Contact Table */}
          <div className="faq-table-section">
            <h2 className="faq-table-title">
              MAKLUMAT NOMBOR TELEFON KECEMASAN 24 JAM<br />
              POLIS BANTUAN<br />
              UNIVERSITI TEKNOLOGI MARA
            </h2>
            <div className="faq-table-wrapper">
              <table className="faq-table">
                <thead>
                  <tr>
                    <th>NEGERI</th>
                    <th>KAMPUS</th>
                    <th>NO. TELEFON KECEMASAN (24 JAM)</th>
                  </tr>
                </thead>
                <tbody>
                  {emergencyContacts.map((row, idx) => (
                    <tr key={idx} className={idx % 2 === 0 ? 'faq-tr-even' : 'faq-tr-odd'}>
                      <td>{row.negeri}</td>
                      <td>{row.kampus}</td>
                      <td>{row.telefon}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </main>

      {/* ── FOOTER ── */}
      <footer className="lp-footer">
        <div className="lp-footer-inner">
          <p className="lp-footer-text">
            <strong>Penafian dan Notis Privasi:</strong>{' '}
            Sistem ini disediakan untuk pengurusan aduan rasmi UiTM. Semua data yang dikemukakan adalah sulit dan hanya untuk kegunaan dalaman universiti. Sistem ini dipantau secara berterusan dan sebarang penyalahgunaan boleh dikenakan tindakan undang-undang atau tatatertib.
          </p>
          <p className="lp-footer-copy">© Pejabat Komunikasi Strategik, UiTM 2026</p>
        </div>
      </footer>

    </div>
  );
}
