import { type InputHTMLAttributes, useState, useEffect, forwardRef, useId } from 'react';
import { EyeIcon, EyeOffIcon } from 'shared/ui';
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
                <EyeIcon
                  width="24"
                  height="24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                  focusable="false"
                />
              ) : (
                <EyeOffIcon
                  width="24"
                  height="24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                  focusable="false"
                />
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
