import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Loader } from '../components/ui';

const AuthSuccess: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { login } = useAuth();
  const { error: showError } = useToast();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get('token');
    const userParam = params.get('user');

    if (!token || !userParam) {
      showError('Authentication failed. Please try again.');
      navigate('/login', { replace: true });
      return;
    }

    try {
      const user = JSON.parse(decodeURIComponent(userParam));
      login(user, token);
      navigate('/home', { replace: true });
    } catch {
      showError('Authentication data was invalid. Please try again.');
      navigate('/login', { replace: true });
    }
  }, [location.search, login, navigate, showError]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-primary">
      <Loader size="lg" className="text-accent-primary" />
    </div>
  );
};

export default AuthSuccess;

