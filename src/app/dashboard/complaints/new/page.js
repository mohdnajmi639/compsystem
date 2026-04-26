'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Topbar from '@/components/Topbar';

export default function NewComplaintPage() {
  const router = useRouter();
  const [form, setForm] = useState({ title: '', description: '', category: 'Academic', priority: 'Medium' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/complaints', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      router.push('/dashboard/complaints');
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  return (
    <>
      <Topbar title="Submit New Complaint" />
      <div className="page-content">
        <div className="card" style={{maxWidth:'700px'}}>
          {error && <div className="auth-error">{error}</div>}
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Title</label>
              <input className="form-input" required value={form.title} onChange={e => setForm({...form, title: e.target.value})} placeholder="Brief summary of your complaint" />
            </div>
            <div className="form-group">
              <label className="form-label">Category</label>
              <select className="form-select" value={form.category} onChange={e => setForm({...form, category: e.target.value})}>
                <option>Academic</option><option>Facility</option><option>Financial</option><option>Administrative</option><option>Other</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Priority</label>
              <select className="form-select" value={form.priority} onChange={e => setForm({...form, priority: e.target.value})}>
                <option>Low</option><option>Medium</option><option>High</option><option>Urgent</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea className="form-textarea" required value={form.description} onChange={e => setForm({...form, description: e.target.value})} placeholder="Provide detailed information about your complaint..." />
            </div>
            <div style={{display:'flex',gap:'12px'}}>
              <button className="btn btn-primary" type="submit" disabled={loading}>{loading ? 'Submitting...' : 'Submit Complaint'}</button>
              <button className="btn btn-secondary" type="button" onClick={() => router.back()}>Cancel</button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
