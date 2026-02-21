import React, { useState, useEffect } from 'react';
import { AppState, Theme } from '../../types';
import { loadState, saveState } from '../../services/storageService';
import Dashboard from '../../components/Dashboard';
import SoundShiftStudio from '../../components/SoundShiftStudio';
import BeliefReframer from '../../components/BeliefReframer';
import Tracker369 from '../../components/Tracker369';
import Module555 from '../../components/Module555';
import Hooponopono from '../../components/Hooponopono';
import Journaling from '../../components/Journaling';
import Visualization from '../../components/Visualization';
import ProfileSettings from '../components/ProfileSettings';
import Marketplace from '../../components/Marketplace';

type View =
  | 'dashboard'
  | 'soundshift'
  | 'beliefs'
  | '369'
  | '555'
  | 'release'
  | 'journal'
  | 'visualize'
  | 'profile'
  | 'marketplace';

const FocusIcon: React.FC = () => (
  <svg viewBox="0 0 24 24">
    <circle cx="12" cy="12" r="6" />
    <path d="M4 12h2" />
    <path d="M18 12h2" />
    <path d="M12 4v2" />
    <path d="M12 18v2" />
  </svg>
);

const SoundshiftIcon: React.FC = () => (
  <svg viewBox="0 0 24 24">
    <rect x="5" y="9" width="3" height="6" rx="1" />
    <rect x="16" y="9" width="3" height="6" rx="1" />
    <path d="M8 11a4 4 0 0 1 8 0v2" />
    <path d="M5 15a3 3 0 0 0 3 3" />
    <path d="M16 18a3 3 0 0 0 3-3" />
  </svg>
);

const MarketplaceIcon: React.FC = () => (
  <svg viewBox="0 0 24 24">
    <path d="M5 9h14" />
    <path d="M7 5h10l2 4H5z" />
    <path d="M6 9v8h12V9" />
    <path d="M10 13h4" />
  </svg>
);

const ReframerIcon: React.FC = () => (
  <svg viewBox="0 0 24 24">
    <path d="M8 7h8" />
    <path d="M8 12h8" />
    <path d="M8 17h5" />
    <path d="M6 5h12v14H6z" />
  </svg>
);

const Ritual369Icon: React.FC = () => (
  <svg viewBox="0 0 24 24">
    <path d="M6 7h4v4H6z" />
    <path d="M14 7h4v4h-4z" />
    <path d="M10 13h4v4h-4z" />
  </svg>
);

const Ritual555Icon: React.FC = () => (
  <svg viewBox="0 0 24 24">
    <path d="M6 8h4l-1 3h3" />
    <path d="M6 13h4l-1 3h3" />
    <path d="M6 18h4l-1 3h3" />
  </svg>
);

const VisualizeIcon: React.FC = () => (
  <svg viewBox="0 0 24 24">
    <path d="M3 12s3.5-5 9-5 9 5 9 5-3.5 5-9 5-9-5-9-5z" />
    <circle cx="12" cy="12" r="2.5" />
  </svg>
);

const ReleaseIcon: React.FC = () => (
  <svg viewBox="0 0 24 24">
    <path d="M7 18c1-3 2.5-5.5 5-8" />
    <path d="M11 20c1-3 2.5-5.5 5-8" />
    <path d="M6 8c1.5-1 3.5-2 6-2 2.5 0 4.5 1 6 2" />
  </svg>
);

const JournalIcon: React.FC = () => (
  <svg viewBox="0 0 24 24">
    <path d="M7 4h10v16H7z" />
    <path d="M9 8h6" />
    <path d="M9 12h4" />
    <path d="M5 6v12" />
  </svg>
);

const ProfileIcon: React.FC = () => (
  <svg viewBox="0 0 24 24">
    <circle cx="12" cy="9" r="3" />
    <path d="M6 19a6 6 0 0 1 12 0" />
  </svg>
);

const DashboardPage: React.FC = () => {
  const [state, setState] = useState<AppState>(loadState());
  const [activeView, setActiveView] = useState<View>('dashboard');
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    saveState(state);
    if (state.theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [state]);

  const handleUpdate = (updates: Partial<AppState>) => {
    setState(prev => ({ ...prev, ...updates }));
  };

  const toggleTheme = () => {
    const nextTheme: Theme = state.theme === 'dark' ? 'light' : 'dark';
    handleUpdate({ theme: nextTheme });
    const wt = (window as any).toggleTheme;
    if (typeof wt === 'function') wt();
  };

  const navigate = (view: View) => {
    setActiveView(view);
    setIsMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen transition-colors duration-300 lg:pl-72">
      <header className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-white/70 dark:bg.black/40 backdrop-blur-xl border-b border-slate-200 dark:border-white/5 z-40 flex items-center justify-between px-6">
        <div className="flex items-center gap-2">
           <div className="w-8 h-8 rounded-lg bg-amber-500 flex items-center justify-center text-black font-bold text-lg shadow-lg shadow-amber-500/20">M</div>
           <h1 className="text-lg font-serif text-slate-800 dark:text-amber-500 font-bold tracking-tight">MindShift</h1>
        </div>
        <button 
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="w-10 h-10 flex flex-col items-center justify-center gap-1.5 focus:outline-none"
          aria-label="Toggle Menu"
        >
          <span className={`h-0.5 w-6 bg-slate-800 dark:bg-amber-400 transition-all duration-300 ${isMenuOpen ? 'rotate-45 translate-y-2' : ''}`}></span>
          <span className={`h-0.5 w-6 bg-slate-800 dark:bg-amber-400 transition-all duration-300 ${isMenuOpen ? 'opacity-0' : ''}`}></span>
          <span className={`h-0.5 w-6 bg-slate-800 dark:bg-amber-400 transition-all duration-300 ${isMenuOpen ? '-rotate-45 -translate-y-2' : ''}`}></span>
        </button>
      </header>

      <div className={`lg:hidden fixed inset-0 z-50 transition-all duration-500 ${isMenuOpen ? 'visible' : 'invisible'}`}>
        <div 
          className={`absolute inset-0 bg-slate-900/60 dark:bg-black/80 backdrop-blur-md transition-opacity duration-500 ${isMenuOpen ? 'opacity-100' : 'opacity-0'}`}
          onClick={() => setIsMenuOpen(false)}
        ></div>
        <nav className={`absolute top-0 right-0 bottom-0 w-4/5 max-w-xs bg-white dark:bg-[#0c0c0e] shadow-2xl transition-transform duration-500 ease-out flex flex-col p-8 ${isMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}>
          <div className="flex justify-between items-center mb-12">
            <div className="text-[10px] uppercase tracking-widest text-muted font-bold">Main Navigation</div>
            <button onClick={() => setIsMenuOpen(false)} className="text-muted hover:text-red-500">✕</button>
          </div>

          <div className="space-y-4">
            <NavItem icon={<FocusIcon />} label="Focus Dashboard" active={activeView === 'dashboard'} onClick={() => navigate('dashboard')} />
            <NavItem icon={<SoundshiftIcon />} label="SoundShift Studio" active={activeView === 'soundshift'} onClick={() => navigate('soundshift')} />
            <NavItem icon={<MarketplaceIcon />} label="Marketplace" active={activeView === 'marketplace'} onClick={() => navigate('marketplace')} />
            <NavItem icon={<ReframerIcon />} label="Neural Reframer" active={activeView === 'beliefs'} onClick={() => navigate('beliefs')} />
            <NavItem icon={<Ritual369Icon />} label="3-6-9 Ritual" active={activeView === '369'} onClick={() => navigate('369')} />
            <NavItem icon={<Ritual555Icon />} label="5-5-5 Ritual" active={activeView === '555'} onClick={() => navigate('555')} />
            <NavItem icon={<VisualizeIcon />} label="Whisper Visualize" active={activeView === 'visualize'} onClick={() => navigate('visualize')} />
            <NavItem icon={<ReleaseIcon />} label="Emotional Release" active={activeView === 'release'} onClick={() => navigate('release')} />
            <NavItem icon={<JournalIcon />} label="Daily Journal" active={activeView === 'journal'} onClick={() => navigate('journal')} />
            <NavItem icon={<ProfileIcon />} label="Profile Settings" active={activeView === 'profile'} onClick={() => navigate('profile')} />
          </div>

          <div className="mt-auto pt-8 border-t border-slate-100 dark:border-white/5 space-y-4">
            <button 
              onClick={toggleTheme}
              className="w-full flex items-center justify-between p-4 bg-slate-100 dark:bg-white/5 rounded-2xl"
            >
              <div className="flex items-center gap-3">
                <span className="text-xl">{state.theme === 'dark' ? '☀️' : '🌙'}</span>
                <span className="text-xs font-bold uppercase tracking-widest text-secondary">
                  {state.theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
                </span>
              </div>
              <div className={`w-8 h-4 rounded-full relative transition-colors ${state.theme === 'dark' ? 'bg-amber-500' : 'bg-slate-300'}`}>
                <div className={`absolute top-0.5 w-3 h-3 rounded-full bg-white transition-all ${state.theme === 'dark' ? 'right-0.5' : 'left-0.5'}`}></div>
              </div>
            </button>
            <p className="text-[9px] text-center text-muted uppercase tracking-widest leading-loose">
              Manifesting Excellence<br/>v1.2 Premium Edition
            </p>
          </div>
        </nav>
      </div>

110→      <nav className="hidden lg:flex fixed top-0 left-0 bottom-0 w-72 sidebar-shell backdrop-blur-2xl border-r border-slate-200 dark:border-white/10 z-50 p-8 flex-col">
        <div className="mb-12">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 rounded-2xl bg-amber-500 flex items-center justify-center text-black font-bold text-xl shadow-lg shadow-amber-500/20">M</div>
             <h1 className="text-2xl font-serif text-slate-800 dark:text-amber-500 font-bold tracking-tight">MindShift</h1>
          </div>
          <p className="text-[10px] text-slate-500 dark:text-gray-500 uppercase tracking-widest mt-2 font-bold px-1">Neural Empowerment</p>
        </div>
        
        <div className="space-y-4 flex-1">
          <NavItem icon={<FocusIcon />} label="Focus" active={activeView === 'dashboard'} onClick={() => navigate('dashboard')} />
          <NavItem icon={<SoundshiftIcon />} label="SoundShift" active={activeView === 'soundshift'} onClick={() => navigate('soundshift')} />
          <NavItem icon={<MarketplaceIcon />} label="Marketplace" active={activeView === 'marketplace'} onClick={() => navigate('marketplace')} />
          <NavItem icon={<ReframerIcon />} label="Reframer" active={activeView === 'beliefs'} onClick={() => navigate('beliefs')} />
          <NavItem icon={<Ritual369Icon />} label="3-6-9" active={activeView === '369'} onClick={() => navigate('369')} />
          <NavItem icon={<Ritual555Icon />} label="5-5-5" active={activeView === '555'} onClick={() => navigate('555')} />
          <NavItem icon={<VisualizeIcon />} label="Visualize" active={activeView === 'visualize'} onClick={() => navigate('visualize')} />
          <NavItem icon={<ReleaseIcon />} label="Release" active={activeView === 'release'} onClick={() => navigate('release')} />
          <NavItem icon={<JournalIcon />} label="Journal" active={activeView === 'journal'} onClick={() => navigate('journal')} />
          <NavItem icon={<ProfileIcon />} label="Profile" active={activeView === 'profile'} onClick={() => navigate('profile')} />
        </div>

        <div className="mt-auto space-y-6">
           <div className="p-5 bg-surface-soft dark:bg-white/5 rounded-3xl border border-subtle dark:border-white/5 shadow-md">
              <div className="flex justify-between items-center mb-3">
                <span className="text-[9px] uppercase tracking-widest text-muted font-bold">Theme Calibration</span>
                <span className="text-xs">{state.theme === 'dark' ? '✨' : '🎨'}</span>
              </div>
              <button 
                onClick={toggleTheme}
                className="w-full h-10 rounded-xl bg-slate-900 ensure-contrast dark:bg-amber-500 flex items-center justify-center gap-2 group transition-all shadow-md shadow-slate-900/10 hover:shadow-lg hover:shadow-amber-500/30 active:scale-95"
              >
                <span className="text-lg transition-transform group-hover:rotate-12">{state.theme === 'dark' ? '☀️' : '🌙'}</span>
                <span className="text-[10px] font-bold uppercase tracking-widest ensure-contrast">
                  Switch Mode
                </span>
              </button>
           </div>
           <p className="text-[9px] text-center text-muted uppercase tracking-[0.2em] font-medium italic">
             "Thoughts become things."
           </p>
        </div>
      </nav>

      <main className="w-full max-w-5xl mx-auto px-4 sm:px-8 lg:px-12 py-24 lg:py-20 transition-all">
        <div className="max-w-xl mx-auto">
          {activeView === 'dashboard' && <Dashboard state={state} onUpdate={handleUpdate} />}
          {activeView === 'soundshift' && <SoundShiftStudio state={state} onUpdate={handleUpdate} />}
          {activeView === 'beliefs' && <BeliefReframer state={state} onUpdate={handleUpdate} />}
          {activeView === '369' && <Tracker369 state={state} onUpdate={handleUpdate} />}
          {activeView === '555' && <Module555 state={state} onUpdate={handleUpdate} />}
          {activeView === 'visualize' && <Visualization state={state} onUpdate={handleUpdate} />}
          {activeView === 'marketplace' && <Marketplace state={state} onUpdate={handleUpdate} />}
          {activeView === 'release' && <Hooponopono state={state} onUpdate={handleUpdate} />}
          {activeView === 'journal' && <Journaling state={state} onUpdate={handleUpdate} />}
          {activeView === 'profile' && <ProfileSettings />}
        </div>
      </main>

      <footer className="w-full py-8 text-center text-muted text-[10px] uppercase tracking-widest border-t border-slate-100 dark:border-white/5 leading-relaxed">
         &copy; 2026 MindShift Manifest &bull; Elevate your Reality <br />
         Made to heal your inner self - Sambit Ghosh
      </footer>
    </div>
  );
};

interface NavItemProps {
  icon: React.ReactNode;
  label: string;
  active: boolean;
  onClick: () => void;
}

const NavItem: React.FC<NavItemProps> = ({ icon, label, active, onClick }) => (
  <button
    onClick={onClick}
    className={`nav-item ${active ? 'nav-item-active' : ''}`}
  >
    <span className="nav-item-icon">
      {icon}
    </span>
    <span className="nav-item-label">
      {label}
    </span>
    {active && <span className="nav-item-dot" />}
  </button>
);

export default DashboardPage;
