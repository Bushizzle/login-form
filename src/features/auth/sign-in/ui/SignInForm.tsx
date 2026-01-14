import { useRef, useEffect, useCallback } from 'react';
import type { UseFormRegister, UseFormHandleSubmit, UseFormStateReturn } from 'react-hook-form';
import { TextField, PasswordField, Button, Alert } from 'shared/ui';
import type { CredentialsFormData } from '../model/schema';
import type { SignInState } from '../model/types';
import styles from './SignInForm.module.pcss';

interface SignInFormProps {
  register: UseFormRegister<CredentialsFormData>;
  handleSubmit: UseFormHandleSubmit<CredentialsFormData>;
  formState: UseFormStateReturn<CredentialsFormData>;
  state: SignInState;
  onSubmit: (data: CredentialsFormData) => Promise<void>;
  clearError: () => void;
  onPasswordVisibilityChange?: (visible: boolean) => void;
  onEmailInputRef?: (ref: HTMLInputElement | null) => void;
  onPasswordInputRef?: (ref: HTMLInputElement | null) => void;
  onEmailFocus?: () => void;
  onEmailBlur?: () => void;
  onPasswordFocus?: () => void;
  onPasswordBlur?: () => void;
}

export function SignInForm({
  register,
  handleSubmit,
  formState,
  state,
  onSubmit,
  clearError,
  onPasswordVisibilityChange,
  onEmailInputRef,
  onPasswordInputRef,
  onEmailFocus,
  onEmailBlur,
  onPasswordFocus,
  onPasswordBlur,
}: SignInFormProps): JSX.Element {
  const globalErrorRef = useRef<HTMLDivElement>(null);
  const emailInputRef = useRef<HTMLInputElement | null>(null);
  const passwordInputRef = useRef<HTMLInputElement | null>(null);
  const emailError = formState.errors.email?.message;
  const passwordError = formState.errors.password?.message;

  const emailRegister = register('email');
  const passwordRegister = register('password');

  const { onBlur: onEmailRhfBlur, ...emailRegisterRest } = emailRegister;
  const { onBlur: onPasswordRhfBlur, ...passwordRegisterRest } = passwordRegister;

  const emailRefCallback = useCallback(
    (element: HTMLInputElement | null) => {
      emailInputRef.current = element;
      const registerRef = emailRegister.ref;
      if (typeof registerRef === 'function') {
        registerRef(element);
      } else if (registerRef && 'current' in registerRef) {
         
        (registerRef as { current: HTMLInputElement | null }).current = element;
      }
      onEmailInputRef?.(element);
    },
    [emailRegister, onEmailInputRef]
  );

  const passwordRefCallback = useCallback(
    (element: HTMLInputElement | null) => {
      passwordInputRef.current = element;
      const registerRef = passwordRegister.ref;
      if (typeof registerRef === 'function') {
        registerRef(element);
      } else if (registerRef && 'current' in registerRef) {
         
        (registerRef as { current: HTMLInputElement | null }).current = element;
      }
      onPasswordInputRef?.(element);
    },
    [passwordRegister, onPasswordInputRef]
  );

  useEffect(() => {
    if (formState.isSubmitted && !formState.isValid) {
      const firstErrorField = emailError ? emailInputRef.current : passwordInputRef.current;
      if (firstErrorField) {
        firstErrorField.focus();
      }
    }
  }, [formState.isSubmitted, formState.isValid, emailError]);

  useEffect(() => {
    if (state.error && globalErrorRef.current) {
      globalErrorRef.current.focus();
    }
  }, [state.error]);

  const handleFormSubmit = handleSubmit((data) => {
    void onSubmit(data);
  });

  const handleSubmitWrapper = (e: React.FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    void handleFormSubmit(e);
  };

  return (
    <form onSubmit={handleSubmitWrapper} className={styles.form} noValidate data-testid="sign-in-form">
      {state.isSuccess && !state.error && (
        <Alert variant="success" className={styles.alert} data-testid="auth-success-alert">
          Signed in successfully.
        </Alert>
      )}
      {state.error && (
        <Alert
          variant="error"
          className={styles.alert}
          ref={globalErrorRef}
          tabIndex={-1}
          data-testid="auth-error-alert"
        >
          {state.error === 'INVALID_CREDENTIALS'
            ? 'Invalid email or password. Please try again.'
            : 'Network error. Please check your connection and try again.'}
        </Alert>
      )}

      <TextField
        label="Email"
        type="email"
        inputMode="email"
        autoComplete="email"
        error={emailError}
        required
        disabled={state.isLoading}
        onFocus={() => {
          clearError();
          onEmailFocus?.();
        }}
        onBlur={(e) => {
          void onEmailRhfBlur(e);
          onEmailBlur?.();
        }}
        data-testid="email-input"
        {...emailRegisterRest}
        ref={emailRefCallback}
      />

      <PasswordField
        label="Password"
        autoComplete="current-password"
        error={passwordError}
        required
        disabled={state.isLoading}
        onFocus={() => {
          clearError();
          onPasswordFocus?.();
        }}
        onBlur={(e) => {
          void onPasswordRhfBlur(e);
          onPasswordBlur?.();
        }}
        onVisibilityChange={onPasswordVisibilityChange}
        data-testid="password-input"
        {...passwordRegisterRest}
        ref={passwordRefCallback}
      />

      <Button
        type="submit"
        isLoading={state.isLoading}
        disabled={state.isLoading}
        className={styles.submitButton}
        data-testid="submit-button"
      >
        {state.isLoading ? 'Signing in...' : 'Sign in'}
      </Button>
    </form>
  );
}

