'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: '', email: '', password: '', studentId: '', department: 'Computer Science' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, role: 'student' }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      router.push('/login');
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  const departments = ['Computer Science', 'Engineering', 'Business', 'Science', 'Arts', 'Medicine', 'Law', 'Education'];

  return (
    <div className="auth-container">
      <div className="card auth-card">
        <h1>Create Account</h1>
        <p className="subtitle">Register as a student</p>
        {error && <div className="auth-error">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input className="form-input" required value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="Your full name" />
          </div>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input className="form-input" type="email" required value={form.email} onChange={e => setForm({...form, email: e.target.value})} placeholder="you@university.edu" />
          </div>
          <div className="form-group">
            <label className="form-label">Student ID</label>
            <input className="form-input" value={form.studentId} onChange={e => setForm({...form, studentId: e.target.value})} placeholder="e.g. STU001" />
          </div>
          <div className="form-group">
            <label className="form-label">Department</label>
            <select className="form-select" value={form.department} onChange={e => setForm({...form, department: e.target.value})}>
              {departments.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input className="form-input" type="password" required minLength={6} value={form.password} onChange={e => setForm({...form, password: e.target.value})} placeholder="Min 6 characters" />
          </div>
          <button className="btn btn-primary btn-lg" style={{width:'100%'}} disabled={loading}>
            {loading ? 'Creating...' : 'Create Account'}
          </button>
        </form>
        <p className="auth-footer">Already have an account? <Link href="/login">Sign In</Link></p>
      </div>
    </div>
  );
}
