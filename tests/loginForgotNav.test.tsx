import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { renderToString } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import Login from '../src/pages/Login';

vi.mock('../src/context/AuthContext', async () => {
  return {
    useAuth: () => ({ currentUser: null, loading: false, loginWithName: () => {} })
  };
});

describe('Login forgot password navigation', () => {
  it('renders a link to /reset', () => {
    const html = renderToString(
      <MemoryRouter initialEntries={['/login']}>
        <Login />
      </MemoryRouter>
    );
    expect(html.includes('href="/reset"')).toBe(true);
  });
});
