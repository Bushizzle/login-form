import { type InputHTMLAttributes, forwardRef, useId } from 'react';
import styles from './TextField.module.pcss';

interface TextFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label: string;
  error?: string;
  helperText?: string;
  type?: 'text' | 'email' | 'tel' | 'url';
}

export const TextField = forwardRef<HTMLInputElement, TextFieldProps>(
  ({ label, error, helperText, id, className = '', required, ...props }, ref) => {
    const reactId = useId();
    const fieldId = id ?? `text-field-${reactId}`;
    const errorId = error ? `${fieldId}-error` : undefined;
    const helperId = helperText ? `${fieldId}-helper` : undefined;
    const describedBy = [errorId, helperId].filter(Boolean).join(' ') || undefined;

    return (
      <div className={styles.wrapper}>
        <label htmlFor={fieldId} className={styles.label}>
          {label}
          {required && <span className={styles.required} aria-label="required">*</span>}
        </label>
        <input
          id={fieldId}
          type={props.type || 'text'}
          className={`${styles.input} ${error ? styles.error : ''} ${className}`}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={describedBy}
          aria-required={required}
          ref={ref}
          {...props}
        />
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

TextField.displayName = 'TextField';
