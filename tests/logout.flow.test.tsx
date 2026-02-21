import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AuthProvider } from '../src/context/AuthContext';
import ProtectedRoute from '../src/routes/ProtectedRoute';
import DashboardPage from '../src/pages/Dashboard';
import Login from '../src/pages/Login';

describe('Logout flow', () => {
  it('logs out, clears user, redirects to login, and shows message', async () => {
    window.localStorage.setItem('mindshift_user_name', 'FlowTester');

    render(
      <AuthProvider>
        <MemoryRouter initialEntries={['/dashboard']}>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route element={<ProtectedRoute />}>
              <Route path="/dashboard" element={<DashboardPage />} />
            </Route>
          </Routes>
        </MemoryRouter>
      </AuthProvider>
    );

    const user = userEvent.setup();

    const profileTab = await screen.findByRole('button', { name: /profile settings/i });
    await user.click(profileTab);

    const logoutButton = await screen.findByRole('button', { name: /log out of mindshift/i });
    await user.click(logoutButton);

    const message = await screen.findByText(/you have been logged out/i);
    expect(message).toBeTruthy();
    expect(window.localStorage.getItem('mindshift_user_name')).toBeNull();
  });
});

