import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import type { UseFormRegister, UseFormHandleSubmit, UseFormStateReturn } from 'react-hook-form';
import { MemoryRouter } from 'react-router-dom';
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

  function renderForm(overrideProps?: Partial<typeof defaultProps>): ReturnType<typeof render> {
    return render(
      <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <SignInForm {...defaultProps} {...overrideProps} />
      </MemoryRouter>
    );
  }

  it('renders email and password fields', () => {
    renderForm();

    expect(screen.getByTestId('email-input')).toBeInTheDocument();
    expect(screen.getByTestId('password-input')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
    expect(screen.getByTestId('forgot-password-link')).toBeInTheDocument();
    expect(screen.getByTestId('social-google')).toBeInTheDocument();
    expect(screen.getByTestId('social-apple')).toBeInTheDocument();
    expect(screen.getByTestId('social-facebook')).toBeInTheDocument();
  });

  it('displays email error when present', () => {
    const formStateWithError: UseFormStateReturn<CredentialsFormData> = {
      ...mockFormState,
      errors: { email: { message: 'Invalid email', type: 'validation' } },
    };

    renderForm({ formState: formStateWithError });

    expect(screen.getByText('Invalid email')).toBeInTheDocument();
  });

  it('displays password error when present', () => {
    const formStateWithError: UseFormStateReturn<CredentialsFormData> = {
      ...mockFormState,
      errors: { password: { message: 'Password required', type: 'validation' } },
    };

    renderForm({ formState: formStateWithError });

    expect(screen.getByText('Password required')).toBeInTheDocument();
  });

  it('displays global error alert on auth failure', () => {
    const stateWithError: SignInState = {
      isLoading: false,
      error: 'INVALID_CREDENTIALS',
      isSuccess: false,
    };

    renderForm({ state: stateWithError });

    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.getByText(/invalid email or password/i)).toBeInTheDocument();
  });

  it('displays network error message', () => {
    const stateWithError: SignInState = {
      isLoading: false,
      error: 'NETWORK_ERROR',
      isSuccess: false,
    };

    renderForm({ state: stateWithError });

    expect(screen.getByText(/network error/i)).toBeInTheDocument();
  });

  it('shows loading state on submit button', () => {
    const loadingState: SignInState = {
      isLoading: true,
      error: null,
      isSuccess: false,
    };

    renderForm({ state: loadingState });

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

    renderForm({ state: successState });

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

    renderForm({ formState: formStateWithError });

    await waitFor(() => {
      const emailInput = screen.getByLabelText(/email/i);
      expect(emailInput).toHaveFocus();
    });
  });
});

