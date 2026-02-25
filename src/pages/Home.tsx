import React, { useEffect, useState } from 'react';
import { AppState } from '../../types';
import { useAuth } from '../context/AuthContext';
import { affirmationPool } from '../../services/affirmationLibrary';
import { Appointment } from '../services/guideService';
import { playFrequency, playAmbient, stop, preloadAmbients } from '../../services/soundEngine';
import { curatedProducts } from '../../components/Marketplace';

type View = 'dashboard' | 'home' | 'soundshift' | 'beliefs' | '369' | '555' | 'release' | 'journal' | 'visualize' | 'profile' | 'marketplace' | 'guides';

interface HomeProps {
  state: AppState;
  onUpdate: (updates: Partial<AppState>) => void;
  onNavigate: (view: View) => void;
}

const Home: React.FC<HomeProps> = ({ state, onNavigate }) => {
  const { currentUser } = useAuth();
  const [greeting, setGreeting] = useState('');
  const [randomAffirmation, setRandomAffirmation] = useState('');
  const [upcomingAppointment] = useState<Appointment | null>(null);
  const [reframeInput, setReframeInput] = useState('');
  const [isPlaying, setIsPlaying] = useState<string | null>(null);

  // 1. Welcome Section & Init
  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good Morning');
    else if (hour < 18) setGreeting('Good Afternoon');
    else setGreeting('Good Evening');
    
    preloadAmbients().catch(console.error);
    refreshAffirmation();
  }, []);

  const refreshAffirmation = () => {
    const randomIndex = Math.floor(Math.random() * affirmationPool.length);
    setRandomAffirmation(affirmationPool[randomIndex]);
  };

  const handlePlaySound = (id: string, type: 'frequency' | 'ambient') => {
    if (isPlaying === id) {
      stop();
      setIsPlaying(null);
    } else {
      stop();
      if (type === 'frequency') {
        playFrequency(id);
      } else {
        playAmbient(id);
      }
      setIsPlaying(id);
    }
  };

  const handleReframe = () => {
    if (reframeInput.trim()) {
      onNavigate('beliefs');
    }
  };

  // Stats calculation
  const totalSessions = state.ftbaEntries.length + (state.breathingSessions?.length || 0);
  const streak = state.streak || 0;
  const listeningMinutes = Math.round((state.soundPreferences?.todayListeningMs || 0) / 60000);

  // Helper for name formatting
  const formattedName = currentUser?.name 
    ? currentUser.name.charAt(0).toUpperCase() + currentUser.name.slice(1).toLowerCase()
    : 'Friend';

  // Dynamic Contextual Text
  const getContextualText = () => {
    if (streak > 3) return "You're building momentum.";
    if (totalSessions === 0) return "Your next step awaits.";
    if (listeningMinutes > 0) return "You've already invested in your state.";
    return "Your inner state, aligned.";
  };

  return (
    <div className="min-h-screen w-full bg-[#0c1220] text-slate-200 overflow-hidden relative">
      {/* 2. Background - Subtle Neural Glow */}
      <div 
        className="absolute inset-0 z-0 animate-subtle-shift"
        style={{
          background: `
            radial-gradient(circle at 20% 15%, rgba(120, 80, 255, 0.12), transparent 40%),
            radial-gradient(circle at 80% 30%, rgba(255, 160, 90, 0.08), transparent 45%),
            linear-gradient(to bottom, #0c1220, #111827)
          `,
          backgroundSize: '150% 150%'
        }}
      />
      
      <div className="relative z-10 max-w-6xl mx-auto px-6 py-8 space-y-12 pb-32 animate-fade-in">
        
        {/* 1. Header Section */}
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div className="relative group">
            <h1 className="text-3xl md:text-4xl font-serif font-medium text-slate-100 tracking-wide transition-all duration-300 animate-fade-in">
              {greeting}, <span className="group-hover:text-white group-hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.3)] transition-all duration-500">{formattedName}</span>
            </h1>
            <div className="mt-2 flex flex-col items-start gap-1">
              <p className="text-slate-400/90 font-light text-sm tracking-wide animate-fade-in" style={{ animationDelay: '200ms' }}>
                {getContextualText()}
              </p>
            </div>
          </div>
          
          {/* 4. Stats - Floating Glass Pills */}
          <div className="flex gap-4 text-sm flex-wrap">
            <div className="flex flex-col items-center justify-center px-4 py-2 rounded-full bg-white/5 border border-white/5 backdrop-blur-sm hover:scale-102 hover:shadow-[0_0_15px_rgba(255,255,255,0.05)] transition-all duration-300">
              <span className="text-slate-500 text-[10px] uppercase tracking-wider mb-0.5">Listening</span>
              <span className="text-slate-200 font-medium">{listeningMinutes} <span className="text-slate-600 text-[10px]">min</span></span>
            </div>
            <div className="flex flex-col items-center justify-center px-4 py-2 rounded-full bg-white/5 border border-white/5 backdrop-blur-sm hover:scale-102 hover:shadow-[0_0_15px_rgba(255,255,255,0.05)] transition-all duration-300">
              <span className="text-slate-500 text-[10px] uppercase tracking-wider mb-0.5">Sessions</span>
              <span className="text-slate-200 font-medium">{totalSessions}</span>
            </div>
            <div className="flex flex-col items-center justify-center px-4 py-2 rounded-full bg-white/5 border border-white/5 backdrop-blur-sm hover:scale-102 hover:shadow-[0_0_15px_rgba(255,255,255,0.05)] transition-all duration-300">
              <span className="text-slate-500 text-[10px] uppercase tracking-wider mb-0.5">Streak</span>
              <span className="text-slate-200 font-medium">{streak} <span className="text-slate-600 text-[10px]">day</span></span>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          
          {/* 5. Daily Invocation - Centerpiece Energy Block */}
          <div className="group relative p-10 rounded-[2rem] bg-white/5 border border-white/5 hover:border-white/10 transition-all duration-500 hover:shadow-2xl hover:shadow-indigo-500/5 animate-fade-in" style={{ animationDelay: '100ms' }}>
            <div className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
              <button 
                onClick={refreshAffirmation}
                className="p-2 text-slate-400 hover:text-white transition-colors"
                title="Refresh Invocation"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>
            </div>
            
            <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-indigo-300/60 mb-8">
              Daily Invocation
            </h3>
            
            <div className="relative">
              <p className="text-xl md:text-2xl font-serif italic font-light text-slate-200 leading-relaxed text-center px-4 animate-fade-in">
                {randomAffirmation}
              </p>
            </div>

            <div className="mt-10 flex flex-col items-center gap-6">
              {/* Breathing Energy Bar */}
              <div className="w-24 h-0.5 bg-gradient-to-r from-transparent via-indigo-400/30 to-transparent relative overflow-hidden">
                 <div className="absolute inset-0 bg-gradient-to-r from-transparent via-indigo-400/50 to-transparent animate-[shimmer_3s_infinite]" />
              </div>
              
              <button 
                onClick={() => onNavigate('dashboard')} 
                className="text-[10px] uppercase tracking-widest text-slate-500 hover:text-indigo-300 transition-colors pt-2"
              >
                Go to Full Invocations
              </button>
            </div>
          </div>

          {/* 6. Quick Shift - Modern Ritual Buttons */}
          <div className="p-8 rounded-[2rem] bg-white/5 border border-white/5 hover:border-white/10 transition-all duration-500 animate-fade-in" style={{ animationDelay: '200ms' }}>
            <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-indigo-300/60 mb-8 text-center">
              Quick Shift
            </h3>
            
            <div className="flex flex-col gap-6">
              {[
                { id: '528', label: '528 Hz', sub: 'Emotional Coherence', type: 'frequency' },
                { id: 'rain', label: 'Rain', sub: 'Soft Focus', type: 'ambient' },
                { id: '432', label: '432 Hz', sub: 'Grounding Frequency', type: 'frequency' }
              ].map((sound) => (
                <div key={sound.id} className="flex items-center justify-between group cursor-pointer" onClick={() => handlePlaySound(sound.id, sound.type as 'frequency' | 'ambient')}>
                  <div className="flex items-center gap-5">
                    <button
                      className={`
                        w-12 h-12 rounded-full flex items-center justify-center transition-all duration-500 relative
                        ${isPlaying === sound.id 
                          ? 'bg-amber-500/20 text-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.2)] scale-105' 
                          : 'bg-white/5 text-slate-400 group-hover:bg-white/10 group-hover:text-slate-200'}
                      `}
                    >
                      {/* Pulse ring when idle */}
                      {isPlaying !== sound.id && (
                        <div className="absolute inset-0 rounded-full border border-white/5 animate-[ping_3s_cubic-bezier(0,0,0.2,1)_infinite] opacity-0 group-hover:opacity-100" />
                      )}
                      
                      {isPlaying === sound.id ? (
                         <div className="absolute inset-0 rounded-full border border-amber-500/30 animate-[ping_2s_cubic-bezier(0,0,0.2,1)_infinite]" />
                      ) : null}

                      {isPlaying === sound.id ? (
                        <div className="flex gap-0.5 items-end h-3 z-10">
                          <div className="w-0.5 bg-current animate-[pulse_1s_ease-in-out_infinite] h-full" />
                          <div className="w-0.5 bg-current animate-[pulse_1.5s_ease-in-out_infinite] h-2/3" />
                          <div className="w-0.5 bg-current animate-[pulse_0.8s_ease-in-out_infinite] h-full" />
                        </div>
                      ) : (
                        <svg className="w-4 h-4 ml-0.5 z-10" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                      )}
                    </button>
                    <div className="flex flex-col">
                      <span className={`text-sm font-medium transition-colors ${isPlaying === sound.id ? 'text-amber-400' : 'text-slate-300 group-hover:text-white'}`}>
                        {sound.label}
                      </span>
                      <span className="text-[10px] text-slate-500 font-light tracking-wide uppercase">
                        {sound.sub}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 text-center">
              <button 
                onClick={() => onNavigate('soundshift')}
                className="text-[10px] uppercase tracking-widest text-slate-500 hover:text-amber-400 transition-colors"
              >
                Open Sound Studio
              </button>
            </div>
          </div>

          {/* 7. Shift a Story - Transformational */}
          <div className="p-8 rounded-[2rem] bg-white/5 border border-white/5 hover:border-white/10 transition-all duration-500 flex flex-col animate-fade-in" style={{ animationDelay: '300ms' }}>
            <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-indigo-300/60 mb-6">
              Shift a Story
            </h3>
            
            <div className="flex-1 flex flex-col">
              <textarea
                value={reframeInput}
                onChange={(e) => setReframeInput(e.target.value)}
                placeholder="Write a thought you’re ready to release..."
                className="w-full bg-transparent border-b border-white/10 focus:border-violet-500/50 outline-none text-slate-200 text-lg font-light resize-none h-32 placeholder:text-slate-600 transition-all duration-500 focus:shadow-[inset_0_-10px_20px_-10px_rgba(139,92,246,0.1)]"
              />
            </div>

            <button 
              onClick={handleReframe}
              disabled={!reframeInput.trim()}
              className={`
                mt-6 w-full py-4 rounded-xl text-sm font-medium tracking-wide transition-all duration-500 relative overflow-hidden group
                ${reframeInput.trim() 
                  ? 'text-white shadow-[0_4px_20px_rgba(212,165,116,0.2)]' 
                  : 'bg-white/5 text-slate-500 cursor-not-allowed'}
              `}
              style={reframeInput.trim() ? { background: 'linear-gradient(135deg, #d4a574, #b8865b)' } : {}}
            >
              {reframeInput.trim() && (
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
              )}
              <span className="relative z-10">Reframe Now</span>
            </button>
            <p className="mt-3 text-center text-[10px] text-slate-500 font-light tracking-wide uppercase">
               Rewrite the narrative.
            </p>
          </div>

          {/* 8. Your Support - Connected */}
          <div className="p-8 rounded-[2rem] bg-white/5 border border-white/5 hover:border-white/10 transition-all duration-500 animate-fade-in" style={{ animationDelay: '400ms' }}>
             <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-indigo-300/60 mb-6">
              Your Support
            </h3>
            
            <div className="flex-1 flex flex-col items-center justify-center text-center h-48">
              {upcomingAppointment ? (
                <div className="w-full bg-white/5 p-6 rounded-2xl flex items-center gap-4">
                   <div className="w-12 h-12 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-400">
                     📅
                   </div>
                   <div className="text-left">
                     <p className="font-serif text-slate-200">Session with Guide</p>
                     <p className="text-xs text-slate-500 mt-1">Today, 4:00 PM</p>
                   </div>
                </div>
              ) : (
                <>
                  <div className="relative w-16 h-16 mb-6 flex items-center justify-center">
                    <div className="absolute inset-0 bg-indigo-500/10 rounded-full animate-[ping_4s_ease-in-out_infinite]" />
                    <div className="relative w-12 h-12 bg-indigo-500/10 rounded-full flex items-center justify-center text-indigo-300/80 shadow-[0_0_15px_rgba(99,102,241,0.2)]">
                      🤍
                    </div>
                  </div>
                  <p className="font-light text-slate-300">Support becomes powerful when intentional.</p>
                </>
              )}
            </div>
            
            <button 
              onClick={() => onNavigate('guides')}
              className="w-full py-3 rounded-xl border border-white/10 hover:border-indigo-500/30 hover:bg-indigo-500/5 transition-all duration-500 text-xs font-medium text-slate-400 hover:text-indigo-200 uppercase tracking-wider hover:shadow-[0_0_15px_rgba(99,102,241,0.1)]"
            >
              Explore Guides
            </button>
          </div>

          {/* 9. Curated for You - Premium Calm Tech */}
          <div className="p-8 rounded-[2rem] bg-white/5 border border-white/5 hover:border-white/10 transition-all duration-500 md:col-span-2 animate-fade-in" style={{ animationDelay: '500ms' }}>
            <div className="flex items-center justify-between mb-8">
              <div className="flex flex-col gap-2">
                <h3 className="text-lg font-serif font-light text-slate-200 tracking-wide">
                  Curated Ritual Tools
                </h3>
                <div className="h-px w-12 bg-white/10" />
              </div>
              <button 
                onClick={() => onNavigate('marketplace')}
                className="text-[10px] uppercase tracking-widest text-slate-500 hover:text-amber-400 transition-colors"
              >
                View All
              </button>
            </div>

            {/* Marketplace Grid - Horizontal scroll on mobile, Grid on desktop */}
            <div className="flex overflow-x-auto md:grid md:grid-cols-2 gap-6 pb-4 md:pb-0 snap-x -mx-4 px-4 md:mx-0 md:px-0 scrollbar-hide">
              {curatedProducts.slice(0, 2).map((product, idx) => (
                <div 
                  key={product.id}
                  className="min-w-[280px] md:min-w-0 snap-center group flex items-center gap-6 p-4 rounded-2xl hover:bg-white/5 transition-all duration-500 cursor-pointer border border-transparent hover:border-white/5 backdrop-blur-sm animate-fade-in"
                  style={{ animationDelay: `${600 + idx * 100}ms` }}
                  onClick={() => onNavigate('marketplace')}
                >
                  <div className="w-24 h-24 rounded-xl bg-white/5 overflow-hidden relative shadow-lg group-hover:scale-105 transition-transform duration-700 group-hover:shadow-2xl">
                     <div className="absolute inset-0 flex items-center justify-center text-slate-600 group-hover:text-slate-400 transition-colors duration-500">
                       🛍️
                     </div>
                  </div>
                  <div>
                    <h4 className="font-serif text-lg text-slate-200 group-hover:text-amber-400 transition-colors duration-300">
                      {product.title}
                    </h4>
                    <p className="text-xs text-slate-500 mt-2 line-clamp-2 font-light leading-relaxed">
                      {product.shortDescription}
                    </p>
                    <p className="text-sm font-light text-slate-400/80 mt-3 group-hover:text-white transition-colors">
                      ${(product.priceCents / 100).toFixed(2)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Home;
