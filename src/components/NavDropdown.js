'use client';
import { useState, useRef, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';

function Dropdown({ label, items, id }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  return (
    <div ref={ref} style={{ position: 'relative', height: '52px', display: 'flex', alignItems: 'center' }}>
      <button
        className="lp-nav-link lp-nav-dropdown-btn"
        id={id}
        onClick={() => setOpen(o => !o)}
        aria-expanded={open}
        style={{ height: '52px', display: 'flex', alignItems: 'center', gap: '4px', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', padding: '0 14px', borderBottom: `3px solid ${open ? '#7c3aed' : 'transparent'}` }}
      >
        {label}
        <svg
          width="11" height="11"
          viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"
          style={{ transition: 'transform 0.2s', transform: open ? 'rotate(180deg)' : 'rotate(0deg)', marginTop: '1px' }}
        >
          <polyline points="6 9 12 15 18 9"/>
        </svg>
      </button>

      {open && (
        <>
          <div style={{ position: 'fixed', inset: 0, zIndex: 99 }} onClick={() => setOpen(false)} />
          <div style={{
            position: 'absolute',
            top: 'calc(100% + 4px)',
            left: '50%',
            transform: 'translateX(-50%)',
            background: '#fff',
            border: '1px solid #e5e7eb',
            borderRadius: '12px',
            boxShadow: '0 10px 40px rgba(0,0,0,0.18)',
            minWidth: '270px',
            zIndex: 200,
            overflow: 'hidden',
            animation: 'navDDFadeIn 0.15s ease',
          }} role="menu">
            {items.map(item => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                role="menuitem"
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '12px',
                  padding: '14px 18px',
                  textDecoration: 'none',
                  color: '#111827',
                  transition: 'background 0.12s',
                  borderBottom: '1px solid #f3f4f6',
                }}
                className="lp-nav-dd-item"
              >
                <span style={{
                  width: 34, height: 34, borderRadius: 8,
                  background: item.iconBg || '#ede9fe',
                  color: item.iconColor || '#7c3aed',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0, marginTop: 1,
                }}>
                  {item.icon}
                </span>
                <span>
                  <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#111827', marginBottom: 2 }}>{item.label}</div>
                  <div style={{ fontSize: '0.74rem', color: '#6b7280', lineHeight: 1.4 }}>{item.desc}</div>
                </span>
              </Link>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export function NavDropdownAduan() {
  const { data: session } = useSession();
  const link = (path) => session ? path : `/login?callbackUrl=${path}`;

  const items = [
    {
      href: link('/aduan/umum'),
      label: 'Aduan Umum',
      desc: 'Aduan pertanyaan, cadangan & penghargaan',
      iconBg: '#ede9fe', iconColor: '#7c3aed',
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
        </svg>
      ),
    },
    {
      href: link('/aduan/ict'),
      label: 'Aduan ICT',
      desc: 'Masalah WiFi, internet & sistem ICT',
      iconBg: '#dbeafe', iconColor: '#1d4ed8',
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/>
        </svg>
      ),
    },
    {
      href: link('/aduan/fasiliti'),
      label: 'Aduan Fasiliti',
      desc: 'Kerosakan elektrik, sivil & landskap',
      iconBg: '#dcfce7', iconColor: '#15803d',
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
        </svg>
      ),
    },
  ];

  return <Dropdown label="Aduan Baharu" items={items} id="nav-new" />;
}

export function NavDropdownSemak() {
  const { data: session } = useSession();
  const link = (path) => session ? path : `/login?callbackUrl=${path}`;

  const items = [
    {
      href: link('/aduan/umum/semak'),
      label: 'Semak Aduan Umum',
      desc: 'Semak status aduan pertanyaan & cadangan',
      iconBg: '#ede9fe', iconColor: '#7c3aed',
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
      ),
    },
    {
      href: link('/aduan/ict/status'),
      label: 'Semak Aduan ICT',
      desc: 'Semak status aduan WiFi, internet & ICT',
      iconBg: '#dbeafe', iconColor: '#1d4ed8',
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
        </svg>
      ),
    },
    {
      href: link('/aduan/fasiliti/semak'),
      label: 'Semak Aduan Fasiliti',
      desc: 'Semak status aduan elektrik, sivil & fasiliti',
      iconBg: '#dcfce7', iconColor: '#15803d',
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/>
        </svg>
      ),
    },
  ];

  return <Dropdown label="Semakan" items={items} id="nav-check" />;
}
