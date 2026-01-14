import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Header } from './Header';
import { AccessibilityProvider } from 'shared/contexts';

function renderWithProvider(): ReturnType<typeof render> {
  return render(
    <AccessibilityProvider>
      <Header />
    </AccessibilityProvider>
  );
}

describe('Header', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.className = '';
  });

  it('should render header with title', () => {
    renderWithProvider();

    expect(screen.getByTestId('header')).toBeInTheDocument();
    expect(screen.getByTestId('header-title')).toHaveTextContent('Login Form');
  });

  it('should render accessibility menu button', () => {
    renderWithProvider();

    const button = screen.getByTestId('accessibility-menu-button');
    expect(button).toBeInTheDocument();
    expect(button).toHaveAttribute('aria-expanded', 'false');
  });

  it('should open menu on button click', async () => {
    const user = userEvent.setup();
    renderWithProvider();

    const button = screen.getByTestId('accessibility-menu-button');
    await user.click(button);

    expect(button).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByTestId('accessibility-menu')).toBeInTheDocument();
  });

  it('should close menu on outside click', async () => {
    const user = userEvent.setup();
    renderWithProvider();

    const button = screen.getByTestId('accessibility-menu-button');
    await user.click(button);

    expect(screen.getByTestId('accessibility-menu')).toBeInTheDocument();

    // Click outside
    await user.click(document.body);

    await waitFor(() => {
      expect(screen.queryByTestId('accessibility-menu')).not.toBeInTheDocument();
    });
  });

  it('should close menu on Escape key', async () => {
    const user = userEvent.setup();
    renderWithProvider();

    const button = screen.getByTestId('accessibility-menu-button');
    await user.click(button);

    expect(screen.getByTestId('accessibility-menu')).toBeInTheDocument();

    await user.keyboard('{Escape}');

    await waitFor(() => {
      expect(screen.queryByTestId('accessibility-menu')).not.toBeInTheDocument();
    });
    expect(button).toHaveFocus();
  });

  it('should display all menu sections when open', async () => {
    const user = userEvent.setup();
    renderWithProvider();

    const button = screen.getByTestId('accessibility-menu-button');
    await user.click(button);

    expect(screen.getByTestId('font-size-section')).toBeInTheDocument();
    expect(screen.getByTestId('contrast-section')).toBeInTheDocument();
    expect(screen.getByTestId('theme-section')).toBeInTheDocument();
  });

  it('should update font size setting', async () => {
    const user = userEvent.setup();
    renderWithProvider();

    const button = screen.getByTestId('accessibility-menu-button');
    await user.click(button);

    const largeOption = screen.getByTestId('font-size-large');
    await user.click(largeOption);

    expect(largeOption).toBeChecked();
  });

  it('should update contrast setting', async () => {
    const user = userEvent.setup();
    renderWithProvider();

    const button = screen.getByTestId('accessibility-menu-button');
    await user.click(button);

    const highOption = screen.getByTestId('contrast-high');
    await user.click(highOption);

    expect(highOption).toBeChecked();
  });

  it('should update theme setting', async () => {
    const user = userEvent.setup();
    renderWithProvider();

    const button = screen.getByTestId('accessibility-menu-button');
    await user.click(button);

    const darkOption = screen.getByTestId('theme-dark');
    await user.click(darkOption);

    expect(darkOption).toBeChecked();
  });

  it('should render all accessibility options', async () => {
    const user = userEvent.setup();
    renderWithProvider();

    const button = screen.getByTestId('accessibility-menu-button');
    await user.click(button);

    // Check all options are present
    expect(screen.getByTestId('font-size-normal')).toBeInTheDocument();
    expect(screen.getByTestId('font-size-large')).toBeInTheDocument();
    expect(screen.getByTestId('font-size-xlarge')).toBeInTheDocument();
    expect(screen.getByTestId('contrast-normal')).toBeInTheDocument();
    expect(screen.getByTestId('contrast-high')).toBeInTheDocument();
    expect(screen.getByTestId('theme-auto')).toBeInTheDocument();
    expect(screen.getByTestId('theme-light')).toBeInTheDocument();
    expect(screen.getByTestId('theme-dark')).toBeInTheDocument();
  });

  it('should allow switching between all accessibility options', async () => {
    const user = userEvent.setup();
    renderWithProvider();

    const button = screen.getByTestId('accessibility-menu-button');
    await user.click(button);

    // Font size
    const normalSize = screen.getByTestId('font-size-normal');
    const largeSize = screen.getByTestId('font-size-large');
    const xlargeSize = screen.getByTestId('font-size-xlarge');
    await user.click(largeSize);
    expect(largeSize).toBeChecked();
    await user.click(xlargeSize);
    expect(xlargeSize).toBeChecked();
    await user.click(normalSize);
    expect(normalSize).toBeChecked();

    // Contrast
    const normalContrast = screen.getByTestId('contrast-normal');
    const highContrast = screen.getByTestId('contrast-high');
    await user.click(highContrast);
    expect(highContrast).toBeChecked();
    await user.click(normalContrast);
    expect(normalContrast).toBeChecked();

    // Theme
    const autoTheme = screen.getByTestId('theme-auto');
    const lightTheme = screen.getByTestId('theme-light');
    const darkTheme = screen.getByTestId('theme-dark');
    await user.click(darkTheme);
    expect(darkTheme).toBeChecked();
    await user.click(lightTheme);
    expect(lightTheme).toBeChecked();
    await user.click(autoTheme);
    expect(autoTheme).toBeChecked();
  });

  it('should handle menu toggle correctly', async () => {
    const user = userEvent.setup();
    renderWithProvider();

    const button = screen.getByTestId('accessibility-menu-button');
    
    // Initially closed
    expect(button).toHaveAttribute('aria-expanded', 'false');
    expect(screen.queryByTestId('accessibility-menu')).not.toBeInTheDocument();

    // Open
    await user.click(button);
    expect(button).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByTestId('accessibility-menu')).toBeInTheDocument();

    // Close
    await user.click(button);
    expect(button).toHaveAttribute('aria-expanded', 'false');
    expect(screen.queryByTestId('accessibility-menu')).not.toBeInTheDocument();
  });
});
