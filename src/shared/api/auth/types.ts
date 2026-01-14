export type AuthResult =
  | { success: true }
  | { success: false; error: 'INVALID_CREDENTIALS' | 'NETWORK_ERROR' };


