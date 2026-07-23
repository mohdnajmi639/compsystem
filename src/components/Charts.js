'use client';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, ArcElement, PointElement, LineElement, Title, Tooltip, Legend, Filler } from 'chart.js';
import { Bar, Doughnut, Line } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, PointElement, LineElement, Title, Tooltip, Legend, Filler);

// Professional Light Theme Options
const commonOpts = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: false, // Hide legend for cleaner look on bar/line charts
    },
    tooltip: {
      backgroundColor: '#111827',
      titleColor: '#fff',
      bodyColor: '#e5e7eb',
      padding: 10,
      cornerRadius: 0, // Sharp edges
      displayColors: false,
    }
  },
  scales: {
    x: {
      ticks: { color: '#6b7280', font: { size: 11, family: 'Inter' } },
      grid: { display: false },
      border: { display: true, color: '#e5e7eb' }
    },
    y: {
      ticks: { color: '#6b7280', font: { size: 11, family: 'Inter' }, precision: 0 },
      grid: { color: '#f3f4f6', borderDash: [4, 4] },
      border: { display: false }
    }
  }
};

export function CategoryChart({ data }) {
  if (!data?.length) return <p style={{color:'#9ca3af', fontSize:'0.85rem'}}>Tiada data</p>;
  return (
    <div className="chart-container">
      <Bar 
        data={{ 
          labels: data.map(d => d._id), 
          datasets: [{ 
            label: 'Jumlah Aduan', 
            data: data.map(d => d.count), 
            backgroundColor: '#7c3aed', 
            hoverBackgroundColor: '#5b21b6',
            borderRadius: 0, // Sharp edges
            barPercentage: 0.6,
          }] 
        }} 
        options={commonOpts} 
      />
    </div>
  );
}

export function StatusChart({ data }) {
  if (!data) return <p style={{color:'#9ca3af', fontSize:'0.85rem'}}>Tiada data</p>;
  const labels = ['Pending','In Progress','Resolved','Rejected'];
  const values = [data.pendingComplaints, data.inProgressComplaints, data.resolvedComplaints, data.rejectedComplaints];
  return (
    <div className="chart-container">
      <Doughnut 
        data={{ 
          labels, 
          datasets: [{ 
            data: values, 
            backgroundColor: ['#f59e0b', '#3b82f6', '#10b981', '#ef4444'], 
            borderWidth: 2,
            borderColor: '#ffffff',
            hoverOffset: 4
          }] 
        }} 
        options={{ 
          responsive: true, 
          maintainAspectRatio: false, 
          cutout: '75%', // Sleek thin ring
          plugins: { 
            legend: { 
              position: 'bottom', 
              labels: { color: '#374151', font: { size: 12, family: 'Inter' }, padding: 20, usePointStyle: true, pointStyle: 'rect' } 
            },
            tooltip: { cornerRadius: 0 }
          } 
        }} 
      />
    </div>
  );
}

export function TrendChart({ data }) {
  if (!data?.length) return <p style={{color:'#9ca3af', fontSize:'0.85rem'}}>Tiada data</p>;
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  return (
    <div className="chart-container">
      <Line 
        data={{ 
          labels: data.map(d => `${months[d._id.month-1]} ${d._id.year}`), 
          datasets: [{ 
            label: 'Jumlah Aduan', 
            data: data.map(d => d.count), 
            borderColor: '#5b21b6', 
            backgroundColor: 'rgba(91, 33, 182, 0.05)', 
            fill: true, 
            tension: 0, // Sharp angular lines instead of bubbly curves
            borderWidth: 2,
            pointRadius: 4,
            pointBackgroundColor: '#fff',
            pointBorderColor: '#5b21b6',
            pointBorderWidth: 2,
            pointHoverRadius: 6,
          }] 
        }} 
        options={commonOpts} 
      />
    </div>
  );
}

export function PriorityChart({ data }) {
  if (!data?.length) return <p style={{color:'#9ca3af', fontSize:'0.85rem'}}>Tiada data</p>;
  
  const priorityColors = {
    'Low': '#10b981',
    'Medium': '#3b82f6',
    'High': '#f59e0b',
    'Urgent': '#ef4444'
  };

  return (
    <div className="chart-container">
      <Bar 
        data={{ 
          labels: data.map(d => d._id), 
          datasets: [{ 
            label: 'Jumlah', 
            data: data.map(d => d.count), 
            backgroundColor: data.map(d => priorityColors[d._id] || '#7c3aed'),
            borderRadius: 0,
            barPercentage: 0.6,
          }] 
        }} 
        options={commonOpts} 
      />
    </div>
  );
}
