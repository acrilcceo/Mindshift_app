import { describe, it, expect } from 'vitest';
import React from 'react';
import { render } from '@testing-library/react';
import { act } from 'react-dom/test-utils';
import { AuthProvider, useAuth } from '../src/context/AuthContext';

type AuthContextValue = ReturnType<typeof useAuth>;

function setup() {
  const ref: { current: AuthContextValue | null } = { current: null };

  const Capture: React.FC = () => {
    ref.current = useAuth();
    return null;
  };

  render(
    <AuthProvider>
      <Capture />
    </AuthProvider>
  );

  if (!ref.current) {
    throw new Error('Auth context not captured');
  }

  return ref;
}

describe('AuthContext logout', () => {
  it('clears currentUser and localStorage on logout', () => {
    const ref = setup();

    act(() => {
      ref.current!.loginWithName('Tester');
    });

    expect(ref.current!.currentUser?.name).toBe('Tester');

    act(() => {
      ref.current!.logout();
    });

    expect(ref.current!.currentUser).toBeNull();
    expect(window.localStorage.getItem('mindshift_user_name')).toBeNull();
  });
});
