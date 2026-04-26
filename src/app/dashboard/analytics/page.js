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

  if (loading) return <><Topbar title="Analytics" /><div className="page-content"><div className="loading"><div className="spinner" /></div></div></>;
  if (!data) return <><Topbar title="Analytics" /><div className="page-content"><div className="empty-state"><h3>Failed to load analytics</h3></div></div></>;

  const o = data.overview;

  return (
    <>
      <Topbar title="Analytics" />
      <div className="page-content">
        <div className="stats-grid">
          <div className="card stat-card"><div className="stat-icon purple">📋</div><div className="stat-info"><h3>{o.totalComplaints}</h3><p>Total Complaints</p></div></div>
          <div className="card stat-card"><div className="stat-icon green">✅</div><div className="stat-info"><h3>{o.resolutionRate}%</h3><p>Resolution Rate</p></div></div>
          <div className="card stat-card"><div className="stat-icon blue">👥</div><div className="stat-info"><h3>{o.totalUsers}</h3><p>Total Users</p></div></div>
          <div className="card stat-card"><div className="stat-icon orange">⭐</div><div className="stat-info"><h3>{o.avgRating}</h3><p>Avg Rating</p></div></div>
        </div>
        <div className="analytics-grid">
          <div className="card chart-card"><h3>Complaints by Category</h3><CategoryChart data={data.categoryData} /></div>
          <div className="card chart-card"><h3>Status Distribution</h3><StatusChart data={o} /></div>
          <div className="card chart-card" style={{gridColumn:'1/-1'}}><h3>Monthly Trend</h3><TrendChart data={data.monthlyData} /></div>
        </div>
      </div>
    </>
  );
}
