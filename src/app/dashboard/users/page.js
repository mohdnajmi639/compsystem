'use client';
import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import Topbar from '@/components/Topbar';

const ROLES = ['student', 'staff', 'admin', 'public'];

const DEPARTMENTS = [
  'Fakulti Pengurusan Maklumat (FPM)',
  'Fakulti Filem, Teater dan Animasi (FiTA)',
  'Umum',
  'Admin Sistem',
  'Fasiliti',
  'Hal Ehwal Pelajar (HEP)',
  'ICT',
];

const formatDepartment = (dept) => {
  if (dept === 'Fasiliti') return 'Bahagian Fasiliti';
  if (dept === 'ICT') return 'Teknologi Maklumat dan Komunikasi (ICT)';
  return dept;
};

const roleBadge = (role) => {
  const map = {
    admin: 'badge-urgent',
    staff: 'badge-pending',
    public: 'badge-progress',
    student: 'badge-resolved',
  };
  return <span className={`badge ${map[role] || ''}`}>{role}</span>;
};

export default function UsersPage() {
  const { data: session } = useSession();
  const isAdmin = session?.user?.role === 'admin';

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editTarget, setEditTarget] = useState(null); // user being edited
  const [deleteTarget, setDeleteTarget] = useState(null); // user being deleted
  const [deleteCountdown, setDeleteCountdown] = useState(0); // 5-second wait
  const [editForm, setEditForm] = useState({ name: '', email: '', role: '', department: '' });
  const [toast, setToast] = useState(null); // { msg, type }
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetch('/api/users')
      .then((r) => r.json())
      .then((d) => { setUsers(Array.isArray(d) ? d : []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (deleteCountdown > 0) {
      const timer = setTimeout(() => setDeleteCountdown(deleteCountdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [deleteCountdown]);

  const openEdit = (user) => {
    setEditTarget(user);
    setEditForm({ name: user.name || '', email: user.email || '', role: user.role, department: user.department || '' });
  };

  const closeEdit = () => {
    setEditTarget(null);
    setEditForm({ name: '', email: '', role: '', department: '' });
  };

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const handleSave = async () => {
    if (!editTarget) return;

    // Capture state before closing the modal
    const currentTargetId = editTarget._id;
    const currentForm = { ...editForm };
    const currentTargetName = editTarget.name; // For fallback/reference
    const previousUsers = users;

    // Optimistic update — apply change immediately to the table
    setUsers((prev) =>
      prev.map((u) =>
        u._id === currentTargetId ? { ...u, name: currentForm.name, email: currentForm.email, role: currentForm.role, department: currentForm.department } : u
      )
    );
    closeEdit();

    try {
      const res = await fetch(`/api/users/${currentTargetId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(currentForm),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Ralat berlaku');
      // Sync with actual server data
      setUsers((prev) => prev.map((u) => (u._id === currentTargetId ? data : u)));
      showToast(`Maklumat ${currentForm.name} berjaya dikemaskini`);
    } catch (err) {
      // Revert on failure
      setUsers(previousUsers);
      showToast(err.message, 'error');
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    const currentTargetId = deleteTarget._id;
    const currentTargetName = deleteTarget.name;
    const previousUsers = users;

    // Optimistic delete
    setUsers((prev) => prev.filter((u) => u._id !== currentTargetId));
    setDeleteTarget(null);
    setDeleteCountdown(0);

    try {
      const res = await fetch(`/api/users/${currentTargetId}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Ralat berlaku');
      showToast(`Akaun ${currentTargetName} berjaya dipadam`);
    } catch (err) {
      setUsers(previousUsers);
      showToast(err.message, 'error');
    }
  };

  const filtered = users.filter(
    (u) =>
      u.name?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase()) ||
      u.department?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <Topbar title="Pengurusan Pengguna" />

      {/* ── Toast ─────────────────────────── */}
      {toast && (
        <div
          style={{
            position: 'fixed',
            bottom: '28px',
            right: '28px',
            zIndex: 9999,
            background: toast.type === 'error' ? '#dc2626' : '#16a34a',
            color: '#fff',
            padding: '14px 22px',
            borderRadius: 0,
            fontSize: '0.9rem',
            fontWeight: 600,
            boxShadow: '0 8px 30px rgba(0,0,0,0.18)',
            animation: 'slideInRight 0.3s ease',
          }}
        >
          {toast.msg}
        </div>
      )}

      {/* ── Edit Modal ────────────────────── */}
      {editTarget && (
        <div
          style={{
            position: 'fixed', inset: 0, zIndex: 1000,
            background: 'rgba(0,0,0,0.45)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '20px',
          }}
          onClick={(e) => { if (e.target === e.currentTarget) closeEdit(); }}
        >
          <div
            style={{
              background: '#fff',
              borderRadius: 0,
              padding: '32px',
              width: '100%',
              maxWidth: '440px',
              boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
              animation: 'fadeInUp 0.25s ease',
            }}
          >
            {/* Modal Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '24px' }}>
              <div
                style={{
                  width: '46px', height: '46px', borderRadius: '50%',
                  background: 'linear-gradient(135deg,#6366f1,#8b5cf6)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#fff', fontWeight: 800, fontSize: '1.1rem', flexShrink: 0,
                }}
              >
                {editTarget.name?.charAt(0).toUpperCase()}
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: '1.05rem', color: '#111827' }}>
                  {editTarget.name}
                </div>
                <div style={{ fontSize: '0.83rem', color: '#6b7280' }}>{editTarget.email}</div>
              </div>
              <button
                onClick={closeEdit}
                style={{
                  marginLeft: 'auto', background: 'none', border: 'none',
                  cursor: 'pointer', fontSize: '1.4rem', color: '#9ca3af',
                  lineHeight: 1, padding: '4px',
                }}
              >
                ×
              </button>
            </div>

            {/* Name */}
            <div style={{ marginBottom: '18px' }}>
              <label style={{ display: 'block', fontSize: '0.83rem', fontWeight: 700, color: '#374151', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Nama Penuh
              </label>
              <input
                className="form-input"
                type="text"
                value={editForm.name}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                style={{ width: '100%', padding: '10px 14px' }}
              />
            </div>

            {/* Email */}
            <div style={{ marginBottom: '18px' }}>
              <label style={{ display: 'block', fontSize: '0.83rem', fontWeight: 700, color: '#374151', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Emel
              </label>
              <input
                className="form-input"
                type="email"
                value={editForm.email}
                onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                style={{ width: '100%', padding: '10px 14px' }}
              />
            </div>

            {/* Role */}
            <div style={{ marginBottom: '18px' }}>
              <label style={{ display: 'block', fontSize: '0.83rem', fontWeight: 700, color: '#374151', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Peranan (Role)
              </label>
              <select
                className="form-select"
                value={editForm.role}
                onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                style={{ width: '100%' }}
              >
                {ROLES.map((r) => (
                  <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>
                ))}
              </select>
            </div>

            {/* Department */}
            <div style={{ marginBottom: '28px' }}>
              <label style={{ display: 'block', fontSize: '0.83rem', fontWeight: 700, color: '#374151', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Jabatan (Department)
              </label>
              <select
                className="form-select"
                value={editForm.department}
                onChange={(e) => setEditForm({ ...editForm, department: e.target.value })}
                style={{ width: '100%' }}
              >
                {DEPARTMENTS.map((d) => (
                  <option key={d} value={d}>{formatDepartment(d)}</option>
                ))}
              </select>
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={closeEdit}
                style={{
                  flex: 1, padding: '12px', borderRadius: 0,
                  border: '1.5px solid #e5e7eb', background: '#fff',
                  color: '#374151', fontWeight: 600, cursor: 'pointer',
                  fontSize: '0.95rem',
                }}
              >
                Batal
              </button>
              <button
                onClick={handleSave}
                style={{
                  flex: 2, padding: '12px', borderRadius: 0,
                  background: 'linear-gradient(135deg,#6366f1,#8b5cf6)',
                  border: 'none', color: '#fff', fontWeight: 700, cursor: 'pointer',
                  fontSize: '0.95rem',
                }}
              >
                Simpan Perubahan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Delete Modal ──────────────────── */}
      {deleteTarget && (
        <div
          style={{
            position: 'fixed', inset: 0, zIndex: 1000,
            background: 'rgba(0,0,0,0.45)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '20px',
          }}
          onClick={(e) => { if (e.target === e.currentTarget) setDeleteTarget(null); }}
        >
          <div
            style={{
              background: '#fff',
              borderRadius: 0,
              padding: '32px',
              width: '100%',
              maxWidth: '440px',
              boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
              animation: 'fadeInUp 0.25s ease',
              textAlign: 'center',
            }}
          >
            <div style={{ marginBottom: '20px' }}>
              <div
                style={{
                  width: '64px', height: '64px', borderRadius: '50%',
                  background: '#fef2f2', border: '2px solid #fee2e2',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  margin: '0 auto', color: '#dc2626', fontSize: '2rem',
                }}
              >
                !
              </div>
            </div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#111827', marginBottom: '12px' }}>
              Adakah anda pasti?
            </h3>
            <p style={{ fontSize: '0.95rem', color: '#4b5563', marginBottom: '24px', lineHeight: 1.5 }}>
              Anda pasti mahu memadam akaun <strong>{deleteTarget.name}</strong>? Tindakan ini tidak boleh dipulihkan.
            </p>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={() => { setDeleteTarget(null); setDeleteCountdown(0); }}
                style={{
                  flex: 1, padding: '12px', borderRadius: 0,
                  border: '1.5px solid #e5e7eb', background: '#fff',
                  color: '#374151', fontWeight: 600, cursor: 'pointer',
                  fontSize: '0.95rem',
                }}
              >
                Batal
              </button>
              <button
                onClick={handleDelete}
                disabled={deleteCountdown > 0}
                style={{
                  flex: 1, padding: '12px', borderRadius: 0,
                  background: deleteCountdown > 0 ? '#fca5a5' : '#dc2626',
                  border: 'none', color: '#fff', fontWeight: 700, 
                  cursor: deleteCountdown > 0 ? 'not-allowed' : 'pointer',
                  fontSize: '0.95rem', transition: 'background 0.2s',
                }}
              >
                {deleteCountdown > 0 ? `Tunggu ${deleteCountdown}s...` : 'Ya, Padam Akaun'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Page Content ──────────────────── */}
      <div className="page-content">
        <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#111827', marginBottom: '24px' }}>
          Pengurusan Pengguna
        </h1>

        {/* Search bar */}
        <div className="card" style={{ padding: '16px 20px', marginBottom: '16px' }}>
          <input
            type="text"
            className="form-input"
            placeholder="Cari nama, emel atau jabatan..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ width: '100%', maxWidth: '400px' }}
          />
        </div>

        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '20px 24px', borderBottom: '1px solid #e5e7eb', background: '#f9fafb', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h3 style={{ fontSize: '1rem', color: '#111827', margin: 0, fontWeight: 700 }}>
              Senarai Pengguna Sistem
            </h3>
            <span style={{ fontSize: '0.82rem', color: '#6b7280', fontWeight: 600 }}>
              {filtered.length} pengguna
            </span>
          </div>

          {loading ? (
            <div style={{ padding: '40px', textAlign: 'center' }}>
              <div className="spinner" style={{ margin: '0 auto' }} />
            </div>
          ) : filtered.length === 0 ? (
            <div style={{ padding: '40px', textAlign: 'center', color: '#6b7280' }}>
              Tiada pengguna dijumpai.
            </div>
          ) : (
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Nama</th>
                    <th>Emel</th>
                    <th>Peranan</th>
                    <th>Jabatan</th>
                    <th style={{ textAlign: 'right' }}>Sertai Pada</th>
                    {isAdmin && <th style={{ textAlign: 'center' }}>Tindakan</th>}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((u) => (
                    <tr key={u._id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div
                            style={{
                              width: '34px', height: '34px', borderRadius: '50%',
                              background: 'linear-gradient(135deg,#6366f1,#8b5cf6)',
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              color: '#fff', fontWeight: 800, fontSize: '0.85rem', flexShrink: 0,
                            }}
                          >
                            {u.name?.charAt(0).toUpperCase()}
                          </div>
                          <span style={{ fontWeight: 600, color: '#111827' }}>{u.name}</span>
                        </div>
                      </td>
                      <td style={{ color: '#6b7280' }}>{u.email}</td>
                      <td>{roleBadge(u.role)}</td>
                      <td style={{ color: '#374151' }}>{formatDepartment(u.department) || '-'}</td>
                      <td style={{ color: '#9ca3af', fontSize: '0.85rem', textAlign: 'right' }}>
                        {new Date(u.createdAt).toLocaleDateString('ms-MY')}
                      </td>
                      {isAdmin && (
                        <td style={{ textAlign: 'center' }}>
                          <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                            <button
                              onClick={() => openEdit(u)}
                              style={{
                                padding: '6px 12px',
                                borderRadius: 0,
                                border: '1.5px solid #6366f1',
                                background: 'transparent',
                                color: '#6366f1',
                                fontWeight: 700,
                                fontSize: '0.82rem',
                                cursor: 'pointer',
                                transition: 'all 0.18s',
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.background = '#6366f1';
                                e.currentTarget.style.color = '#fff';
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.background = 'transparent';
                                e.currentTarget.style.color = '#6366f1';
                              }}
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => { setDeleteTarget(u); setDeleteCountdown(5); }}
                              style={{
                                padding: '6px 12px',
                                borderRadius: 0,
                                border: '1.5px solid #ef4444',
                                background: 'transparent',
                                color: '#ef4444',
                                fontWeight: 700,
                                fontSize: '0.82rem',
                                cursor: 'pointer',
                                transition: 'all 0.18s',
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.background = '#ef4444';
                                e.currentTarget.style.color = '#fff';
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.background = 'transparent';
                                e.currentTarget.style.color = '#ef4444';
                              }}
                            >
                              Padam
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideInRight {
          from { opacity: 0; transform: translateX(40px); }
          to   { opacity: 1; transform: translateX(0); }
        }
      `}</style>
    </>
  );
}
