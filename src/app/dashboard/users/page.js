'use client';
import { useEffect, useState } from 'react';
import Topbar from '@/components/Topbar';

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/users').then(r => r.json()).then(d => { setUsers(Array.isArray(d) ? d : []); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  return (
    <>
      <Topbar title="Pengurusan Pengguna" />
      <div className="page-content">
        <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#111827', marginBottom: '24px' }}>Pengurusan Pengguna</h1>
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '20px 24px', borderBottom: '1px solid #e5e7eb', background: '#f9fafb' }}>
            <h3 style={{ fontSize: '1rem', color: '#111827', margin: 0, fontWeight: 700 }}>Senarai Pengguna Sistem</h3>
          </div>

          {loading ? (
            <div style={{ padding: '40px', textAlign: 'center' }}>
              <div className="spinner" style={{ margin: '0 auto' }} />
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
                  </tr>
                </thead>
                <tbody>
                  {users.map(u => (
                    <tr key={u._id}>
                      <td style={{ fontWeight: 600, color: '#111827' }}>{u.name}</td>
                      <td style={{ color: '#6b7280' }}>{u.email}</td>
                      <td>
                        <span className={`badge ${u.role === 'admin' ? 'badge-urgent' : u.role === 'staff' ? 'badge-progress' : 'badge-resolved'}`}>
                          {u.role}
                        </span>
                      </td>
                      <td style={{ color: '#374151' }}>{u.department}</td>
                      <td style={{ color: '#9ca3af', fontSize: '0.85rem', textAlign: 'right' }}>
                        {new Date(u.createdAt).toLocaleDateString('ms-MY')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
