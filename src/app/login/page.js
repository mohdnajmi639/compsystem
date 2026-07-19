'use client';
import { useState } from 'react';
import { signIn, getSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Suspense } from 'react';
import { NavDropdownAduan, NavDropdownSemak } from '@/components/NavDropdown';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  let callbackUrl = searchParams.get('callbackUrl');
  if (callbackUrl === 'null') callbackUrl = null;

  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const res = await signIn('credentials', { ...form, redirect: false });
    
    if (res?.error) {
      setError('E-mel atau kata laluan tidak sah. Sila cuba semula.');
      setLoading(false);
    } else {
      const session = await getSession();
      if (session?.user?.role === 'admin' || session?.user?.role === 'staff') {
        window.location.href = callbackUrl || '/dashboard';
      } else {
        window.location.href = (callbackUrl && callbackUrl !== '/dashboard') ? callbackUrl : '/';
      }
    }
  };

  const registerUrl = `/register?callbackUrl=${encodeURIComponent(callbackUrl)}`;

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
            <NavDropdownAduan />
            <NavDropdownSemak />
            <Link href="/panduan" className="lp-nav-link" id="nav-panduan">Panduan</Link>
            <Link href="/faq" className="lp-nav-link" id="nav-faq">Soalan Lazim</Link>
          </div>
          <div className="lp-nav-end">

            <Link href={registerUrl} className="lp-login-btn" id="register-nav-btn">Daftar</Link>
          </div>
        </div>
      </nav>

      {/* Auth Body */}
      <div className="lp-auth-body">
        <div className="lp-auth-card">
          <div className="lp-auth-header">
            <span className="lp-logo-circle" style={{width:48,height:48,marginBottom:16}}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="#fff" strokeWidth="2"/>
                <circle cx="12" cy="12" r="4" fill="#fff"/>
                <path d="M12 2v4M12 18v4M2 12h4M18 12h4" stroke="#fff" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </span>
            <h1 className="lp-auth-title">Log Masuk</h1>
            <p className="lp-auth-subtitle">Sila log masuk dengan akaun pelajar anda</p>
          </div>

          {error && <div className="lp-auth-error">{error}</div>}

          <form onSubmit={handleSubmit} className="lp-auth-form">
            <div className="lp-auth-field">
              <label className="lp-auth-label">E-mel Pelajar</label>
              <input
                id="login-email"
                className="lp-auth-input"
                type="email"
                required
                value={form.email}
                onChange={e => setForm({...form, email: e.target.value})}
                placeholder="example@student.uitm.edu.my"
              />
            </div>
            <div className="lp-auth-field">
              <label className="lp-auth-label">Kata Laluan</label>
              <input
                id="login-password"
                className="lp-auth-input"
                type="password"
                required
                value={form.password}
                onChange={e => setForm({...form, password: e.target.value})}
                placeholder="••••••••"
              />
            </div>
            <button
              id="login-submit"
              className="lp-auth-btn"
              type="submit"
              disabled={loading}
            >
              {loading ? 'Mengesahkan...' : 'Log Masuk'}
            </button>
          </form>

          <div className="lp-auth-divider"><span>atau</span></div>

          <div className="lp-auth-register-box">
            <p className="lp-auth-register-text">Belum mempunyai akaun?</p>
            <Link href={registerUrl} className="lp-auth-register-btn" id="go-register-btn">
              Daftar Akaun Baharu
            </Link>
          </div>

          <div className="lp-auth-demo">
            <p className="lp-auth-demo-title">Akaun Demo:</p>
            <p>Pelajar: student@university.edu / student123</p>
            <p>Pentadbir: admin@university.edu / admin123</p>
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

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="loading"><div className="spinner" /></div>}>
      <LoginForm />
    </Suspense>
  );
}
