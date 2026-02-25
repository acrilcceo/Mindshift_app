
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './src/context/AuthContext';
import ProtectedRoute from './src/routes/ProtectedRoute';
import Login from './src/pages/Login';
import ResetPassword from './src/pages/ResetPassword';

const Dashboard = React.lazy(() => import('./src/pages/Dashboard'));

const App: React.FC = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/reset" element={<ResetPassword />} />
          <Route element={<ProtectedRoute />}>
            <Route
              path="/home"
              element={
                <React.Suspense
                  fallback={
                    <div className="min-h-screen flex items-center justify-center bg-primary">
                      <div className="text-secondary text-sm">Loading…</div>
                    </div>
                  }
                >
                  <Dashboard />
                </React.Suspense>
              }
            />
          </Route>
          <Route path="*" element={<Navigate to="/home" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
