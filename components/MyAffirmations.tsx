import React, { useEffect, useMemo, useState } from 'react';
import { UserAffirmation, AffirmationCategory } from '../types';
import { getAll, remove, duplicate, exportJSON, importJSON } from '../services/affirmationService';
import AffirmationForm from './AffirmationForm';

type SortKey = 'newest' | 'oldest' | 'alpha' | 'used';

const MyAffirmations: React.FC = () => {
  const [items, setItems] = useState<UserAffirmation[]>([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<AffirmationCategory | 'All'>('All');
  const [reminder, setReminder] = useState<'All' | 'Has' | 'None'>('All');
  const [sort, setSort] = useState<SortKey>('newest');
  const [page, setPage] = useState(1);
  const [openForm, setOpenForm] = useState(false);
  const [editing, setEditing] = useState<UserAffirmation | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [importError, setImportError] = useState<string | null>(null);
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');

  useEffect(() => {
    setItems(getAll());
  }, []);
  useEffect(() => {
    const handler = () => { setEditing(null); setOpenForm(true); };
    window.addEventListener('openAddAffirmation' as any, handler as any);
    return () => window.removeEventListener('openAddAffirmation' as any, handler as any);
  }, []);

  const PAGE_SIZE = 20;

  const processed = useMemo(() => {
    let arr = items;
    if (search.trim()) {
      const q = search.toLowerCase();
      arr = arr.filter(a => a.text.toLowerCase().includes(q));
    }
    if (category !== 'All') {
      arr = arr.filter(a => a.category === category);
    }
    if (reminder !== 'All') {
      arr = arr.filter(a => (reminder === 'Has' ? a.reminder.frequency !== 'None' : a.reminder.frequency === 'None'));
    }
    if (startDate) {
      const s = new Date(startDate).setHours(0,0,0,0);
      arr = arr.filter(a => a.createdAt >= s);
    }
    if (endDate) {
      const e = new Date(endDate).setHours(23,59,59,999);
      arr = arr.filter(a => a.createdAt <= e);
    }
    if (sort === 'newest') arr = [...arr].sort((a,b) => b.createdAt - a.createdAt);
    else if (sort === 'oldest') arr = [...arr].sort((a,b) => a.createdAt - b.createdAt);
    else if (sort === 'alpha') arr = [...arr].sort((a,b) => a.text.localeCompare(b.text));
    else if (sort === 'used') arr = [...arr].sort((a,b) => b.useCount - a.useCount);
    return arr;
  }, [items, search, category, reminder, sort]);

  const totalPages = Math.max(1, Math.ceil(processed.length / PAGE_SIZE));
  const pageItems = processed.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleSaved = () => {
    setItems(getAll());
    setEditing(null);
  };

  const handleRemove = (id: string) => {
    remove(id);
    setItems(getAll());
    setConfirmId(null);
  };

  const handleDuplicate = (id: string) => {
    duplicate(id);
    setItems(getAll());
  };

  const handleExport = () => {
    const blob = new Blob([exportJSON()], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'affirmations_backup.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = async (file: File) => {
    setImportError(null);
    const text = await file.text();
    try {
      importJSON(text);
      setItems(getAll());
    } catch (e: any) {
      setImportError(e?.message || 'Import failed');
    }
  };

  return (
    <section aria-labelledby="myAffirmationsTitle" className="glass-card p-8 rounded-[2rem] mt-10">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h3 id="myAffirmationsTitle" className="label text-secondary">My Affirmations</h3>
          <p className="body-sm text-muted">Create, edit, search, and organize your personal invocations.</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => { setEditing(null); setOpenForm(true); }}
            className="px-4 py-2 rounded-xl bg-slate-900 dark:bg-amber-500 text-white dark:text-black text-[12px] font-bold"
            aria-label="Add New Affirmation"
          >
            Add New Affirmation
          </button>
          <button onClick={handleExport} className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-gray-300 text-[12px]" aria-label="Export affirmations">
            Export
          </button>
          <label className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-gray-300 text-[12px] cursor-pointer" aria-label="Import affirmations">
            Import
            <input type="file" accept="application/json" className="hidden" onChange={e => e.target.files && handleImport(e.target.files[0])} />
          </label>
        </div>
      </div>

      {importError && <div role="alert" className="mb-3 text-[12px] text-red-600 dark:text-red-400">{importError}</div>}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3 mb-4">
        <div className="flex flex-col gap-1">
          <span className="text-[10px] uppercase tracking-widest text-muted font-bold">Search</span>
          <input
            type="text"
            aria-label="Search affirmations"
            placeholder="Search..."
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            className="w-full h-10 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-4 text-[12px] text-primary placeholder-muted"
          />
        </div>
        <select
          aria-label="Filter by category"
          value={category}
          onChange={e => { setCategory(e.target.value as any); setPage(1); }}
          className="w-full h-10 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-3 text-[12px] text-primary"
        >
          <option value="All">All Categories</option>
          {(['Gratitude','Self-Love','Success','Health','Relationships','Custom'] as AffirmationCategory[]).map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <select
          aria-label="Filter by reminder"
          value={reminder}
          onChange={e => { setReminder(e.target.value as any); setPage(1); }}
          className="w-full h-10 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-3 text-[12px] text-primary"
        >
          <option value="All">All Reminders</option>
          <option value="Has">Has Reminder</option>
          <option value="None">No Reminder</option>
        </select>
        <select
          aria-label="Sort affirmations"
          value={sort}
          onChange={e => setSort(e.target.value as SortKey)}
          className="w-full h-10 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-3 text-[12px] text-primary"
        >
          <option value="newest">Newest</option>
          <option value="oldest">Oldest</option>
          <option value="alpha">Alphabetical</option>
          <option value="used">Most Used</option>
        </select>
        <input
          type="date"
          aria-label="Start date"
          value={startDate}
          onChange={e => { setStartDate(e.target.value); setPage(1); }}
          className="w-full h-10 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-3 text-[12px] text-primary"
        />
        <input
          type="date"
          aria-label="End date"
          value={endDate}
          onChange={e => { setEndDate(e.target.value); setPage(1); }}
          className="w-full h-10 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-3 text-[12px] text-primary"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {pageItems.map(a => (
          <div key={a.id} className="glass-card p-6 rounded-3xl border-l-4 border-purple-500/40">
            <div className="label text-secondary mb-2">{a.category}</div>
            <div className="text-primary leading-relaxed">{a.text}</div>
            <div className="mt-4 flex items-center justify-between text-[10px] text-muted">
              <span>Created {new Date(a.createdAt).toLocaleDateString()}</span>
              <span>Used {a.useCount}</span>
            </div>
            <div className="mt-4 flex gap-2">
              <button className="px-3 py-1 rounded-xl bg-slate-100 dark:bg-white/5 text-[12px]" onClick={() => { setEditing(a); setOpenForm(true); }} aria-label="Edit affirmation">Edit</button>
              <button className="px-3 py-1 rounded-xl bg-slate-100 dark:bg-white/5 text-[12px]" onClick={() => handleDuplicate(a.id)} aria-label="Duplicate affirmation">Duplicate</button>
              <button className="px-3 py-1 rounded-xl bg-red-600 text-white text-[12px]" onClick={() => setConfirmId(a.id)} aria-label="Delete affirmation">Delete</button>
            </div>
            {confirmId === a.id && (
              <div className="mt-3 flex gap-2 items-center" role="alertdialog" aria-label="Confirm delete">
                <span className="text-[12px]">Delete this affirmation?</span>
                <button className="px-3 py-1 rounded-xl bg-red-600 text-white text-[12px]" onClick={() => handleRemove(a.id)}>Confirm</button>
                <button className="px-3 py-1 rounded-xl bg-slate-100 dark:bg-white/5 text-[12px]" onClick={() => setConfirmId(null)}>Cancel</button>
              </div>
            )}
            {a.versions.length > 1 && (
              <details className="mt-3">
                <summary className="cursor-pointer text-[12px] text-secondary">Version History</summary>
                <ul className="mt-2 space-y-2">
                  {a.versions.map((v, i) => (
                    <li key={i} className="text-[12px] text-secondary">
                      <span className="font-mono">{new Date(v.timestamp).toLocaleString()}</span> — {v.text}
                    </li>
                  ))}
                </ul>
              </details>
            )}
          </div>
        ))}
      </div>

      <div className="mt-6 flex items-center justify-between">
        <div className="text-[10px] text-muted">Showing {pageItems.length} of {processed.length}</div>
        <div className="flex gap-2" role="navigation" aria-label="Pagination">
          <button className="px-3 py-1 rounded-xl bg-slate-100 dark:bg-white/5 text-[12px]" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} aria-disabled={page === 1}>Prev</button>
          <span className="px-3 py-1 rounded-xl bg-slate-100 dark:bg-white/5 text-[12px]">{page} / {totalPages}</span>
          <button className="px-3 py-1 rounded-xl bg-slate-100 dark:bg-white/5 text-[12px]" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} aria-disabled={page === totalPages}>Next</button>
        </div>
      </div>

      <AffirmationForm open={openForm} onClose={() => setOpenForm(false)} editing={editing || undefined} onSaved={handleSaved} />
    </section>
  );
};

export default MyAffirmations;
