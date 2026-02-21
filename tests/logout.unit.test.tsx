import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { renderHook, act } from '@testing-library/react';
import { AuthProvider, useAuth } from '../src/context/AuthContext';

function setup() {
  const wrapper: React.FC<React.PropsWithChildren> = ({ children }) => (
    <AuthProvider>{children}</AuthProvider>
  );
  return renderHook(() => useAuth(), { wrapper });
}

describe('AuthContext logout', () => {
  it('clears currentUser and localStorage on logout', () => {
    const { result } = setup();

    act(() => {
      result.current.loginWithName('Tester');
    });

    expect(result.current.currentUser?.name).toBe('Tester');

    act(() => {
      result.current.logout();
    });

    expect(result.current.currentUser).toBeNull();
    expect(window.localStorage.getItem('mindshift_user_name')).toBeNull();
  });
});
