import Link from 'next/link';
import Image from 'next/image';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import HomeUserMenu from '@/components/HomeUserMenu';
import { NavDropdownAduan, NavDropdownSemak } from '@/components/NavDropdown';

export const metadata = {
  title: 'E-Aduan UiTM',
  description: 'Ada aduan? Salurkan aduan anda mengikut kategori yang sesuai di bawah.',
};

export default async function Home() {
  const session = await getServerSession(authOptions);

  const getAduanLink = (path) => {
    return session ? path : `/login?callbackUrl=${path}`;
  };

  return (
    <div className="lp-auth-root">

      {/* ── NAVBAR ── */}
      <nav className="lp-nav">
        <div className="lp-nav-inner">
          <Link href="/" className="lp-logo" id="site-logo">
            <img src="/images/logo aduan2.png" alt="Aduan Logo" style={{height: 32, width: 'auto'}} />
          </Link>

          <div className="lp-nav-links">
            <Link href="/" className="lp-nav-link lp-nav-active" id="nav-home">Anjung</Link>
            {session?.user?.role !== 'admin' && session?.user?.role !== 'staff' && (
              <>
                <NavDropdownAduan />
                <NavDropdownSemak />
              </>
            )}
            <Link href="/panduan" className="lp-nav-link" id="nav-panduan">Panduan</Link>
            <Link href="/faq" className="lp-nav-link" id="nav-faq">Soalan Lazim</Link>
          </div>

          <div className="lp-nav-end">

            {session ? (
              <HomeUserMenu session={session} />
            ) : (
              <Link href="/login" className="lp-login-btn" id="login-button">Log Masuk</Link>
            )}
          </div>
        </div>
      </nav>

      {/* ── HERO BANNER ── */}
      <section className="lp-hero">
        <Image
          src="/images/uitm-banner.png"
          alt="Universiti Teknologi MARA Banner"
          fill
          priority
          style={{ objectFit: 'cover', objectPosition: 'center' }}
          className="lp-hero-bg-img"
        />
        <div className="lp-hero-text">
          <h1 className="lp-hero-title">Pengurusan Aduan Universiti</h1>
          <p className="lp-hero-subtitle">Ada aduan? Salurkan aduan anda mengikut kategori yang sesuai di bawah:</p>
        </div>
      </section>

      {/* ── MAIN PURPLE BODY ── */}
      <main className="lp-body">

        {/* Category Cards */}
        <div className="lp-cards-row">
          <Link href={getAduanLink('/aduan/umum')} className="lp-card" id="card-umum">
            <div className="lp-card-top">
              <div className="lp-card-diamond lp-diamond-1" />
            </div>
            <div className="lp-card-gradient lp-grad-1" />
            <span className="lp-card-label">Aduan Umum</span>
            <div className="lp-card-hover-overlay">
              <span className="lp-card-hover-text">Sebarang aduan umum, pertanyaan, cadangan dan penghargaan</span>
            </div>
          </Link>

          <Link href={getAduanLink('/aduan/ict')} className="lp-card" id="card-ict">
            <div className="lp-card-top">
              <div className="lp-card-diamond lp-diamond-2" />
            </div>
            <div className="lp-card-gradient lp-grad-2" />
            <span className="lp-card-label">Aduan ICT</span>
            <div className="lp-card-hover-overlay">
              <span className="lp-card-hover-text">Sebarang masalah berkenaan dengan WIFI, internet, sistem teknologi maklumat dan komunikasi</span>
            </div>
          </Link>

          <Link href={getAduanLink('/aduan/fasiliti')} className="lp-card" id="card-fasiliti">
            <div className="lp-card-top">
              <div className="lp-card-diamond lp-diamond-3" />
            </div>
            <div className="lp-card-gradient lp-grad-3" />
            <span className="lp-card-label">Aduan Fasiliti</span>
            <div className="lp-card-hover-overlay">
              <span className="lp-card-hover-text">Sebarang kerosakan elektrikal, landskap, pengurusan majlis, sivil dan telekomunikasi</span>
            </div>
          </Link>
        </div>


        {/* Quick Action Buttons */}
        <div className="lp-qa-row">
          <NavDropdownSemak variant="qa-button" />
          <Link href="/panduan" className="lp-qa-btn" id="btn-manual">Manual Aduan Umum</Link>
          <Link href="/faq" className="lp-qa-btn" id="btn-faq">Soalan Lazim</Link>
        </div>

        {/* Perlukan Bantuan */}
        <section className="lp-help" id="help">
          <h2 className="lp-help-title">Perlukan Bantuan?</h2>
          <p className="lp-help-desc">Jika anda berada dalam situasi kecemasan, berikut adalah talian penting yang boleh dihubungi:</p>

          <div className="lp-help-cols">
            <div className="lp-help-col">
              <h3 className="lp-help-col-title">Kecemasan &amp; Keselamatan</h3>
              <ul className="lp-help-ul">
                <li><strong>Dalam kampus UiTM:</strong><br/>03-5544 3999 (Keselamatan UiTM)</li>
                <li><strong>Luar kampus:</strong><br/>999 (Polis / Ambulan / Bomba)</li>
              </ul>
            </div>

            <div className="lp-help-col">
              <h3 className="lp-help-col-title">Rawatan Perubatan</h3>
              <ul className="lp-help-ul">
                <li><strong>Ambulan UiTM (Kampus Shah Alam):</strong><br/>03-5544 2999</li>
                <li><strong>Klinik Kesihatan UiTM:</strong><br/>03-5544 2200</li>
                <li><strong>Hospital berdekatan:</strong><br/>Sila hadir ke hospital berhampiran untuk rawatan segera.</li>
              </ul>
            </div>

            <div className="lp-help-col">
              <h3 className="lp-help-col-title">Lain-Lain Perkhidmatan Kecemasan UiTM</h3>
              <ul className="lp-help-ul">
                <li><strong>Pejabat Bendahari UiTM (Kecemasan Kewangan):</strong><br/>03-5544 2626</li>
                <li><strong>Talian Umum UiTM (General Line):</strong><br/>03-5544 2000</li>
              </ul>
            </div>
          </div>
        </section>
      </main>

      {/* ── FOOTER ── */}
      <footer className="lp-footer" id="faq">
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
