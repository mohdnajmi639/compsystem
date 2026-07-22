'use client';
import { useEffect, useState } from 'react';
import Topbar from '@/components/Topbar';
import { CategoryChart, StatusChart, TrendChart } from '@/components/Charts';

export default function AnalyticsPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/analytics').then(r => r.json()).then(d => { setData(d); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  if (loading) return <><Topbar title="Analitik" /><div className="page-content"><div className="loading"><div className="spinner" style={{ margin: '0 auto' }} /></div></div></>;
  if (!data) return <><Topbar title="Analitik" /><div className="page-content"><div className="empty-state"><h3>Gagal memuatkan analitik</h3></div></div></>;

  const o = data.overview;

  return (
    <>
      <Topbar title="Analitik" />
      <div className="page-content">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#ffffff', margin: 0 }} className="print-title">Analitik Sistem</h1>
          <button 
            onClick={() => window.print()}
            style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', background: '#7c3aed', color: '#fff', border: 'none', fontWeight: 600, cursor: 'pointer', transition: 'opacity 0.2s' }}
            onMouseEnter={e => e.currentTarget.style.opacity = '0.9'}
            onMouseLeave={e => e.currentTarget.style.opacity = '1'}
            className="print-hide"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            Muat Turun PDF
          </button>
        </div>
        
        {/* Unified Stats Bar */}
        <div className="card" style={{ display: 'flex', padding: 0, marginBottom: 24, overflow: 'hidden', flexWrap: 'wrap' }}>
          {[
            { 
              label: 'Jumlah Aduan', value: o.totalComplaints, color: '#7c3aed', bg: '#f5f3ff',
              icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="8" y1="13" x2="16" y2="13"/><line x1="8" y1="17" x2="16" y2="17"/></svg>
            },
            { 
              label: 'Kadar Penyelesaian', value: o.resolutionRate + '%', color: '#16a34a', bg: '#f0fdf4',
              icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
            },
            { 
              label: 'Jumlah Pengguna', value: o.totalUsers, color: '#2563eb', bg: '#eff6ff',
              icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
            },
            { 
              label: 'Purata Penilaian', value: o.avgRating, color: '#ea580c', bg: '#fff7ed',
              icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
            },
          ].map((stat, i) => (
            <div key={i} style={{ flex: '1 1 200px', padding: '24px', borderRight: i < 3 ? '1px solid #e5e7eb' : 'none', display: 'flex', alignItems: 'center', gap: '16px', minWidth: '200px' }}>
              <div style={{ width: '48px', height: '48px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: stat.bg, color: stat.color, flexShrink: 0 }}>
                {stat.icon}
              </div>
              <div>
                <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#111827', lineHeight: 1 }}>{stat.value}</div>
                <div style={{ fontSize: '0.78rem', color: '#6b7280', marginTop: '4px' }}>{stat.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Unified Charts Panel */}
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '20px 24px', borderBottom: '1px solid #e5e7eb', background: '#f9fafb' }}>
            <h3 style={{ fontSize: '1rem', color: '#111827', margin: 0, fontWeight: 700 }}>Laporan Keseluruhan</h3>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))' }}>
            <div style={{ padding: '24px', borderRight: '1px solid #e5e7eb', borderBottom: '1px solid #e5e7eb' }}>
              <h3 style={{ marginBottom: '16px', fontSize: '1rem', fontWeight: 700, color: '#111827' }}>Aduan Mengikut Kategori</h3>
              <div className="chart-container" style={{ height: '280px' }}><CategoryChart data={data.categoryData} /></div>
            </div>
            <div style={{ padding: '24px', borderBottom: '1px solid #e5e7eb' }}>
              <h3 style={{ marginBottom: '16px', fontSize: '1rem', fontWeight: 700, color: '#111827' }}>Taburan Status</h3>
              <div className="chart-container" style={{ height: '280px' }}><StatusChart data={o} /></div>
            </div>
            <div style={{ gridColumn: '1 / -1', padding: '24px' }}>
              <h3 style={{ marginBottom: '16px', fontSize: '1rem', fontWeight: 700, color: '#111827' }}>Trend Bulanan</h3>
              <div className="chart-container" style={{ height: '320px' }}><TrendChart data={data.monthlyData} /></div>
            </div>
          </div>
        </div>

      </div>
    </>
  );
}
