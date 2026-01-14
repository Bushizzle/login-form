import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import type { UseFormRegister, UseFormHandleSubmit, UseFormStateReturn } from 'react-hook-form';
import { SignInForm } from './SignInForm';
import type { CredentialsFormData } from '../model/schema';
import type { SignInState } from '../model/types';

const mockRegister = vi.fn((name: keyof CredentialsFormData) => {
  return {
    name,
    onChange: vi.fn(),
    onBlur: vi.fn(),
    ref: vi.fn(),
  };
}) as UseFormRegister<CredentialsFormData>;

const mockHandleSubmit = vi.fn((fn: (data: CredentialsFormData) => Promise<void>) => {
  return (e?: React.BaseSyntheticEvent) => {
    e?.preventDefault();
    return fn({ email: '', password: '' } as CredentialsFormData);
  };
}) as UseFormHandleSubmit<CredentialsFormData>;
const mockFormState: UseFormStateReturn<CredentialsFormData> = {
  errors: {},
  isDirty: false,
  isSubmitted: false,
  isSubmitSuccessful: false,
  isValid: true,
  isValidating: false,
  submitCount: 0,
  touchedFields: {},
  dirtyFields: {},
  defaultValues: undefined,
  isSubmitting: false,
  isLoading: false,
  disabled: false,
  validatingFields: {},
  isReady: true,
};

describe('SignInForm', () => {
  const defaultProps = {
    register: mockRegister,
    handleSubmit: mockHandleSubmit,
    formState: mockFormState,
    state: { isLoading: false, error: null, isSuccess: false } as SignInState,
    onSubmit: vi.fn(),
    clearError: vi.fn(),
  };

  it('renders email and password fields', () => {
    render(<SignInForm {...defaultProps} />);

    expect(screen.getByText(/email/i)).toBeInTheDocument();
    expect(screen.getByText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
  });

  it('displays email error when present', () => {
    const formStateWithError: UseFormStateReturn<CredentialsFormData> = {
      ...mockFormState,
      errors: { email: { message: 'Invalid email', type: 'validation' } },
    };

    render(<SignInForm {...defaultProps} formState={formStateWithError} />);

    expect(screen.getByText('Invalid email')).toBeInTheDocument();
  });

  it('displays password error when present', () => {
    const formStateWithError: UseFormStateReturn<CredentialsFormData> = {
      ...mockFormState,
      errors: { password: { message: 'Password required', type: 'validation' } },
    };

    render(<SignInForm {...defaultProps} formState={formStateWithError} />);

    expect(screen.getByText('Password required')).toBeInTheDocument();
  });

  it('displays global error alert on auth failure', () => {
    const stateWithError: SignInState = {
      isLoading: false,
      error: 'INVALID_CREDENTIALS',
      isSuccess: false,
    };

    render(<SignInForm {...defaultProps} state={stateWithError} />);

    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.getByText(/invalid email or password/i)).toBeInTheDocument();
  });

  it('displays network error message', () => {
    const stateWithError: SignInState = {
      isLoading: false,
      error: 'NETWORK_ERROR',
      isSuccess: false,
    };

    render(<SignInForm {...defaultProps} state={stateWithError} />);

    expect(screen.getByText(/network error/i)).toBeInTheDocument();
  });

  it('shows loading state on submit button', () => {
    const loadingState: SignInState = {
      isLoading: true,
      error: null,
      isSuccess: false,
    };

    render(<SignInForm {...defaultProps} state={loadingState} />);

    const submitButton = screen.getByRole('button', { name: /signing in/i });
    expect(submitButton).toBeDisabled();
    expect(submitButton).toHaveAttribute('type', 'submit');
  });

  it('displays success alert when sign in succeeds', () => {
    const successState: SignInState = {
      isLoading: false,
      error: null,
      isSuccess: true,
    };

    render(<SignInForm {...defaultProps} state={successState} />);

    expect(screen.getByTestId('auth-success-alert')).toBeInTheDocument();
    expect(screen.getByText(/signed in successfully/i)).toBeInTheDocument();
  });

  it('focuses first invalid field on submit', async () => {
    const formStateWithError: UseFormStateReturn<CredentialsFormData> = {
      ...mockFormState,
      isSubmitted: true,
      isValid: false,
      errors: { email: { message: 'Invalid email', type: 'validation' } },
    };

    render(<SignInForm {...defaultProps} formState={formStateWithError} />);

    await waitFor(() => {
      const emailInput = screen.getByLabelText(/email/i);
      expect(emailInput).toHaveFocus();
    });
  });
});

