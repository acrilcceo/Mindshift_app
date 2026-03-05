import React, { useEffect, useMemo, useState, useRef } from 'react';
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
  
  // Single view state
  const [currentIndex, setCurrentIndex] = useState(0);
  
  const [openForm, setOpenForm] = useState(false);
  const [editing, setEditing] = useState<UserAffirmation | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [importError, setImportError] = useState<string | null>(null);
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');

  // Touch handling
  const touchStart = useRef<number | null>(null);
  const touchEnd = useRef<number | null>(null);

  useEffect(() => {
    setItems(getAll());
  }, []);

  useEffect(() => {
    const handler = () => { setEditing(null); setOpenForm(true); };
    window.addEventListener('openAddAffirmation' as any, handler as any);
    return () => window.removeEventListener('openAddAffirmation' as any, handler as any);
  }, []);

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

  // Ensure index is valid when list changes
  useEffect(() => {
    if (processed.length === 0) {
      setCurrentIndex(0);
    } else if (currentIndex >= processed.length) {
      setCurrentIndex(processed.length - 1);
    }
  }, [processed.length]); // Intentionally not including currentIndex to avoid loops, just capping it

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

  // Swipe handlers (optimized with useRef for performance)
  const onTouchStart = (e: React.TouchEvent) => {
    touchEnd.current = null;
    touchStart.current = e.targetTouches[0].clientX;
  };

  const onTouchMove = (e: React.TouchEvent) => {
    touchEnd.current = e.targetTouches[0].clientX;
  };

  const onTouchEnd = () => {
    if (!touchStart.current || !touchEnd.current) return;
    const distance = touchStart.current - touchEnd.current;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe && currentIndex < processed.length - 1) {
      setCurrentIndex(prev => prev + 1);
    }
    if (isRightSwipe && currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  };

  const currentItem = processed[currentIndex];

  return (
    <section aria-labelledby="myAffirmationsTitle" className="glass-card p-6 md:p-8 rounded-[2rem] mt-4 min-h-[80vh] flex flex-col relative overflow-hidden">
      {/* Header & Controls (kept minimal) */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6 z-10 relative">
        <div>
          <h3 id="myAffirmationsTitle" className="label text-secondary">My Affirmations</h3>
          <p className="body-sm text-muted">Swipe through your personal invocations.</p>
        </div>
        <div className="flex flex-wrap gap-2 justify-end items-center">
          <button
            onClick={handleExport}
            className="p-2 rounded-xl text-muted hover:text-primary transition-colors"
            title="Export Affirmations"
          >
            <span className="sr-only">Export</span>
            ↓
          </button>
          <label className="p-2 rounded-xl text-muted hover:text-primary transition-colors cursor-pointer" title="Import Affirmations">
            <span className="sr-only">Import</span>
            ↑
            <input type="file" accept="application/json" className="hidden" onChange={e => e.target.files && handleImport(e.target.files[0])} />
          </label>
          <div className="w-px h-6 bg-card-border mx-1"></div>
          <button
            onClick={() => { setEditing(null); setOpenForm(true); }}
            className="px-4 py-2 rounded-xl bg-surface-elevated dark:bg-darkSurface-elevated border border-card-border text-xs font-semibold hover:bg-surface-muted transition-colors"
          >
            + Add
          </button>
        </div>
      </div>

       {/* Compact Filters - Row */}
       <div className="flex overflow-x-auto pb-2 gap-2 mb-4 scrollbar-hide opacity-50 hover:opacity-100 transition-opacity duration-300 z-10 relative">
          <input
            type="text"
            placeholder="Search..."
            value={search}
            onChange={e => { setSearch(e.target.value); setCurrentIndex(0); }}
            className="bg-transparent border-b border-card-border px-2 py-1 text-sm min-w-[100px] focus:outline-none focus:border-accent-primary"
          />
          <select
            value={category}
            onChange={e => { setCategory(e.target.value as any); setCurrentIndex(0); }}
            className="bg-transparent border-b border-card-border px-2 py-1 text-sm focus:outline-none focus:border-accent-primary"
          >
            <option value="All">All Categories</option>
            {(['Gratitude','Self-Love','Success','Health','Relationships','Custom'] as AffirmationCategory[]).map(c => <option key={c} value={c}>{c}</option>)}
          </select>
           {/* ... other filters if needed, kept minimal */}
       </div>

      <div 
        className="flex-1 flex flex-col items-center justify-center relative w-full"
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        {processed.length === 0 ? (
          <div className="text-center text-muted">No affirmations found.</div>
        ) : (
          currentItem && (
            <div className="w-full max-w-lg mx-auto flex flex-col items-center animate-in fade-in zoom-in-95 duration-700 ease-out">
              
              {/* Card */}
              <div className="w-full bg-surface-elevated dark:bg-darkSurface-elevated p-8 md:p-12 rounded-[2.5rem] shadow-2xl border border-card-border/50 relative overflow-hidden group min-h-[400px] flex flex-col items-center justify-center text-center transform-gpu transition-all duration-500 hover:shadow-accent-primary/5">
                
                {/* Ambient Glow */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-accent-primary/5 rounded-full blur-[100px] pointer-events-none"></div>

                {/* Category Pill */}
                <span className="mb-8 px-3 py-1 rounded-full bg-surface-muted dark:bg-darkSurface-muted text-accent-primary text-[10px] font-bold uppercase tracking-[0.2em] border border-card-border/50">
                    {currentItem.category}
                </span>

                {/* Affirmation Text */}
                <p className="text-2xl md:text-3xl leading-relaxed font-serif text-textPrimary-light dark:text-textPrimary-dark font-medium opacity-90">
                  {currentItem.text}
                </p>

                {/* Breathing Microcopy */}
                 <div className="mt-12 text-xs text-muted/40 font-medium tracking-widest uppercase animate-pulse">
                  Take a breath... Swipe when ready
                </div>

                {/* Edit Actions (Hover only) */}
                <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex gap-2">
                    <button onClick={() => { setEditing(currentItem); setOpenForm(true); }} className="p-2 hover:bg-surface-muted rounded-full text-muted hover:text-primary transition-colors" title="Edit">
                      <span className="sr-only">Edit</span>
                      ✎
                    </button>
                    <button onClick={() => handleDuplicate(currentItem.id)} className="p-2 hover:bg-surface-muted rounded-full text-muted hover:text-primary transition-colors" title="Duplicate">
                      <span className="sr-only">Duplicate</span>
                      ⧉
                    </button>
                     <button onClick={() => setConfirmId(currentItem.id)} className="p-2 hover:bg-surface-muted rounded-full text-muted hover:text-error transition-colors" title="Delete">
                      <span className="sr-only">Delete</span>
                      ×
                    </button>
                </div>
                 
                 {/* Delete Confirmation Overlay */}
                {confirmId === currentItem.id && (
                  <div className="absolute inset-0 bg-surface-elevated/95 dark:bg-darkSurface-elevated/95 backdrop-blur-sm flex flex-col items-center justify-center z-20 p-6 text-center animate-in fade-in duration-200">
                      <p className="text-lg font-medium text-primary mb-6">Delete this affirmation?</p>
                      <div className="flex gap-4">
                        <button className="px-6 py-2 rounded-xl bg-error text-white text-sm font-medium shadow-lg shadow-error/20" onClick={() => handleRemove(currentItem.id)}>Delete</button>
                        <button className="px-6 py-2 rounded-xl bg-secondary text-primary text-sm font-medium" onClick={() => setConfirmId(null)}>Cancel</button>
                      </div>
                  </div>
                )}
              </div>

              {/* Progress Dots */}
              <div className="flex justify-center flex-wrap gap-2 mt-8 max-w-[80%]">
                {processed.length <= 20 ? (
                   processed.map((_, i) => (
                    <div 
                      key={i} 
                      className={`h-1.5 w-1.5 rounded-full transition-all duration-300 ${
                        i === currentIndex 
                          ? "bg-accent-primary w-3" 
                          : "bg-surface-muted dark:bg-darkSurface-muted hover:bg-accent-primary/50" 
                      }`} 
                      onClick={() => setCurrentIndex(i)} // Allow jumping
                    />
                  ))
                ) : (
                  // Fallback for large lists
                   <div className="flex items-center gap-3">
                      <span className="text-xs text-muted font-mono">{currentIndex + 1}</span>
                      <div className="w-24 h-1 bg-surface-muted dark:bg-darkSurface-muted rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-accent-primary transition-all duration-500 ease-out"
                          style={{ width: `${((currentIndex + 1) / processed.length) * 100}%` }}
                        />
                      </div>
                      <span className="text-xs text-muted font-mono">{processed.length}</span>
                   </div>
                )}
              </div>

            </div>
          )
        )}
      </div>

      <AffirmationForm open={openForm} onClose={() => setOpenForm(false)} editing={editing || undefined} onSaved={handleSaved} />
    </section>
  );
};

export default MyAffirmations;
