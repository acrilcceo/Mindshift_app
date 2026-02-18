import { signInWithPopup, signInWithRedirect, type Auth, type AuthProvider } from 'firebase/auth';

export async function googleLogin(auth: Auth, provider: AuthProvider): Promise<void> {
  try {
    await signInWithPopup(auth, provider);
    return;
  } catch (e: any) {
    const code = e?.code || '';
    const fallbackCodes = [
      'auth/popup-blocked',
      'auth/popup-closed-by-user',
      'auth/operation-not-supported-in-this-environment',
      'auth/internal-error'
    ];
    if (fallbackCodes.includes(code)) {
      await signInWithRedirect(auth, provider);
      return;
    }
    throw e;
  }
}
