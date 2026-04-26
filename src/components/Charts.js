'use client';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, ArcElement, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import { Bar, Doughnut, Line } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, PointElement, LineElement, Title, Tooltip, Legend);

const chartColors = ['#8b5cf6','#3b82f6','#10b981','#f59e0b','#ef4444','#ec4899'];
const commonOpts = { responsive:true, maintainAspectRatio:false, plugins:{ legend:{ labels:{ color:'#94a3b8',font:{size:12} } } }, scales:{ x:{ ticks:{color:'#64748b'}, grid:{color:'rgba(255,255,255,0.05)'} }, y:{ ticks:{color:'#64748b'}, grid:{color:'rgba(255,255,255,0.05)'} } } };

export function CategoryChart({ data }) {
  if (!data?.length) return <p style={{color:'var(--text-muted)'}}>No data</p>;
  return (
    <div className="chart-container">
      <Bar data={{ labels:data.map(d=>d._id), datasets:[{ label:'Complaints', data:data.map(d=>d.count), backgroundColor:chartColors, borderRadius:6 }] }} options={commonOpts} />
    </div>
  );
}

export function StatusChart({ data }) {
  if (!data) return <p style={{color:'var(--text-muted)'}}>No data</p>;
  const labels = ['Pending','In Progress','Resolved','Rejected'];
  const values = [data.pendingComplaints,data.inProgressComplaints,data.resolvedComplaints,data.rejectedComplaints];
  return (
    <div className="chart-container">
      <Doughnut data={{ labels, datasets:[{ data:values, backgroundColor:['#f59e0b','#3b82f6','#10b981','#ef4444'], borderWidth:0 }] }} options={{ responsive:true, maintainAspectRatio:false, plugins:{ legend:{ position:'bottom', labels:{color:'#94a3b8',padding:16} } } }} />
    </div>
  );
}

export function TrendChart({ data }) {
  if (!data?.length) return <p style={{color:'var(--text-muted)'}}>No data</p>;
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  return (
    <div className="chart-container">
      <Line data={{ labels:data.map(d=>`${months[d._id.month-1]} ${d._id.year}`), datasets:[{ label:'Complaints', data:data.map(d=>d.count), borderColor:'#8b5cf6', backgroundColor:'rgba(139,92,246,0.1)', fill:true, tension:0.4 }] }} options={commonOpts} />
    </div>
  );
}
