import { useState, useCallback } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { signIn } from 'shared/api/auth';
import { credentialsSchema, type CredentialsFormData } from './schema';
import type { SignInState } from './types';

interface UseSignInFormReturn {
  register: ReturnType<typeof useForm<CredentialsFormData>>['register'];
  handleSubmit: ReturnType<typeof useForm<CredentialsFormData>>['handleSubmit'];
  formState: ReturnType<typeof useForm<CredentialsFormData>>['formState'];
  control: ReturnType<typeof useForm<CredentialsFormData>>['control'];
  state: SignInState;
  onSubmit: (data: CredentialsFormData) => Promise<void>;
  clearError: () => void;
}

export function useSignInForm(): UseSignInFormReturn {
  const [state, setState] = useState<SignInState>({
    isLoading: false,
    error: null,
  });

  const form = useForm<CredentialsFormData>({
    resolver: zodResolver(credentialsSchema),
    mode: 'onBlur',
    reValidateMode: 'onBlur',
  });

  const clearError = useCallback((): void => {
    setState((prev) => ({ ...prev, error: null }));
  }, []);

  const onSubmit = useCallback(
    async (data: CredentialsFormData): Promise<void> => {
      setState({ isLoading: true, error: null });

      try {
        const result = await signIn(data.email, data.password);

        if (result.success) {
          setState({ isLoading: false, error: null });
        } else {
          setState({ isLoading: false, error: result.error });
        }
      } catch {
        setState({ isLoading: false, error: 'NETWORK_ERROR' });
      }
    },
    []
  );

  return {
    register: form.register,
    handleSubmit: form.handleSubmit,
    formState: form.formState,
    control: form.control,
    state,
    onSubmit,
    clearError,
  };
}

