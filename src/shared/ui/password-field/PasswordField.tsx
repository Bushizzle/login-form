import { type InputHTMLAttributes, useState, useEffect, forwardRef, useId } from 'react';
import styles from './PasswordField.module.pcss';

interface PasswordFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label: string;
  error?: string;
  helperText?: string;
  showToggle?: boolean;
  onVisibilityChange?: (visible: boolean) => void;
}

export const PasswordField = forwardRef<HTMLInputElement, PasswordFieldProps>(
  (
    {
      label,
      error,
      helperText,
      id,
      className = '',
      required,
      showToggle = true,
      onVisibilityChange,
      ...props
    },
    ref
  ) => {
    const [isVisible, setIsVisible] = useState(false);
    const reactId = useId();
    const fieldId = id ?? `password-field-${reactId}`;
    const toggleId = `${fieldId}-toggle`;
    const errorId = error ? `${fieldId}-error` : undefined;
    const helperId = helperText ? `${fieldId}-helper` : undefined;
    const describedBy = [errorId, helperId].filter(Boolean).join(' ') || undefined;

    useEffect(() => {
      onVisibilityChange?.(isVisible);
    }, [isVisible, onVisibilityChange]);

    const toggleVisibility = (): void => {
      setIsVisible((prev) => !prev);
    };

    return (
      <div className={styles.wrapper}>
        <label htmlFor={fieldId} className={styles.label}>
          {label}
          {required && <span className={styles.required} aria-label="required">*</span>}
        </label>
        <div className={styles.inputWrapper}>
          <input
            id={fieldId}
            type={isVisible ? 'text' : 'password'}
            className={`${styles.input} ${error ? styles.error : ''} ${className}`}
            aria-invalid={error ? 'true' : 'false'}
            aria-describedby={describedBy}
            aria-required={required}
            ref={ref}
            {...props}
          />
          {showToggle && (
            <button
              id={toggleId}
              type="button"
              className={styles.toggle}
              onClick={toggleVisibility}
              aria-pressed={isVisible}
              aria-label={isVisible ? 'Hide password' : 'Show password'}
              aria-controls={fieldId}
            >
              {isVisible ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  width="24"
                  height="24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                  focusable="false"
                >
                  <path d="M2 12s4-6 10-6 10 6 10 6-4 6-10 6-10-6-10-6z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  width="24"
                  height="24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                  focusable="false"
                >
                  <path d="M4 12c2.8 2.8 5.8 4 8 4s5.2-1.2 8-4" />
                  <path d="M9.3 16.1l-.5 1.3" />
                  <path d="M12 16.6v1.5" />
                  <path d="M14.7 16.1l.5 1.3" />
                </svg>
              )}
            </button>
          )}
        </div>
        {error && (
          <div id={errorId} className={styles.errorText} role="alert">
            {error}
          </div>
        )}
        {helperText && !error && (
          <div id={helperId} className={styles.helperText}>
            {helperText}
          </div>
        )}
      </div>
    );
  }
);

PasswordField.displayName = 'PasswordField';
