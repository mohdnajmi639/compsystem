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
      <Topbar title="User Management" />
      <div className="page-content">
        <div className="card">
          {loading ? <div className="loading"><div className="spinner" /></div> : (
            <div className="table-container">
              <table>
                <thead>
                  <tr><th>Name</th><th>Email</th><th>Role</th><th>Department</th><th>Joined</th></tr>
                </thead>
                <tbody>
                  {users.map(u => (
                    <tr key={u._id}>
                      <td style={{fontWeight:500}}>{u.name}</td>
                      <td style={{color:'var(--text-secondary)'}}>{u.email}</td>
                      <td><span className={`badge ${u.role === 'admin' ? 'badge-urgent' : u.role === 'staff' ? 'badge-progress' : 'badge-resolved'}`}>{u.role}</span></td>
                      <td style={{color:'var(--text-secondary)'}}>{u.department}</td>
                      <td style={{color:'var(--text-muted)',fontSize:'0.85rem'}}>{new Date(u.createdAt).toLocaleDateString()}</td>
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
