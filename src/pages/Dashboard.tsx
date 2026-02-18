import React, { useState, useEffect } from 'react';
import { AppState, Theme } from '../../types';
import { loadState, saveState } from '../../services/storageService';
import Dashboard from '../../components/Dashboard';
import BeliefReframer from '../../components/BeliefReframer';
import Tracker369 from '../../components/Tracker369';
import Module555 from '../../components/Module555';
import Hooponopono from '../../components/Hooponopono';
import Journaling from '../../components/Journaling';
import Visualization from '../../components/Visualization';
import ProfileSettings from '../components/ProfileSettings';

type View = 'dashboard' | 'beliefs' | '369' | '555' | 'release' | 'journal' | 'visualize' | 'profile';

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
            <div className="text-[10px] uppercase tracking-widest text-slate-400 dark:text-gray-500 font-bold">Main Navigation</div>
            <button onClick={() => setIsMenuOpen(false)} className="text-slate-400 dark:text-gray-500 hover:text-red-500">✕</button>
          </div>

          <div className="space-y-3">
            <NavItem icon="🏠" label="Focus Dashboard" active={activeView === 'dashboard'} onClick={() => navigate('dashboard')} />
            <NavItem icon="🧠" label="Neural Reframer" active={activeView === 'beliefs'} onClick={() => navigate('beliefs')} />
            <NavItem icon="⚡" label="3-6-9 Ritual" active={activeView === '369'} onClick={() => navigate('369')} />
            <NavItem icon="🔁" label="5-5-5 Ritual" active={activeView === '555'} onClick={() => navigate('555')} />
            <NavItem icon="✨" label="Whisper Visualize" active={activeView === 'visualize'} onClick={() => navigate('visualize')} />
            <NavItem icon="🌊" label="Emotional Release" active={activeView === 'release'} onClick={() => navigate('release')} />
            <NavItem icon="📓" label="Daily Journal" active={activeView === 'journal'} onClick={() => navigate('journal')} />
            <NavItem icon="⚙️" label="Profile Settings" active={activeView === 'profile'} onClick={() => navigate('profile')} />
          </div>

          <div className="mt-auto pt-8 border-t border-slate-100 dark:border-white/5 space-y-4">
            <button 
              onClick={toggleTheme}
              className="w-full flex items-center justify-between p-4 bg-slate-100 dark:bg-white/5 rounded-2xl"
            >
              <div className="flex items-center gap-3">
                <span className="text-xl">{state.theme === 'dark' ? '☀️' : '🌙'}</span>
                <span className="text-xs font-bold uppercase tracking-widest text-slate-600 dark:text-gray-400">
                  {state.theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
                </span>
              </div>
              <div className={`w-8 h-4 rounded-full relative transition-colors ${state.theme === 'dark' ? 'bg-amber-500' : 'bg-slate-300'}`}>
                <div className={`absolute top-0.5 w-3 h-3 rounded-full bg-white transition-all ${state.theme === 'dark' ? 'right-0.5' : 'left-0.5'}`}></div>
              </div>
            </button>
            <p className="text-[9px] text-center text-slate-400 dark:text-gray-600 uppercase tracking-widest leading-loose">
              Manifesting Excellence<br/>v1.2 Premium Edition
            </p>
          </div>
        </nav>
      </div>

      <nav className="hidden lg:flex fixed top-0 left-0 bottom-0 w-72 bg-white/70 dark:bg-black/60 backdrop-blur-2xl border-r border-slate-200 dark:border-white/10 z-50 p-8 flex-col">
        <div className="mb-12">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 rounded-2xl bg-amber-500 flex items-center justify-center text-black font-bold text-xl shadow-lg shadow-amber-500/20">M</div>
             <h1 className="text-2xl font-serif text-slate-800 dark:text-amber-500 font-bold tracking-tight">MindShift</h1>
          </div>
          <p className="text-[10px] text-slate-500 dark:text-gray-500 uppercase tracking-widest mt-2 font-bold px-1">Neural Empowerment</p>
        </div>
        
        <div className="space-y-2 flex-1">
          <NavItem icon="🏠" label="Focus" active={activeView === 'dashboard'} onClick={() => navigate('dashboard')} />
          <NavItem icon="🧠" label="Reframer" active={activeView === 'beliefs'} onClick={() => navigate('beliefs')} />
          <NavItem icon="⚡" label="3-6-9" active={activeView === '369'} onClick={() => navigate('369')} />
          <NavItem icon="🔁" label="5-5-5" active={activeView === '555'} onClick={() => navigate('555')} />
          <NavItem icon="✨" label="Visualize" active={activeView === 'visualize'} onClick={() => navigate('visualize')} />
          <NavItem icon="🌊" label="Release" active={activeView === 'release'} onClick={() => navigate('release')} />
          <NavItem icon="📓" label="Journal" active={activeView === 'journal'} onClick={() => navigate('journal')} />
          <NavItem icon="⚙️" label="Profile" active={activeView === 'profile'} onClick={() => navigate('profile')} />
        </div>

        <div className="mt-auto space-y-6">
           <div className="p-5 bg-slate-50 dark:bg-white/5 rounded-3xl border border-slate-100 dark:border-white/5">
              <div className="flex justify-between items-center mb-3">
                <span className="text-[9px] uppercase tracking-widest text-slate-400 dark:text-gray-500 font-bold">Theme Calibration</span>
                <span className="text-xs">{state.theme === 'dark' ? '✨' : '🎨'}</span>
              </div>
              <button 
                onClick={toggleTheme}
                className="w-full h-10 rounded-xl bg-slate-900 dark:bg-amber-500 flex items-center justify-center gap-2 group transition-all active:scale-95"
              >
                <span className="text-lg transition-transform group-hover:rotate-12">{state.theme === 'dark' ? '☀️' : '🌙'}</span>
                <span className="text-[10px] font-bold uppercase tracking-widest text-white dark:text-black">
                  Switch Mode
                </span>
              </button>
           </div>
           <p className="text-[9px] text-center text-slate-400 dark:text-gray-600 uppercase tracking-[0.2em] font-medium italic">
             "Thoughts become things."
           </p>
        </div>
      </nav>

      <main className="w-full max-w-5xl mx-auto px-4 sm:px-8 lg:px-12 py-24 lg:py-20 transition-all">
        <div className="max-w-xl mx-auto">
          {activeView === 'dashboard' && <Dashboard state={state} onUpdate={handleUpdate} />}
          {activeView === 'beliefs' && <BeliefReframer state={state} onUpdate={handleUpdate} />}
          {activeView === '369' && <Tracker369 state={state} onUpdate={handleUpdate} />}
          {activeView === '555' && <Module555 state={state} onUpdate={handleUpdate} />}
          {activeView === 'visualize' && <Visualization state={state} onUpdate={handleUpdate} />}
          {activeView === 'release' && <Hooponopono state={state} onUpdate={handleUpdate} />}
          {activeView === 'journal' && <Journaling state={state} onUpdate={handleUpdate} />}
          {activeView === 'profile' && <ProfileSettings />}
        </div>
      </main>

      <footer className="w-full py-8 text-center text-slate-400 dark:text-gray-600 text-[10px] uppercase tracking-widest border-t border-slate-100 dark:border-white/5 leading-relaxed">
         &copy; 2026 MindShift Manifest &bull; Elevate your Reality <br />
         Made to heal your inner self - Sambit Ghosh
      </footer>
    </div>
  );
};

interface NavItemProps {
  icon: string;
  label: string;
  active: boolean;
  onClick: () => void;
}

const NavItem: React.FC<NavItemProps> = ({ icon, label, active, onClick }) => (
  <button
    onClick={onClick}
    className={`flex items-center space-x-4 p-4 lg:px-5 lg:py-4 rounded-2xl transition-all duration-300 group w-full ${active ? 'bg-slate-900 dark:bg-white/10 text-white shadow-xl shadow-slate-900/10 dark:shadow-none' : 'text-slate-400 dark:text-gray-500 hover:text-slate-800 dark:hover:text-gray-300 hover:bg-slate-100 dark:hover:bg-white/5'}`}
  >
    <span className={`text-xl lg:text-2xl transition-transform duration-300 ${active ? 'scale-110' : 'group-hover:scale-105'}`}>{icon}</span>
    <span className="text-xs lg:text-sm font-bold lg:font-semibold uppercase lg:capitalize tracking-widest lg:tracking-normal">{label}</span>
    {active && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></div>}
  </button>
);

export default DashboardPage;
