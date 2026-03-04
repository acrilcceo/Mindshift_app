import React, { useState, useMemo } from 'react';
import { AppState, FTBAEntry, DailyGoal } from '../types';

interface JournalingProps {
  state: AppState;
  onUpdate: (updates: Partial<AppState>) => void;
}

type SortKey = 'timestamp' | 'feel' | 'belief';
type SortOrder = 'asc' | 'desc';

const Journaling: React.FC<JournalingProps> = ({ state, onUpdate }) => {
  const [activeView, setActiveView] = useState<'ftba' | 'gratitude' | 'goals'>('ftba');
  
  // FTBA Local Form State
  const [ftbaForm, setFtbaForm] = useState({
    feel: '',
    trigger: '',
    belief: '',
    action: ''
  });

  // Validation & Filter State
  const [showErrors, setShowErrors] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('timestamp');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  
  // Selection State
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // State for tracking which entry is being edited
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<FTBAEntry>>({});

  // Active Goals for Reminder
  const activeGoals = useMemo(() => state.dailyGoals.filter(g => !g.completed), [state.dailyGoals]);

  // Derived filtered and sorted entries
  const processedEntries = useMemo(() => {
    let entries = [...state.ftbaEntries];

    // Search filter
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      entries = entries.filter(e => 
        e.feel.toLowerCase().includes(term) ||
        e.trigger.toLowerCase().includes(term) ||
        e.belief.toLowerCase().includes(term) ||
        e.action.toLowerCase().includes(term)
      );
    }

    // Date filter
    if (startDate) {
      const start = new Date(startDate).getTime();
      entries = entries.filter(e => e.timestamp >= start);
    }
    if (endDate) {
      const end = new Date(endDate).getTime() + 86400000; // end of the selected day
      entries = entries.filter(e => e.timestamp <= end);
    }

    // Sort
    entries.sort((a, b) => {
      let valA: string | number = a[sortKey];
      let valB: string | number = b[sortKey];

      if (typeof valA === 'string') valA = valA.toLowerCase();
      if (typeof valB === 'string') valB = valB.toLowerCase();

      if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return entries;
  }, [state.ftbaEntries, searchTerm, startDate, endDate, sortKey, sortOrder]);

  // FTBA Functions
  const saveFtba = () => {
    if (!ftbaForm.feel.trim() || !ftbaForm.action.trim()) {
      setShowErrors(true);
      return;
    }
    
    const entry: FTBAEntry = {
      id: crypto.randomUUID(),
      timestamp: Date.now(),
      feel: ftbaForm.feel,
      trigger: ftbaForm.trigger,
      belief: ftbaForm.belief,
      action: ftbaForm.action
    };
    
    onUpdate({ ftbaEntries: [entry, ...state.ftbaEntries] });
    setFtbaForm({ feel: '', trigger: '', belief: '', action: '' });
    setShowErrors(false);
  };

  const deleteFtba = (id: string) => {
    if (confirm("Permanently erase this neural entry?")) {
      onUpdate({ ftbaEntries: state.ftbaEntries.filter(e => e.id !== id) });
      setSelectedIds(prev => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  };

  const handleBulkDelete = () => {
    if (confirm(`Are you sure you want to delete ${selectedIds.size} entries?`)) {
      onUpdate({ ftbaEntries: state.ftbaEntries.filter(e => !selectedIds.has(e.id)) });
      setSelectedIds(new Set());
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === processedEntries.length && processedEntries.length > 0) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(processedEntries.map(e => e.id)));
    }
  };

  const startEditing = (entry: FTBAEntry) => {
    setEditingId(entry.id);
    setEditForm({ ...entry });
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditForm({});
  };

  const saveEdit = () => {
    if (!editForm.feel?.trim() || !editForm.action?.trim()) {
      alert("Feel and Action fields cannot be empty.");
      return;
    }
    const updatedEntries = state.ftbaEntries.map(e => 
      e.id === editingId ? { ...e, ...editForm } as FTBAEntry : e
    );
    onUpdate({ ftbaEntries: updatedEntries });
    setEditingId(null);
    setEditForm({});
  };

  // Timestamp Formatter: YYYY-MM-DD HH:MM AM/PM
  const formatTimestamp = (ts: number) => {
    const date = new Date(ts);
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    
    let hours = date.getHours();
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12; 
    const strTime = `${String(hours).padStart(2, '0')}:${minutes} AM/PM`;
    
    return `${yyyy}-${mm}-${dd} ${strTime}`;
  };

  // Gratitude Functions
  const [gratitudeInput, setGratitudeInput] = useState('');
  const addGratitude = () => {
    if (!gratitudeInput.trim()) return;
    onUpdate({ gratitudeList: [gratitudeInput, ...state.gratitudeList] });
    setGratitudeInput('');
  };

  // Goals Functions
  const [goalInput, setGoalInput] = useState('');
  const addGoal = () => {
    if (!goalInput.trim()) return;
    const newGoal: DailyGoal = { id: crypto.randomUUID(), text: goalInput, completed: false };
    onUpdate({ dailyGoals: [...state.dailyGoals, newGoal] });
    setGoalInput('');
  };

  const toggleGoal = (id: string) => {
    const updated = state.dailyGoals.map(g => g.id === id ? { ...g, completed: !g.completed } : g);
    onUpdate({ dailyGoals: updated });
  };

  const deleteGoal = (id: string) => {
    onUpdate({ dailyGoals: state.dailyGoals.filter(g => g.id !== id) });
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-10 print:p-0">
      {/* Active Goal Reminders - Subtle Notification */}
      {activeGoals.length > 0 && (
        <div className="mx-2 p-4 bg-surface-muted dark:bg-darkSurface-muted border border-card-border rounded-2xl flex items-center justify-between animate-in slide-in-from-top-4 duration-700">
          <div className="flex items-center gap-3">
            <span className="w-2 h-2 rounded-full bg-accent-primary animate-pulse"></span>
            <div>
              <p className="text-sm font-bold text-accent-primary uppercase tracking-widest">Active Focus</p>
              <p className="text-sm text-textSecondary-light dark:text-textSecondary-dark font-medium">{activeGoals[0].text}</p>
            </div>
          </div>
          <button 
            onClick={() => setActiveView('goals')}
            className="text-sm font-bold text-accent-primary uppercase tracking-widest hover:underline"
          >
            View All ({activeGoals.length})
          </button>
        </div>
      )}

      <div className="flex bg-surface-muted dark:bg-darkSurface-muted p-1 rounded-2xl print:hidden">
        {(['ftba', 'gratitude', 'goals'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveView(tab)}
            className={`flex-1 py-3 rounded-xl text-sm uppercase tracking-widest font-bold transition-all ${activeView === tab ? 'bg-accent-primary text-btn-primary shadow-lg' : 'text-textSecondary-light dark:text-textSecondary-dark hover:text-textPrimary-light dark:hover:text-textPrimary-dark'}`}
          >
            {tab === 'ftba' ? 'Neural Journal' : tab}
          </button>
        ))}
      </div>

      {activeView === 'ftba' && (
        <div className="space-y-10">
          <section className="space-y-6 print:hidden">
            <div className="text-center px-4">
            <h3 className="text-xl font-serif text-textPrimary-light dark:text-textPrimary-dark font-bold">Neural Decoding</h3>
            <p className="text-textSecondary-light dark:text-textSecondary-dark text-sm mt-1 italic">Trace the circuitry of your reactions.</p>
          </div>
            <div className="bg-surface-elevated dark:bg-darkSurface-elevated p-6 rounded-3xl space-y-5 border border-card-border shadow-xl">
              <div className="space-y-2">
                <label className="flex justify-between text-sm uppercase tracking-widest font-bold">
                  <span className="text-accent-primary">1. Feel (The Emotion) *</span>
                  {showErrors && !ftbaForm.feel.trim() && <span className="text-error lowercase">Required</span>}
                </label>
                <input 
                  value={ftbaForm.feel} 
                  onChange={e => {
                    setFtbaForm({...ftbaForm, feel: e.target.value});
                    if(e.target.value.trim()) setShowErrors(false);
                  }} 
                  placeholder="What is the raw sensation?" 
                  className={`w-full bg-surface-muted dark:bg-darkSurface-muted border rounded-xl px-4 py-3 text-sm focus:outline-none transition-colors ${showErrors && !ftbaForm.feel.trim() ? 'border-error bg-error' : 'border-card-border focus:border-accent-primary/50'}`} 
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm uppercase tracking-widest text-accent-primary font-bold">2. Trigger (The Catalyst)</label>
                <input 
                  value={ftbaForm.trigger} 
                  onChange={e => setFtbaForm({...ftbaForm, trigger: e.target.value})} 
                  placeholder="What external event sparked this?" 
                  className="w-full bg-surface-muted dark:bg-darkSurface-muted border border-card-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-accent-primary/50 transition-colors" 
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm uppercase tracking-widest text-accent-primary font-bold">3. Belief (The Narrative)</label>
                <input 
                  value={ftbaForm.belief} 
                  onChange={e => setFtbaForm({...ftbaForm, belief: e.target.value})} 
                  placeholder="What did you tell yourself?" 
                  className="w-full bg-surface-muted dark:bg-darkSurface-muted border border-card-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-accent-primary/50 transition-colors" 
                />
              </div>
              <div className="space-y-2">
                <label className="flex justify-between text-sm uppercase tracking-widest font-bold">
                  <span className="text-accent-primary">4. Action (The Override) *</span>
                  {showErrors && !ftbaForm.action.trim() && <span className="text-error lowercase">Required</span>}
                </label>
                <input 
                  value={ftbaForm.action} 
                  onChange={e => {
                    setFtbaForm({...ftbaForm, action: e.target.value});
                    if(e.target.value.trim()) setShowErrors(false);
                  }} 
                  placeholder="How will you consciously respond?" 
                  className={`w-full bg-surface-muted dark:bg-darkSurface-muted border rounded-xl px-4 py-3 text-sm focus:outline-none transition-colors ${showErrors && !ftbaForm.action.trim() ? 'border-error bg-error' : 'border-card-border focus:border-accent-primary/50'}`} 
                />
              </div>
              <button 
                onClick={saveFtba} 
                className="w-full py-4 rounded-2xl bg-btn-primary text-btn-primary font-bold transition-all active:scale-[0.98] shadow-btn hover:shadow-btn-hover"
              >
                Log Neural Shift
              </button>
            </div>
          </section>

          <section className="space-y-6">
            <div className="flex flex-col gap-4 px-2 print:hidden">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <h4 className="text-sm uppercase tracking-widest text-textSecondary-light dark:text-textSecondary-dark font-bold">Evolution History</h4>
                  <span className="text-sm bg-surface-muted dark:bg-darkSurface-muted text-textPrimary-light dark:text-textPrimary-dark px-2 py-0.5 rounded-full font-mono border border-card-border">
                    {state.ftbaEntries.length} total
                  </span>
                </div>
                <button onClick={handlePrint} className="text-sm text-accent-primary hover:text-textPrimary-light dark:hover:text-textPrimary-dark uppercase tracking-widest font-bold px-3 py-1 bg-surface-muted dark:bg-darkSurface-muted rounded-full border border-card-border transition-colors">Export PDF/Print</button>
              </div>

              {/* Filtering / Search Toolbar */}
              <div className="space-y-3">
                <div className="flex flex-col sm:flex-row gap-2">
                   <div className="relative flex-1">
                      <input 
                        type="text"
                        placeholder="Search cycles..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="w-full bg-surface-muted dark:bg-darkSurface-muted border border-card-border rounded-xl px-4 py-2 text-sm text-textPrimary-light dark:text-textPrimary-dark placeholder-textSecondary-light dark:placeholder-textSecondary-dark focus:outline-none focus:border-accent-primary/50 focus:ring-1 focus:ring-accent-primary/40"
                      />
                      <span className="absolute right-3 top-2 text-textSecondary-light dark:text-textSecondary-dark">🔍</span>
                   </div>
                   <select 
                     value={`${sortKey}-${sortOrder}`}
                     onChange={e => {
                        const [key, order] = e.target.value.split('-') as [SortKey, SortOrder];
                        setSortKey(key);
                        setSortOrder(order);
                     }}
                     className="bg-surface-muted dark:bg-darkSurface-muted border border-card-border rounded-xl px-3 py-2 text-sm uppercase tracking-widest font-bold text-textSecondary-light dark:text-textSecondary-dark focus:outline-none focus:border-accent-primary/50 focus:ring-1 focus:ring-accent-primary/40"
                   >
                      <option value="timestamp-desc">Newest First</option>
                      <option value="timestamp-asc">Oldest First</option>
                      <option value="feel-asc">Emotion A-Z</option>
                      <option value="feel-desc">Emotion Z-A</option>
                      <option value="belief-asc">Belief A-Z</option>
                      <option value="belief-desc">Belief Z-A</option>
                   </select>
                </div>
                <div className="flex flex-wrap gap-2 items-center">
                  <span className="text-sm uppercase tracking-widest text-textSecondary-light dark:text-textSecondary-dark font-bold">Filter By Date:</span>
                  <input 
                    type="date" 
                    value={startDate}
                    onChange={e => setStartDate(e.target.value)}
                    className="bg-surface-muted dark:bg-darkSurface-muted border border-card-border rounded-lg px-2 py-1 text-sm text-textPrimary-light dark:text-textPrimary-dark focus:outline-none focus:border-accent-primary/50 focus:ring-1 focus:ring-accent-primary/40"
                  />
                  <span className="text-sm text-textSecondary-light dark:text-textSecondary-dark">to</span>
                  <input 
                    type="date" 
                    value={endDate}
                    onChange={e => setEndDate(e.target.value)}
                    className="bg-surface-muted dark:bg-darkSurface-muted border border-card-border rounded-lg px-2 py-1 text-sm text-textPrimary-light dark:text-textPrimary-dark focus:outline-none focus:border-accent-primary/50 focus:ring-1 focus:ring-accent-primary/40"
                  />
                  {(startDate || endDate || searchTerm) && (
                    <button 
                      onClick={() => {setStartDate(''); setEndDate(''); setSearchTerm('');}}
                      className="text-sm text-accent-primary hover:underline"
                    >Reset</button>
                  )}
                </div>
              </div>

              {/* Bulk Actions Bar */}
              {processedEntries.length > 0 && (
                <div className="flex items-center justify-between bg-surface-muted dark:bg-darkSurface-muted px-4 py-3 rounded-xl border border-card-border shadow-sm">
                  <div className="flex items-center gap-3">
                    <input 
                      type="checkbox" 
                      checked={selectedIds.size === processedEntries.length && processedEntries.length > 0} 
                      onChange={toggleSelectAll}
                      className="w-4 h-4 rounded accent-accent-primary cursor-pointer"
                    />
                    <span className="text-sm text-textSecondary-light dark:text-textSecondary-dark uppercase tracking-widest font-bold">
                      {selectedIds.size > 0 ? `${selectedIds.size} Selected` : 'Select All Cycles'}
                    </span>
                  </div>
                  {selectedIds.size > 0 && (
                    <div className="flex gap-4">
                      <button 
                        onClick={() => setSelectedIds(new Set())}
                        className="text-sm text-textSecondary-light dark:text-textSecondary-dark hover:text-textPrimary-light dark:hover:text-textPrimary-dark font-bold uppercase tracking-widest"
                      >
                        Clear
                      </button>
                      <button 
                        onClick={handleBulkDelete}
                        className="text-sm text-error hover:text-error/80 font-bold uppercase tracking-widest flex items-center gap-1"
                      >
                        <span>🗑️</span> Purge Selected
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
            
            <div className="space-y-4">
              {processedEntries.map(e => (
                <div 
                  key={e.id} 
                  className={`bg-surface-elevated dark:bg-darkSurface-elevated p-6 rounded-3xl border-l-4 transition-all duration-300 relative group flex gap-4 ${editingId === e.id ? 'border-accent-secondary ring-2 ring-accent-secondary/20' : 'border border-card-border hover:border-accent-primary shadow-lg'}`}
                >
                  {/* Selection Checkbox */}
                  <div className="flex-shrink-0 pt-1 print:hidden">
                     <input 
                        type="checkbox" 
                        checked={selectedIds.has(e.id)} 
                        onChange={() => toggleSelect(e.id)}
                        className={`w-5 h-5 rounded-lg accent-accent-primary cursor-pointer transition-opacity ${selectedIds.size > 0 ? 'opacity-100' : 'opacity-20 group-hover:opacity-100'}`}
                      />
                  </div>

                  <div className="flex-1">
                    {editingId === e.id ? (
                      <div className="space-y-4">
                        <div className="flex justify-between items-center mb-2">
                          <h5 className="text-sm uppercase tracking-widest text-accent-secondary font-bold">Editing Evolution</h5>
                          <span className="text-sm text-textSecondary-light dark:text-textSecondary-dark font-mono tracking-tighter">{formatTimestamp(e.timestamp)}</span>
                        </div>
                        <div className="space-y-3">
                          <input value={editForm.feel} onChange={ev => setEditForm({...editForm, feel: ev.target.value})} className="w-full bg-surface-muted dark:bg-darkSurface-muted border border-accent-secondary/30 rounded-lg px-3 py-2 text-sm text-textPrimary-light dark:text-textPrimary-dark" />
                          <input value={editForm.trigger} onChange={ev => setEditForm({...editForm, trigger: ev.target.value})} className="w-full bg-surface-muted dark:bg-darkSurface-muted border border-card-border rounded-lg px-3 py-2 text-sm text-textPrimary-light dark:text-textPrimary-dark" />
                          <input value={editForm.belief} onChange={ev => setEditForm({...editForm, belief: ev.target.value})} className="w-full bg-surface-muted dark:bg-darkSurface-muted border border-card-border rounded-lg px-3 py-2 text-sm text-textPrimary-light dark:text-textPrimary-dark" />
                          <input value={editForm.action} onChange={ev => setEditForm({...editForm, action: ev.target.value})} className="w-full bg-surface-muted dark:bg-darkSurface-muted border border-accent-secondary/30 rounded-lg px-3 py-2 text-sm text-textPrimary-light dark:text-textPrimary-dark" />
                        </div>
                        <div className="flex gap-2 pt-2">
                          <button onClick={saveEdit} className="flex-1 py-2 bg-btn-primary text-btn-primary shadow-btn hover:shadow-btn-hover text-sm font-bold rounded-xl transition-all transform hover:-translate-y-0.5">Save</button>
                          <button onClick={cancelEditing} className="flex-1 py-2 bg-surface-muted dark:bg-darkSurface-muted text-textSecondary-light dark:text-textSecondary-dark hover:text-textPrimary-light dark:hover:text-textPrimary-dark border border-card-border text-sm font-bold rounded-xl transition-colors">Cancel</button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="flex justify-between items-center mb-4 pb-2 border-b border-card-border">
                          <div className="flex flex-col">
                            <span className="text-sm font-bold text-accent-primary uppercase tracking-wide">{e.feel}</span>
                            <span className="text-sm text-textSecondary-light dark:text-textSecondary-dark font-mono mt-0.5 tracking-tighter uppercase">{formatTimestamp(e.timestamp)}</span>
                          </div>
                          <div className="flex gap-2 print:hidden">
                            <button onClick={() => startEditing(e)} className="text-sm text-textSecondary-light dark:text-textSecondary-dark hover:text-accent-secondary transition-colors px-2 py-1 bg-surface-muted dark:bg-darkSurface-muted border border-card-border rounded-lg">Edit</button>
                            <button onClick={() => deleteFtba(e.id)} className="text-sm text-textSecondary-light dark:text-textSecondary-dark hover:text-error transition-colors px-2 py-1 bg-surface-muted dark:bg-darkSurface-muted border border-card-border rounded-lg">✕</button>
                          </div>
                        </div>
                        <div className="space-y-3 text-sm leading-relaxed">
                          <p className="text-textSecondary-light dark:text-textSecondary-dark italic">"I felt <span className="text-accent-primary font-medium">{e.feel}</span> because <span className="text-textSecondary-light dark:text-textSecondary-dark">{e.trigger || '...'}</span>. I told myself <span className="text-textSecondary-light dark:text-textSecondary-dark">{e.belief || '...'}</span>. Now, I choose to <span className="text-accent-primary font-bold">{e.action}</span>."</p>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              ))}

              {/* Enhanced Empty State */}
              {processedEntries.length === 0 && (
                <div className="text-center py-16 px-8 border-2 border-dashed border-card-border rounded-[3rem] group hover:border-accent-primary transition-all duration-700 relative overflow-hidden bg-surface-elevated dark:bg-darkSurface-elevated shadow-sm">
                  <div className="absolute inset-0 bg-gradient-to-b from-surface-muted/50 to-transparent dark:from-darkSurface-muted/50 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  
                  <div className="relative z-10 flex flex-col items-center">
                    <div className="w-24 h-24 rounded-full bg-surface-muted dark:bg-darkSurface-muted flex items-center justify-center mb-10 shadow-2xl border border-card-border group-hover:scale-110 transition-transform duration-700 relative">
                      <div className="absolute inset-0 rounded-full bg-[var(--accent-glow-secondary)] blur-xl animate-pulse"></div>
                      <div className="text-6xl filter drop-shadow-[0_0_15px_var(--accent-glow-primary)] animate-pulse relative z-10">👁️</div>
                    </div>
                    
                    <h5 className="text-xl font-serif text-textPrimary-light dark:text-textPrimary-dark mb-4 tracking-tight font-bold">The Neural Map is Clear</h5>
                    
                    <p className="text-textSecondary-light dark:text-textSecondary-dark text-sm max-w-[320px] leading-relaxed italic mb-10">
                      {searchTerm || startDate || endDate 
                        ? "No entries match your search parameters. Try widening your perspective."
                        : "Neural decoding is the act of observing your automatic responses to reclaim your sovereignty."}
                    </p>

                    {!searchTerm && !startDate && !endDate && (
                      <div className="w-full max-w-sm grid grid-cols-1 gap-4 text-left">
                        <div className="flex gap-4 items-start p-4 rounded-2xl bg-surface-muted dark:bg-darkSurface-muted border border-card-border hover:bg-surface-base dark:hover:bg-darkSurface-base transition-all">
                          <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[var(--accent-glow-secondary)] text-accent-primary flex items-center justify-center text-sm font-bold">1</span>
                          <div>
                            <p className="text-sm font-bold text-textSecondary-light dark:text-textSecondary-dark uppercase tracking-wider mb-1">Notice the Vibration</p>
                            <p className="text-sm text-textSecondary-light dark:text-textSecondary-dark leading-normal">The next time a sudden emotion hits—anxiety, anger, or fear—stop and identify the raw feeling.</p>
                          </div>
                        </div>
                        <div className="flex gap-4 items-start p-4 rounded-2xl bg-surface-muted dark:bg-darkSurface-muted border border-card-border hover:bg-surface-base dark:hover:bg-darkSurface-base transition-all">
                          <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[var(--accent-glow-secondary)] text-accent-primary flex items-center justify-center text-sm font-bold">2</span>
                          <div>
                            <p className="text-sm font-bold text-textPrimary-light dark:text-textPrimary-dark uppercase tracking-wider mb-1">Trace the Spark</p>
                            <p className="text-sm text-textSecondary-light dark:text-textSecondary-dark leading-normal">What precisely triggered it? A word, a memory, or an email? Identify the external catalyst.</p>
                          </div>
                        </div>
                        <div className="flex gap-4 items-start p-4 rounded-2xl bg-surface-muted dark:bg-darkSurface-muted border border-card-border hover:bg-surface-base dark:hover:bg-darkSurface-base transition-all">
                          <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[var(--accent-glow-secondary)] text-accent-primary flex items-center justify-center text-sm font-bold">3</span>
                          <div>
                            <p className="text-sm font-bold text-textSecondary-light dark:text-textSecondary-dark uppercase tracking-wider mb-1">Rewrite the Script</p>
                            <p className="text-sm text-textSecondary-light dark:text-textSecondary-dark leading-normal">What belief is running? "I am not safe"? "I am not enough"? Consciously choose a new narrative.</p>
                          </div>
                        </div>
                        
                        <div className="mt-6 flex flex-col items-center gap-2 animate-bounce">
                           <span className="text-sm uppercase tracking-widest text-accent-primary font-bold opacity-80">Ready for your first shift?</span>
                           <span className="text-xl text-textPrimary-light dark:text-textPrimary-dark">↑</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </section>
        </div>
      )}

      {activeView === 'gratitude' && (
        <div className="space-y-6 animate-in slide-in-from-right-4">
          <div className="bg-surface-elevated dark:bg-darkSurface-elevated p-6 rounded-3xl shadow-xl border border-card-border">
             <h3 className="text-sm font-serif text-textPrimary-light dark:text-textPrimary-dark mb-4 font-bold">I am grateful for...</h3>
             <div className="flex gap-2">
                <input value={gratitudeInput} onChange={e => setGratitudeInput(e.target.value)} placeholder="The morning sun..." className="flex-1 bg-surface-muted dark:bg-darkSurface-muted border border-card-border rounded-xl px-4 py-3 text-sm text-textPrimary-light dark:text-textPrimary-dark placeholder-textSecondary-light dark:placeholder-textSecondary-dark focus:outline-none focus:border-accent-secondary focus:ring-1 focus:ring-accent-secondary/40" onKeyDown={e => e.key === 'Enter' && addGratitude()} />
                <button onClick={addGratitude} className="bg-accent-secondary w-12 rounded-xl hover:bg-accent-secondary/80 font-bold transition-all active:scale-95 shadow-lg shadow-accent-secondary/20 text-btn-primary-text">+</button>
             </div>
             <div className="mt-8 space-y-4">
                {state.gratitudeList.map((item, i) => (
                  <div className="text-sm text-textSecondary-light dark:text-textSecondary-dark border-b border-card-border pb-3 animate-in slide-in-from-left-2 flex gap-3">
                    <span className="text-accent-secondary/50">✨</span>
                    <span>{item}</span>
                  </div>
                ))}
                {state.gratitudeList.length === 0 && <div className="text-center py-10 text-textSecondary-light dark:text-textSecondary-dark text-sm italic">Abundance begins with appreciation.</div>}
             </div>
          </div>
        </div>
      )}

      {activeView === 'goals' && (
        <div className="space-y-6 animate-in slide-in-from-left-4">
          <div className="bg-surface-elevated dark:bg-darkSurface-elevated p-6 rounded-3xl shadow-xl border border-card-border">
            <h3 className="text-sm font-serif text-textPrimary-light dark:text-textPrimary-dark mb-4 font-bold">Intention Checklist</h3>
            <div className="flex gap-2 mb-8">
                <input value={goalInput} onChange={e => setGoalInput(e.target.value)} placeholder="I will manifest..." className="flex-1 bg-surface-muted dark:bg-darkSurface-muted border border-card-border rounded-xl px-4 py-3 text-sm text-textPrimary-light dark:text-textPrimary-dark placeholder-textSecondary-light dark:placeholder-textSecondary-dark focus:outline-none focus:border-accent-primary focus:ring-1 focus:ring-accent-primary/40" onKeyDown={e => e.key === 'Enter' && addGoal()} />
                <button onClick={addGoal} className="bg-accent-primary w-12 rounded-xl hover:bg-accent-primary/80 font-bold transition-all active:scale-95 shadow-lg shadow-accent-primary/20 text-btn-primary-text">+</button>
             </div>
             <div className="space-y-3">
                {state.dailyGoals.map((goal) => (
                  <div key={goal.id} className="flex items-center justify-between bg-surface-muted dark:bg-darkSurface-muted p-4 rounded-2xl border border-card-border group transition-all hover:bg-surface-base dark:hover:bg-darkSurface-base shadow-sm">
                    <div className="flex items-center gap-4">
                      <button onClick={() => toggleGoal(goal.id)} className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${goal.completed ? 'bg-accent-primary border-accent-primary shadow-[0_0_10px_var(--accent-glow-primary)]' : 'border-card-border hover:border-accent-primary'}`}>
                        {goal.completed && <span className="text-sm text-btn-primary-text">✓</span>}
                      </button>
                      <span className={`text-sm font-medium transition-all ${goal.completed ? 'text-textSecondary-light dark:text-textSecondary-dark line-through' : 'text-textPrimary-light dark:text-textPrimary-dark'}`}>{goal.text}</span>
                    </div>
                    <button onClick={() => deleteGoal(goal.id)} className="text-textSecondary-light dark:text-textSecondary-dark hover:text-error opacity-0 group-hover:opacity-100 transition-opacity p-2">✕</button>
                  </div>
                ))}
                {state.dailyGoals.length === 0 && <div className="text-center py-10 text-textSecondary-light dark:text-textSecondary-dark text-sm italic">Define your reality for today.</div>}
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Journaling;