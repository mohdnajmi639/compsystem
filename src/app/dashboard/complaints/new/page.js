'use client';
import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Topbar from '@/components/Topbar';

const CATEGORY_LABELS = {
  General: 'Aduan Umum',
  ICT: 'Aduan ICT',
  Facility: 'Aduan Fasiliti',
};

const CATEGORY_DESCS = {
  General: 'Sebarang aduan umum, pertanyaan, cadangan dan penghargaan',
  ICT: 'Sebarang masalah berkenaan dengan WIFI, internet, sistem teknologi maklumat dan komunikasi',
  Facility: 'Sebarang kerosakan elektrikal, landskap, pengurusan majlis, sivil dan telekomunikasi',
};

function NewComplaintForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session } = useSession();

  const rawCategory = searchParams.get('category') || 'General';
  const categoryKey = Object.keys(CATEGORY_LABELS).includes(rawCategory) ? rawCategory : 'General';

  const [form, setForm] = useState({
    title: '',
    description: '',
    category: categoryKey,
    priority: 'Medium',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Keep category in sync if the URL param changes
  useEffect(() => {
    setForm(f => ({ ...f, category: categoryKey }));
  }, [categoryKey]);

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
      <Topbar title="Aduan Baharu" />
      <div className="page-content">

        {/* Category breadcrumb pill */}
        <div className="nc-category-pill" id="nc-category-badge">
          <span className="nc-category-dot" />
          {CATEGORY_LABELS[form.category]}
          <span className="nc-category-desc"> — {CATEGORY_DESCS[form.category]}</span>
        </div>

        <div className="card nc-card">
          {error && <div className="auth-error" style={{marginBottom:20}}>{error}</div>}

          <form onSubmit={handleSubmit}>

            {/* ── 1. Profil Pengguna ── */}
            <div className="nc-section-header">1. Profil Pengguna</div>
            <div className="nc-section-body">
              <div className="nc-field-row">
                <div className="nc-field">
                  <label className="nc-label">Kategori</label>
                  <div className="nc-static">Pelajar</div>
                </div>
              </div>
              <div className="nc-field-row">
                <div className="nc-field">
                  <label className="nc-label">Nama</label>
                  <div className="nc-static nc-static-highlight">{session?.user?.name || '—'}</div>
                </div>
              </div>
              <div className="nc-field-row nc-field-row-2">
                <div className="nc-field">
                  <label className="nc-label">Email</label>
                  <div className="nc-static">{session?.user?.email || '—'}</div>
                </div>
                <div className="nc-field">
                  <label className="nc-label">No. Telefon</label>
                  <input className="nc-input" placeholder="cth. 0123456789" />
                </div>
              </div>
            </div>

            {/* ── 2. Maklumat Aduan ── */}
            <div className="nc-section-header">2. Maklumat Aduan</div>
            <div className="nc-section-body">
              <div className="nc-field-row nc-field-row-2">
                <div className="nc-field">
                  <label className="nc-label">Kategori Aduan</label>
                  <select
                    id="nc-category"
                    className="nc-input nc-select"
                    value={form.category}
                    onChange={e => setForm({...form, category: e.target.value})}
                  >
                    <option value="General">Aduan Umum</option>
                    <option value="ICT">Aduan ICT</option>
                    <option value="Facility">Aduan Fasiliti</option>
                  </select>
                </div>
                <div className="nc-field">
                  <label className="nc-label">Tarikh</label>
                  <div className="nc-static">{new Date().toLocaleDateString('ms-MY', {day:'2-digit', month:'short', year:'numeric'})}</div>
                </div>
              </div>
              <div className="nc-field-row">
                <div className="nc-field">
                  <label className="nc-label">Hantar Kepada</label>
                  <div className="nc-radio-group">
                    <label className="nc-radio-label">
                      <input type="radio" name="sendTo" defaultChecked /> Jabatan / Fakulti / Kampus Cawangan Berkenaan
                    </label>
                    <label className="nc-radio-label">
                      <input type="radio" name="sendTo" /> Tidak Pasti
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* ── 3. Perkara ── */}
            <div className="nc-section-header">3. Perkara</div>
            <div className="nc-section-body">
              <div className="nc-field-row">
                <div className="nc-field">
                  <label className="nc-label">Tajuk Aduan</label>
                  <input
                    id="nc-title"
                    className="nc-input"
                    required
                    value={form.title}
                    onChange={e => setForm({...form, title: e.target.value})}
                    placeholder="Ringkasan tajuk aduan anda"
                  />
                </div>
              </div>
              <div className="nc-field-row">
                <div className="nc-field">
                  <label className="nc-label">
                    Keterangan Aduan
                    <span className="nc-label-hint"> ⓘ</span>
                  </label>
                  <p className="nc-label-desc">
                    Perhatikan dengan jelas isu, atau masalah yang menjadi sebab aduan dibuat. Terangkan dengan sepenuh-penuhnya apa yang berlaku, bila dan bagaimana ia berlaku.
                  </p>
                  <textarea
                    id="nc-description"
                    className="nc-textarea"
                    required
                    value={form.description}
                    onChange={e => setForm({...form, description: e.target.value})}
                    placeholder="Huraikan aduan anda dengan terperinci..."
                    rows={6}
                  />
                </div>
              </div>
            </div>

            {/* ── 4. Senarai Lampiran ── */}
            <div className="nc-section-header">4. Senarai Lampiran</div>
            <div className="nc-section-body">
              <p className="nc-label-desc" style={{marginBottom:12}}>
                Sertakan dokumen seperti surat, sertifikasi, kronologi atau mana-mana bukti lain yang menyokong aduan anda.
              </p>
              <div className="nc-attachment-row">
                <input id="nc-file" type="file" className="nc-file-input" multiple />
                <button type="button" className="nc-attach-btn" onClick={() => document.getElementById('nc-file').click()}>
                  + Tambah Lampiran
                </button>
              </div>
            </div>

            {/* ── Submit ── */}
            <div className="nc-submit-row">
              <button id="nc-submit" className="nc-submit-btn" type="submit" disabled={loading}>
                {loading ? 'Menghantar...' : 'Hantar Aduan'}
              </button>
              <button className="nc-cancel-btn" type="button" onClick={() => router.back()}>
                Batal
              </button>
            </div>

          </form>
        </div>

        {/* Disclaimer */}
        <div className="nc-disclaimer">
          <strong>Penafian dan Notis Privasi:</strong>{' '}
          Sistem ini disediakan untuk pengurusan aduan rasmi UiTM. Semua data yang dikemukakan adalah sulit dan hanya untuk kegunaan dalaman universiti. Sistem ini dipantau secara berterusan dan sebarang penyalahgunaan boleh dikenakan tindakan undang-undang atau tatatertib.
        </div>
      </div>
    </>
  );
}

export default function NewComplaintPage() {
  return (
    <Suspense fallback={<div className="loading"><div className="spinner" /></div>}>
      <NewComplaintForm />
    </Suspense>
  );
}
