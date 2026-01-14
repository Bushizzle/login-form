export type SignInError = 'INVALID_CREDENTIALS' | 'NETWORK_ERROR';

export interface SignInState {
  isLoading: boolean;
  error: SignInError | null;
  isSuccess: boolean;
}


