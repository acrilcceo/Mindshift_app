import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './routes/ProtectedRoute';
import Login from './pages/Login';
import ResetPassword from './pages/ResetPassword';
import { AppState, Theme } from './types';
import { loadState, saveState, storageGet } from './services/store';

// Layout
import DashboardLayout from './pages/Dashboard';

// Pages & Components
import Home from './pages/Home';
import FocusDashboard from './components/FocusDashboard';
import SoundShiftStudio from './components/SoundShiftStudio';
import BeliefReframer from './components/BeliefReframer';
import Tracker369 from './components/Tracker369';
import Module555 from './components/Module555';
import Hooponopono from './components/Hooponopono';
import Journaling from './components/Journaling';
import Visualization from './components/Visualization';
import ProfileSettings from './components/ProfileSettings';
import Marketplace from './components/Marketplace';
import GuidesPage from './pages/Guides';
import MindHub from './pages/MindHub';
import ServiceHub from './pages/ServiceHub';
import ManifestAlarm from './pages/ManifestAlarm';
import ManifestationModal from './components/ManifestationModal';
import { useManifestationTimer } from './hooks/useManifestationTimer';

// Wrapper to provide navigation helper to legacy components
const NavigationWrapper = ({ children }: { children: (onNavigate: (view: string) => void) => React.ReactNode }) => {
  const navigate = useNavigate();
  
  const handleNavigate = (view: string) => {
     const routes: Record<string, string> = {
        'dashboard': '/dashboard',
        'home': '/home',
        'soundshift': '/soundshift',
        'beliefs': '/beliefs',
        '369': '/369',
        '555': '/555',
        'release': '/release',
        'journal': '/journal',
        'visualize': '/visualize',
        'profile': '/profile',
        'marketplace': '/marketplace',
        'guides': '/guides'
     };
     navigate(routes[view] || '/' + view);
  };
  
  return <>{children(handleNavigate)}</>;
};

const AppContent: React.FC = () => {
  const [state, setState] = useState<AppState>(loadState());
  
  const handleUpdate = (updates: Partial<AppState>) => {
    setState(prev => ({ ...prev, ...updates }));
  };

  const { isModalOpen, setIsModalOpen } = useManifestationTimer(state, handleUpdate);
  
  const handleManifestationComplete = () => {
    const today = new Date().toISOString().split('T')[0];
    const lastDate = state.manifestationStreak?.lastDate;
    let newStreak = state.manifestationStreak?.count || 0;

    if (lastDate === today) return;

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayString = yesterday.toISOString().split('T')[0];

    if (lastDate === yesterdayString) {
      newStreak += 1;
    } else {
      newStreak = 1;
    }

    handleUpdate({
      manifestationStreak: {
        lastDate: today,
        count: newStreak
      }
    });
  };
  
  useEffect(() => {
    saveState(state);
    if (state.theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [state]);

  const toggleTheme = () => {
    const nextTheme: Theme = state.theme === 'dark' ? 'light' : 'dark';
    handleUpdate({ theme: nextTheme });
    const wt = (window as any).toggleTheme;
    if (typeof wt === 'function') wt();
  };

  return (
    <>
      {/* 11:11 Aura Effect */}
      <div 
        className={`fixed inset-0 pointer-events-none z-[90] transition-opacity ease-in-out ${
          isModalOpen ? 'opacity-100 duration-500' : 'opacity-0 duration-1000'
        }`}
        style={{
          background: state.theme === 'dark' 
            ? 'radial-gradient(circle at center, rgba(200,150,90,0.25), transparent 60%)'
            : 'radial-gradient(circle at center, rgba(212,165,116,0.15), transparent 60%)'
        }}
      />

      <ManifestationModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onComplete={handleManifestationComplete}
        settings={state.manifestationSettings || {
          enabled: false,
          timeAM: false,
          timePM: false,
          customAffirmation: "I am aligned with my highest purpose.",
          soundEnabled: true,
          ritualMode: 'quick'
        }}
      />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/reset" element={<ResetPassword />} />
        
        <Route element={<ProtectedRoute />}>
          <Route element={<DashboardLayout state={state} onToggleTheme={toggleTheme} />}>
            <Route path="/" element={<Navigate to="/home" replace />} />
            
            <Route path="/home" element={
              <NavigationWrapper>
                {(onNavigate) => <Home state={state} onUpdate={handleUpdate} onNavigate={onNavigate as any} />}
              </NavigationWrapper>
            } />
            
            <Route path="/dashboard" element={<FocusDashboard state={state} onUpdate={handleUpdate} />} />
            <Route path="/mind" element={<MindHub state={state} />} />
            <Route path="/manifest-1111" element={<ManifestAlarm state={state} onUpdate={handleUpdate} />} />
            <Route path="/services" element={<ServiceHub />} />
          
          <Route path="/soundshift" element={<SoundShiftStudio state={state} onUpdate={handleUpdate} />} />
          <Route path="/beliefs" element={<BeliefReframer state={state} onUpdate={handleUpdate} />} />
          <Route path="/369" element={<Tracker369 state={state} onUpdate={handleUpdate} />} />
          <Route path="/555" element={<Module555 state={state} onUpdate={handleUpdate} />} />
          <Route path="/visualize" element={<Visualization state={state} onUpdate={handleUpdate} />} />
          <Route path="/release" element={<Hooponopono state={state} onUpdate={handleUpdate} />} />
          <Route path="/journal" element={<Journaling state={state} onUpdate={handleUpdate} />} />
          <Route path="/profile" element={<ProfileSettings />} />
          <Route path="/marketplace" element={<Marketplace state={state} onUpdate={handleUpdate} />} />
          <Route path="/guides" element={<GuidesPage state={state} onUpdate={handleUpdate} />} />
        </Route>
      </Route>
      
      <Route path="*" element={<Navigate to="/home" replace />} />
    </Routes>
    </>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
