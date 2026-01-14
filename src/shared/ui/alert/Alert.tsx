import { forwardRef, type HTMLAttributes, type ReactNode } from 'react';
import styles from './Alert.module.pcss';

interface AlertProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  variant?: 'error' | 'success' | 'info';
}

export const Alert = forwardRef<HTMLDivElement, AlertProps>(
  ({ children, variant = 'error', className = '', ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={`${styles.alert} ${styles[variant]} ${className}`}
        role="alert"
        {...props}
      >
        {children}
      </div>
    );
  }
);

Alert.displayName = 'Alert';

