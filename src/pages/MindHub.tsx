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
    { id: 'visualize', label: 'Visualize', icon: <VisualizeIcon />, path: '/visualize', color: 'bg-indigo-500/10 text-indigo-500' },
    { id: '1111', label: '11:11 Alarm', icon: <SparkleIcon />, path: '/manifest-1111', color: 'bg-yellow-500/10 text-yellow-500' },
  ];

  return (
    <div className="space-y-6 pb-24">
      <header className="mb-2 sticky top-0 z-30 bg-[#0F1115]/80 backdrop-blur-md pt-4 pb-2 -mx-4 px-4 border-b border-slate-300 dark:border-slate-700">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-serif text-slate-800 dark:text-slate-100 font-bold">Mind Hub</h1>
            <p className="text-slate-600 dark:text-slate-300 text-sm">Community & Tools</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex p-1 bg-white dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700">
          <button
            onClick={() => setActiveTab('community')}
            className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${
              activeTab === 'community' 
                ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm' 
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            Community
          </button>
          <button
            onClick={() => setActiveTab('tools')}
            className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${
              activeTab === 'tools' 
                ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm' 
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
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
              className="flex flex-col items-center justify-center p-6 rounded-3xl bg-white/5 border border-white/5 hover:bg-white/10 transition-all active:scale-95 shadow-sm group"
            >
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-3 transition-transform group-hover:scale-110 ${tool.color}`}>
                <div className="w-6 h-6">{tool.icon}</div>
              </div>
              <span className="text-sm font-bold text-white/90">{tool.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default MindHub;
