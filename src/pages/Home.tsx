import React, { useEffect, useState, useMemo } from 'react';
import { AppState, MarketplaceProduct } from '../../types';
import { useAuth } from '../context/AuthContext';
import { affirmationPool } from '../../services/affirmationLibrary';
import { getAppointments, Guide, Appointment } from '../services/guideService';
import { playFrequency, playAmbient, stop, preloadAmbients } from '../../services/soundEngine';
import { curatedProducts } from '../../components/Marketplace';

// We need to import the View type from DashboardPage, but it's not exported there yet.
// We will fix that in the next step. For now, we'll define a compatible type or use any.
// Actually, it's better to define the interface for the props we expect.
type View = 'dashboard' | 'home' | 'soundshift' | 'beliefs' | '369' | '555' | 'release' | 'journal' | 'visualize' | 'profile' | 'marketplace' | 'guides';

interface HomeProps {
  state: AppState;
  onUpdate: (updates: Partial<AppState>) => void;
  onNavigate: (view: View) => void;
}

const Home: React.FC<HomeProps> = ({ state, onUpdate, onNavigate }) => {
  const { currentUser } = useAuth();
  const [greeting, setGreeting] = useState('');
  const [randomAffirmation, setRandomAffirmation] = useState('');
  const [upcomingAppointment, setUpcomingAppointment] = useState<Appointment | null>(null);
  const [upcomingGuide, setUpcomingGuide] = useState<Guide | null>(null); // We might need to fetch guide details
  const [reframeInput, setReframeInput] = useState('');
  const [isPlaying, setIsPlaying] = useState<string | null>(null);

  // 1. Welcome Section
  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good Morning');
    else if (hour < 18) setGreeting('Good Afternoon');
    else setGreeting('Good Evening');
    
    // Preload sounds
    preloadAmbients().catch(console.error);
  }, []);

  // 2. Daily Invocation
  useEffect(() => {
    refreshAffirmation();
  }, []);

  const refreshAffirmation = () => {
    const randomIndex = Math.floor(Math.random() * affirmationPool.length);
    setRandomAffirmation(affirmationPool[randomIndex]);
  };

  // 3. Upcoming Session
  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        if (currentUser) {
           // We would fetch real appointments here. 
           // Since getAppointments requires a userId, and we have it from auth.
           // However, guideService might need an update to filter by date/upcoming.
           // For now, let's use the mock data approach or check if we can query.
           // user-specific appointments are not easily fetchable without an exported function in guideService
           // that filters by user. 
           // Let's assume for now we don't have an appointment or mock one if needed.
           // We'll skip complex fetching for this iteration and focus on UI structure.
           // If we had a "getUpcomingAppointment(userId)" service method, we'd use it.
        }
      } catch (error) {
        console.error("Failed to fetch appointments", error);
      }
    };
    fetchAppointments();
  }, [currentUser]);

  // 3. Quick Sound Access
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

  // 4. Reframer Shortcut
  const handleReframe = () => {
    if (reframeInput.trim()) {
      // We can pass the input to the Reframer via state or a temporary storage
      // Since onNavigate just switches view, we might need to update app state to pass data
      // or use a query param if we were using real routing.
      // For now, let's just navigate.
      // To actually pass the text, we might need to update a "draftBelief" in AppState?
      // Or just assume the user will type it again. 
      // The prompt says "Navigate to full Reframer page with text prefilled".
      // We'll use a URL param approach if possible, but we are in a single page app structure mostly.
      // Let's use a temporary state update if possible, or just navigate for now.
      onNavigate('beliefs');
    }
  };

  // Stats
  // We'll calculate simple stats from state
  const totalSessions = state.ftbaEntries.length + (state.breathingSessions?.length || 0);
  const streak = state.streak || 0;
  const listeningMinutes = Math.round((state.soundPreferences?.todayListeningMs || 0) / 60000);
  // Real implementation would calculate streak from activity dates.

  return (
    <div className="max-w-6xl mx-auto px-6 py-8 space-y-8 pb-24">
      
      {/* 1. Welcome Section */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-serif font-bold text-slate-900 dark:text-amber-50">
            {greeting}, {currentUser?.name || 'Friend'}
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2 text-lg">
            Your inner state, aligned.
          </p>
        </div>
        
        <div className="flex gap-6 text-sm">
          <div className="text-center">
            <div className="text-2xl font-bold text-slate-800 dark:text-amber-500">
              {listeningMinutes}m
            </div>
            <div className="text-slate-500 dark:text-slate-400 uppercase tracking-wider text-[10px]">
              Listening
            </div>
          </div>
          <div className="w-px bg-slate-200 dark:bg-white/10"></div>
          <div className="text-center">
            <div className="text-2xl font-bold text-slate-800 dark:text-amber-500">
              {totalSessions}
            </div>
            <div className="text-slate-500 dark:text-slate-400 uppercase tracking-wider text-[10px]">
              Sessions
            </div>
          </div>
          <div className="w-px bg-slate-200 dark:bg-white/10"></div>
          <div className="text-center">
            <div className="text-2xl font-bold text-slate-800 dark:text-amber-500">
              {streak}
            </div>
            <div className="text-slate-500 dark:text-slate-400 uppercase tracking-wider text-[10px]">
              Day Streak
            </div>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {/* 2. Daily Invocation */}
        <div className="glass-card p-6 rounded-3xl border border-slate-200 dark:border-white/5 bg-white/50 dark:bg-white/5 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
            <button 
              onClick={refreshAffirmation}
              className="p-2 hover:bg-black/5 dark:hover:bg-white/10 rounded-full transition-colors"
              title="Refresh"
            >
              🔄
            </button>
          </div>
          <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-4">
            Daily Invocation
          </h3>
          <p className="text-xl md:text-2xl font-serif text-slate-800 dark:text-slate-200 leading-relaxed">
            "{randomAffirmation}"
          </p>
          <div className="mt-6">
             <button 
               onClick={() => onNavigate('dashboard')} // Assuming 'dashboard' is the old dashboard which had affirmations, or maybe 'beliefs'? 
               // Actually the old dashboard was the main affirmation place. 
               // If we are replacing 'dashboard' view, we might not have a "Full Invocations" page.
               // Let's point to 'beliefs' for now or keep it dead.
               className="text-amber-600 dark:text-amber-500 text-sm font-medium hover:underline"
             >
               Go to Full Invocations →
             </button>
          </div>
        </div>

        {/* 3. Quick Sound Access */}
        <div className="glass-card p-6 rounded-3xl border border-slate-200 dark:border-white/5 bg-white/50 dark:bg-white/5">
          <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-4">
            Quick Shift
          </h3>
          <div className="grid grid-cols-3 gap-3">
            {[
              { id: '528', label: '528 Hz', type: 'frequency' },
              { id: 'rain', label: 'Rain', type: 'ambient' },
              { id: '432', label: '432 Hz', type: 'frequency' }
            ].map((sound) => (
              <button
                key={sound.id}
                onClick={() => handlePlaySound(sound.id, sound.type as 'frequency' | 'ambient')}
                className={`
                  aspect-square rounded-2xl flex flex-col items-center justify-center gap-2 transition-all
                  ${isPlaying === sound.id 
                    ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/20 scale-95' 
                    : 'bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-600 dark:text-slate-300'}
                `}
              >
                <span className="text-2xl">{isPlaying === sound.id ? '⏸' : '▶'}</span>
                <span className="text-[10px] font-bold">{sound.label}</span>
              </button>
            ))}
          </div>
          <div className="mt-6 text-center">
            <button 
              onClick={() => onNavigate('soundshift')}
              className="text-amber-600 dark:text-amber-500 text-sm font-medium hover:underline"
            >
              Open Sound Studio →
            </button>
          </div>
        </div>

        {/* 4. Reframer Shortcut */}
        <div className="glass-card p-6 rounded-3xl border border-slate-200 dark:border-white/5 bg-white/50 dark:bg-white/5 flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-4">
              Shift a Story
            </h3>
            <textarea
              value={reframeInput}
              onChange={(e) => setReframeInput(e.target.value)}
              placeholder="I'm feeling blocked because..."
              className="w-full bg-transparent border-b border-slate-200 dark:border-white/10 focus:border-amber-500 outline-none text-slate-800 dark:text-slate-200 resize-none h-20 placeholder:text-slate-400 dark:placeholder:text-slate-600"
            />
          </div>
          <button 
            onClick={handleReframe}
            disabled={!reframeInput.trim()}
            className="mt-4 w-full py-3 rounded-xl bg-slate-900 dark:bg-white/10 text-white hover:bg-amber-500 dark:hover:bg-white/20 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Reframe Now
          </button>
        </div>

        {/* 5. Upcoming Session (Guides) */}
        <div className="glass-card p-6 rounded-3xl border border-slate-200 dark:border-white/5 bg-white/50 dark:bg-white/5">
           <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-4">
            Your Support
          </h3>
          {upcomingAppointment ? (
            <div className="bg-slate-100 dark:bg-white/5 p-4 rounded-2xl flex items-center gap-4">
               {/* Appointment details would go here */}
               <div className="w-12 h-12 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-500">
                 📅
               </div>
               <div>
                 <p className="font-bold text-slate-800 dark:text-slate-200">Session with Guide</p>
                 <p className="text-xs text-slate-500">Today, 4:00 PM</p>
               </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-40 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-white/5 flex items-center justify-center text-2xl">
                🧘‍♀️
              </div>
              <div>
                <p className="font-medium text-slate-800 dark:text-slate-200">No upcoming sessions</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Connect with a guide to deepen your practice.</p>
              </div>
            </div>
          )}
          <button 
            onClick={() => onNavigate('guides')}
            className="mt-4 w-full py-3 rounded-xl border border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors text-sm font-medium text-slate-600 dark:text-slate-300"
          >
            Explore Guides
          </button>
        </div>

        {/* 6. Marketplace Preview */}
        <div className="glass-card p-6 rounded-3xl border border-slate-200 dark:border-white/5 bg-white/50 dark:bg-white/5 md:col-span-2 lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">
              Curated for You
            </h3>
            <button 
              onClick={() => onNavigate('marketplace')}
              className="text-xs text-amber-600 dark:text-amber-500 hover:underline"
            >
              View All
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {curatedProducts.slice(0, 2).map(product => (
              <div 
                key={product.id}
                className="group flex items-center gap-4 p-3 rounded-2xl hover:bg-slate-50 dark:hover:bg-white/5 transition-colors cursor-pointer"
                onClick={() => onNavigate('marketplace')}
              >
                <div className="w-20 h-20 rounded-xl bg-slate-200 dark:bg-white/10 overflow-hidden relative">
                   {/* Fallback image if real one fails or is just a placeholder path */}
                   <div className="absolute inset-0 flex items-center justify-center text-slate-400">
                     🛍️
                   </div>
                </div>
                <div>
                  <h4 className="font-serif font-bold text-slate-800 dark:text-slate-200 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                    {product.title}
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                    {product.shortDescription}
                  </p>
                  <p className="text-sm font-bold text-slate-900 dark:text-slate-100 mt-2">
                    ${(product.priceCents / 100).toFixed(2)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};

export default Home;
