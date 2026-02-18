import { describe, it, expect, vi, beforeEach } from 'vitest';
import { googleLogin } from '../src/services/authService';

vi.mock('firebase/auth', async () => {
  return {
    signInWithPopup: vi.fn(),
    signInWithRedirect: vi.fn()
  };
});

const auth: any = {};
const provider: any = {};

describe('googleLogin', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
  it('uses popup when successful', async () => {
    const mod = await import('firebase/auth');
    (mod.signInWithPopup as any).mockResolvedValueOnce({});
    await googleLogin(auth, provider);
    expect(mod.signInWithPopup).toHaveBeenCalledTimes(1);
    expect(mod.signInWithRedirect).not.toHaveBeenCalled();
  });

  it('falls back to redirect on popup-blocked', async () => {
    const mod = await import('firebase/auth');
    (mod.signInWithPopup as any).mockRejectedValueOnce({ code: 'auth/popup-blocked' });
    (mod.signInWithRedirect as any).mockResolvedValueOnce({});
    await googleLogin(auth, provider);
    expect(mod.signInWithPopup).toHaveBeenCalledTimes(1);
    expect(mod.signInWithRedirect).toHaveBeenCalledTimes(1);
  });

  it('rethrows errors not eligible for fallback', async () => {
    const mod = await import('firebase/auth');
    (mod.signInWithPopup as any).mockRejectedValueOnce({ code: 'auth/invalid-api-key' });
    await expect(googleLogin(auth, provider)).rejects.toBeTruthy();
    expect(mod.signInWithRedirect).not.toHaveBeenCalled();
  });
});
