import { apiRequest, setAuthToken, removeAuthToken, getAuthToken } from './client';
import { API_ENDPOINTS } from './config';

export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  email: string;
  password: string;
  name?: string;
}

/**
 * Login with email and password
 */
export async function loginWithEmail(credentials: LoginCredentials) {
  const response = await apiRequest<AuthResponse>(API_ENDPOINTS.AUTH.LOGIN, {
    method: 'POST',
    body: credentials,
  });

  if (response.success && response.data?.token) {
    setAuthToken(response.data.token);
  }

  return response;
}

/**
 * Register new user with email and password
 */
export async function registerWithEmail(credentials: RegisterCredentials) {
  const response = await apiRequest<AuthResponse>(API_ENDPOINTS.AUTH.REGISTER, {
    method: 'POST',
    body: credentials,
  });

  if (response.success && response.data?.token) {
    setAuthToken(response.data.token);
  }

  return response;
}

/**
 * Authenticate with Google OAuth token
 */
export async function loginWithGoogle(idToken: string) {
  const response = await apiRequest<AuthResponse>(API_ENDPOINTS.AUTH.GOOGLE, {
    method: 'POST',
    body: { idToken },
  });

  if (response.success && response.data?.token) {
    setAuthToken(response.data.token);
  }

  return response;
}

/**
 * Get current authenticated user
 */
export async function getCurrentUser() {
  const token = getAuthToken();
  if (!token) {
    return { success: false, message: 'No auth token found' };
  }

  return apiRequest<User>(API_ENDPOINTS.AUTH.ME, {
    method: 'GET',
  });
}

/**
 * Logout user
 */
export async function logout() {
  const token = getAuthToken();
  
  if (token) {
    // Attempt to logout on server (fire and forget)
    apiRequest(API_ENDPOINTS.AUTH.LOGOUT, { method: 'POST' }).catch(() => {});
  }

  removeAuthToken();
  
  return { success: true };
}

/**
 * Request password reset email
 */
export async function forgotPassword(email: string) {
  return apiRequest(API_ENDPOINTS.AUTH.FORGOT_PASSWORD, {
    method: 'POST',
    body: { email },
  });
}

/**
 * Reset password with token
 */
export async function resetPassword(token: string, newPassword: string) {
  return apiRequest(API_ENDPOINTS.AUTH.RESET_PASSWORD, {
    method: 'POST',
    body: { token, newPassword },
  });
}

/**
 * Check if user is authenticated (has valid token)
 */
export function isAuthenticated(): boolean {
  return !!getAuthToken();
}
