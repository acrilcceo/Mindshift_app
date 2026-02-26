import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { HomeIcon, ProfileIcon, MindIcon, ServiceIcon } from './Icons';

const MobileFooterNav: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const currentPath = location.pathname;

  const isActive = (path: string) => {
    if (path === '/home' && (currentPath === '/home' || currentPath === '/')) return true;
    return currentPath.startsWith(path);
  };

  const navItems = [
    { label: 'Home', path: '/home', icon: <HomeIcon /> },
    { label: 'Mind', path: '/mind', icon: <MindIcon /> },
    { label: 'Service', path: '/services', icon: <ServiceIcon /> },
    { label: 'Profile', path: '/profile', icon: <ProfileIcon /> },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden pb-safe">
      <div className="h-16 bg-card/95 backdrop-blur-md border-t border-card-border flex items-center justify-around px-2 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]">
        {navItems.map((item) => {
          const active = isActive(item.path);
          return (
            <button
              key={item.label}
              onClick={() => navigate(item.path)}
              className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition-all duration-300 ${
                active ? 'text-accent-primary' : 'text-muted'
              }`}
            >
              <div className={`relative transition-transform duration-300 ${active ? 'scale-110' : 'scale-100'}`}>
                {active && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-accent-primary rounded-full shadow-[0_0_8px_rgba(var(--accent-primary-rgb),0.6)]" />
                )}
                <div className={`w-6 h-6 ${active ? 'drop-shadow-[0_0_5px_rgba(var(--accent-primary-rgb),0.5)]' : ''}`}>
                  {item.icon}
                </div>
              </div>
              <span className={`text-[10px] font-medium tracking-wide ${active ? 'font-bold' : ''}`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default MobileFooterNav;
