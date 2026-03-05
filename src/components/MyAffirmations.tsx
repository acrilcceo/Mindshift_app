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

  // Swipe handlers
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

    if (isLeftSwipe) {
      handleNext();
    }
    if (isRightSwipe) {
      handlePrev();
    }
  };

  const handlePrev = () => {
    setCurrentIndex(prev => Math.max(prev - 1, 0));
  };

  const handleNext = () => {
    setCurrentIndex(prev => Math.min(prev + 1, processed.length - 1));
  };

  const currentItem = processed[currentIndex];

  return (
    <section aria-labelledby="myAffirmationsTitle" className="glass-card p-8 rounded-[2rem] mt-10 min-h-[700px] flex flex-col">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
        <div>
          <h3 id="myAffirmationsTitle" className="label text-secondary">My Affirmations</h3>
          <p className="body-sm text-muted">Create, edit, search, and organize your personal invocations.</p>
        </div>
        <div className="flex flex-col sm:flex-row sm:flex-wrap sm:justify-end gap-2 w-full md:w-auto max-w-full box-border">
          <button
            onClick={() => { setEditing(null); setOpenForm(true); }}
            className="w-full sm:w-auto px-5 py-2.5 rounded-2xl btn-primary-ritual text-sm font-semibold transition-all duration-200 ease-out transform hover:-translate-y-0.5 active:scale-95"
            aria-label="Add New Affirmation"
          >
            Add New Affirmation
          </button>
          <button
            onClick={handleExport}
            className="w-full sm:w-auto px-4 py-2 rounded-xl bg-secondary text-secondary hover:text-primary transition-colors text-sm"
            aria-label="Export affirmations"
          >
            Export
          </button>
          <label className="hidden md:inline-flex items-center px-4 py-2 rounded-xl bg-secondary text-secondary hover:text-primary transition-colors text-sm cursor-pointer" aria-label="Import affirmations">
            Import
            <input type="file" accept="application/json" className="hidden" onChange={e => e.target.files && handleImport(e.target.files[0])} />
          </label>
        </div>
      </div>

      {importError && <div role="alert" className="mb-3 text-sm text-error">{importError}</div>}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3 mb-4">
        <div className="flex flex-col gap-1">
          <span className="text-sm uppercase tracking-widest text-muted font-bold">Search</span>
          <input
            type="text"
            aria-label="Search affirmations"
            placeholder="Search..."
            value={search}
            onChange={e => { setSearch(e.target.value); setCurrentIndex(0); }}
            className="w-full h-10 bg-card border border-card-border rounded-xl px-4 text-sm text-primary placeholder-muted focus:outline-none focus:border-accent-primary"
          />
        </div>
        <select
          aria-label="Filter by category"
          value={category}
          onChange={e => { setCategory(e.target.value as any); setCurrentIndex(0); }}
          className="w-full h-10 bg-card border border-card-border rounded-xl px-3 text-sm text-primary focus:outline-none focus:border-accent-primary"
        >
          <option value="All">All Categories</option>
          {(['Gratitude','Self-Love','Success','Health','Relationships','Custom'] as AffirmationCategory[]).map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <select
          aria-label="Filter by reminder"
          value={reminder}
          onChange={e => { setReminder(e.target.value as any); setCurrentIndex(0); }}
          className="w-full h-10 bg-card border border-card-border rounded-xl px-3 text-sm text-primary focus:outline-none focus:border-accent-primary"
        >
          <option value="All">All Reminders</option>
          <option value="Has">Has Reminder</option>
          <option value="None">No Reminder</option>
        </select>
        <select
          aria-label="Sort affirmations"
          value={sort}
          onChange={e => { setSort(e.target.value as SortKey); setCurrentIndex(0); }}
          className="w-full h-10 bg-card border border-card-border rounded-xl px-3 text-sm text-primary focus:outline-none focus:border-accent-primary"
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
          onChange={e => { setStartDate(e.target.value); setCurrentIndex(0); }}
          className="w-full h-10 bg-card border border-card-border rounded-xl px-3 text-sm text-primary focus:outline-none focus:border-accent-primary"
        />
        <input
          type="date"
          aria-label="End date"
          value={endDate}
          onChange={e => { setEndDate(e.target.value); setCurrentIndex(0); }}
          className="w-full h-10 bg-card border border-card-border rounded-xl px-3 text-sm text-primary focus:outline-none focus:border-accent-primary"
        />
      </div>

      <div 
        className="flex-1 flex flex-col items-center justify-center mt-4 relative min-h-[400px]"
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        {processed.length === 0 ? (
          <div className="text-center text-muted">No affirmations found matching your criteria.</div>
        ) : (
          currentItem && (
            <div className="w-full max-w-2xl mx-auto flex flex-col items-center animate-in fade-in duration-500">
              
              <div className="w-full bg-surface-elevated dark:bg-darkSurface-elevated p-10 md:p-14 rounded-[2.5rem] shadow-xl border border-card-border relative overflow-hidden group">
                {/* Background Decoration */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-accent-primary/5 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-accent-secondary/5 rounded-full blur-2xl -ml-8 -mb-8 pointer-events-none"></div>

                {/* Category Chip */}
                <div className="flex justify-center mb-8">
                  <span className="px-4 py-1.5 rounded-full bg-surface-muted dark:bg-darkSurface-muted text-accent-primary text-xs font-bold uppercase tracking-widest border border-card-border">
                    {currentItem.category}
                  </span>
                </div>

                {/* Text */}
                <p className="text-2xl md:text-3xl lg:text-4xl font-serif text-center text-textPrimary-light dark:text-textPrimary-dark leading-relaxed mb-10 transition-all duration-300">
                  {currentItem.text}
                </p>

                {/* Action Buttons (Subtle) */}
                <div className="flex items-center justify-center gap-6 text-sm text-muted opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <button onClick={() => { setEditing(currentItem); setOpenForm(true); }} className="hover:text-primary transition-colors flex items-center gap-1">
                      <span className="text-xs uppercase tracking-wider">Edit</span>
                    </button>
                    <div className="w-1 h-1 rounded-full bg-card-border"></div>
                    <button onClick={() => handleDuplicate(currentItem.id)} className="hover:text-primary transition-colors flex items-center gap-1">
                      <span className="text-xs uppercase tracking-wider">Duplicate</span>
                    </button>
                    <div className="w-1 h-1 rounded-full bg-card-border"></div>
                    <button onClick={() => setConfirmId(currentItem.id)} className="hover:text-error text-error/70 transition-colors flex items-center gap-1">
                      <span className="text-xs uppercase tracking-wider">Delete</span>
                    </button>
                </div>

                {/* Delete Confirmation Overlay */}
                {confirmId === currentItem.id && (
                  <div className="absolute inset-0 bg-surface-elevated/95 dark:bg-darkSurface-elevated/95 backdrop-blur-md flex flex-col items-center justify-center z-20 p-6 text-center animate-in fade-in duration-200">
                      <p className="text-lg font-medium text-primary mb-6">Are you sure you want to delete this affirmation?</p>
                      <div className="flex gap-4">
                        <button className="px-6 py-2.5 rounded-xl bg-error text-white font-medium shadow-lg shadow-error/20 hover:shadow-error/30 transition-all" onClick={() => handleRemove(currentItem.id)}>Delete</button>
                        <button className="px-6 py-2.5 rounded-xl bg-secondary text-primary font-medium hover:bg-surface-muted transition-colors" onClick={() => setConfirmId(null)}>Cancel</button>
                      </div>
                  </div>
                )}
              </div>

              {/* Navigation Controls */}
              <div className="w-full flex items-center justify-between mt-12 px-4 md:px-10">
                <button 
                  onClick={handlePrev} 
                  disabled={currentIndex === 0}
                  className={`group flex items-center gap-3 px-6 py-3 rounded-2xl transition-all duration-300 ${
                    currentIndex === 0 
                      ? 'opacity-30 cursor-not-allowed text-muted' 
                      : 'bg-surface-elevated dark:bg-darkSurface-elevated hover:bg-surface-muted dark:hover:bg-darkSurface-muted text-primary shadow-sm hover:shadow-md'
                  }`}
                  aria-label="Previous Affirmation"
                >
                  <span className="text-xl group-hover:-translate-x-1 transition-transform">←</span>
                  <span className="hidden sm:inline font-medium">Previous</span>
                </button>
                
                <div className="flex flex-col items-center gap-1">
                  <span className="text-sm font-medium text-primary font-mono">
                    {currentIndex + 1} <span className="text-muted">/</span> {processed.length}
                  </span>
                  <div className="w-32 h-1 bg-surface-muted dark:bg-darkSurface-muted rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-accent-primary transition-all duration-500 ease-out"
                      style={{ width: `${((currentIndex + 1) / processed.length) * 100}%` }}
                    />
                  </div>
                </div>

                <button 
                  onClick={handleNext} 
                  disabled={currentIndex === processed.length - 1}
                  className={`group flex items-center gap-3 px-6 py-3 rounded-2xl transition-all duration-300 ${
                    currentIndex === processed.length - 1 
                      ? 'opacity-30 cursor-not-allowed text-muted' 
                      : 'bg-surface-elevated dark:bg-darkSurface-elevated hover:bg-surface-muted dark:hover:bg-darkSurface-muted text-primary shadow-sm hover:shadow-md'
                  }`}
                  aria-label="Next Affirmation"
                >
                  <span className="hidden sm:inline font-medium">Next</span>
                  <span className="text-xl group-hover:translate-x-1 transition-transform">→</span>
                </button>
              </div>
              
              <div className="mt-6 text-center text-xs text-muted/50 font-medium uppercase tracking-widest">
                Swipe to Navigate
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
