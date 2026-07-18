import Link from 'next/link';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import HomeUserMenu from '@/components/HomeUserMenu';
import { NavDropdownAduan, NavDropdownSemak } from '@/components/NavDropdown';

export const metadata = {
  title: 'Panduan | Sistem Aduan UiTM',
  description: 'Senarai Dokumen Rujukan untuk Sistem e-Aduan UiTM',
};

export default async function PanduanPage() {
  const session = await getServerSession(authOptions);

  return (
    <div className="lp-root" style={{ background: '#ffffff' }}>

      {/* ── NAVBAR ── */}
      <nav className="lp-nav">
        <div className="lp-nav-inner">
          <Link href="/" className="lp-logo" id="panduan-site-logo">
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
            <Link href="/" className="lp-nav-link" id="panduan-nav-anjung">Anjung</Link>
            <NavDropdownAduan />
            {session?.user?.role !== 'admin' && session?.user?.role !== 'staff' && (
              <NavDropdownSemak />
            )}
            <Link href="/panduan" className="lp-nav-link lp-nav-active" id="panduan-nav-panduan">Panduan</Link>
            <Link href="/faq" className="lp-nav-link" id="panduan-nav-faq">Soalan Lazim</Link>
          </div>

          <div className="lp-nav-end">
            <div className="lp-lang-group">
              <button className="lp-lang-active" id="panduan-lang-my">🇲🇾</button>
              <button className="lp-lang-btn" id="panduan-lang-en">🇬🇧</button>
            </div>
            {session ? (
              <HomeUserMenu session={session} />
            ) : (
              <Link href="/login" className="lp-login-btn" id="panduan-login-button">Log Masuk</Link>
            )}
          </div>
        </div>
      </nav>

      {/* ── PANDUAN CONTENT ── */}
      <main style={{ flex: 1, padding: '48px 24px', maxWidth: '1100px', margin: '0 auto', width: '100%' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: '500', color: '#111827', marginBottom: '16px' }}>
          Senarai Dokumen Rujukan
        </h1>
        <ol style={{ paddingLeft: '24px', color: '#374151' }}>
          <li style={{ paddingLeft: '8px' }}>
            <a 
              href="/documents/pekeliling_am_bil_2_2022.pdf" 
              target="_blank" 
              rel="noopener noreferrer"
              style={{ color: '#2563eb', textDecoration: 'underline', fontSize: '1rem' }}
            >
              Pekeliling Am Bilangan 2 Tahun 2022 - Penambahbaikan Pengurusan Aduan Awam
            </a>
          </li>
        </ol>
      </main>

      {/* ── FOOTER ── */}
      <footer className="lp-footer">
        <div className="lp-footer-inner">
          <p className="lp-footer-text">
            <strong>Penafian dan Notis Privasi:</strong>{' '}
            Sistem ini disediakan untuk pengurusan aduan rasmi UiTM. Semua data yang dikemukakan adalah sulit dan hanya untuk kegunaan dalaman universiti. Sistem ini dipantau secara berterusan dan sebarang penyalahgunaan boleh dikenakan tindakan undang-undang atau tatatertib.
          </p>
          <p className="lp-footer-copy">© Pejabat Komunikasi Strategik, UiTM 2025</p>
        </div>
      </footer>

    </div>
  );
}
