import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import { AccessibilityProvider, useAccessibility } from './AccessibilityContext';
import { useState } from 'react';

// Test component that uses the context
function TestComponent(): JSX.Element {
  const { settings, updateSettings } = useAccessibility();
  const [clicked, setClicked] = useState(false);

  return (
    <div>
      <div data-testid="font-size">{settings.fontSize}</div>
      <div data-testid="contrast">{settings.contrast}</div>
      <div data-testid="dark-mode">{settings.darkMode}</div>
      <button
        onClick={() => {
          updateSettings({ fontSize: 'large' });
          setClicked(true);
        }}
      >
        Update
      </button>
      {clicked && <div data-testid="updated">Updated</div>}
    </div>
  );
}

describe('AccessibilityContext', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  afterEach(() => {
    localStorage.clear();
    document.documentElement.className = '';
  });

  it('should provide default settings', () => {
    render(
      <AccessibilityProvider>
        <TestComponent />
      </AccessibilityProvider>
    );

    expect(screen.getByTestId('font-size')).toHaveTextContent('normal');
    expect(screen.getByTestId('contrast')).toHaveTextContent('normal');
    expect(screen.getByTestId('dark-mode')).toHaveTextContent('auto');
  });

  it('should load settings from localStorage', () => {
    localStorage.setItem(
      'accessibility-settings',
      JSON.stringify({ fontSize: 'xlarge', contrast: 'high' })
    );

    render(
      <AccessibilityProvider>
        <TestComponent />
      </AccessibilityProvider>
    );

    expect(screen.getByTestId('font-size')).toHaveTextContent('xlarge');
    expect(screen.getByTestId('contrast')).toHaveTextContent('high');
    expect(screen.getByTestId('dark-mode')).toHaveTextContent('auto'); // default
  });

  it('should update settings and persist to localStorage', () => {
    render(
      <AccessibilityProvider>
        <TestComponent />
      </AccessibilityProvider>
    );

    const button = screen.getByText('Update');
    act(() => {
      button.click();
    });

    expect(screen.getByTestId('font-size')).toHaveTextContent('large');
    expect(screen.getByTestId('updated')).toBeInTheDocument();

    // Check localStorage
    const saved = localStorage.getItem('accessibility-settings');
    expect(saved).toBeTruthy();
    if (saved) {
      const parsed = JSON.parse(saved) as { fontSize?: string };
      expect(parsed.fontSize).toBe('large');
    }
  });

  it('should apply CSS classes to document element', () => {
    render(
      <AccessibilityProvider>
        <TestComponent />
      </AccessibilityProvider>
    );

    const button = screen.getByText('Update');
    act(() => {
      button.click();
    });

    expect(document.documentElement.classList.contains('font-size-large')).toBe(true);
  });

  it('should handle invalid localStorage data gracefully', () => {
    localStorage.setItem('accessibility-settings', 'invalid json');

    render(
      <AccessibilityProvider>
        <TestComponent />
      </AccessibilityProvider>
    );

    // Should fall back to defaults
    expect(screen.getByTestId('font-size')).toHaveTextContent('normal');
  });

  it('should throw error when used outside provider', () => {
    // Suppress console.error for this test
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    expect(() => {
      render(<TestComponent />);
    }).toThrow('useAccessibility must be used within AccessibilityProvider');

    consoleSpy.mockRestore();
  });

  it('should update all settings types', () => {
    render(
      <AccessibilityProvider>
        <TestComponent />
      </AccessibilityProvider>
    );

    const button = screen.getByText('Update');
    act(() => {
      button.click();
    });

    // Verify all settings are accessible
    expect(screen.getByTestId('font-size')).toHaveTextContent('large');
    expect(screen.getByTestId('contrast')).toBeInTheDocument();
    expect(screen.getByTestId('dark-mode')).toBeInTheDocument();
  });

  it('should persist settings across renders', () => {
    const { unmount } = render(
      <AccessibilityProvider>
        <TestComponent />
      </AccessibilityProvider>
    );

    const button = screen.getByText('Update');
    act(() => {
      button.click();
    });

    unmount();

    // Re-render and check persistence
    render(
      <AccessibilityProvider>
        <TestComponent />
      </AccessibilityProvider>
    );

    expect(screen.getByTestId('font-size')).toHaveTextContent('large');
  });
});
