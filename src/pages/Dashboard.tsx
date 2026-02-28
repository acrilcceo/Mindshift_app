import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { AppState, Theme } from '../types';
import MobileFooterNav from '../components/MobileFooterNav';
import {
  FocusIcon,
  HomeIcon,
  SoundshiftIcon,
  MarketplaceIcon,
  GuideIcon,
  ReframerIcon,
  Ritual369Icon,
  Ritual555Icon,
  VisualizeIcon,
  ReleaseIcon,
  JournalIcon,
  ProfileIcon
} from '../components/Icons';

interface DashboardLayoutProps {
  state: AppState;
  onToggleTheme: () => void;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ state, onToggleTheme }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path: string) => {
    if (path === '/home' && (location.pathname === '/home' || location.pathname === '/')) return true;
    return location.pathname.startsWith(path);
  };

  const handleNav = (path: string) => {
    navigate(path);
    setIsMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen transition-colors duration-300 lg:pl-72 pb-20 md:pb-0">
      <header className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-primary/80 backdrop-blur-xl border-b border-card-border z-40 flex items-center justify-between px-6">
        <div className="flex items-center gap-2">
           <div className="w-8 h-8 rounded-lg bg-accent-primary flex items-center justify-center text-btn-primary-text font-bold text-lg shadow-lg shadow-accent-primary/20">M</div>
           <h1 className="text-lg font-serif text-primary font-bold tracking-tight">MindShift</h1>
        </div>
        <button 
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="w-10 h-10 flex flex-col items-center justify-center gap-1.5 focus:outline-none text-primary"
          aria-label="Toggle Menu"
        >
          <span className={`h-0.5 w-6 bg-current transition-all duration-300 ${isMenuOpen ? 'rotate-45 translate-y-2' : ''}`}></span>
          <span className={`h-0.5 w-6 bg-current transition-all duration-300 ${isMenuOpen ? 'opacity-0' : ''}`}></span>
          <span className={`h-0.5 w-6 bg-current transition-all duration-300 ${isMenuOpen ? '-rotate-45 -translate-y-2' : ''}`}></span>
        </button>
      </header>

      <div className={`lg:hidden fixed inset-0 z-50 transition-all duration-500 ${isMenuOpen ? 'visible' : 'invisible'}`}>
        <div 
          className={`absolute inset-0 bg-secondary/80 backdrop-blur-sm transition-opacity duration-500 ${isMenuOpen ? 'opacity-100' : 'opacity-0'}`}
          onClick={() => setIsMenuOpen(false)}
        ></div>
        <nav className={`absolute top-0 right-0 bottom-0 w-4/5 max-w-xs bg-secondary shadow-2xl transition-transform duration-500 ease-out flex flex-col p-8 ${isMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}>
          <div className="flex justify-between items-center mb-12">
            <div className="text-sm uppercase tracking-widest text-muted font-bold">Main Navigation</div>
            <button onClick={() => setIsMenuOpen(false)} className="text-muted hover:text-accent-primary">✕</button>
          </div>

          <div className="space-y-4 overflow-y-auto">
            <NavItem icon={<HomeIcon />} label="Home" active={isActive('/home')} onClick={() => handleNav('/home')} />
            <NavItem icon={<FocusIcon />} label="Focus Dashboard" active={isActive('/dashboard')} onClick={() => handleNav('/dashboard')} />
            <NavItem icon={<SoundshiftIcon />} label="SoundShift Studio" active={isActive('/soundshift')} onClick={() => handleNav('/soundshift')} />
            <NavItem icon={<MarketplaceIcon />} label="Marketplace" active={isActive('/marketplace')} onClick={() => handleNav('/marketplace')} />
            <NavItem icon={<GuideIcon />} label="Guides" active={isActive('/guides')} onClick={() => handleNav('/guides')} />
            <NavItem icon={<ReframerIcon />} label="Neural Reframer" active={isActive('/beliefs')} onClick={() => handleNav('/beliefs')} />
            <NavItem icon={<Ritual369Icon />} label="3-6-9 Ritual" active={isActive('/369')} onClick={() => handleNav('/369')} />
            <NavItem icon={<Ritual555Icon />} label="5-5-5 Ritual" active={isActive('/555')} onClick={() => handleNav('/555')} />
            <NavItem icon={<VisualizeIcon />} label="Whisper Visualize" active={isActive('/visualize')} onClick={() => handleNav('/visualize')} />
            <NavItem icon={<ReleaseIcon />} label="Emotional Release" active={isActive('/release')} onClick={() => handleNav('/release')} />
            <NavItem icon={<JournalIcon />} label="Daily Journal" active={isActive('/journal')} onClick={() => handleNav('/journal')} />
            <NavItem icon={<ProfileIcon />} label="Profile Settings" active={isActive('/profile')} onClick={() => handleNav('/profile')} />
          </div>

          <div className="mt-auto pt-8 border-t border-card-border space-y-4">
            <button 
              onClick={onToggleTheme}
              className="w-full flex items-center justify-between p-4 bg-secondary rounded-2xl"
            >
              <div className="flex items-center gap-3">
                <span className="text-xl">{state.theme === 'dark' ? '☀️' : '🌙'}</span>
                <span className="text-sm font-bold uppercase tracking-widest text-secondary">
                  {state.theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
                </span>
              </div>
              <div className={`w-8 h-4 rounded-full relative transition-colors ${state.theme === 'dark' ? 'bg-accent-primary' : 'bg-muted/30'}`}>
                <div className={`absolute top-0.5 w-3 h-3 rounded-full bg-card shadow-sm transition-all ${state.theme === 'dark' ? 'right-0.5' : 'left-0.5'}`}></div>
              </div>
            </button>
            <p className="text-sm text-center text-muted uppercase tracking-widest leading-loose">
              Manifesting Excellence<br/>v1.2 Premium Edition
            </p>
          </div>
        </nav>
      </div>

      <nav className="hidden lg:flex fixed top-0 left-0 bottom-0 w-72 bg-secondary border-r border-card-border z-50 p-8 flex-col">
        <div className="mb-12">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 rounded-2xl bg-accent-primary flex items-center justify-center text-btn-primary font-bold text-xl shadow-lg shadow-accent-primary/20">M</div>
             <h1 className="text-2xl font-serif text-primary font-bold tracking-tight">MindShift</h1>
          </div>
          <p className="text-sm text-secondary uppercase tracking-widest mt-2 font-bold px-1">Neural Empowerment</p>
        </div>
        
        <div className="space-y-4 flex-1 overflow-y-auto pr-2 custom-scrollbar">
          <NavItem icon={<FocusIcon />} label="Focus" active={isActive('/dashboard')} onClick={() => handleNav('/dashboard')} />
          <NavItem icon={<SoundshiftIcon />} label="SoundShift" active={isActive('/soundshift')} onClick={() => handleNav('/soundshift')} />
          <NavItem icon={<MarketplaceIcon />} label="Marketplace" active={isActive('/marketplace')} onClick={() => handleNav('/marketplace')} />
          <NavItem icon={<GuideIcon />} label="Guides" active={isActive('/guides')} onClick={() => handleNav('/guides')} />
          <NavItem icon={<ReframerIcon />} label="Reframer" active={isActive('/beliefs')} onClick={() => handleNav('/beliefs')} />
          <NavItem icon={<Ritual369Icon />} label="3-6-9" active={isActive('/369')} onClick={() => handleNav('/369')} />
          <NavItem icon={<Ritual555Icon />} label="5-5-5" active={isActive('/555')} onClick={() => handleNav('/555')} />
          <NavItem icon={<VisualizeIcon />} label="Visualize" active={isActive('/visualize')} onClick={() => handleNav('/visualize')} />
          <NavItem icon={<ReleaseIcon />} label="Release" active={isActive('/release')} onClick={() => handleNav('/release')} />
          <NavItem icon={<JournalIcon />} label="Journal" active={isActive('/journal')} onClick={() => handleNav('/journal')} />
          <NavItem icon={<ProfileIcon />} label="Profile" active={isActive('/profile')} onClick={() => handleNav('/profile')} />
        </div>

        <div className="mt-auto space-y-6 pt-6">
           <div className="p-5 card-base rounded-3xl shadow-md">
              <div className="flex justify-between items-center mb-3">
                <span className="text-sm uppercase tracking-widest text-muted font-bold">Theme Calibration</span>
                <span className="text-sm">{state.theme === 'dark' ? '✨' : '🎨'}</span>
              </div>
              <button 
                onClick={onToggleTheme}
                className="w-full h-10 rounded-xl btn-primary-ritual flex items-center justify-center gap-2 group transition-all hover:shadow-lg active:scale-95"
              >
                <span className="text-lg transition-transform group-hover:rotate-12">{state.theme === 'dark' ? '☀️' : '🌙'}</span>
                <span className="text-sm font-bold uppercase tracking-widest">
                  Switch Mode
                </span>
              </button>
           </div>
           <p className="text-sm text-center text-muted uppercase tracking-[0.2em] font-medium italic">
             "Thoughts become things."
           </p>
        </div>
      </nav>

      <main className="min-h-screen pt-20 lg:pt-8 px-6 pb-24 md:pb-12">
        <div className="max-w-6xl mx-auto">
          <Outlet />
        </div>
      </main>

      {/* Mobile Footer Brand */}
      <div className="md:hidden w-full text-center pb-24 pt-8">
         <p className="text-[12px] text-gray-500 dark:text-gray-400">© 2026 MindShift Manifest • Elevate your Reality</p>
         <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-1">Made to heal your inner self - Sambit Ghosh</p>
      </div>

      <footer className="hidden md:block w-full py-8 text-center text-muted text-sm uppercase tracking-widest border-t border-card-border leading-relaxed ml-0 lg:ml-0">
         &copy; 2026 MindShift Manifest &bull; Elevate your Reality <br />
         Made to heal your inner self - Sambit Ghosh
      </footer>

      {/* Mobile Footer Navigation - Only visible on mobile */}
      <MobileFooterNav />
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
    className={`nav-item ${active ? 'nav-item-active' : ''} w-full text-left`}
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

export default DashboardLayout;
