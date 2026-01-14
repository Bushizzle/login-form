import type { AuthResult } from './types';

export async function signIn(email: string, password: string): Promise<AuthResult> {
  try {
    const url = `${import.meta.env.BASE_URL}api/auth/sign-in`;
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const data = (await response.json().catch(() => null)) as AuthResult | null;

    if (response.ok) {
      return { success: true };
    }

    if (data && typeof data === 'object' && 'success' in data && data.success === false) {
      if (data.error === 'INVALID_CREDENTIALS' || data.error === 'NETWORK_ERROR') {
        return { success: false, error: data.error };
      }
    }

    return { success: false, error: 'NETWORK_ERROR' };
  } catch {
    return { success: false, error: 'NETWORK_ERROR' };
  }
}


