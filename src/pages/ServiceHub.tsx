import React from 'react';
import { useNavigate } from 'react-router-dom';
import { MarketplaceIcon, GuideIcon } from '../components/Icons';

const ServiceHub: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="space-y-6 pb-20">
      <header className="mb-6">
        <h1 className="text-2xl font-serif text-primary font-bold">Services</h1>
        <p className="text-muted text-sm">Tools and guides to support your journey.</p>
      </header>

      <div className="space-y-4">
        <button
          onClick={() => navigate('/marketplace')}
          className="w-full flex items-center justify-between p-6 rounded-3xl glass-card border border-card-border hover:bg-card/80 transition-all active:scale-95 shadow-sm group"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
              <div className="w-6 h-6"><MarketplaceIcon /></div>
            </div>
            <div className="text-left">
              <h3 className="text-lg font-bold text-primary">Marketplace</h3>
              <p className="text-sm text-muted">Ritual tools & digital assets</p>
            </div>
          </div>
          <span className="text-muted group-hover:translate-x-1 transition-transform">→</span>
        </button>

        <button
          onClick={() => navigate('/guides')}
          className="w-full flex items-center justify-between p-6 rounded-3xl glass-card border border-card-border hover:bg-card/80 transition-all active:scale-95 shadow-sm group"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
              <div className="w-6 h-6"><GuideIcon /></div>
            </div>
            <div className="text-left">
              <h3 className="text-lg font-bold text-primary">Find a Guide</h3>
              <p className="text-sm text-muted">Connect with experts</p>
            </div>
          </div>
          <span className="text-muted group-hover:translate-x-1 transition-transform">→</span>
        </button>
      </div>
    </div>
  );
};

export default ServiceHub;
