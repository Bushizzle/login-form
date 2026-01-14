/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

interface AccessibilitySettings {
  fontSize: 'normal' | 'large' | 'xlarge';
  contrast: 'normal' | 'high';
  darkMode: 'auto' | 'light' | 'dark';
}

interface AccessibilityContextValue {
  settings: AccessibilitySettings;
  updateSettings: (updates: Partial<AccessibilitySettings>) => void;
}

const defaultSettings: AccessibilitySettings = {
  fontSize: 'normal',
  contrast: 'normal',
  darkMode: 'auto',
};

const AccessibilityContext = createContext<AccessibilityContextValue | undefined>(undefined);

export function AccessibilityProvider({ children }: { children: ReactNode }): JSX.Element {
  const [settings, setSettings] = useState<AccessibilitySettings>(() => {
    // Load from localStorage if available
    const saved = localStorage.getItem('accessibility-settings');
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as Partial<AccessibilitySettings>;
        return { ...defaultSettings, ...parsed };
      } catch {
        return defaultSettings;
      }
    }
    return defaultSettings;
  });

  const updateSettings = (updates: Partial<AccessibilitySettings>): void => {
    setSettings((prev) => {
      const newSettings = { ...prev, ...updates };
      localStorage.setItem('accessibility-settings', JSON.stringify(newSettings));
      return newSettings;
    });
  };

  // Apply settings to document
  useEffect(() => {
    const root = document.documentElement;

    // Font size
    root.classList.remove('font-size-normal', 'font-size-large', 'font-size-xlarge');
    root.classList.add(`font-size-${settings.fontSize}`);

    // Contrast
    root.classList.remove('contrast-normal', 'contrast-high');
    root.classList.add(`contrast-${settings.contrast}`);

    // Dark mode
    root.classList.remove('theme-auto', 'theme-light', 'theme-dark');
    root.classList.add(`theme-${settings.darkMode}`);
  }, [settings]);

  return (
    <AccessibilityContext.Provider value={{ settings, updateSettings }}>
      {children}
    </AccessibilityContext.Provider>
  );
}

export function useAccessibility(): AccessibilityContextValue {
  const context = useContext(AccessibilityContext);
  if (context === undefined) {
    throw new Error('useAccessibility must be used within AccessibilityProvider');
  }
  return context;
}

