import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button, Input } from '../components/ui';
import { useToast } from '../context/ToastContext';
import { forgotPassword } from '../api/auth';

const ResetPassword: React.FC = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const { success, error: showError } = useToast();

  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!emailValid) {
      showError('Please enter a valid email address');
      return;
    }

    setLoading(true);
    try {
      const response = await forgotPassword(email);
      
      if (response.success) {
        setSubmitted(true);
        success('If an account exists with this email, you will receive a password reset link.');
      } else {
        // Still show success to prevent email enumeration
        setSubmitted(true);
        success('If an account exists with this email, you will receive a password reset link.');
      }
    } catch (err) {
      showError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-primary transition-colors duration-500 px-4">
      {/* Background */}
      <div 
        className="fixed inset-0 z-0"
        style={{
          background: `
            radial-gradient(circle at 50% 30%, var(--bg-gradient-start), transparent 40%),
            radial-gradient(circle at 50% 70%, var(--bg-gradient-end), transparent 45%),
            var(--bg-primary)
          `
        }}
      />

      <div className="relative z-10 w-full max-w-md">
        {/* Back to login */}
        <Link 
          to="/login" 
          className="inline-flex items-center gap-2 text-sm text-muted hover:text-primary transition-colors mb-6"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to login
        </Link>

        <div className="card-base p-8 sm:p-10 rounded-[2rem] space-y-6 animate-fade-in">
          {/* Header */}
          <div className="text-center space-y-3">
            <Link to="/" className="inline-flex items-center justify-center gap-3 group">
              <div className="w-12 h-12 rounded-2xl bg-accent-primary flex items-center justify-center text-btn-primary font-bold text-2xl shadow-lg shadow-accent-glow transition-transform group-hover:scale-105">
                M
              </div>
            </Link>
            <h1 className="text-2xl font-serif text-primary font-bold">Reset Password</h1>
            <p className="text-sm text-muted">
              {submitted 
                ? "Check your email for reset instructions" 
                : "Enter your email and we'll send you a reset link"}
            </p>
          </div>

          {!submitted ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                type="email"
                label="Email Address"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                autoComplete="email"
                leftIcon={
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                }
              />

              <Button
                type="submit"
                variant="primary"
                fullWidth
                loading={loading}
                size="lg"
                disabled={!emailValid}
              >
                Send Reset Link
              </Button>
            </form>
          ) : (
            <div className="text-center space-y-4">
              <div className="w-16 h-16 mx-auto rounded-full bg-green-500/10 flex items-center justify-center">
                <svg className="w-8 h-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="text-sm text-secondary">
                We've sent password reset instructions to <strong className="text-primary">{email}</strong>
              </p>
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  setSubmitted(false);
                  setEmail('');
                }}
              >
                Try another email
              </Button>
            </div>
          )}

          {/* Back to login link */}
          <div className="text-center text-sm text-secondary">
            Remember your password?{' '}
            <Link
              to="/login"
              className="font-semibold text-accent-primary hover:text-accent-primary/80 transition-colors"
            >
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
