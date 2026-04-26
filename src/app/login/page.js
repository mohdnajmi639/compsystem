'use client';
import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const res = await signIn('credentials', { ...form, redirect: false });
    setLoading(false);
    if (res?.error) setError(res.error);
    else router.push('/dashboard');
  };

  return (
    <div className="auth-container">
      <div className="card auth-card">
        <h1>Welcome Back</h1>
        <p className="subtitle">Sign in to your account</p>
        {error && <div className="auth-error">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input className="form-input" type="email" required value={form.email} onChange={e => setForm({...form, email: e.target.value})} placeholder="you@university.edu" />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input className="form-input" type="password" required value={form.password} onChange={e => setForm({...form, password: e.target.value})} placeholder="••••••••" />
          </div>
          <button className="btn btn-primary btn-lg" style={{width:'100%'}} disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
        <p className="auth-footer">Don&apos;t have an account? <Link href="/register">Register</Link></p>
        <div style={{marginTop:'20px',padding:'14px',background:'var(--bg-glass)',borderRadius:'var(--radius-sm)',fontSize:'0.8rem',color:'var(--text-muted)'}}>
          <strong style={{color:'var(--text-secondary)'}}>Demo Accounts:</strong><br/>
          Student: student@university.edu / student123<br/>
          Staff: staff@university.edu / staff123<br/>
          Admin: admin@university.edu / admin123
        </div>
      </div>
    </div>
  );
}
