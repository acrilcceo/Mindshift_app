export function mapFirebaseAuthError(error: unknown): string {
  const anyError = error as { code?: string; message?: string } | null | undefined;
  const code = anyError?.code || '';

  if (code === 'auth/api-key-not-valid') {
    return 'Configuration error. Please contact admin.';
  }

  if (code === 'auth/email-already-in-use') {
    return 'Email already registered.';
  }

  if (code === 'auth/weak-password') {
    return 'Password must be at least 6 characters.';
  }

  if (code === 'auth/invalid-credential' || code === 'auth/invalid-login-credentials') {
    return 'Invalid credentials. Please check your details and try again.';
  }

  if (code === 'auth/user-not-found') {
    return 'No account found for these details.';
  }

  if (code === 'auth/wrong-password') {
    return 'Incorrect password. Please try again.';
  }

  if (code === 'auth/too-many-requests') {
    return 'Too many attempts. Please wait a moment and try again.';
  }

  return 'Something went wrong. Please try again.';
}

