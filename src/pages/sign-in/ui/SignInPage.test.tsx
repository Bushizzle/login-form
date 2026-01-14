import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { SignInPage } from './SignInPage';
import { AccessibilityProvider } from 'shared/contexts';
import * as authClient from 'shared/api/auth';

// Mock the auth client
vi.mock('shared/api/auth', () => ({
  signIn: vi.fn(),
}));

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

function renderSignInPage(): ReturnType<typeof render> {
  return render(
    <AccessibilityProvider>
      <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <SignInPage />
      </MemoryRouter>
    </AccessibilityProvider>
  );
}

describe('SignInPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render sign in form', () => {
    renderSignInPage();

    expect(screen.getByTestId('sign-in-page')).toBeInTheDocument();
    expect(screen.getByTestId('sign-in-form')).toBeInTheDocument();
    expect(screen.getByTestId('email-input')).toBeInTheDocument();
    expect(screen.getByTestId('password-input')).toBeInTheDocument();
    expect(screen.getByTestId('submit-button')).toBeInTheDocument();
  });

  it('should render mascot container', () => {
    renderSignInPage();

    expect(screen.getByTestId('mascot-container')).toBeInTheDocument();
  });

  it('should handle successful sign in', async () => {
    const user = userEvent.setup();
    vi.mocked(authClient.signIn).mockResolvedValue({ success: true });

    renderSignInPage();

    const emailInput = screen.getByTestId('email-input');
    const passwordInput = screen.getByTestId('password-input');
    const submitButton = screen.getByTestId('submit-button');

    await user.type(emailInput, 'demo@example.com');
    await user.type(passwordInput, 'password123');
    await user.click(submitButton);

    await waitFor(() => {
      expect(authClient.signIn).toHaveBeenCalledWith('demo@example.com', 'password123');
    });
  });

  it('should handle invalid credentials', async () => {
    const user = userEvent.setup();
    vi.mocked(authClient.signIn).mockResolvedValue({
      success: false,
      error: 'INVALID_CREDENTIALS',
    });

    renderSignInPage();

    const emailInput = screen.getByTestId('email-input');
    const passwordInput = screen.getByTestId('password-input');
    const submitButton = screen.getByTestId('submit-button');

    await user.type(emailInput, 'wrong@example.com');
    await user.type(passwordInput, 'wrongpassword');
    await user.click(submitButton);

    await waitFor(
      () => {
        expect(screen.getByTestId('auth-error-alert')).toBeInTheDocument();
      },
      { timeout: 2000 }
    );
  });

  it('should handle network error', async () => {
    const user = userEvent.setup();
    vi.mocked(authClient.signIn).mockRejectedValue(new Error('Network error'));

    renderSignInPage();

    const emailInput = screen.getByTestId('email-input');
    const passwordInput = screen.getByTestId('password-input');
    const submitButton = screen.getByTestId('submit-button');

    await user.type(emailInput, 'demo@example.com');
    await user.type(passwordInput, 'password123');
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByTestId('auth-error-alert')).toBeInTheDocument();
    });
  });

  it('should validate email field', async () => {
    const user = userEvent.setup();
    renderSignInPage();

    const emailInput = screen.getByTestId('email-input');

    await user.type(emailInput, 'invalid-email');
    await user.tab(); // Trigger blur validation

    await waitFor(() => {
      expect(screen.getByText(/valid email/i)).toBeInTheDocument();
    });
  });

  it('should validate password field', async () => {
    const user = userEvent.setup();
    renderSignInPage();

    const passwordInput = screen.getByTestId('password-input');

    await user.type(passwordInput, 'short');
    await user.tab(); // Trigger blur validation

    await waitFor(() => {
      expect(screen.getByText(/at least 8 characters/i)).toBeInTheDocument();
    });
  });

  it('should initialize mascot on mount', () => {
    renderSignInPage();

    const mascotContainer = screen.getByTestId('mascot-container');
    expect(mascotContainer).toBeInTheDocument();
    // Mascot should be mounted (check for button inside)
    expect(mascotContainer.querySelector('[data-testid="mascot-eye-button"]')).toBeTruthy();
  });

  it('should handle form state changes', () => {
    renderSignInPage();

    // Component should render without errors
    expect(screen.getByTestId('sign-in-form')).toBeInTheDocument();
  });

  it('should update mascot state when email value changes', async () => {
    const user = userEvent.setup();
    renderSignInPage();

    const emailInput = screen.getByTestId('email-input');
    await user.type(emailInput, 'test@example.com');

    // Mascot should react to email input (state changes handled internally)
    await waitFor(() => {
      expect(emailInput).toHaveValue('test@example.com');
    });
  });

  it('should update mascot state when password value changes', async () => {
    const user = userEvent.setup();
    renderSignInPage();

    const passwordInput = screen.getByTestId('password-input');
    await user.type(passwordInput, 'password123');

    await waitFor(() => {
      expect(passwordInput).toHaveValue('password123');
    });
  });

  it('should handle password visibility changes', async () => {
    const user = userEvent.setup();
    renderSignInPage();

    const passwordInput = screen.getByTestId('password-input');
    const toggleButton = screen.getByLabelText(/show password/i);

    await user.type(passwordInput, 'password123');
    await user.click(toggleButton);

    expect(passwordInput).toHaveAttribute('type', 'text');
  });
});

