import Link from 'next/link';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import HomeUserMenu from '@/components/HomeUserMenu';
import { NavDropdownAduan, NavDropdownSemak } from '@/components/NavDropdown';

export const metadata = {
  title: 'Panduan | E-Aduan UiTM',
  description: 'Senarai Dokumen Rujukan untuk Sistem e-Aduan UiTM',
};

export default async function PanduanPage() {
  const session = await getServerSession(authOptions);

  return (
    <div className="lp-auth-root">

      {/* ── NAVBAR ── */}
      <nav className="lp-nav">
        <div className="lp-nav-inner">
          <Link href="/" className="lp-logo" id="panduan-site-logo">
            <img src="/images/logo aduan.png" alt="Aduan Logo" style={{height: 32, width: 'auto'}} />
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
            {session ? (
              <HomeUserMenu session={session} />
            ) : (
              <Link href="/login" className="lp-login-btn" id="panduan-login-button">Log Masuk</Link>
            )}
          </div>
        </div>
      </nav>

      {/* ── PANDUAN CONTENT ── */}
      <main className="glass-panel" style={{ flex: 1, padding: '48px 24px', maxWidth: '1100px', margin: '48px auto', width: '90%' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: '500', color: '#ffffff', marginBottom: '16px' }}>
          Senarai Dokumen Rujukan
        </h1>
        <ol style={{ paddingLeft: '24px', color: '#ffffff' }}>
          <li style={{ paddingLeft: '8px' }}>
            <a 
              href="/documents/pekeliling_am_bil_2_2022.pdf" 
              target="_blank" 
              rel="noopener noreferrer"
              style={{ color: '#93c5fd', textDecoration: 'underline', fontSize: '1rem' }}
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
          <p className="lp-footer-copy">© Pejabat Komunikasi Strategik, UiTM 2026</p>
        </div>
      </footer>

    </div>
  );
}
