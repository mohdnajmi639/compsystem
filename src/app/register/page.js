'use client';
import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Suspense } from 'react';

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/dashboard';

  const [form, setForm] = useState({
    name: '', email: '', password: '', confirmPassword: '',
    studentId: '', department: 'Sains Komputer'
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const departments = [
    'Sains Komputer', 'Kejuruteraan', 'Perniagaan', 'Sains',
    'Sastera', 'Perubatan', 'Undang-undang', 'Pendidikan',
    'Senibina', 'Farmasi'
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      setError('Kata laluan tidak sepadan. Sila semak semula.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          password: form.password,
          studentId: form.studentId,
          department: form.department,
          role: 'student'
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      // Redirect to login with the callbackUrl preserved
      router.push(`/login?callbackUrl=${encodeURIComponent(callbackUrl)}&registered=1`);
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  const loginUrl = `/login?callbackUrl=${encodeURIComponent(callbackUrl)}`;

  return (
    <div className="lp-auth-root">
      {/* Navbar */}
      <nav className="lp-nav">
        <div className="lp-nav-inner">
          <Link href="/" className="lp-logo" id="auth-logo">
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
            <Link href="/" className="lp-nav-link" id="nav-anjung">Anjung</Link>
            <Link href="#" className="lp-nav-link" id="nav-aduan">Aduan Baharu</Link>
            <Link href="#" className="lp-nav-link" id="nav-semakan">Semakan</Link>
            <Link href="#" className="lp-nav-link" id="nav-panduan">Panduan</Link>
            <Link href="#" className="lp-nav-link" id="nav-faq">Soalan Lazim</Link>
          </div>
          <div className="lp-nav-end">
            <div className="lp-lang-group">
              <button className="lp-lang-active" id="lang-my">🇲🇾</button>
              <button className="lp-lang-btn" id="lang-en">🇬🇧</button>
            </div>
            <Link href={loginUrl} className="lp-login-btn" id="login-nav-btn">Log Masuk</Link>
          </div>
        </div>
      </nav>

      {/* Auth Body */}
      <div className="lp-auth-body">
        <div className="lp-auth-card lp-auth-card-wide">
          <div className="lp-auth-header">
            <span className="lp-logo-circle" style={{width:48,height:48,marginBottom:16}}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="#fff" strokeWidth="2"/>
                <circle cx="12" cy="12" r="4" fill="#fff"/>
                <path d="M12 2v4M12 18v4M2 12h4M18 12h4" stroke="#fff" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </span>
            <h1 className="lp-auth-title">Daftar Akaun</h1>
            <p className="lp-auth-subtitle">Cipta akaun pelajar untuk mengemukakan aduan</p>
          </div>

          {error && <div className="lp-auth-error">{error}</div>}

          <form onSubmit={handleSubmit} className="lp-auth-form">
            <div className="lp-auth-row">
              <div className="lp-auth-field">
                <label className="lp-auth-label">Nama Penuh</label>
                <input
                  id="reg-name"
                  className="lp-auth-input"
                  required
                  value={form.name}
                  onChange={e => setForm({...form, name: e.target.value})}
                  placeholder="Nama penuh anda"
                />
              </div>
              <div className="lp-auth-field">
                <label className="lp-auth-label">No. Pelajar</label>
                <input
                  id="reg-student-id"
                  className="lp-auth-input"
                  value={form.studentId}
                  onChange={e => setForm({...form, studentId: e.target.value})}
                  placeholder="cth. 2023123456"
                />
              </div>
            </div>

            <div className="lp-auth-field">
              <label className="lp-auth-label">E-mel Pelajar</label>
              <input
                id="reg-email"
                className="lp-auth-input"
                type="email"
                required
                value={form.email}
                onChange={e => setForm({...form, email: e.target.value})}
                placeholder="example@student.uitm.edu.my"
              />
            </div>

            <div className="lp-auth-field">
              <label className="lp-auth-label">Fakulti / Jabatan</label>
              <select
                id="reg-department"
                className="lp-auth-input lp-auth-select"
                value={form.department}
                onChange={e => setForm({...form, department: e.target.value})}
              >
                {departments.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>

            <div className="lp-auth-row">
              <div className="lp-auth-field">
                <label className="lp-auth-label">Kata Laluan</label>
                <input
                  id="reg-password"
                  className="lp-auth-input"
                  type="password"
                  required
                  minLength={6}
                  value={form.password}
                  onChange={e => setForm({...form, password: e.target.value})}
                  placeholder="Minimum 6 aksara"
                />
              </div>
              <div className="lp-auth-field">
                <label className="lp-auth-label">Sahkan Kata Laluan</label>
                <input
                  id="reg-confirm-password"
                  className="lp-auth-input"
                  type="password"
                  required
                  minLength={6}
                  value={form.confirmPassword}
                  onChange={e => setForm({...form, confirmPassword: e.target.value})}
                  placeholder="Ulangi kata laluan"
                />
              </div>
            </div>

            <button
              id="register-submit"
              className="lp-auth-btn"
              type="submit"
              disabled={loading}
            >
              {loading ? 'Mendaftar...' : 'Daftar Akaun'}
            </button>
          </form>

          <div className="lp-auth-divider"><span>atau</span></div>

          <div className="lp-auth-register-box">
            <p className="lp-auth-register-text">Sudah mempunyai akaun?</p>
            <Link href={loginUrl} className="lp-auth-register-btn lp-auth-register-btn-outline" id="go-login-btn">
              Log Masuk
            </Link>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="lp-footer">
        <div className="lp-footer-inner">
          <p className="lp-footer-text">
            <strong>Penafian dan Notis Privasi:</strong>{' '}
            Sistem ini disediakan untuk pengurusan aduan rasmi UiTM. Semua data yang dikemukakan adalah sulit dan hanya untuk kegunaan dalaman universiti.
          </p>
          <p className="lp-footer-copy">© Pejabat Komunikasi Strategik, UiTM 2025</p>
        </div>
      </footer>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="loading"><div className="spinner" /></div>}>
      <RegisterForm />
    </Suspense>
  );
}
