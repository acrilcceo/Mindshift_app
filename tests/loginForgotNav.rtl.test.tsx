import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Login from '../src/pages/Login';

vi.mock('../src/context/AuthContext', async () => {
  return {
    useAuth: () => ({ currentUser: null, loading: false, login: async () => {} })
  };
});

describe('Forgot Password navigation interactions', () => {
  it('navigates to reset route on click', async () => {
    render(
      <MemoryRouter initialEntries={['/login']}>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/reset" element={<div data-testid="reset-route">Reset Route</div>} />
        </Routes>
      </MemoryRouter>
    );
    const user = userEvent.setup();
    const link = screen.getByRole('link', { name: /forgot password/i });
    await user.click(link);
    const reset = await screen.findByTestId('reset-route');
    expect(reset).toBeInTheDocument();
  });
});
