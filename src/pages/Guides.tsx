
import React, { useState, useEffect, useMemo } from 'react';
import { AppState } from '../types';
import { useAuth } from '../context/AuthContext';
import { Guide, getGuides, seedGuides } from '../services/guideService';
import GuideCard from '../components/guides/GuideCard';
import GuideProfile from '../components/guides/GuideProfile';
import BookingModal from '../components/guides/BookingModal';

interface GuidesPageProps {
  state?: AppState; // Optional to allow standalone usage if needed
  onUpdate?: (updates: Partial<AppState>) => void;
}

const GuidesPage: React.FC<GuidesPageProps> = ({ state }) => {
  const { currentUser } = useAuth();
  const [guides, setGuides] = useState<Guide[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedGuide, setSelectedGuide] = useState<Guide | null>(null);
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [guideToBook, setGuideToBook] = useState<Guide | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');

  const filters = ['All', 'Therapy', 'Manifestation', 'Breathwork', 'Energy Work', 'Trauma Recovery'];
  const isDemoMode = (guides[0] as any)?._isMock;

  useEffect(() => {
    const fetchGuides = async () => {
      setLoading(true);
      try {
        const data = await getGuides();
        setGuides(data);
      } catch (error) {
        console.error('Failed to load guides:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchGuides();
  }, []);

  const filteredGuides = useMemo(() => {
    return guides.filter(guide => {
      const matchesSearch = guide.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            guide.specialty.some(s => s.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesFilter = activeFilter === 'All' || guide.specialty.some(s => s.includes(activeFilter) || guide.title.includes(activeFilter));
      
      return matchesSearch && matchesFilter;
    });
  }, [guides, searchTerm, activeFilter]);

  const handleBookSession = (guide: Guide) => {
    setGuideToBook(guide);
    setIsBookingOpen(true);
  };

  if (selectedGuide) {
    return (
      <GuideProfile 
        guide={selectedGuide} 
        onBack={() => setSelectedGuide(null)}
        userId={currentUser?.name || 'guest'}
      />
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500 min-h-screen">
      {/* Header */}
      <header className="space-y-4">
        <div>
          <h2 className="text-4xl font-serif font-bold text-primary">MindShift Guides</h2>
          <p className="text-secondary mt-2 text-lg">
            Connect with professionals who support your inner evolution.
          </p>
          {isDemoMode && (
             <div className="mt-4 p-3 bg-accent-primary/10 text-accent-primary rounded-xl text-sm flex items-center gap-3">
               <span>⚠️ Running in Demo Mode (Mock Data). Database is empty.</span>
               <button 
                 onClick={async () => {
                   setLoading(true);
                   await seedGuides();
                   const data = await getGuides();
                   setGuides(data);
                   setLoading(false);
                 }}
                 className="px-3 py-1 bg-accent-primary/20 rounded-lg text-sm font-bold hover:opacity-80 transition-opacity"
               >
                 Initialize Database
               </button>
             </div>
          )}
        </div>

        {/* Search & Filter */}
        <div className="flex flex-col md:flex-row gap-4 justify-between items-center glass-card p-4 rounded-2xl border border-card-border">
          <div className="relative w-full md:w-1/3">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted">🔍</span>
            <input 
              type="text" 
              placeholder="Search by name or specialty..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-card border border-card-border focus:outline-none focus:ring-2 focus:ring-accent-primary/50 transition-shadow text-primary placeholder:text-muted"
            />
          </div>
          
          <div className="flex gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 no-scrollbar">
            {filters.map(filter => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-all ${
                  activeFilter === filter
                    ? 'btn-primary-ritual text-btn-primary shadow-lg shadow-accent-primary/20'
                    : 'bg-card text-secondary border border-card-border hover:bg-secondary/10'
                }`}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-96 rounded-[2rem] bg-secondary animate-pulse"></div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pb-20">
          {filteredGuides.map(guide => (
            <GuideCard 
              key={guide.id} 
              guide={guide} 
              onViewProfile={setSelectedGuide}
              onBookSession={handleBookSession}
            />
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && filteredGuides.length === 0 && (
        <div className="text-center py-20">
          <p className="text-muted text-lg">No guides found matching your criteria.</p>
          {searchTerm === '' && activeFilter === 'All' ? (
            <button 
              onClick={async () => {
                setLoading(true);
                await seedGuides();
                const data = await getGuides();
                setGuides(data);
                setLoading(false);
              }}
              className="mt-4 px-4 py-2 bg-secondary rounded-lg text-sm hover:bg-secondary/80 transition-colors text-primary"
            >
              Initialize Database
            </button>
          ) : (
            <button 
              onClick={() => {
                setSearchTerm('');
                setActiveFilter('All');
              }}
              className="mt-4 text-accent-primary hover:underline"
            >
              Clear filters
            </button>
          )}
        </div>
      )}

      {guideToBook && (
        <BookingModal 
          guide={guideToBook}
          isOpen={isBookingOpen}
          onClose={() => {
            setIsBookingOpen(false);
            setGuideToBook(null);
          }}
          userId={currentUser?.name || 'guest'}
        />
      )}
    </div>
  );
};

export default GuidesPage;
