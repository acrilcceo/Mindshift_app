import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppState } from '../types';
import { 
  JournalIcon, 
  Ritual555Icon, 
  Ritual369Icon, 
  ReleaseIcon, 
  ReframerIcon, 
  VisualizeIcon,
  SparkleIcon
} from '../components/Icons';
import { CircleFeed } from '../components/circles/CircleFeed';
import { FriendsFeed } from '../components/friends/FriendsFeed';

interface MindHubProps {
  state: AppState;
}

const MindHub: React.FC<MindHubProps> = ({ state }) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'community' | 'tools'>('community');

  const tools = [
    { id: 'journal', label: 'Journal', icon: <JournalIcon />, path: '/journal', color: 'bg-blue-500/10 text-blue-500' },
    { id: '555', label: '5-5-5 Ritual', icon: <Ritual555Icon />, path: '/555', color: 'bg-purple-500/10 text-purple-500' },
    { id: '369', label: '3-6-9 Method', icon: <Ritual369Icon />, path: '/369', color: 'bg-amber-500/10 text-amber-500' },
    { id: 'release', label: 'Ho\'oponopono', icon: <ReleaseIcon />, path: '/release', color: 'bg-teal-500/10 text-teal-500' },
    { id: 'beliefs', label: 'Reframer', icon: <ReframerIcon />, path: '/beliefs', color: 'bg-rose-500/10 text-rose-500' },
    { id: 'visualize', label: 'Visualize', icon: <VisualizeIcon />, path: '/visualize', color: 'bg-accent-secondary/10 text-accent-secondary' },
    { id: '1111', label: '11:11 Alarm', icon: <SparkleIcon />, path: '/manifest-1111', color: 'bg-yellow-500/10 text-yellow-500' },
  ];

  return (
    <div className="space-y-6 pb-24">
      <header className="mb-2 sticky top-0 z-30 bg-surface-base/80 dark:bg-darkSurface-base/80 backdrop-blur-md pt-4 pb-2 -mx-4 px-4 border-b border-card-border">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-serif text-textPrimary-light dark:text-textPrimary-dark font-bold">Mind Hub</h1>
            <p className="text-textSecondary-light dark:text-textSecondary-dark text-sm">Community & Tools</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex p-1 bg-surface-muted dark:bg-darkSurface-base rounded-xl border border-card-border">
          <button
            onClick={() => setActiveTab('community')}
            className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${
              activeTab === 'community' 
                ? 'bg-surface-elevated dark:bg-darkSurface-elevated text-textPrimary-light dark:text-textPrimary-dark shadow-sm border border-card-border' 
                : 'text-textSecondary-light dark:text-textSecondary-dark hover:text-textPrimary-light dark:hover:text-textPrimary-dark'
            }`}
          >
            Community
          </button>
          <button
            onClick={() => setActiveTab('tools')}
            className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${
              activeTab === 'tools' 
                ? 'bg-surface-elevated dark:bg-darkSurface-elevated text-textPrimary-light dark:text-textPrimary-dark shadow-sm border border-card-border' 
                : 'text-textSecondary-light dark:text-textSecondary-dark hover:text-textPrimary-light dark:hover:text-textPrimary-dark'
            }`}
          >
            Toolkit
          </button>
        </div>
      </header>

      {activeTab === 'community' ? (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {/* Momentum Circles */}
          <section>
            <CircleFeed />
          </section>

          {/* Path of Positivity (Friends) */}
          <section>
            <FriendsFeed />
          </section>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {tools.map((tool) => (
            <button
              key={tool.id}
              onClick={() => navigate(tool.path)}
              className="flex flex-col items-center justify-center p-6 rounded-3xl bg-surface-elevated dark:bg-darkSurface-elevated border border-card-border hover:shadow-md transition-all active:scale-95 shadow-sm group"
            >
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-3 transition-transform group-hover:scale-110 ${tool.color}`}>
                <div className="w-6 h-6">{tool.icon}</div>
              </div>
              <span className="text-sm font-bold text-textPrimary-light dark:text-textPrimary-dark">{tool.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default MindHub;
