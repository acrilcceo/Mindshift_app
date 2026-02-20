import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ResetPassword from '../src/pages/ResetPassword';

vi.mock('firebase/auth', async () => {
  return {
    sendPasswordResetEmail: vi.fn().mockResolvedValue({})
  };
});

vi.mock('../src/firebase/firebaseConfig', async () => {
  return {
    configured: true,
    auth: {}
  };
});

describe('ResetPassword interactions', () => {
  it('shows success message after sending reset with User ID', async () => {
    render(
      <MemoryRouter initialEntries={['/reset']}>
        <ResetPassword />
      </MemoryRouter>
    );
    const user = userEvent.setup();
    const userIdInput = screen.getAllByPlaceholderText('6–20 alphanumeric')[0];
    await user.type(userIdInput, 'abc12345');
    const submit = screen.getAllByLabelText('Send password reset email')[0];
    await user.click(submit);
    const statuses = await screen.findAllByRole('status').catch(() => []);
    const hasSuccess = statuses.some((el) =>
      el.textContent?.toLowerCase().includes('email sent')
    );
    expect(hasSuccess).toBe(true);
  });

  it('shows error message when reset fails', async () => {
    const mod = await import('firebase/auth');
    (mod.sendPasswordResetEmail as any).mockRejectedValueOnce({ message: 'Failed to send' });
    render(
      <MemoryRouter initialEntries={['/reset']}>
        <ResetPassword />
      </MemoryRouter>
    );
    const user = userEvent.setup();
    const userIdInput = screen.getAllByPlaceholderText('6–20 alphanumeric')[0];
    await user.type(userIdInput, 'abc12345');
    const submit = screen.getAllByLabelText('Send password reset email')[0];
    await user.click(submit);
    const alerts = await screen.findAllByRole('alert').catch(() => []);
    const hasError = alerts.some((el) =>
      el.textContent?.toLowerCase().includes('something went wrong')
    );
    expect(hasError).toBe(true);
  });
});
