import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AppState } from '../types';
import { 
  JournalIcon, 
  Ritual555Icon, 
  Ritual369Icon, 
  ReleaseIcon, 
  ReframerIcon, 
  VisualizeIcon 
} from '../components/Icons';

interface MindHubProps {
  state: AppState;
  onUpdate: (updates: Partial<AppState>) => void;
}

const MindHub: React.FC<MindHubProps> = ({ state }) => {
  const navigate = useNavigate();

  const tools = [
    { id: 'journal', label: 'Journal', icon: <JournalIcon />, path: '/journal', color: 'bg-blue-500/10 text-blue-500' },
    { id: '555', label: '5-5-5 Ritual', icon: <Ritual555Icon />, path: '/555', color: 'bg-purple-500/10 text-purple-500' },
    { id: '369', label: '3-6-9 Method', icon: <Ritual369Icon />, path: '/369', color: 'bg-amber-500/10 text-amber-500' },
    { id: 'release', label: 'Ho\'oponopono', icon: <ReleaseIcon />, path: '/release', color: 'bg-teal-500/10 text-teal-500' },
    { id: 'beliefs', label: 'Reframer', icon: <ReframerIcon />, path: '/beliefs', color: 'bg-rose-500/10 text-rose-500' },
    { id: 'visualize', label: 'Visualize', icon: <VisualizeIcon />, path: '/visualize', color: 'bg-indigo-500/10 text-indigo-500' },
  ];

  return (
    <div className="space-y-6 pb-20">
      <header className="mb-6">
        <h1 className="text-2xl font-serif text-primary font-bold">Mind Hub</h1>
        <p className="text-muted text-sm">Your toolkit for mental expansion.</p>
      </header>

      <div className="grid grid-cols-2 gap-4">
        {tools.map((tool) => (
          <button
            key={tool.id}
            onClick={() => navigate(tool.path)}
            className="flex flex-col items-center justify-center p-6 rounded-3xl glass-card border border-card-border hover:bg-card/80 transition-all active:scale-95 shadow-sm"
          >
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-3 ${tool.color}`}>
              <div className="w-6 h-6">{tool.icon}</div>
            </div>
            <span className="text-sm font-bold text-primary">{tool.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default MindHub;
