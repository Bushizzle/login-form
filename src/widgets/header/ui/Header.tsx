import { useState, useRef, useEffect } from 'react';
import { useAccessibility } from 'shared/contexts/AccessibilityContext';
import { SettingsIcon } from 'shared/ui';
import styles from './Header.module.pcss';

export function Header(): JSX.Element {
  const { settings, updateSettings } = useAccessibility();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const closeMenu = (options?: { restoreFocus?: boolean }): void => {
    const restoreFocus = options?.restoreFocus ?? false;
    const menu = menuRef.current;
    const wasFocusInside = Boolean(menu && menu.contains(document.activeElement));

    setIsMenuOpen(false);

    if (restoreFocus || wasFocusInside) {
      // Defer until after state update
      queueMicrotask(() => {
        buttonRef.current?.focus();
      });
    }
  };

  useEffect(() => {
    if (!isMenuOpen) {
      return;
    }

    const menu = menuRef.current;
    if (!menu) {
      return;
    }

    // Focus first focusable control for keyboard users
    const firstFocusable = menu.querySelector<HTMLElement>(
      'input, button, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    firstFocusable?.focus();
  }, [isMenuOpen]);

  useEffect(() => {
    if (!isMenuOpen) {
      return;
    }

    const handleClickOutside = (event: MouseEvent): void => {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        closeMenu();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMenuOpen]);

  useEffect(() => {
    if (!isMenuOpen) {
      return;
    }

    const handleEscape = (event: KeyboardEvent): void => {
      if (event.key === 'Escape') {
        closeMenu({ restoreFocus: true });
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isMenuOpen]);

  return (
    <header className={styles.header} data-testid="header">
      <div className={styles.container}>
        <h1 className={styles.title} data-testid="header-title">Login Form</h1>
        <div className={styles.menuWrapper}>
          <button
            ref={buttonRef}
            type="button"
            className={styles.menuButton}
            onClick={() => {
              if (isMenuOpen) {
                closeMenu({ restoreFocus: true });
              } else {
                setIsMenuOpen(true);
              }
            }}
            aria-expanded={isMenuOpen}
            aria-haspopup="dialog"
            aria-controls="accessibility-settings-panel"
            aria-label="Accessibility settings"
            data-testid="accessibility-menu-button"
          >
            <SettingsIcon
              aria-hidden="true"
              focusable="false"
              width="18"
              height="18"
              style={{ display: 'block' }}
            />
            <span className={styles.visuallyHidden}>Accessibility settings</span>
          </button>
          {isMenuOpen && (
            <div
              id="accessibility-settings-panel"
              ref={menuRef}
              className={styles.menu}
              role="dialog"
              aria-modal="false"
              aria-labelledby="accessibility-settings-title"
              data-testid="accessibility-menu"
            >
              <h2 id="accessibility-settings-title" className={styles.visuallyHidden}>
                Accessibility settings
              </h2>
              <div className={styles.menuSection} data-testid="font-size-section">
                <h2 className={styles.menuTitle}>Font Size</h2>
                <div className={styles.radioGroup} role="radiogroup" aria-label="Font size">
                  <label className={styles.radioLabel}>
                    <input
                      type="radio"
                      name="fontSize"
                      value="normal"
                      checked={settings.fontSize === 'normal'}
                      onChange={() => updateSettings({ fontSize: 'normal' })}
                      className={styles.radio}
                      data-testid="font-size-normal"
                    />
                    <span>Normal</span>
                  </label>
                  <label className={styles.radioLabel}>
                    <input
                      type="radio"
                      name="fontSize"
                      value="large"
                      checked={settings.fontSize === 'large'}
                      onChange={() => updateSettings({ fontSize: 'large' })}
                      className={styles.radio}
                      data-testid="font-size-large"
                    />
                    <span>Large</span>
                  </label>
                  <label className={styles.radioLabel}>
                    <input
                      type="radio"
                      name="fontSize"
                      value="xlarge"
                      checked={settings.fontSize === 'xlarge'}
                      onChange={() => updateSettings({ fontSize: 'xlarge' })}
                      className={styles.radio}
                      data-testid="font-size-xlarge"
                    />
                    <span>Extra Large</span>
                  </label>
                </div>
              </div>

              <div className={styles.menuSection} data-testid="contrast-section">
                <h2 className={styles.menuTitle}>Contrast</h2>
                <div className={styles.radioGroup} role="radiogroup" aria-label="Contrast">
                  <label className={styles.radioLabel}>
                    <input
                      type="radio"
                      name="contrast"
                      value="normal"
                      checked={settings.contrast === 'normal'}
                      onChange={() => updateSettings({ contrast: 'normal' })}
                      className={styles.radio}
                      data-testid="contrast-normal"
                    />
                    <span>Normal</span>
                  </label>
                  <label className={styles.radioLabel}>
                    <input
                      type="radio"
                      name="contrast"
                      value="high"
                      checked={settings.contrast === 'high'}
                      onChange={() => updateSettings({ contrast: 'high' })}
                      className={styles.radio}
                      data-testid="contrast-high"
                    />
                    <span>High</span>
                  </label>
                </div>
              </div>

              <div className={styles.menuSection} data-testid="theme-section">
                <h2 className={styles.menuTitle}>Theme</h2>
                <div className={styles.radioGroup} role="radiogroup" aria-label="Theme">
                  <label className={styles.radioLabel}>
                    <input
                      type="radio"
                      name="darkMode"
                      value="auto"
                      checked={settings.darkMode === 'auto'}
                      onChange={() => updateSettings({ darkMode: 'auto' })}
                      className={styles.radio}
                      data-testid="theme-auto"
                    />
                    <span>Auto</span>
                  </label>
                  <label className={styles.radioLabel}>
                    <input
                      type="radio"
                      name="darkMode"
                      value="light"
                      checked={settings.darkMode === 'light'}
                      onChange={() => updateSettings({ darkMode: 'light' })}
                      className={styles.radio}
                      data-testid="theme-light"
                    />
                    <span>Light</span>
                  </label>
                  <label className={styles.radioLabel}>
                    <input
                      type="radio"
                      name="darkMode"
                      value="dark"
                      checked={settings.darkMode === 'dark'}
                      onChange={() => updateSettings({ darkMode: 'dark' })}
                      className={styles.radio}
                      data-testid="theme-dark"
                    />
                    <span>Dark</span>
                  </label>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

