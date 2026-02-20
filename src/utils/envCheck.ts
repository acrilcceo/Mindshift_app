type FirebaseEnvCheckResult = {
  ok: boolean;
  missing: string[];
};

export function validateFirebaseEnv(): FirebaseEnvCheckResult {
  const requiredVars = [
    'VITE_FIREBASE_API_KEY',
    'VITE_FIREBASE_PROJECT_ID',
    'VITE_FIREBASE_APP_ID'
  ];

  const missing = requiredVars.filter((key) => {
    const value = (import.meta.env as any)[key];
    return !value || String(value).trim().length === 0;
  });

  if (import.meta.env.DEV && missing.length > 0) {
    console.error('[env] Missing Firebase environment variables', { missing });
  }

  return {
    ok: missing.length === 0,
    missing
  };
}
